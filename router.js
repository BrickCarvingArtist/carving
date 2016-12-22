import Router from "koa-router";
import fs from "fs";
import {ValidFilePath} from "./config";
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
const getFile = async path => {
	let file;
	try{
		if(!ValidFilePath.includes(path)){
			throw new Error("无权访问此文件");
		}
		file = await readFile(path, "utf-8");
	}catch(e){
		console.log(e);
		file = "文件读取失败";
	}
	return file;
};
const getHTML = async path => (await getFile("./modifier.html")).replace(/(<(textarea).*>)(<\/\2>)/, "$1" + await getFile(path) + "$3");
export default new Router()
	.get("/", async ({query, response}) => {
		response.body = await getHTML(query.path);
	})
	.post("/update", async ({request, query, response}) => {
		let code,
			message;
		const {
			path
		} = query;
		try{
			if(!ValidFilePath.includes(path)){
				throw new Error("无权修改此文件");
			}
			await writeFile(path, request.body.file);
			code = 0;
			message = "文件更新成功";
		}catch(e){
			code = 1;
			message = e.toString();
		}
		response.body = {
			code,
			message
		};
	})
	.routes();