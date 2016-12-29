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
				await writeFile(`${NGINX_CONF_PATH_PREFIX}${id}.conf`, compileCSVToNginxConfig(file, id));
				await writeFile(`${OUTPUT_FILES_PATH_PREFIX}git.${id}.sh`, compileCSVToGitShell(file, id));
				await writeFile(`${OUTPUT_FILES_PATH_PREFIX}pm2.${id}.sh`, `a=$(pm2 start -f ./output/pm2.${id}.config.js); echo $a`);
				await writeFile(`${OUTPUT_FILES_PATH_PREFIX}pm2.${id}.config.js`, compileCSVToPM2Config(file, id));
				message = (await Promise.all(compileCSVToDNS(file).split(/\n/).map(item => new Promise(async (resolve, reject) => {
					const t = item.split(",");
					resolve((await (await fetch(await compileAliyunURI({
						Action : "AddDomainRecord",
						DomainName : t[0],
						RR : t[1],
						Type : "A",
						Value : SERVER_CONFIG.IP
					}))).json()).Message);
				})))).concat("all domain names completely sent to the resolution.").join("\n");
			}catch(e){
				message = e.toString().replace(/.*:(.*)/, "$1");
			}
		}else{
			message = "access denied";
		}
		response.body = message;
	})
	.get("/restart", async ({response}) => {
		let message;
		try{
			await exec("nginx -s stop");
			await exec(`nginx -c ${NGINX_CONF_PATH_PREFIX}nginx.conf`);
			message = "main server successfully restarted.";
		}catch(e){
			message = e.toString().replace(/.*:(.*)/, "$1");
		}
		response.body = message;
	})
	.get("*", ({response}) => {
		response.body = "access denied";
	})
	.routes();