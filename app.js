import "babel-polyfill";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import {ServerConfig} from "./config";
import routes from "./router";
new Koa()
	.use(bodyParser())
	.use(routes)
	.listen(ServerConfig.port, () => console.log(`Server started on port ${ServerConfig.port}`));