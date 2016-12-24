import "babel-polyfill";
import Koa from "koa";
import serve from "koa-static";
import bodyParser from "koa-bodyparser";
import {SERVER_CONFIG} from "./config";
import routes from "./router";
import git from "./git";
git(new Koa)
	.use(serve("./static"))
	.use(bodyParser())
	.use(routes)
	.listen(SERVER_CONFIG.port, () => console.log(`The server started on port ${SERVER_CONFIG.port}`));