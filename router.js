import Router from "koa-router";
import multer from "koa-multer";
import fetch from "node-fetch";
import {NGINX_CONF_PATH_PREFIX, VALID_TIME_AREA} from "./config";
import {
	readFile, writeFile, exec, getHTML,
	compileCSVToNginxConfig,
	compileCSVToGitShell,
	compileCSVToDNS,
	compileAliyunURI
} from "./utils";
export default new Router()
	.get("/:time/:area", async ({params, query, response}) => {
		const {
			time,
			area
		} = params;
		response.body = ["access denied", await getHTML(time, area)][+VALID_TIME_AREA[time].includes(area)];
	})
	.post("/upload", multer().single("file"), async ({req, query, response}) => {
		const file = req.file.buffer.toString();
		const {
			id
		} = query;
		let message;
		try{
			await writeFile(`${NGINX_CONF_PATH_PREFIX}${id}.conf`, compileCSVToNginxConfig(id, file));
			await writeFile(`./git.${id}.sh`, compileCSVToGitShell(id, file));
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
	.routes();