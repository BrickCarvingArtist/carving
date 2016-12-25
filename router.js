import Router from "koa-router";
import multer from "koa-multer";
import fetch from "node-fetch";
import {NGINX_CONF_PATH_PREFIX, VALID_TIME_AREA} from "./config";
import {
	readFile, writeFile, exec,
	compileCSVToNginxConfig,
	compileCSVToGitShell,
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
				await writeFile(`./git.${id}.sh`, compileCSVToGitShell(file, id));
				message = (await Promise.all(compileCSVToDNS(file).split(/\n/).map(async item => new Promise(async (resolve, reject) => {
					const t = item.split(",");
					resolve((await (await fetch(await compileAliyunURI({
						Action : "AddDomainRecord",
						DomainName : t[0],
						RR : t[1],
						Type : "A",
						Value : "47.90.90.237"
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