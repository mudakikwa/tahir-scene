/* eslint-disable no-undef */
/* eslint-disable */
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader.js";
import Stats from "three/examples/jsm/libs/stats.module";
import HdrFile from "./texture/interior.hdr";
import { TextureLoader } from "three";

export default function App(props) {
  let simulationDetails = [
    {
      simulations_id:
        "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/simulations_glb/192903",
      texture_file_type: {
        diffuse:
          "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/inventory/765",
        normal:
          "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/inventory/766",
        roughness:
          "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/inventory/769",
        heatmap:
          "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/inventory/765"
      },
      fit_meter_position: 71.95314591700134
    },
    {
      simulations_id:
        "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/simulations_glb/192984",
      texture_file_type: {
        diffuse:
          "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/inventory/748",
        normal:
          "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/inventory/747",
        roughness:
          "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/inventory/751",
        heatmap:
          "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/inventory/748"
      },
      fit_meter_position: 64.01779701779702
    }
  ];
  const material = new THREE.MeshStandardMaterial();

  const stats = Stats();
  document.body.appendChild(stats.dom);

  const params = {
    exposure: 1.5,
    Emissive: material.emissive.getHex()
  };

  const avatarId = 23385;
  var renderer,
    camera,
    scene,
    controls,
    width,
    height,
    container,
    texture2,
    main,
    createCamera,
    createLights,
    createRenderer,
    createControls,
    createGround,
    createGridHelper,
    createLoader,
    render,
    onWindowResize,
    manageGlb,
    obj,
    newObj,
    blob,
    imageUrl,
    loadingManager,
    containerRef;

  containerRef = useRef(null);

  useEffect(() => {
    main = () => {
      container = containerRef.current;

      scene = new THREE.Scene();
      loadingManager = new THREE.LoadingManager(
        () => {
          render();
        },
        (url, numberloaded, allobj) => {
          console.log({
            payload: parseInt((numberloaded / allobj) * 100)
          });
        }
      );
      createCamera();

      createLights();

      createLights();

      createGround();

      createGridHelper();

      createRenderer();

      createControls();

      createLoader();

      createLoader();

      animate();
    };
    manageGlb = (url, object, datainfo, type, textures) => {
      ``;
      let loader = null;
      if (type === "glb") {
        loader = new GLTFLoader(loadingManager);
      } else {
        loader = new OBJLoader(loadingManager);
      }
      loader.load(url, function (gltf1) {
        let obj3d = null;
        if (type === "glb") {
          obj3d = gltf1.scene;
        } else {
          obj3d = gltf1;
        }
        obj3d.traverse(function (child) {
          if (child.isMesh) {
            //  roughnessMipmapper.generateMipmaps(child.material);
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material.map) child.material.map.anistropy = 16;
            if (object === "shoe_right" || object === "shoe_left") {
              child.material = new THREE.MeshStandardMaterial({
                color: "black"
              });
            }
            if (object === "hair") {
              let alphaMapTexture = new TextureLoader(loadingManager).load(
                "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/avatar_accessories/hair-brunette_hair_alpha_map"
              );
              console.log(child);
              child.material.roughness = 1;
              alphaMapTexture.flipY = false;
              console.log(object);
              // child.material.blending = THREE.CustomBlending;
              // child.material.blendEquation=THREE.AddEquation
              // child.material.blendSrc=THREE.SrcAlphaFactor
              // child.material.Dst=THREE.OneMinusSrcAlphaFactor
              // child.material.alphaMap = alphaMapTexture;

              // child.material.roughness=0.8
            }
            if (object === "garment") {
              let diffuseTexture = new THREE.TextureLoader(loadingManager).load(
                textures.diffuse
              );
              diffuseTexture.flipY = false;
              diffuseTexture.encoding = THREE.sRGBEncoding;
              let roughnessTexture = new THREE.TextureLoader(
                loadingManager
              ).load(textures.roughness);
              roughnessTexture.flipY = false;
              let normalTexture = new THREE.TextureLoader(loadingManager).load(
                textures.normal
              );
              normalTexture.flipY = false;
              child.material = new THREE.MeshStandardMaterial({
                map: diffuseTexture,
                roughnessMap: roughnessTexture,
                normalMap: normalTexture,
                toneMapped: false,
                roughness: 0.85
              });
              console.log(child.material);
              render();
            }
          }
        });
        if (object === "garment" || object === "avatar") {
          obj3d.scale.set(1, 1, 1);
          scene.add(obj3d);
        } else {
          let objinfo = datainfo[object];
          obj3d.scale.set(objinfo.scale_x, objinfo.scale_z, objinfo.scale_y);
          if (type !== "glb") {
            obj3d.rotation.x = THREE.Math.degToRad(objinfo.rot_x - 90);
            obj3d.rotation.y = THREE.Math.degToRad(objinfo.rot_z);
            obj3d.rotation.z = THREE.Math.degToRad(-objinfo.rot_y);
          }
          obj3d.position.x = objinfo.pos_x;
          obj3d.position.y = objinfo.pos_z;
          obj3d.position.z = -objinfo.pos_y;
          scene.add(obj3d);
          render();

          if (object === "garment") {
            diffuseTexture.dispose();
            roughnessTexture.dispose();
            normalTexture.dispose();
          }
        }
      });
    };
    createCamera = () => {
      let fieldOfView = 60;
      let aspectRatio = container.clientWidth / container.clientHeight;
      let nearPlane = 0.1;
      let farPlane = 1000;
      camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
      );
      camera.position.set(0, 4, 6);
    };

    createLights = () => {
      let dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(-2, 4, -3);
      dirLight.target.position.y = 2;
      scene.add(dirLight);
      dirLight.target.updateMatrixWorld();
      dirLight.castShadow = true;
      dirLight.shadow.bias = -0.00001;
      dirLight.shadow.mapSize.height = 1024 * 4;
      dirLight.shadow.mapSize.width = 1024 * 4;
      let dirLighttwo = new THREE.DirectionalLight(0xffffff, 0.5);
      dirLighttwo.position.set(2, 4, 3);
      dirLight.position.multiplyScalar(30);
      dirLighttwo.target.position.y = 2;
      scene.add(dirLighttwo);
      dirLighttwo.target.updateMatrixWorld();
      dirLighttwo.castShadow = true;
      dirLighttwo.shadow.bias = -0.0001;
      dirLighttwo.shadow.mapSize.height = 1024 * 4;
      dirLighttwo.shadow.mapSize.width = 1024 * 4;
    };

    createRenderer = () => {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.setClearColor(0xa9a9a9);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);
      /**
       * Tahir Test
       */
      // renderer.shadowMap.type = THREE.PCFShadowMap
      // renderer.physicallyCorrectLights = true
      // renderer.toneMapping = THREE.ReinhardToneMapping
      // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    };

    createControls = () => {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(2, 2, 2);
      controls.addEventListener("change", render);
      controls.minDistance = 2;
      controls.maxDistance = 8;
      controls.minPolarAngle = 1;
      controls.maxPolarAngle = 1.8;
    };

    createGround = () => {
      let geom = new THREE.CircleGeometry(50, 50);
      geom.computeBoundingBox();

      let material = new THREE.ShaderMaterial({
        vertexShader: `
        vec3;
        varying vec2 vUv;
        void main() {       
          vUv =uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        }
      `,
        fragmentShader: `
        vec3;
        varying vec2 vUv;
        void main() {
          float alpha = smoothstep(0.4, 0.0, sqrt((vUv.x -0.5) * (vUv.x - 0.5) + (vUv.y -0.5 ) * (vUv.y -0.5)));
          gl_FragColor = vec4(1, 1 , 1, alpha);
        }
      `
      });

      let diffused_ground = new THREE.Mesh(geom, material);
      diffused_ground.rotation.x = -Math.PI / 2;
      diffused_ground.receiveShadow = true;
      diffused_ground.material.transparent = true;
      scene.add(diffused_ground);
    };

    createGridHelper = () => {
      let grid = new THREE.GridHelper(50, 20, 0x000000, 0x000000);
      grid.material.opacity = 0.12;
      grid.material.transparent = true;
      scene.add(grid);
    };

    createLoader = () => {
      let cubeMaps = {
        sky: {
          path:
            "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/resources/",
          images: [
            "px-min.jpg",
            "nx-min.jpg",
            "py-min.jpg",
            "ny-min.jpg",
            "pz-min.jpg",
            "nz-min.jpg"
          ]
        }
      };
      fetch(
        "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/avatar_accessories_json/" +
          avatarId,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        }
      )
        .then(function (response) {
          return response.json();
        })
        .then((data) => {
          let environmentTexture = new THREE.CubeTextureLoader(loadingManager)
            .setPath(cubeMaps["sky"].path)
            .load(cubeMaps["sky"].images);
          // let hdrMap = new RGBELoader(loadingManager).load(
          //   'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/ninomaru_teien_1k.hdr',
          // );
          const rgbeloader = new RGBELoader(loadingManager).load(
            HdrFile,
            function (texture) {
              texture.mapping = THREE.EquirectangularReflectionMapping;
              scene.background = environmentTexture;
              scene.environment = texture;
              console.log(texture);
            }
          );

          var gui = new GUI();
          gui.add(params, "exposure", 0, 4, 0.01).onChange(render);
          gui.open();
          // hdrMap.mapping = THREE.EquirectangularReflectionMapping;
          // scene.environment = hdrMap;

          scene.fog = new THREE.Fog(0xffffff, 20, 21);
          let jsonLink = data;
          manageGlb(
            "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/avatars_glb/" +
              avatarId,
            "avatar",
            jsonLink,
            "glb"
          );
          manageGlb(
            "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/avatar_accessories/shoe_left-clo3d_heel.obj",
            "shoe_left",
            jsonLink,
            "obj"
          );
          manageGlb(
            "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/avatar_accessories/shoe_right-clo3d_heel.obj",
            "shoe_right",
            jsonLink,
            "obj"
          );
          manageGlb(
            "https://deep-gears-storage.s3.eu-west-2.amazonaws.com/avatar_accessories/hair-brunette_hair.glb",
            "hair",
            jsonLink,
            "glb"
          );

          simulationDetails.forEach((element) => {
            if (element.simulations_id) {
              manageGlb(element.simulations_id, "garment", jsonLink, "glb", {
                diffuse: element.texture_file_type.diffuse,
                normal: element.texture_file_type.normal,
                roughness: element.texture_file_type.roughness,
                heatmap: element.texture_file_type.heatmap
              });
            }
          });
          controls.target.set(0, 3, 0);
          controls.update();
          camera.updateProjectionMatrix();
          scene.scale.set(3, 3, 3);
        });
    };
    function animate() {
      requestAnimationFrame(animate);
      stats.update();
    }
    render = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.render(scene, camera);
      renderer.toneMappingExposure = params.exposure;
    };

    onWindowResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onWindowResize);

    main();
    render();
    return () => {
      try {
        let el = document.querySelector("canvas");
        el.remove();
      } catch (error) {}
      renderer.forceContextLoss();
      container = undefined;
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      texture2 = undefined;
      camera = undefined;
      scene = undefined;
      controls = undefined;
      width = undefined;
      height = undefined;
      container = undefined;
      texture2 = undefined;
      main = undefined;
      createCamera = undefined;
      createLights = undefined;
      createRenderer = undefined;
      createControls = undefined;
      createGround = undefined;
      createGridHelper = undefined;
      createLoader = undefined;
      render = undefined;
      containerRef = undefined;
      onWindowResize = undefined;
    };
  }, [simulationDetails, avatarId]);

  return (
    <div
      style={{
        minWidth: "100vw",
        minHeight: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh"
      }}
      ref={containerRef}
    ></div>
  );
}
