export const ServerConfig = {
	host : "127.0.0.1",
	port : 12345
};
export const ValidFilePath = [
	"livedemos",
	"20160704.xihu",
	"20160801.xihu",
	"20160912.xihu", 
	"20160912.xiasha",
	"20160912.qinhuai",
	"20161010.xihu",
	"20161010.xiasha",
	"20161010.putuo"
].map(item => `/usr/local/nginx/conf/${item}.conf`).concat("./modifier.html");