const isDevelopment = +(process.env.NODE_ENV === "development");
export const NGINX_CONF_PATH_PREFIX = ["/usr/local/nginx/conf/", "/Users/apple/Desktop/carving/nginx/"][isDevelopment];
export const GIT_REPOSITORY_PATH_PREFIX = ["/root/H5/", "/Users/apple/Desktop/carving/H5/"][isDevelopment];
export const VALID_TIME_AREA = {
	20160704 : ["xihu"],
	20160801 : ["xihu"],
	20160912 : ["xihu", "xiasha", "qinhuai"],
	20161010 : ["xihu", "xiasha", "putuo"]
};
