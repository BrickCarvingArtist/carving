module.exports = {
	apps : [
		{
			name : "20160912.xiasha.yanyangfan_fangwoxing",
			cwd : "/Users/apple/Desktop/carving/H5/20160912.xiasha/yanyangfan/fangwoxing/",
			script : "server.js",
			exec_mode : "cluster",
			instances : "max",
			min_uptime : "1h",
			max_restarts : 5
		}
	]
};