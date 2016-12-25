import IO from "koa-socket";
import {spawn} from "child_process";
export default app => {
	const git = new IO("git");
	git.attach(app);
	git.on("ack", async ({acknowledge}, id) => {
		acknowledge("the file accepted.");
		const gitsh = spawn(`./git.${id}.sh`);
		gitsh.stdout.on("data", data => git.broadcast("message", data.toString()));
		gitsh.stderr.on("data", data => git.broadcast("message", data.toString()));
		gitsh.on("close", () => git.broadcast("message", "all repositories was published."));
	});
	return app;
};