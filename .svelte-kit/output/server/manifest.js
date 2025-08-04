export const manifest = {
	appDir: "_app",
	assets: new Set(["52ad366d-45d5-4274-8288-3b9e0c8ccb46.jpeg","Photo May 14.jpg","my-photo.jpg","my-photo2.png","pawel knorps group.jpg","photo10.jpg","photo11.jpg","photo12.jpg","photo3.jpg","photo4.jpg","photo5.jpg","photo6.jpg","photo7.jpg","photo8.jpg","photo9.jpg","portfolio.json","portfolio.json.zip"]),
	mimeTypes: {".jpeg":"image/jpeg",".jpg":"image/jpeg",".png":"image/png",".json":"application/json",".zip":"application/zip"},
	_: {
		entry: {"file":"_app/immutable/start-fa9f8a44.js","imports":["_app/immutable/start-fa9f8a44.js","_app/immutable/chunks/index-5d01c0a5.js","_app/immutable/chunks/singletons-1f9072bf.js","_app/immutable/chunks/paths-6cd3a76e.js"],"stylesheets":[]},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js')
		],
		routes: [
			{
				id: "",
				pattern: /^\/$/,
				names: [],
				types: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
