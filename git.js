import IO from "koa-socket";
import {spawn} from "child_process";
export default app => {
	const git = new IO("git");
	git.attach(app);
	git.on("ack", async ({acknowledge}, id) => {
		acknowledge("the file accepted.");
		const git = spawn(`./git.${id}.sh`);
		git.stdout.on("data", data => git.broadcast("message", data.toString()));
		git.stderr.on("data", data => git.broadcast("message", data.toString()));
		git.stdout.on("close", () => git.broadcast("message", "all repositories was published."));
	});
	return app;
};