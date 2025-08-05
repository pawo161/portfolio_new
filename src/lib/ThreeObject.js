import * as THREE from 'three';
import { TextureLoader } from 'three';
import { base } from '$app/paths';
// Create a new TextureLoader
const loader = new TextureLoader();

// Load your image from the static folder
const texture = [
    loader.load(`${base}/my-photo.jpg`),
    loader.load(`${base}/my-photo2.png`),
    loader.load(`${base}/photo3.jpg`),
    loader.load(`${base}/photo4.jpg`),
    loader.load(`${base}/photo5.jpg`),
    loader.load(`${base}/photo6.jpg`),
    loader.load(`${base}/photo8.jpg`),
];

let Renderer;
const SCENE = new THREE.Scene();
let n = 0.2;

// Audio context and sound variables
let audioContext;
let masterGain;
let ambientOscillator;
let noiseBuffer;
let noiseSource;
let morphGain;
let dragGain;
let isAudioInitialized = false;

// Drag controls variables
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let sphereRotation = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
const rotationSpeed = 0.01;
const dampingFactor = 0.1;
let dragStartTime = 0;

// Custom ShaderMaterial for morphing with Perlin noise in vertex shader
const morphShader = {
    uniforms: {
        tDiffuse1: { value: texture[0] },
        tDiffuse2: { value: texture[1] },
        morphFactor: { value: n },
        time: { value: 0} // Added time uniform for noise animation
        // Add a new uniform for the UV offset
        // uvOffset: { value: new THREE.Vector2(0, 0) } 
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
            vec2 offset = vec2(0.3, 0.2); // przesunięcie w prawo o 20% tekstury
            vec2 shiftedUv = fract(vUv + offset); 
            vec4 color1 = texture2D(tDiffuse1, shiftedUv);
            vec4 color2 = texture2D(tDiffuse2, shiftedUv);
            gl_FragColor = mix(color1, color2, morphFactor);
        }
    `
};

const SPHERE = new THREE.Mesh(
    new THREE.SphereGeometry(1, 200, 200),
    new THREE.ShaderMaterial(morphShader)
);

SPHERE.scale.set(1.3, 1.3, 1.3);
SPHERE.position.set(0, 0, 0);
SCENE.add(SPHERE);

// Add light sources
const light = new THREE.AmbientLight(0x404040);
SCENE.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight2.position.set(-1, 0, 1); // Light from a different angle
SCENE.add(directionalLight2);

SCENE.add(directionalLight);
let z = 5;
let m = 0.2;
let CAMERA = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, m, z);
CAMERA.position.z = 2.2;

const projectPoints = new THREE.Group();
SCENE.add(projectPoints);

// Store projects data globally to be set from Svelte
let allProjects = [];

// Declare raycaster, mouse, and INTERSECTED in the global scope
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED = null;
let interactionObjects = []; // Array to hold interaction spheres for raycasting

/**
 * Updates the Three.js scene with project data and regenerates points.
 * @param {Array} musicProjects - The array of music projects.
 * @param {Array} programmingProjects - The array of programming projects.
 */
export const updateProjects = (musicProjects, programmingProjects) => {
    // Clear existing points
    while (projectPoints.children.length > 0) {
        projectPoints.remove(projectPoints.children[0]);
       
    }
    
    // Combine all projects and add IDs
    allProjects = [
        ...musicProjects.map((project, index) => ({
            ...project,
            type: 'music',
            index: index,
            id: `music-${index}`
        })),
        ...programmingProjects.map((project, index) => ({
            ...project,
            type: 'programming',
            index: index,
            id: `programming-${index}`
        }))
    ];
    
    // Create points for each project
    allProjects.forEach((project, globalIndex) => {
        // Distribute points around sphere using golden spiral
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const y = 1 - (globalIndex / (allProjects.length - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = goldenAngle * globalIndex;
        
        const pointMesh = createDestructiblePoint(project, {
            phi: Math.acos(y),
            theta: theta
        });
        projectPoints.add(pointMesh);
    });
    
    // Collect interaction spheres for raycasting
    interactionObjects = projectPoints.children.map(group => group.children.find(child => child instanceof THREE.Mesh));
};

/**
 * Creates a destructible point group with smaller particles and an interaction sphere.
 * @param {object} project - The project data for the point.
 * @param {object} position - The position of the point on the sphere.
 */
const createDestructiblePoint = (project, position) => {
    const pointGroup = new THREE.Group();
    
    // Particle system
    const particleCount = 5;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const radius = 0.005 + Math.random() * 0.01;
        
        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta);
        
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.0 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.5 + Math.random() * 0.3;
        
        sizes[i] = 1 + Math.random() * 1.2;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            destructionFactor: { value: 0 },
            hoverFactor: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float destructionFactor;
            uniform float hoverFactor;
            
            void main() {
                vColor = color;
                
                vec3 pos = position;
                
                pos += normalize(position) * hoverFactor * 0.1;
                
                if (destructionFactor > 0.0) {
                    float explosionForce = destructionFactor * 2.0;
                    pos += normalize(position) * explosionForce;
                    pos += vec3(
                        sin(time * 10.0 + position.x * 20.0) * destructionFactor * 0.05,
                        cos(time * 8.0 + position.y * 15.0) * destructionFactor * 0.05,
                        sin(time * 12.0 + position.z * 18.0) * destructionFactor * 0.05
                    );
                }
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (200.0 / -mvPosition.z) * (1.0 - destructionFactor * 0.5);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            uniform float destructionFactor;
            
            void main() {
                float distance = length(gl_PointCoord - vec2(0.5));
                if (distance > 0.5) discard;
                
                float alpha = 1.0 - distance * 2.0;
                alpha *= (1.0 - destructionFactor * 0.7);
                
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        depthTest: false,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    pointGroup.add(particleSystem);
    
    // Add interaction sphere for raycasting
    const interactionSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    pointGroup.add(interactionSphere);
    
    // Position the group on the sphere
    const sphereRadius = 1.6;
    pointGroup.position.x = sphereRadius * Math.sin(position.phi) * Math.cos(position.theta);
    pointGroup.position.y = sphereRadius * Math.sin(position.phi) * Math.sin(position.theta);
    pointGroup.position.z = sphereRadius * Math.cos(position.phi);
    
    // Store project data and a random movement offset
    pointGroup.userData = {
        ...project,
        originalPosition: pointGroup.position.clone(),
        particleMaterial: particleMaterial,
        destructionFactor: 0,
        hoverFactor: 0,
        isHovered: false,
        isClicked: false,
        movementOffset: Math.random() * 2 * Math.PI
    };
    
    return pointGroup;
};

// Variables for morphing logic
let currentTextureIndex = 0;
let morphing = false;
let baseMorphSpeed = 0.000091;
let morphSpeed = baseMorphSpeed;
const morphDelay = 2000;
let lastMorphTime = 0;
let scrollPosition = 0;

// Audio initialization function
const initAudio = async () => {
    if (isAudioInitialized) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master gain for overall volume control
        masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        masterGain.connect(audioContext.destination);
        
        // Create ambient drone oscillator
        ambientOscillator = audioContext.createOscillator();
        ambientOscillator.type = 'sine';
        ambientOscillator.frequency.setValueAtTime(60, audioContext.currentTime); // Low frequency drone
        
        const ambientGain = audioContext.createGain();
        ambientGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        ambientOscillator.connect(ambientGain);
        ambientGain.connect(masterGain);
        ambientOscillator.start();
        
        // Create noise buffer for texture morphing sounds
        const bufferSize = audioContext.sampleRate * 2;
        noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        // Gain nodes for different sound layers
        morphGain = audioContext.createGain();
        morphGain.gain.setValueAtTime(0, audioContext.currentTime);
        morphGain.connect(masterGain);
        
        dragGain = audioContext.createGain();
        dragGain.gain.setValueAtTime(0, audioContext.currentTime);
        dragGain.connect(masterGain);
        
        console.log('Audio initialized successfully');
        isAudioInitialized = true;
    } catch (error) {
        console.warn('Audio initialization failed:', error);
    }
};

// Function to update audio based on animation state
const updateAudio = (rotationSpeed, morphFactor, isDragging, hoverCount) => {
    if (!isAudioInitialized || !audioContext) return;
    
    const currentTime = audioContext.currentTime;
    
    // Update ambient drone frequency based on rotation speed
    if (ambientOscillator) {
        const baseFreq = 60;
        const speedMultiplier = Math.min(rotationSpeed * 1000, 2);
        const targetFreq = baseFreq + (speedMultiplier * 20);
        ambientOscillator.frequency.exponentialRampToValueAtTime(targetFreq, currentTime + 0.1);
    }
    
    // Morphing sound effects
    if (morphing && morphGain) {
        // Create filtered noise during morphing
        if (!noiseSource) {
            noiseSource = audioContext.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            
            const filter = audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(200 + morphFactor * 800, currentTime);
            filter.Q.setValueAtTime(10, currentTime);
            
            const morphVol = Math.sin(morphFactor * Math.PI) * 0.1;
            morphGain.gain.setValueAtTime(morphVol, currentTime);
            
            noiseSource.connect(filter);
            filter.connect(morphGain);
            noiseSource.start();
        }
        
        // Update filter frequency during morph
        if (noiseSource) {
            const filter = noiseSource.context.createBiquadFilter();
            filter.frequency.exponentialRampToValueAtTime(200 + morphFactor * 800, currentTime + 0.1);
        }
    } else if (!morphing && noiseSource) {
        // Fade out morph sound
        morphGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.5);
        setTimeout(() => {
            if (noiseSource) {
                noiseSource.stop();
                noiseSource = null;
            }
        }, 500);
    }
    
    // Drag interaction sounds
    if (isDragging && dragGain) {
        // Create subtle harmonics during drag
        const dragOsc = audioContext.createOscillator();
        dragOsc.type = 'triangle';
        dragOsc.frequency.setValueAtTime(120, currentTime);
        
        dragGain.gain.setValueAtTime(0.05, currentTime);
        dragOsc.connect(dragGain);
        dragOsc.start();
        dragOsc.stop(currentTime + 0.1);
    }
    
    // Hover interaction sounds
    if (hoverCount > 0 && Math.random() < 0.1) { // Occasional hover sounds
        const hoverOsc = audioContext.createOscillator();
        hoverOsc.type = 'sine';
        hoverOsc.frequency.setValueAtTime(800 + Math.random() * 400, currentTime);
        
        const hoverGain = audioContext.createGain();
        hoverGain.gain.setValueAtTime(0.02, currentTime);
        hoverGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2);
        
        hoverOsc.connect(hoverGain);
        hoverGain.connect(masterGain);
        hoverOsc.start();
        hoverOsc.stop(currentTime + 0.2);
    }
};

// Function to play click sound
const playClickSound = () => {
    if (!isAudioInitialized || !audioContext) return;
    
    const currentTime = audioContext.currentTime;
    
    // Create a click sound with multiple harmonics
    for (let i = 0; i < 3; i++) {
        const clickOsc = audioContext.createOscillator();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(200 * (i + 1), currentTime);
        
        const clickGain = audioContext.createGain();
        clickGain.gain.setValueAtTime(0.1 / (i + 1), currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);
        
        clickOsc.connect(clickGain);
        clickGain.connect(masterGain);
        clickOsc.start();
        clickOsc.stop(currentTime + 0.3);
    }
};

// Scroll tracking
const updateScrollPosition = () => {
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const scrollMultiplier = 1 + (scrollPosition / 1000) * 2;
    morphSpeed = baseMorphSpeed * Math.min(scrollMultiplier, 5);
    
   
    // console.log(n);
};

window.addEventListener('scroll', updateScrollPosition);

const animate = async () => {
    requestAnimationFrame(animate);

    const now = performance.now();
    
    // Update time uniform for sphere's noise animation
    SPHERE.material.uniforms.time.value = now * 0.00001;

    const uniforms = SPHERE.material.uniforms;

    // Handle morphing with scroll-based speed
    if (!morphing && now - lastMorphTime > morphDelay) {
        morphing = true;
        uniforms.tDiffuse1.value = texture[currentTextureIndex];
        currentTextureIndex = (currentTextureIndex + 1) % texture.length;
        uniforms.tDiffuse2.value = texture[currentTextureIndex];
        uniforms.morphFactor.value = 0.0;
        lastMorphTime = now;
        
    }

    if (morphing) {
        uniforms.morphFactor.value += morphSpeed;
        if (uniforms.morphFactor.value >= 1.0) {
            uniforms.morphFactor.value = 1.0;
            morphing = false;
        }
    }

    // Apply drag-based rotation with smooth interpolation
    if (!isDragging) {
        // Smooth interpolation towards target rotation
        sphereRotation.x += (targetRotation.x - sphereRotation.x) * dampingFactor;
        sphereRotation.y += (targetRotation.y - sphereRotation.y) * dampingFactor;
    }

    // Apply rotation to sphere and project points (combining drag rotation with auto rotation)
    const autoRotationX = now * 0.00019;
    const autoRotationY = now * 0.00019;
    
    SPHERE.rotation.x = sphereRotation.x + autoRotationX;
    SPHERE.rotation.y = sphereRotation.y + autoRotationY;
    projectPoints.rotation.copy(SPHERE.rotation);

    z = scrollPosition/60+2;
    m = scrollPosition/5929+0.01;
    n = z-2;
    
    // Count hovering points for audio feedback
    let hoverCount = 0;
    
    // Update particle animations and introduce slow movement
    projectPoints.children.forEach(pointGroup => {
        const userData = pointGroup.userData;
        const material = userData.particleMaterial;
        
        if (userData.isHovered) hoverCount++;
        
        // Slow breathing movement for each point
        const timeFactor = (now * 0.0005) + userData.movementOffset;
        const movementScale = 0.05 * Math.sin(timeFactor);
        const newPosition = userData.originalPosition.clone().multiplyScalar(1 + movementScale);
        pointGroup.position.copy(newPosition);

        if (material && material.uniforms) {
            material.uniforms.time.value = now * 0.00001;
            
            // Hover animation: grow slightly on hover
            if (userData.isHovered && userData.hoverFactor < 1.0) {
                userData.hoverFactor += 0.1;
            } else if (!userData.isHovered && userData.hoverFactor > 0.0) {
                userData.hoverFactor -= 0.1;
            }
            material.uniforms.hoverFactor.value = userData.hoverFactor;
            
            // Click destruction (permanent)
            if (userData.isClicked && userData.destructionFactor < 3.0) {
                userData.destructionFactor += 0.1;
            }
            
            material.uniforms.destructionFactor.value = userData.destructionFactor;
        }
    });

    // Update audio based on current animation state
    const currentRotationSpeed = Math.abs(sphereRotation.x) + Math.abs(sphereRotation.y) + 0.00019;
    const currentMorphFactor = uniforms.morphFactor.value;
    updateAudio(currentRotationSpeed, currentMorphFactor, isDragging, hoverCount);

    if (Renderer) {
        Renderer.render(SCENE, CAMERA);
    }
};

export const resize = async () => {
    if (Renderer) {
        Renderer.setPixelRatio(window.devicePixelRatio);
        Renderer.setSize(window.innerWidth, window.innerHeight);
        CAMERA.aspect = window.innerWidth / window.innerHeight;
        CAMERA.updateProjectionMatrix();
    }
};

// Mouse event handlers
const onMouseDown = (event) => {
    console.log('Mouse down detected'); // Debug log
    
    // Initialize audio on first user interaction
    if (!isAudioInitialized) {
        initAudio();
    }
    
    isDragging = true;
    dragStartTime = performance.now();
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    
    // Change cursor to grabbing
    if (Renderer && Renderer.domElement) {
        Renderer.domElement.style.cursor = 'grabbing';
    }
    
    // Prevent default to avoid text selection
    event.preventDefault();
};

const onMouseMove = (event) => {
    // Update mouse position for raycasting
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
        console.log('Dragging...'); // Debug log
        // Calculate mouse movement delta
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        // Update target rotation based on mouse movement
        targetRotation.y += deltaMove.x * rotationSpeed;
        targetRotation.x += deltaMove.y * rotationSpeed;

        // Immediately update sphere rotation for responsive feel
        sphereRotation.y = targetRotation.y;
        sphereRotation.x = targetRotation.x;

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        
        // Prevent default to avoid scrolling while dragging
        event.preventDefault();
    } else {
        // Handle hover effects when not dragging
        raycaster.setFromCamera(mouse, CAMERA);
        const intersects = raycaster.intersectObjects(interactionObjects);

        if (intersects.length > 0) {
            let intersectedSphere = intersects[0].object;
            let pointGroup = intersectedSphere.parent;

            if (INTERSECTED !== pointGroup && !pointGroup.userData.isClicked) {
                if (INTERSECTED) {
                    INTERSECTED.userData.isHovered = false;
                }

                INTERSECTED = pointGroup;
                INTERSECTED.userData.isHovered = true;
            }
        } else {
            if (INTERSECTED) {
                INTERSECTED.userData.isHovered = false;
                INTERSECTED = null;
            }
        }
        
        // Set cursor style for hover feedback
        if (Renderer && Renderer.domElement) {
            Renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
        }
    }
};

const onMouseUp = (event) => {
    console.log('Mouse up detected'); // Debug log
    const dragDuration = performance.now() - dragStartTime;
    const wasDragging = isDragging && dragDuration > 100; // Consider it a drag if longer than 100ms
    
    isDragging = false;
    
    // Reset cursor
    if (Renderer && Renderer.domElement) {
        Renderer.domElement.style.cursor = 'grab';
    }
    
    // If it was a quick click (not a drag), handle project selection
    if (!wasDragging) {
        handleProjectClick(event);
    }
};

const handleProjectClick = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, CAMERA);
    const intersects = raycaster.intersectObjects(interactionObjects);

    if (intersects.length > 0) {
        let clickedSphere = intersects[0].object;
        let clickedGroup = clickedSphere.parent;
        const project = clickedGroup.userData;
        
        // Play click sound
        playClickSound();
        
        // Mark as clicked and start permanent destruction
        if (!clickedGroup.userData.isClicked) {
            clickedGroup.userData.isClicked = true;
            clickedGroup.userData.isHovered = false;
        }
    
        
        // Scroll to the project section
        const projectElement = document.getElementById(project.id);
        if (projectElement) {
            projectElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Add highlight effect
            projectElement.style.transform = 'scale(1.02)';
            projectElement.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                projectElement.style.transform = 'scale(1)';
            }, 1000);
        }
    }
};

const onMouseClick = (event) => {
    // This is now handled in onMouseUp to better distinguish between clicks and drags
};

// Touch event handlers for mobile support
const onTouchStart = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    onMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY
    });
};

const onTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    onMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
    });
};

const onTouchEnd = (event) => {
    event.preventDefault();
    onMouseUp();
};

export const setScene = async (canvas) => {
    Renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    Renderer.setClearColor("#000000");
    
    // Set initial cursor style
    Renderer.domElement.style.cursor = 'grab';
    
    // Add click-to-enable audio message
    const audioNotice = document.createElement('div');
    audioNotice.id = 'audio-notice';
    audioNotice.innerHTML = '🔊 Click to enable audio';
    audioNotice.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20rem;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 1000;
        transition: opacity 0.3s ease;
        cursor: pointer;
    `;
    document.body.appendChild(audioNotice);
    
    // Remove notice after audio is initialized
    const removeNotice = () => {
        if (isAudioInitialized && audioNotice) {
            audioNotice.style.opacity = '0';
            setTimeout(() => {
                if (audioNotice && audioNotice.parentNode) {
                    audioNotice.parentNode.removeChild(audioNotice);
                }
            }, 300);
        }
    };
    
    // Add event listeners
    window.addEventListener('resize', resize);
    
    // Mouse events - attach to canvas for better control
    canvas.addEventListener('mousedown', (e) => {
        onMouseDown(e);
        removeNotice();
    }, false);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('click', onMouseClick, false);
    
    // Also listen to window for mouse events to handle dragging outside canvas
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        onTouchStart(e);
        removeNotice();
    }, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    
    console.log('Scene initialized with drag controls and audio'); // Debug log
    
    await resize();
    await animate();
};