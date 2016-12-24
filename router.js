import Router from "koa-router";
import multer from "koa-multer";
import {VALID_TIME_AREA, NGINX_CONF_PATH_PREFIX} from "./config";
import {
	readFile, writeFile, exec, getHTML,
	compileCSVToNginxConfig, compileCSVToGitShell
} from "./utils";
export default new Router()
	.get("/:time/:area", async ({params, query, response}) => {
		const {
			time,
			area
		} = params;
		response.body = ["无权访问此地址", await getHTML(time, area)][+VALID_TIME_AREA[time].includes(area)];
	})
	.post("/upload", multer().single("file"), async({req, query, response}) => {
		const file = req.file.buffer.toString();
		const {
			id
		} = query;
		let message;
		try{
			await writeFile(`${NGINX_CONF_PATH_PREFIX}${id}.conf`, compileCSVToNginxConfig(id, file));
			await writeFile(`./git.${id}.sh`, compileCSVToGitShell(id, file));
			message = "文件提交成功";
		}catch(e){
			message = e.toString().replace(/.*:(.*)/, "$1");
		}
		response.body = message;
	})
	.get("/restart", async ({response}) => {
		let message;
		try{
			await exec("nginx -s reload");
			message = "服务器重启成功";
		}catch(e){
			message = e.toString().replace(/.*:(.*)/, "$1");
		}
		response.body = message;
	})
	.routes();