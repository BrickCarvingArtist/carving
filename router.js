import Router from "koa-router";
import fs from "fs";
import {FilePathPrefix, ValidFilePath} from "./config";
const promisify = fn => function(){
	return new Promise((resolve, reject) => {
		fn(...arguments, (err, data) => {
			err && reject(err);
			resolve(data);
		});
	});
};
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readNginxConf = async path => {
	let file;
	try{
		if(!ValidFilePath.includes(path)){
			throw new Error("无权访问此文件");
		}
		file = await readFile(`${FilePathPrefix}${path}.conf`, "utf-8");
	}catch(e){
		file = e.toString().replace(/.*:(.*)/, "$1");
	}
	return file;
};
const writeNginxConf = async (path, file) => {
	let code,
		message;
	try{
		if(!ValidFilePath.includes(path)){
			throw new Error("无权修改此文件");
		}
		await writeFile(`${FilePathPrefix}${path}.conf`, file);
		code = 0;
		message = "文件更新成功";
	}catch(e){
		code = 1;
		message = e.toString().replace(/.*:(.*)/, "$1");
	}
	return {
		code,
		message
	};
};
const getHTML = async path => (await readFile("./modifier.html", "utf-8")).replace(/(<(textarea).*>)(<\/\2>)/, "$1" + await readNginxConf(path) + "$3");
export default new Router()
	.get("/", async ({query, response}) => {
		response.body = await getHTML(query.path);
	})
	.post("/update", async ({request, query, response}) => {
		response.body = await writeNginxConf(query.path, request.body.file);
	})
	.routes();