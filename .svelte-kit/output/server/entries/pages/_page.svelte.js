import { c as create_ssr_component, d as add_attribute, e as escape, f as each } from "../../chunks/index.js";
import * as THREE from "three";
import { TextureLoader } from "three";
import { b as base } from "../../chunks/paths.js";
const loader = new TextureLoader();
const texture = [
  loader.load(`${base}/my-photo.jpg`),
  loader.load(`${base}/my-photo2.png`),
  loader.load(`${base}/photo4.jpg`),
  loader.load(`${base}/photo5.jpg`),
  loader.load(`${base}/photo6.jpg`),
  loader.load(`${base}/photo8.jpg`)
];
const SCENE = new THREE.Scene();
const morphShader = {
  uniforms: {
    tDiffuse1: { value: texture[0] },
    tDiffuse2: { value: texture[1] },
    morphFactor: { value: 0.2 },
    time: { value: 0 }
  },
  vertexShader: `
        // Classic Perlin 3D Noise by Stefan Gustavson
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

        float cnoise(vec3 P) {
            vec3 Pi0 = floor(P);
            vec3 Pi1 = Pi0 + vec3(1.0);
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P);
            vec3 Pf1 = Pf0 - vec3(1.0);
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
            vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
            vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
            vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
            vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
            vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
            vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
            vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
            return 2.2 * n_xyz;
        }

        uniform float time;
        varying vec2 vUv;

        void main() {
            vUv = uv;
            vec3 pos = position;
            float noiseValue = cnoise(vec3(pos.x + time, pos.y, pos.z));
            pos = pos * (1.0 + noiseValue);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
  fragmentShader: `
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform float morphFactor;
        varying vec2 vUv;

        void main() {
            vec4 color1 = texture2D(tDiffuse1, vUv);
            vec4 color2 = texture2D(tDiffuse2, vUv);
            gl_FragColor = mix(color1, color2, morphFactor);
        }
    `
};
const SPHERE = new THREE.Mesh(
  new THREE.SphereGeometry(1, 200, 200),
  new THREE.ShaderMaterial(morphShader)
);
SPHERE.scale.set(1.5, 1.5, 1.5);
SPHERE.position.set(0, 0, 0);
SCENE.add(SPHERE);
const light = new THREE.AmbientLight(4210752);
SCENE.add(light);
const directionalLight = new THREE.DirectionalLight(16777215, 0.8);
directionalLight.position.set(1, 1, 1);
const directionalLight2 = new THREE.DirectionalLight(16777215, 0.2);
directionalLight2.position.set(-1, 0, 1);
SCENE.add(directionalLight2);
SCENE.add(directionalLight);
const CAMERA = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 20);
CAMERA.position.z = 2.5;
const projectPoints = new THREE.Group();
SCENE.add(projectPoints);
new THREE.Raycaster();
new THREE.Vector2();
const updateScrollPosition = () => {
  window.pageYOffset || document.documentElement.scrollTop;
};
window.addEventListener("scroll", updateScrollPosition);
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "#revelation.svelte-17woqgr.svelte-17woqgr{animation:svelte-17woqgr-rainbow 6s infinite}@keyframes svelte-17woqgr-rainbow{0%{color:#FF0080}15%{color:#FF00AA}30%{color:#FF00EA}45%{color:#EA00FF}60%{color:#FF00C8}75%{color:#FF009D}100%{color:#FF008C}}.seamless-flow.svelte-17woqgr.svelte-17woqgr{background:transparent;position:relative}.hero-section.svelte-17woqgr.svelte-17woqgr{background:transparent}.projects-flow.svelte-17woqgr.svelte-17woqgr{background:transparent;position:relative;z-index:1}.project-group.svelte-17woqgr.svelte-17woqgr{background:transparent}.project-group.svelte-17woqgr .group.svelte-17woqgr:hover{transform:translateY(-2rem) scale(1.02)}.project-card.svelte-17woqgr.svelte-17woqgr{transition:all 0.5s cubic-bezier(0.4, 0, 0.2, 1);border-radius:12px;padding:1rem;position:relative}.project-card.svelte-17woqgr.svelte-17woqgr::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(45deg, rgba(255, 0, 128, 0.1), transparent);border-radius:12px;opacity:0;transition:opacity 0.3s ease;z-index:-1}.project-card.svelte-17woqgr.svelte-17woqgr:hover::before{opacity:1}@keyframes svelte-17woqgr-pulse-glow{0%,100%{box-shadow:0 0 20px rgba(255, 0, 128, 0.3);transform:scale(1)}50%{box-shadow:0 0 30px rgba(255, 0, 128, 0.5);transform:scale(1.02)}}.social-bubbles.svelte-17woqgr.svelte-17woqgr{animation:svelte-17woqgr-float 3s ease-in-out infinite}.social-bubble.svelte-17woqgr.svelte-17woqgr{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);background:rgba(255, 255, 255, 0.1);border:1px solid rgba(255, 255, 255, 0.2);color:rgba(255, 255, 255, 0.8);transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);position:relative;overflow:hidden}.social-bubble.svelte-17woqgr.svelte-17woqgr::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);transition:left 0.5s}.social-bubble.svelte-17woqgr.svelte-17woqgr:hover::before{left:100%}.social-bubble.svelte-17woqgr.svelte-17woqgr:hover{transform:translateY(-4px) scale(1.1);box-shadow:0 20px 40px rgba(0, 0, 0, 0.3);color:white}.social-bubble.youtube.svelte-17woqgr.svelte-17woqgr:hover{background:rgba(255, 0, 0, 0.2);border-color:rgba(255, 0, 0, 0.5);box-shadow:0 20px 40px rgba(255, 0, 0, 0.2)}.social-bubble.instagram.svelte-17woqgr.svelte-17woqgr:hover{background:linear-gradient(45deg, rgba(225, 48, 108, 0.2), rgba(255, 214, 0, 0.2));border-color:rgba(225, 48, 108, 0.5);box-shadow:0 20px 40px rgba(225, 48, 108, 0.2)}.social-bubble.facebook.svelte-17woqgr.svelte-17woqgr:hover{background:rgba(24, 119, 242, 0.2);border-color:rgba(24, 119, 242, 0.5);box-shadow:0 20px 40px rgba(24, 119, 242, 0.2)}.social-bubble.svelte-17woqgr.svelte-17woqgr:nth-child(1){animation-delay:0s}.social-bubble.svelte-17woqgr.svelte-17woqgr:nth-child(2){animation-delay:0.2s}.social-bubble.svelte-17woqgr.svelte-17woqgr:nth-child(3){animation-delay:0.4s}@keyframes svelte-17woqgr-spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes svelte-17woqgr-float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}.project-group.svelte-17woqgr span.svelte-17woqgr:hover{background:rgba(255, 0, 128, 0.1);border-color:rgba(255, 0, 128, 0.8);color:white}.svelte-17woqgr.svelte-17woqgr::-moz-selection{background-color:#FF0080;color:white}.svelte-17woqgr.svelte-17woqgr::selection{background-color:#FF0080;color:white}.svelte-17woqgr.svelte-17woqgr{border:none;outline:none}@media(max-width: 768px){.social-bubbles.svelte-17woqgr.svelte-17woqgr{top:1rem;right:1rem;gap:0.75rem}.social-bubble.svelte-17woqgr.svelte-17woqgr{width:48px;height:48px}.social-bubble.svelte-17woqgr svg.svelte-17woqgr{width:20px;height:20px}}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ThreeObject;
  let personalData = {};
  let musicProjects = [];
  let programmingProjects = [];
  $$result.css.add(css);
  return `<canvas style="${"top: 0px; right: 20px; z-index: -1; position: fixed; pointer-events: auto;"}" class="${"svelte-17woqgr"}"${add_attribute("this", ThreeObject, 0)}></canvas>


<div class="${"social-bubbles fixed top-8 right-8 z-20 flex flex-col gap-4 svelte-17woqgr"}"><a href="${"https://www.youtube.com/@pawo161"}" target="${"_blank"}" rel="${"noopener noreferrer"}" class="${"social-bubble youtube svelte-17woqgr"}" title="${"YouTube"}"><svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"currentColor"}" class="${"svelte-17woqgr"}"><path d="${"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"}" class="${"svelte-17woqgr"}"></path></svg></a>
	
	<a href="${"https://www.instagram.com/pawel_knorps/"}" target="${"_blank"}" rel="${"noopener noreferrer"}" class="${"social-bubble instagram svelte-17woqgr"}" title="${"Instagram"}"><svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"currentColor"}" class="${"svelte-17woqgr"}"><path d="${"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"}" class="${"svelte-17woqgr"}"></path></svg></a>
	
	<a href="${"https://www.facebook.com/pawo161/"}" target="${"_blank"}" rel="${"noopener noreferrer"}" class="${"social-bubble facebook svelte-17woqgr"}" title="${"Facebook"}"><svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"currentColor"}" class="${"svelte-17woqgr"}"><path d="${"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"}" class="${"svelte-17woqgr"}"></path></svg></a></div>





<div class="${"seamless-flow svelte-17woqgr"}">
	<div class="${"hero-section h-[75vh] flex flex-col justify-center relative svelte-17woqgr"}"><div class="${"group z-10 svelte-17woqgr"}"><h2 class="${"text-white text-6xl font-black tracking-widest ml-20 svelte-17woqgr"}">${escape(personalData.name)}</h2>
			<h2 class="${"text-white text-2xl font-thin tracking-widest mt-6 ml-20 svelte-17woqgr"}">\xA0${escape(personalData.title)} and <mark id="${"revelation"}" style="${"background: none; color: #FF0080;"}" class="${"font-black svelte-17woqgr"}">guitarist.</mark></h2>
			<h2 class="${"text-white text-2xl font-thin tracking-widest mt-6 ml-20 svelte-17woqgr"}">\xA0${escape(personalData.bio)}</h2></div></div>

	
	<div class="${"projects-flow svelte-17woqgr"}">
		${musicProjects.length > 0 ? `<div class="${"project-group ml-24 mb-32 svelte-17woqgr"}"><h3 class="${"text-white text-3xl font-black tracking-widest mb-16 opacity-80 svelte-17woqgr"}"><mark style="${"background: none;"}" class="${"text-[#FF0080] svelte-17woqgr"}">//</mark> MUSIC
				</h3>
				${each(musicProjects, (data, i) => {
    return `<div id="${"music-" + escape(i, true)}" class="${"group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out mr-10 w-[20rem] md:w-[40rem] 2xl:w-[50rem] project-card svelte-17woqgr"}">${data.links ? `<a${add_attribute("href", data.links.youtube || data.links.bandcamp || data.links.soundcloud || data.links.facebook, 0)} rel="${"noopener noreferrer"}" target="${"_blank"}" class="${"block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer svelte-17woqgr"}"><h2 class="${"text-white text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300 svelte-17woqgr"}"><mark style="${"background: none;"}" class="${"text-[#FF0080] svelte-17woqgr"}">.</mark>\xA0${escape(data.title)}</h2>
								<h2 class="${"text-gray-300 text-md font-base mb-6 leading-relaxed svelte-17woqgr"}">${escape(data.description)}</h2>
								<div class="${"flex flex-wrap gap-3 svelte-17woqgr"}">${data.features ? `${each(data.features, (feature) => {
      return `<span class="${"text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200 svelte-17woqgr"}">${escape(feature)}</span>`;
    })}` : ``}</div>
							</a>` : `<div class="${"h-auto px-0 py-0 tracking-widest svelte-17woqgr"}"><h2 class="${"text-white text-xl font-black mb-4 svelte-17woqgr"}"><mark style="${"background: none;"}" class="${"text-[#FF0080] svelte-17woqgr"}">.</mark>\xA0${escape(data.title)}</h2>
								<h2 class="${"text-gray-300 text-md font-base mb-6 leading-relaxed svelte-17woqgr"}">${escape(data.description)}</h2>
								<div class="${"flex flex-wrap gap-3 svelte-17woqgr"}">${data.features ? `${each(data.features, (feature) => {
      return `<span class="${"text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full svelte-17woqgr"}">${escape(feature)}</span>`;
    })}` : ``}</div>
							</div>`}
					</div>`;
  })}</div>` : ``}

		
		${programmingProjects.length > 0 ? `<div class="${"project-group ml-24 mb-32 svelte-17woqgr"}"><h3 class="${"text-white text-3xl font-black tracking-widest mb-16 opacity-80 svelte-17woqgr"}"><mark style="${"background: none;"}" class="${"text-[#FF0080] svelte-17woqgr"}">//</mark> CODE
				</h3>
				${each(programmingProjects, (data, i) => {
    return `<div id="${"programming-" + escape(i, true)}" class="${"group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out mr-10 w-[20rem] md:w-[40rem] 2xl:w-[50rem] project-card svelte-17woqgr"}">${data.github || data.demo ? `<a${add_attribute("href", data.github || data.demo, 0)} rel="${"noopener noreferrer"}" target="${"_blank"}" class="${"block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer svelte-17woqgr"}"><h2 class="${"text-white text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300 svelte-17woqgr"}"><mark style="${"background: none;"}" class="${"text-[#FF0080] svelte-17woqgr"}">.</mark>\xA0${escape(data.title)}</h2>
								<h2 class="${"text-gray-300 text-md font-base mb-6 leading-relaxed svelte-17woqgr"}">${escape(data.description)}</h2>
								<div class="${"flex flex-wrap gap-3 svelte-17woqgr"}">${data.technologies ? `${each(data.technologies, (topic) => {
      return `<span class="${"text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200 svelte-17woqgr"}">${escape(topic)}</span>`;
    })}` : ``}</div>
							</a>` : `<div class="${"h-auto px-0 py-0 tracking-widest svelte-17woqgr"}"><h2 class="${"text-white text-xl font-black mb-4 svelte-17woqgr"}"><mark style="${"background: none;"}" class="${"text-[#FF0080] svelte-17woqgr"}">.</mark>\xA0${escape(data.title)}</h2>
								<h2 class="${"text-gray-300 text-md font-base mb-6 leading-relaxed svelte-17woqgr"}">${escape(data.description)}</h2>
								<div class="${"flex flex-wrap gap-3 svelte-17woqgr"}">${data.technologies ? `${each(data.technologies, (topic) => {
      return `<span class="${"text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full svelte-17woqgr"}">${escape(topic)}</span>`;
    })}` : ``}</div>
							</div>`}
					</div>`;
  })}</div>` : ``}

		
		<div class="${"h-40 bg-gradient-to-b from-transparent to-black/80 svelte-17woqgr"}"></div></div>
</div>`;
});
export {
  Page as default
};
