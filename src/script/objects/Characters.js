import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class Characters {

    constructor(_scene, _textureLoader) {
        this.characters = {}
        this.scene = _scene

        this.characterMaterials = []
        for (let i = 0; i < 8; i++) {
            console.log("loooop");
            
            const characterTexture = _textureLoader.load(`/static/character/texture_${i}.png`)
            console.log(`/static/character/texture_${i}.png`)
            console.log(characterTexture);
            characterTexture.magFilter = THREE.NearestFilter
            characterTexture.minFilter = THREE.NearestFilter
            this.characterMaterials.push(new THREE.MeshStandardMaterial({ map: characterTexture }))
        }

        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/static/draco/')
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)

        gltfLoader.load(
            '/static/character/steve.glb',
            (gltf) => {
                let character = new THREE.Group()
                character.scale.set(1.4,1.4,1.4)
                while (gltf.scene.children.length) {
                    const child = gltf.scene.children[0]
                    child.material = this.characterMaterials[0]
                    const pivot = new THREE.Object3D()
                    // console.log(child)
                    pivot.add(child)
                    pivot.name = `pivot${child.name}`
                    if (child.name == 'leftArm' || child.name == 'rightArm') {
                        const height = new THREE.Box3().setFromObject(child).getSize().y - 0.05
                        pivot.position.y = height * 2
                        child.position.y = height * -2
                    } else if (child.name == 'leftLeg' || child.name == 'rightLeg') {
                        const height = new THREE.Box3().setFromObject(child).getSize().y + 0.05
                        pivot.position.y = height * 1
                        child.position.y = height * -1
                    } else if (child.name == 'Head') {
                        const height = new THREE.Box3().setFromObject(child).getSize().y + 0.05
                        pivot.position.y = height * 3
                        child.position.y = height * -3
                    }
                    character.add(pivot)
                }
                this.baseCharacter = character
            },
            (progress) => {
                console.log('progress', progress);
            },
            (error) => {
                console.log('error', error);
            }
        )
    }

    updatePlayer(data) {
        if (this.characters[data.id] === undefined) {
            this.characters[data.id] = new THREE.Group()
            this.characters[data.id].scale.set(1.4,1.4,1.4)
            this.baseCharacter.children.forEach(element => {
                element.children[0].material = this.characterMaterials[data.skin || 0]
                this.characters[data.id].add(element.clone())
            })
            this.characters[data.id].userData = {
                movementPosition: 0,
                movementDirection: true
            }
            this.scene.add(this.characters[data.id])
        }
        this.characters[data.id].position.x = data.x
        this.characters[data.id].position.z = data.z
        this.characters[data.id].rotation.y = data.rotY
        this.characters[data.id].getObjectByName('pivotHead').rotation.x = data.rotX
        this.characters[data.id].userData.movementPosition += this.characters[data.id].userData.movementDirection ? 1 : -1
        if (this.characters[data.id].userData.movementPosition > 10 || this.characters[data.id].userData.movementPosition < -10) {
            this.characters[data.id].userData.movementDirection = !this.characters[data.id].userData.movementDirection
        }
        if(this.characters[data.id].userData.movementDirection) {
            this.characters[data.id].getObjectByName('pivotleftArm').rotation.x -= Math.PI * 0.03
            this.characters[data.id].getObjectByName('pivotrightArm').rotation.x += Math.PI * 0.03
            this.characters[data.id].getObjectByName('pivotleftLeg').rotation.x += Math.PI * 0.03
            this.characters[data.id].getObjectByName('pivotrightLeg').rotation.x -= Math.PI * 0.03
        } else {
            this.characters[data.id].getObjectByName('pivotleftArm').rotation.x += Math.PI * 0.03
            this.characters[data.id].getObjectByName('pivotrightArm').rotation.x -= Math.PI * 0.03
            this.characters[data.id].getObjectByName('pivotleftLeg').rotation.x -= Math.PI * 0.03
            this.characters[data.id].getObjectByName('pivotrightLeg').rotation.x += Math.PI * 0.03
        }
    }

    removePlayerWithId(id) {
        console.log('remove player with id', id)
        this.scene.remove(this.characters[id])
        delete this.characters[id]
    }

}