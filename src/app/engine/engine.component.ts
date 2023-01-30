import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html',
  styleUrls: ['./engine.component.scss']
})
export class EngineComponent implements OnInit {

  constructor() { }

  private scene!: THREE.Scene
  private renderer!: THREE.WebGLRenderer
  private camera!: THREE.PerspectiveCamera

  private mixers: any[] = [];
  private clock: any;


  @ViewChild('canvas', { static: true }) canvas!: ElementRef;
  @HostListener('window:resize', ['$event'])

  ngOnInit(): void {
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.domElement.style.background = 'linear-gradient( 180deg, rgba( 8,10,27,1 ) 0%, rgba( 39,46,102,1 ) 100% )'; // change bg color here

    // postprocess
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.toneMappingExposure = 1;

    this.canvas.nativeElement.appendChild(this.renderer.domElement)

    this.clock = new THREE.Clock();

    this.environment()
    this.light()
    this.loadScene()
    this.loadAvatar()
    this.controller()
  }

  controller() {
    // set camera target
    this.camera.position.set(0, 0.5, 2.4);

    var controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set(0, 0.6, 0); // set camera position
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      // RIGHT: ''
    }
    controls.enableDamping = true;
    controls.dampingFactor = 1;
    controls.screenSpacePanning = false;

    controls.update();
  }

  environment() {
    // set HDR 
    new RGBELoader()
      .setPath('../../assets/hdr/')
      .load('interior.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = texture;
      });
  }

  light() {

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 0, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(10, 10, 10);
    this.scene.add(dirLight);

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    const d = 4;

    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    const rectLight1 = new THREE.RectAreaLight(0xffffff, 5, 4, 10);
    rectLight1.position.set(0, 5, 5);

    const pointLight = new THREE.PointLight(0xffffff)
    pointLight.position.set(0, 0, 2);

  }

  loadScene() {

    const loader = new GLTFLoader();

    loader.load(
      '../../assets/model/scene0.gltf',
      (gltf) => {
        gltf.scene.traverse((node: THREE.Object3D) => {
          if (node instanceof THREE.Mesh) {

            // material config with standard 1.2 for supporting multiple materials

            let texture = node.material.map
            let color = node.material.color
            let roughness = node.material.roughness
            let metalness = node.material.metalness
            let emissive = node.material.emissive
            if (texture) {
              node.material = new THREE.MeshStandardMaterial({ map: texture, roughness: roughness, metalness: metalness, emissive: emissive, envMap: this.scene.environment, envMapIntensity: 0.5 });
            } else {
              node.material = new THREE.MeshStandardMaterial({ color: color, roughness: roughness, metalness: metalness, emissive: emissive, envMap: this.scene.environment, envMapIntensity: 0.5 });
            }

            // -------------------------------------------

            node.castShadow = true
            node.receiveShadow = true
          }
        });

        gltf.scene.name = 'scene'
        gltf.scene.position.set(0, 0, 0)
        this.scene.add(gltf.scene);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.log('An error happened');
      }
    );
  }

  loadAvatar() {

    const loader = new GLTFLoader();

    loader.load(
      '../../assets/model/masque0.gltf',
      (gltf) => {
        gltf.scene.traverse((node: THREE.Object3D) => {
          if (node instanceof THREE.Mesh) {

            // material config with standard 1.2 for supporting multiple materials

            let texture = node.material.map
            let color = node.material.color
            let roughness = node.material.roughness
            let metalness = node.material.metalness
            let emissive = node.material.emissive
            if (texture) {
              node.material = new THREE.MeshStandardMaterial({ map: texture, roughness: roughness, metalness: metalness, emissive: emissive, envMap: this.scene.environment, envMapIntensity: 0.5 });
            } else {
              node.material = new THREE.MeshStandardMaterial({ color: color, roughness: roughness, metalness: metalness, emissive: emissive, envMap: this.scene.environment, envMapIntensity: 0.5 });
            }

            // -------------------------------------------


            node.castShadow = true
            node.receiveShadow = true
          }
        });

        const mixer = new THREE.AnimationMixer(gltf.scene);
        let animIdx = gltf.animations.findIndex((obj: any) => obj.name == 'anim_masque0_idle0')
        mixer.clipAction(gltf.animations[(animIdx > -1 ? animIdx : 0)]).play(); // idle

        this.mixers.push(mixer);

        gltf.scene.position.set(0, 0, 0)
        this.scene.add(gltf.scene);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.log('An error happened');
      }
    );
  }

  ngAfterViewInit() {
    this.animate()
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // get the width and height of the window
    const width = window.innerWidth;
    const height = window.innerHeight;

    // update the size of the canvas
    this.renderer.setSize(width, height);

    // update the camera aspect ratio
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // re-render the scene
    this.renderer.render(this.scene, this.camera);
  }


  animate() {
    this.renderer.setAnimationLoop(() => { // fix frame late
      const delta = this.clock.getDelta();
      for (const mixer of this.mixers) mixer.update(delta);
      this.renderer.render(this.scene, this.camera)

    })
  }



}
