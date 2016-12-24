const isDevelopment = +(process.env.NODE_ENV === "development");
export const SERVER_CONFIG = {
	host : "127.0.0.1",
	port : 12345
};
export const NGINX_CONF_PATH_PREFIX = ["/usr/local/nginx/conf", "/usr/local/etc/nginx/"][isDevelopment];
export const GIT_REPOSITORY_PATH_PREFIX = ["/root/H5/", "/Users/apple/Desktop/modifier/H5/"][isDevelopment];
export const VALID_TIME_AREA = {
	20160912 : ["xihu", "xiasha", "qinhuai"],
	20161010 : ["xihu", "xiasha", "putuo"]
};