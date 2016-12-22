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
		file = await readFile(`${FilePathPrefix}${path}.conf`, "utf-8");
	}catch(e){
		file = e.toString().replace(/.*:(.*)/, "$1");
	}
	return file;
};
const writeNginxConf = async (path, file, validFilePath) => {
	let code,
		message;
	try{
		if(!validFilePath.includes(path)){
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
const getHTML = async (path, validFilePath) => {
	try{
		if(!validFilePath.includes(path)){
			throw new Error("无权访问此文件");
		}
		return (await readFile("./modifier.html", "utf-8")).replace(/(<(textarea).*>)(<\/\2>)/, "$1" + await readNginxConf(path) + "$3");
	}catch(e){
		return e.toString().replace(/.*:(.*)/, "$1");
	}
};
export default new Router()
	.get("/23336666/:path", async ({params, response}) => {
		response.body = await getHTML(params.path, ValidFilePath);
	})
	.get("/guanjunpeng/:path", async ({params, response}) => {
		response.body = await getHTML(params.path, ValidFilePath.filter(item => item.includes("20160912")));
	})
	.get("/xieyinping/:path", async ({params, response}) => {
		response.body = await getHTML(params.path, ValidFilePath.filter(item => item.includes("20161010")));
	})
	.post("/update", async ({request, query, response}) => {
		const {
			user,
			path
		} = query;
		response.body = await writeNginxConf(path, request.body.file, ValidFilePath.filter(item => item.includes({
			23336666 : item,
			guanjunpeng : "20160912",
			xieyinping : "20161010"
		}[user])));
	})
	.routes();