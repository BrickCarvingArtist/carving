import Router from "koa-router";
import fs from "fs";
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
		try{
			await writeFile(query.path, request.body.file);
			code = 0;
			message = "文件更新成功";
		}catch(e){
			console.log(e);
			code = 1;
			message = "文件更新失败";
		}
		response.body = {
			code,
			message
		};
	})
	.routes();