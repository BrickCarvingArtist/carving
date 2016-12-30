import fs from "fs";
import child_process from "child_process";
import crypto from "crypto";
import {forIn} from "lodash";
import {ACCESS_KEY_ID, ACCESS_KEY_SECRET, GIT_REPOSITORY_PATH_PREFIX} from "./config";
const promisify = fn => function(){
	return new Promise((resolve, reject) => {
		fn(...arguments, (err, ...rest) => {
			err && reject(err);
			resolve(...rest);
		});
	});
};
const compileCSV = fn => (file, ...rest) => {
	let t = file.split(/\r?\n/);
	t.shift();
	return t.reduce((table, row) => {
		return table.concat(fn(row, ...rest));
	}, []).join("");
};
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const exec = promisify(child_process.exec);
const randomBytes = promisify(crypto.randomBytes);
export const compileCSVToNginxConfig = compileCSV((str, id) => {
	const conf = str.split(","),
		projectName = conf[3].split("/")[1],
		port = conf[4];
	return `#-------------------${conf[0]}-------------------
server {
	listen 80;
	server_name ${projectName}.${conf[1]}.${conf[2]}.cn;
	location / {
${[
`		proxy_pass http://127.0.0.1:${conf[4]};`,
`		root ${GIT_REPOSITORY_PATH_PREFIX}${id}/${conf[1]}/${projectName};
		index index.html;
		error_page 404 /;`
][+!port]}
	}
}\n`;
});
export const compileCSVToGitShell = compileCSV((str, id) => {
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
	cd ${projectName}
fi
echo $a
echo "Completely downloaded the repository."
${[
`a=$(npm install --production)
echo $a
echo "Completely installed the dependencies."\n`,
""][+!port]}`;
});
export const compileCSVToPM2Config = (str, id) => `module.exports = {
	apps : [
		${compileCSV((str, id) => {
			const conf = str.split(","),
				name = conf[1],
				projectName = conf[3].split("/")[1];
			return `,\n\t\t{
			name : "${id}.${name}_${projectName}",
			cwd : "${GIT_REPOSITORY_PATH_PREFIX}${id}/${name}/${projectName}/",
			script : "server.js",
			min_uptime : "1h",
			max_restarts : 5
		}`;
})(str, id).slice(4)}
	]
};`;
export const compileCSVToDNS = str => compileCSV(str => {
	const conf = str.split(",");
	return `\n${conf[2]}.cn,${conf[3].split("/")[1]}.${conf[1]}`;
})(str).slice(1);
const compileToEncode = async option => {
	Object.assign(option, {
		Format : "json",
		Version : "2015-01-09",
		AccessKeyId : ACCESS_KEY_ID,
		SignatureMethod : "HMAC-SHA1",
		Timestamp : new Date().toJSON(),
		SignatureVersion : "1.0",
		SignatureNonce : (await randomBytes(14)).toString("hex")
	});
	return Object.keys(option).sort().map(item => `${encodeURIComponent(item)}=${encodeURIComponent(option[item])}`).join("&");
};
const compileStringToSign = url => `GET&%2F&${encodeURIComponent(url)}`;
const compileSignature = stringToSign => crypto.createHmac("sha1", `${ACCESS_KEY_SECRET}&`).update(stringToSign).digest("base64");
export const compileAliyunURI = async option => {
	const keyValues = await compileToEncode(option);
	return `https://alidns.aliyuncs.com/?${keyValues}&Signature=${encodeURIComponent(compileSignature(compileStringToSign(keyValues)))}`;
};