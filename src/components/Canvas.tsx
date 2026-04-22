import { useRef, useMemo, useEffect } from 'react';
import { Canvas as R3FCanvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

const sceneImages = {
  main: '/images/scene-main.jpg',
  programming: '/images/scene-programming.png',
  photography: '/images/scene-photography.png',
  youtube: '/images/scene-youtube.png',
  journey: '/images/scene-journey.png',
  social: '/images/scene-social.png',
} as const;

type SceneKey = keyof typeof sceneImages;

const vert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = `
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float     uBlend;
  uniform vec2      uMouse;
  uniform float     uVpAspect;
  uniform float     uAspectA;
  uniform float     uAspectB;

  varying vec2 vUv;

  vec2 containUV(vec2 uv, float imgAspect, float vpAspect, vec2 mouse, float parallax) {
    vec2 p = (uv - 0.5) + mouse * parallax;
    if (imgAspect > vpAspect) {
      float scale = vpAspect / imgAspect;
      p.y /= scale;
    } else {
      float scale = imgAspect / vpAspect;
      p.x /= scale;
    }
    return p + 0.5;
  }

  vec4 bg = vec4(0.831, 0.314, 0.329, 1.0);

  void main() {
    vec2 uvA = containUV(vUv, uAspectA, uVpAspect, uMouse, 0.022);
    vec2 uvB = containUV(vUv, uAspectB, uVpAspect, uMouse, 0.016);

    bool inA = uvA.x >= 0.0 && uvA.x <= 1.0 && uvA.y >= 0.0 && uvA.y <= 1.0;
    bool inB = uvB.x >= 0.0 && uvB.x <= 1.0 && uvB.y >= 0.0 && uvB.y <= 1.0;

    vec4 colorA = inA ? texture2D(uTexA, uvA) : bg;
    vec4 colorB = inB ? texture2D(uTexB, uvB) : bg;

    gl_FragColor = mix(colorA, colorB, uBlend);
  }
`;

function Background({
  mouseRef,
  activeSceneId,
}: {
  mouseRef: React.MutableRefObject<THREE.Vector2>;
  activeSceneId: string | null;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const blendObj = useRef({ v: 0 });
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);
  const mainTexture = useLoader(THREE.TextureLoader, sceneImages.main);
  const textureCacheRef = useRef<Partial<Record<SceneKey, THREE.Texture>>>({});

  const { viewport } = useThree();
  const vpAspect = viewport.width / viewport.height;

  const getAspect = (texture: THREE.Texture) => {
    const img = texture.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap | null;
    if (!img) return 16 / 9;
    const width = 'naturalWidth' in img ? img.naturalWidth : img.width;
    const height = 'naturalHeight' in img ? img.naturalHeight : img.height;
    return height > 0 ? width / height : 16 / 9;
  };

  const prepareTexture = (texture: THREE.Texture) => {
    texture.colorSpace = THREE.LinearSRGBColorSpace;
  };

  const transitionToTexture = (texture: THREE.Texture) => {
    if (!matRef.current) return;

    matRef.current.uniforms.uTexB.value = texture;
    matRef.current.uniforms.uAspectB.value = getAspect(texture);
    blendObj.current.v = 0;

    gsap.killTweensOf(blendObj.current);
    gsap.to(blendObj.current, {
      v: 1,
      duration: 0.9,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (matRef.current) {
          matRef.current.uniforms.uBlend.value = blendObj.current.v;
        }
      },
      onComplete: () => {
        if (matRef.current) {
          matRef.current.uniforms.uTexA.value = texture;
          matRef.current.uniforms.uAspectA.value = getAspect(texture);
          matRef.current.uniforms.uBlend.value = 0;
          blendObj.current.v = 0;
        }
      },
    });
  };

  prepareTexture(mainTexture);
  textureCacheRef.current.main = mainTexture;

  if (!textureLoaderRef.current) {
    textureLoaderRef.current = new THREE.TextureLoader();
  }

  const uniforms = useMemo(() => ({
    uTexA: { value: mainTexture },
    uTexB: { value: mainTexture },
    uBlend: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uVpAspect: { value: vpAspect },
    uAspectA: { value: getAspect(mainTexture) },
    uAspectB: { value: getAspect(mainTexture) },
  }), [mainTexture, vpAspect]);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.uVpAspect.value = viewport.width / viewport.height;
      matRef.current.uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
    }
  });

  useEffect(() => {
    if (!matRef.current) return;

    const key: SceneKey =
      activeSceneId && activeSceneId in sceneImages
        ? (activeSceneId as SceneKey)
        : 'main';

    const cachedTexture = textureCacheRef.current[key];
    if (cachedTexture) {
      transitionToTexture(cachedTexture);
      return;
    }

    let cancelled = false;

    textureLoaderRef.current?.load(sceneImages[key], (texture) => {
      if (cancelled) return;
      prepareTexture(texture);
      textureCacheRef.current[key] = texture;
      transitionToTexture(texture);
    });

    return () => {
      cancelled = true;
    };
  }, [activeSceneId]);

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function Scene({ activeSceneId }: { activeSceneId: string | null }) {
  const mouseTarget = useRef(new THREE.Vector2());
  const mouseSmooth = useRef(new THREE.Vector2());
  const { gl, pointer } = useThree();

  gl.setClearColor(new THREE.Color('#d45054'));

  useFrame(() => {
    mouseTarget.current.set(pointer.x * 0.4, pointer.y * 0.4);
    mouseSmooth.current.lerp(mouseTarget.current, 0.04);
  });

  return <Background mouseRef={mouseSmooth} activeSceneId={activeSceneId} />;
}

export default function SceneCanvas({ activeSceneId }: { activeSceneId: string | null }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
      <R3FCanvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
          gl.outputColorSpace = THREE.LinearSRGBColorSpace;
        }}
      >
        <Scene activeSceneId={activeSceneId} />
      </R3FCanvas>
    </div>
  );
}
