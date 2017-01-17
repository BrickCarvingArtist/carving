import Koa from "koa";
import serve from "koa-static";
import bodyParser from "koa-bodyparser";
import {SERVER_CONFIG} from "./config";
import routes from "./router";
import command from "./command";
import {log} from "./utils";
command(new Koa)
	.use(serve("./static"))
	.use(bodyParser())
	.use(routes)
	.listen(SERVER_CONFIG.PORT, () => log(`The server started on port ${SERVER_CONFIG.PORT}`));