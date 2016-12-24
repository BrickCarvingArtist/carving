import IO from "koa-socket";
import {spawn} from "child_process";
export default app => {
	const clone = new IO("git");
	clone.attach(app);
	clone.on("ack", async ({acknowledge}, order) => {
		acknowledge("已接收发布请求");
		const git = spawn("./git.sh");
		git.stdout.on("data", data => clone.broadcast("message", data.toString()));
		git.stderr.on("data", data => clone.broadcast("message", data.toString()));
		git.stdout.on("close", () => clone.broadcast("message", "发布成功"));
	});
	return app;
};