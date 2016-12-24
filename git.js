import IO from "koa-socket";
import {spawn} from "child_process";
export default app => {
	const clone = new IO("git");
	clone.attach(app);
	clone.on("ack", async ({acknowledge}, id) => {
		acknowledge("the file accepted.");
		const git = spawn(`./git.${id}.sh`);
		git.stdout.on("data", data => clone.broadcast("message", data.toString()));
		git.stderr.on("data", data => clone.broadcast("message", data.toString()));
		git.stdout.on("close", () => clone.broadcast("message", "all repositories was published."));
	});
	return app;
};