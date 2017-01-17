import Router from "koa-router";
import multer from "koa-multer";
import fetch from "node-fetch";
import {SERVER_CONFIG, OUTPUT_FILES_PATH_PREFIX, NGINX_CONF_PATH_PREFIX, VALID_TIME_AREA} from "./config";
import {
	readFile, writeFile, exec,
	compileCSVToNginxConfig,
	compileCSVToGitShell,
	compileCSVToPM2Shell,
	compileCSVToPM2Config,
	compileCSVToDNS,
	compileAliyunURI
} from "./utils";
export default new Router()
	.get("/", async ({response}) => {
		response.body = await readFile("./static/carving.html", "utf-8");
	})
	.post("/upload", multer().single("file"), async ({req, query, response}) => {
		const file = req.file.buffer.toString();
		const {
			id
		} = query;
		const i = id.split(".");
		let message;
		if(VALID_TIME_AREA[i[0]] && VALID_TIME_AREA[i[0]].includes(i[1])){
			try{
				await Promise.all([
					writeFile(`${NGINX_CONF_PATH_PREFIX}${id}.conf`, compileCSVToNginxConfig(file, id)),
					writeFile(`${OUTPUT_FILES_PATH_PREFIX}${id}/git.sh`, compileCSVToGitShell(file, id)),
					writeFile(`${OUTPUT_FILES_PATH_PREFIX}${id}/pm2.sh`, `a=$(pm2 start -f ${OUTPUT_FILES_PATH_PREFIX}${id}/pm2.config.js); echo $a`),
					writeFile(`${OUTPUT_FILES_PATH_PREFIX}${id}/pm2.config.js`, compileCSVToPM2Config(file, id))
				]);
				message = (await Promise.all(compileCSVToDNS(file).split(/\n/).map(item => new Promise(async (resolve, reject) => {
					const t = item.split(",");
					resolve((await (await fetch(await compileAliyunURI({
						Action : "AddDomainRecord",
						DomainName : t[0],
						RR : t[1],
						Type : "A",
						Value : SERVER_CONFIG.IP
					}))).json()).Message);
				})))).concat("All domain names completely sent to the resolution.").join("\n");
			}catch(e){
				message = e.toString().replace(/.*:(.*)/, "$1");
			}
		}else{
			message = "Access denied.";
		}
		response.body = message;
	})
	.get("/restart", async ({response}) => {
		let message;
		try{
			await exec("nginx -s stop");
			await exec(`nginx -c ${NGINX_CONF_PATH_PREFIX}nginx.conf`);
			message = "Main server successfully restarted.";
		}catch(e){
			message = e.toString().replace(/.*:(.*)/, "$1");
		}
		response.body = message;
	})
	.get("*", ({response}) => {
		response.body = "Access denied.";
	})
	.routes();