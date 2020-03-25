import '../style/main.styl'

import * as THREE from 'three'
import CubePresenters from './objects/CubePresenters.js'
import LightManager from './objects/LightManager.js'
import Floor from './objects/Floor.js'
import Camera from './objects/Camera.js'
import CloudGenerator from './objects/CloudGenerator'
import Islands from './objects/Islands'

const textureLoader = new THREE.TextureLoader()
const detailPopup = document.querySelector('#js-blockDetailPopup')

detailPopup.addEventListener('click', () => {
    detailPopup.classList.remove('open')
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: function() { return this.width / this.height }
}

/**
 * Welcome screen and pointer lock
 */
const welcomeScreen = document.querySelector('#js-welcomeScreen')
const playForm = welcomeScreen.querySelector('#js-playForm')
playForm.addEventListener('submit', (e) => {
    e.preventDefault()
    renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock || renderer.domElement.webkitPointerLockElement
    renderer.domElement.requestPointerLock()
    welcomeScreen.classList.add('hidden')
})

// document.pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement
function pointerLockChange() {
    if (!!document.pointerLockElement) {
        console.log("Pointer locked")
    } else {
        welcomeScreen.classList.remove('hidden')
    }
}
document.addEventListener('pointerlockchange', pointerLockChange, false)
document.addEventListener('mozpointerlockchange', pointerLockChange, false)
document.addEventListener('webkitpointerlockchange', pointerLockChange, false)

/** 
 * Scene
*/
const cubesNumber = 20

const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x0E050F )
scene.fog = new THREE.FogExp2(0x0E0E0E, 0.05)
const camera = new Camera(scene, sizes)

const floor = new Floor(scene, textureLoader, cubesNumber)
const cubePresenters = new CubePresenters(scene, textureLoader, cubesNumber, detailPopup)
const clouds = new CloudGenerator(scene, cubesNumber)
const islands = new Islands(scene, textureLoader)
const lightManager = new LightManager(scene)

/** 
 * Renderer
*/
const renderer = new THREE.WebGLRenderer()
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)) // Pour le limiter à 2 (perf)
document.querySelector('#app').appendChild(renderer.domElement)
renderer.render(scene,camera.elem)

/** 
 * Resize
*/
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    renderer.setSize(sizes.width,sizes.height)
    camera.resize(sizes)
    renderer.render(scene,camera.elem)
})

/** 
 * Cursor
*/
const userData = {
    cursorX: 0,
    cursorY: 0,
    deltaY: 0,
    keyMoveX: 0,
    keyMoveY: 0
}
document.addEventListener('mousemove', (e) => {
    userData.cursorX += e.movementX
    userData.cursorY += e.movementY
})

window.addEventListener('wheel', e => userData.deltaY += e.deltaY )

window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyS':
            userData.keyMoveY = 0.2
            break;
        case 'KeyW':
            userData.keyMoveY = -0.2
            break;
        case 'KeyA':
            userData.keyMoveX = -0.2
            break;
        case 'KeyD':
            userData.keyMoveX = 0.2
            break;
        case 'ArrowDown':
            userData.keyMoveY = 0.2
            break;
        case 'ArrowUp':
            userData.keyMoveY = -0.2
            break;
        case 'ArrowLeft':
            userData.keyMoveX = -0.2
            break;
        case 'ArrowRight':
            userData.keyMoveX = 0.2
            break;
        default:
            break;
    }
})
window.addEventListener('keyup', (e) => {
    if (e.code == 'ArrowDown' || e.code == 'ArrowUp' || e.code == 'KeyW' || e.code == 'KeyS') {
        userData.keyMoveY = 0
    } else if (e.code == 'ArrowLeft' || e.code == 'ArrowRight' || e.code == 'KeyA' || e.code == 'KeyD') {
        userData.keyMoveX = 0
    }
})

window.addEventListener('click', () => cubePresenters.click(camera.elem))

/** 
 * Animation
*/
const animate = () => {
    requestAnimationFrame(animate)

    cubePresenters.update()

    camera.update(userData, sizes)
    userData.deltaY = 0
    renderer.render(scene,camera.elem)
}

animate()


// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/static/draco/')
// const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

// /** 
//  * Model import
// */
// gltfLoader.load(
//     '/static/duck/glTF-Draco/Duck.gltf',
//     (gltf) => {
//         while (gltf.scene.children.length) {
//             const child = gltf.scene.children[0]
//             child.position.y = -1
//             scene.add(child)
//         }
//     },
//     (progress) => {
//         console.log('progress', progress);
//     },
//     (error) => {
//         console.log('error', error);
//     }
// )