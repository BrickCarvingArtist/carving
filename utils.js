import fs from "fs";
import child_process from "child_process";
import {GIT_REPOSITORY_PATH_PREFIX} from "./config";
const promisify = fn => function(){
	return new Promise((resolve, reject) => {
		fn(...arguments, (err, ...rest) => {
			err && reject(err);
			resolve(...rest);
		});
	});
};
const compileCSV = fn => (id, file) => {
	let t = file.split(/\r\n/);
	t.shift();
	return t.reduce((table, row) => {
		return table.concat(fn(id, row));
	}, []).join("");
};
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const exec = promisify(child_process.exec);
export const compileCSVToNginxConfig = compileCSV((id, str) => {
	const conf = str.split(","),
		project = conf[3].split("/")[1],
		port = conf[4];
	return `#-------------------${conf[0]}-------------------
server {
	listen 80;
	server_name ${project}.${conf[1]}.${conf[2]}.com;
	location / {
${[
`		proxy_pass http://127.0.0.1:${conf[4]};`,
`		root ${GIT_REPOSITORY_PATH_PREFIX}${id}/${conf[1]}/${project};
		index index.html;
		error_page 404 /;`
][+!port]}
	}
}\n`;
});
export const compileCSVToGitShell = compileCSV((id, str) => {
	const conf = str.split(","),
		name = conf[1],
		projectPath = conf[3],
		projectName = conf[3].split("/")[1],
		port = conf[4];
	return `cd ${GIT_REPOSITORY_PATH_PREFIX}${id}
if [ ! -d ${name} ]
then
	mkdir ${name}
fi
cd ${name}
if [ -d ${projectName} ]
then
	cd ${projectName}
	a=$(git pull https://www.github.com/${projectPath}.git)
else
	a=$(git clone https://www.github.com/${projectPath}.git)
fi
echo $a
echo "completely downloaded the repository."
${[
`cd ${projectName}
a=$(npm install --production)
echo $a
echo "completely installed the dependencies."
node server.js --name=${name}_${projectName}
echo "completely started the server."\n`,
""][+!port]}`;
});
export const getHTML = async (time, area) => {
	return (await readFile("./static/modifier.html", "utf-8")).replace(/(\/upload)/, "$1" + `?id=${time}.${area}`);
};