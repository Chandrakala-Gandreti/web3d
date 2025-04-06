import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

// Constants
const SIZES = { width: window.innerWidth, height: window.innerHeight };
const ASPECT_RATIO = SIZES.width / SIZES.height;
const CANVAS = document.querySelector('canvas.webgl');
const LOADING_OVERLAY = document.getElementById('loading-overlay');
const LOADING_CANVAS = document.querySelector('.loading-canvas');

// Loading Scene Setup
const loadingScene = new THREE.Scene();
const loadingCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100); // Square aspect ratio
loadingCamera.position.set(0, 0, 5);
const loadingRenderer = new THREE.WebGLRenderer({
    canvas: LOADING_CANVAS,
    antialias: true,
    alpha: true,
});
loadingRenderer.setSize(300, 300);
loadingRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Loading Model
let loadingModel;
const gltfLoader = new GLTFLoader();
const loadLoadingModel = () => new Promise((resolve) => {
    gltfLoader.load(
        './public/headphone.glb',
        (gltf) => {
            loadingModel = gltf.scene;
            loadingModel.scale.set(0.5, 0.5, 0.5);
            loadingModel.position.set(0, 0, 0);
            loadingScene.add(loadingModel);
            resolve(loadingModel);
        },
        undefined,
        (error) => {
            console.error('Loading model failed:', error);
            const fallbackGeometry = new THREE.BoxGeometry(1, 1, 1);
            const fallbackMaterial = new THREE.MeshStandardMaterial({ color: '#4a90e2' });
            loadingModel = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            loadingModel.scale.set(0.5, 0.5, 0.5);
            loadingScene.add(loadingModel);
            resolve(loadingModel);
        }
    );
});

// Loading Lights
const setupLoadingLights = (target) => {
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
    loadingScene.add(ambientLight);
    const spotLight = new THREE.SpotLight('#ffffff', 5, 10, Math.PI / 6);
    spotLight.position.set(2, 3, 3);
    spotLight.target = target;
    loadingScene.add(spotLight);
};

// Loading Animation
const loadingClock = new THREE.Clock();
const animateLoading = () => {
    if (loadingModel) {
        loadingModel.rotation.y += 0.03;
    }
    loadingRenderer.render(loadingScene, loadingCamera);
    requestAnimationFrame(animateLoading);
};

// Main Scene Setup
const scene = new THREE.Scene();
scene.background = null;

// Main Camera
const camera = new THREE.PerspectiveCamera(45, ASPECT_RATIO, 0.1, 100);
camera.position.set(-2, 1, 7);
scene.add(camera);

// Main Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: CANVAS,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
});
renderer.setSize(SIZES.width, SIZES.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

// Orbit Controls
const controls = new OrbitControls(camera, CANVAS);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.minDistance = 4;
controls.maxDistance = 15;

// Global Variables
let headphoneModel;
let spotlight;
let isIntroVisible = true;
let isContactVisible = false;

// Main Model Loading
const loadModel = () => new Promise((resolve) => {
    gltfLoader.load(
        './public/headphone.glb',
        (gltf) => {
            headphoneModel = gltf.scene;
            headphoneModel.scale.set(1, 1, 1);
            headphoneModel.position.set(2, -0.5, 0);
            headphoneModel.rotation.set(0, Math.PI / 2, 0);
            headphoneModel.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = 1; // Start fully visible
                }
            });
            scene.add(headphoneModel);
            resolve(headphoneModel);
        },
        undefined,
        (error) => {
            console.error('Main model loading failed:', error);
            const fallbackGeometry = new THREE.BoxGeometry(1, 1, 1);
            const fallbackMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000', transparent: true, opacity: 1 });
            headphoneModel = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            headphoneModel.scale.set(1, 1, 1);
            headphoneModel.position.set(2, -0.5, 0);
            headphoneModel.rotation.set(0, Math.PI / 2, 0);
            scene.add(headphoneModel);
            resolve(headphoneModel);
        }
    );
});

// Main Lights
const setupLights = (target) => {
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    scene.add(ambientLight);

    spotlight = new THREE.SpotLight('#ffffff', 8, 15, Math.PI / 8, 0.3);
    spotlight.position.set(3, 5, 5);
    spotlight.target = target;
    scene.add(spotlight);

    const rimLight = new THREE.PointLight('#4a90e2', 5, 15);
    rimLight.position.set(-2, 2, -5);
    scene.add(rimLight);
};

// Resize Handler
const handleResize = () => {
    SIZES.width = window.innerWidth;
    SIZES.height = window.innerHeight;
    camera.aspect = SIZES.width / SIZES.height;
    camera.updateProjectionMatrix();
    renderer.setSize(SIZES.width, SIZES.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (headphoneModel) {
        if (SIZES.width <= 480) {
            headphoneModel.scale.set(0.8, 0.8, 0.8);
            camera.position.set(-1, 0.5, 4);
            controls.minDistance = 3;
            controls.maxDistance = 10;
            loadingRenderer.setSize(150, 150);
        } else if (SIZES.width <= 768) {
            headphoneModel.scale.set(1, 1, 1);
            camera.position.set(-1.5, 0.8, 5);
            controls.minDistance = 4;
            controls.maxDistance = 12;
            loadingRenderer.setSize(200, 200);
        } else {
            headphoneModel.scale.set(1, 1, 1);
            camera.position.set(-2, 1, 7);
            controls.minDistance = 4;
            controls.maxDistance = 15;
            loadingRenderer.setSize(300, 300);
        }
    }
};
window.addEventListener('resize', handleResize);

// Main Animation Loop
const clock = new THREE.Clock();
const animate = () => {
    controls.update();
    if (headphoneModel && spotlight) {
        spotlight.position.x = headphoneModel.position.x;
        spotlight.position.z = 5;
        if (isIntroVisible) {
            headphoneModel.rotation.y += 0.005;
        }
        if (isContactVisible) {
            headphoneModel.rotation.y += 0.003;
            headphoneModel.rotation.x += 0.002;
        }
    }
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

// GSAP Animations
const setupAnimations = () => {
    const sections = document.querySelectorAll('.container');

    const animateSection = (index, section) => {
        const tl = gsap.timeline();
        // No opacity animation needed here since model starts visible

        switch (index) {
            case 0: // Intro
                tl.fromTo(headphoneModel.scale, { x: 0.1, y: 0.1, z: 0.1 }, { x: 1.2, y: 1.2, z: 1.2, duration: 1.2, ease: 'expo.out' })
                  .fromTo(headphoneModel.position, { y: -2 }, { y: -0.5, duration: 1.2, ease: 'power4.out' }, 0)
                  .to(headphoneModel.position, { x: 2, duration: 1.2, ease: 'power4.inOut' }, 0)
                  .to(camera.position, { x: -2, y: 1, z: 5, duration: 1.2 }, 0);
                break;
            case 1: // Overview
                tl.to(headphoneModel.position, { x: -2, duration: 1.2, ease: 'power4.inOut' })
                  .to(headphoneModel.rotation, { y: -0.3, duration: 1.2 }, 0.3)
                  .to(camera.position, { x: 0, y: 3, z: 4, duration: 1.5 }, 0);
                break;
            case 2: // Features
                tl.fromTo(headphoneModel.position, 
                    { x: -2 }, 
                    { x: 2, y: 0, z: 0.1, duration: 1.5, ease: 'elastic.out(1, 0.4)' })
                  .to(headphoneModel.rotation, { y: 0.3, x: 0.2, duration: 1.3 }, 0.2)
                  .to(spotlight, { intensity: 10, duration: 0.8 }, 0);
                break;
            case 3: // Specs
                tl.fromTo(headphoneModel.position, 
                    { x: 2, y: 0, z: 0.1 }, 
                    { x: -1.5, y: -0.5, z: -0.5, duration: 1.3, ease: 'power4.out' })
                  .to(headphoneModel.rotation, { y: -0.5, z: 0.1, duration: 1.2 }, 0.2);
                break;
            case 4: // Contact
                tl.fromTo(headphoneModel.position, 
                    { x: -1.5, y: -0.5, z: -0.5 }, 
                    { x: 0, y: 0.5, z: 3, duration: 1.5, ease: 'power4.out' })
                  .to(headphoneModel.rotation, { x: 0.2, y: Math.PI, z: -0.1, duration: 1.8 }, 0.3)
                  .to(headphoneModel.position, { y: 0, z: 0, duration: 1.5, ease: 'expo.inOut' }, 2)
                  .to(spotlight, { intensity: 12, angle: Math.PI / 6, duration: 1.2 }, 0);
                isContactVisible = true;
                break;
        }
    };

    sections.forEach((section, index) => {
        const content = section.querySelector('.content');
        gsap.set(content, { opacity: 0, y: 30 });

        gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                onEnter: () => {
                    if (index === 0) isIntroVisible = true;
                    if (index === 4) isContactVisible = true;
                    animateSection(index, section);
                    gsap.to(content, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
                },
                onLeave: () => {
                    if (index === 0) isIntroVisible = false;
                    if (index === 4) isContactVisible = false;
                    gsap.to(content, { opacity: 0, y: 30, duration: 0.6, ease: 'power3.in' });
                },
                onEnterBack: () => {
                    if (index === 0) isIntroVisible = true;
                    if (index === 4) isContactVisible = true;
                    animateSection(index, section);
                    gsap.to(content, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
                },
                onLeaveBack: () => {
                    if (index === 0) isIntroVisible = false;
                    if (index === 4) isContactVisible = false;
                    gsap.to(content, { opacity: 0, y: 30, duration: 0.6, ease: 'power3.in' });
                }
            }
        });
    });

    animateSection(0); // Trigger intro animation
};

// Initialization
const init = async () => {
    try {
        // Setup loading scene
        const loadingModelInstance = await loadLoadingModel();
        setupLoadingLights(loadingModelInstance);
        animateLoading();

        // Simulate loading progress (e.g., 3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Smoothly hide loading overlay with scale effect
        gsap.to(LOADING_OVERLAY, {
            opacity: 0,
            scale: 0.98,
            duration: 0.8,
            ease: 'power3.inOut',
            onComplete: () => {
                LOADING_OVERLAY.classList.add('hidden');
                loadingRenderer.dispose();
                loadingScene.clear(); // Clean up loading scene
            }
        });

        // Setup main scene
        const model = await loadModel();
        setupLights(model);
        animate();

        // Reveal main content smoothly (no opacity change for model)
        gsap.fromTo('main', 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 }
        );
        // Model is already visible, so animate its entrance with scale and position
        gsap.fromTo(headphoneModel.scale, 
            { x: 0.5, y: 0.5, z: 0.5 }, 
            { x: 1, y: 1, z: 1, duration: 1, ease: 'power2.out', delay: 0.4 }
        );
        gsap.fromTo(headphoneModel.position, 
            { y: -1 }, 
            { y: -0.5, duration: 1, ease: 'power2.out', delay: 0.4 }
        );

        setupAnimations();
    } catch (error) {
        console.error('Initialization failed:', error);
    }
};

init();