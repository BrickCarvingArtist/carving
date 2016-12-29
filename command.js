import IO from "koa-socket";
import {spawn} from "child_process";
import {OUTPUT_FILES_PATH_PREFIX} from "./config";
export default app => {
	const command = new IO("command");
	command.attach(app);
	command.on("ack", async ({socket, acknowledge}, {type, id}) => {
		acknowledge("the mission accepted.");
		if(type === "repository"){
			const gitsh = spawn(`${OUTPUT_FILES_PATH_PREFIX}git.${id}.sh`);
			gitsh.stdout.on("data", data => socket.emit("message", data.toString()));
			gitsh.stderr.on("data", data => socket.emit("message", data.toString()));
			gitsh.on("close", () => socket.emit("message", "all repositories was published."));
		}
		if(type === "server"){
			const pm2sh = spawn(`${OUTPUT_FILES_PATH_PREFIX}pm2.${id}.sh`);
			pm2sh.stdout.on("data", data => socket.emit("message", data.toString()));
			pm2sh.stderr.on("data", data => socket.emit("message", data.toString()));
			pm2sh.on("close", () => socket.emit("message", "all servers was restarted."));
		}
	});
	return app;
};