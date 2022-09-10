module.exports = {
	globDirectory: ".",
	globPatterns: [],
	globIgnores: ["typings/**"],
	swDest: "sw.js",
	ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
	runtimeCaching: [
		{
			urlPattern: /libs/,
			handler: "CacheFirst",
			options: {
				cacheName: "libs",
			},
		},
		{
			urlPattern: /\.(?:html|css|js|json|png|wasm)$/,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "assets",
			},
		},
		{
			urlPattern: /\/$/,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "home",
			},
		},
	],
};
