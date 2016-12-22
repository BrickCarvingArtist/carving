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
		const {
			path
		} = query;
		try{
			if(![
				"livedemos.conf",
				"20160704.xihu.conf",
				"20160801.xihu.conf",
				"20160912.xihu.conf", 
				"20160912.xiasha.conf",
				"20160912.qinhuai.conf",
				"20161010.xihu.conf",
				"20161010.xiasha.conf",
				"20161010.putuo.conf"
			].includes(path)){
				throw new Error("无权访问此文件");
			}
			await writeFile(path, request.body.file);
			code = 0;
			message = "文件更新成功";
		}catch(e){
			code = 1;
			message = e;
		}
		response.body = {
			code,
			message
		};
	})
	.routes();