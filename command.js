import IO from "koa-socket";
import {spawn} from "child_process";
import {OUTPUT_FILES_PATH_PREFIX} from "./config";
export default app => {
	const command = new IO("command");
	command.attach(app);
	command.on("ack", async ({socket, acknowledge}, {type, id}) => {
		acknowledge("The mission accepted.");
		if(type === "repository"){
			const gitsh = spawn(`${OUTPUT_FILES_PATH_PREFIX}${id}/git.sh`);
			gitsh.stdout.on("data", data => socket.emit("message", data.toString()));
			gitsh.stderr.on("data", data => socket.emit("message", data.toString()));
			gitsh.on("close", () => socket.emit("message", "All repositories was published."));
		}else if(type === "server"){
			const pm2sh = spawn(`${OUTPUT_FILES_PATH_PREFIX}${id}/pm2.sh`);
			pm2sh.stdout.on("data", data => socket.emit("message", data.toString()));
			pm2sh.stderr.on("data", data => socket.emit("message", data.toString()));
			pm2sh.on("close", () => socket.emit("message", "All servers was restarted."));
		}else{
			acknowledge("No such mission.");
		}
	});
	return app;
};