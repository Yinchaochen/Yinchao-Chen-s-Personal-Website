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

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float seamNoise(vec2 uv) {
    float wave = sin(uv.y * 18.0 + uv.x * 4.0) * 0.012;
    wave += sin(uv.y * 41.0 - uv.x * 6.0) * 0.008;
    wave += (hash21(vec2(floor(uv.y * 28.0), floor(uv.x * 14.0))) - 0.5) * 0.012;
    return wave;
  }

  vec4 bg = vec4(0.831, 0.314, 0.329, 1.0);

  void main() {
    vec2 uvA = containUV(vUv, uAspectA, uVpAspect, uMouse, 0.022);
    vec2 uvB = containUV(vUv, uAspectB, uVpAspect, uMouse, 0.016);

    bool inA = uvA.x >= 0.0 && uvA.x <= 1.0 && uvA.y >= 0.0 && uvA.y <= 1.0;
    bool inB = uvB.x >= 0.0 && uvB.x <= 1.0 && uvB.y >= 0.0 && uvB.y <= 1.0;

    vec4 colorA = inA ? texture2D(uTexA, uvA) : bg;
    vec4 colorB = inB ? texture2D(uTexB, uvB) : bg;
    float eased = smoothstep(0.0, 1.0, clamp(uBlend, 0.0, 1.0));
    float centerBias = 1.0 - pow(abs(vUv.y - 0.5) * 2.0, 1.45);
    centerBias = clamp(centerBias, 0.0, 1.0);

    float crackNoise = seamNoise(vUv) * eased;
    float crackHalfWidth = eased * (0.012 + 0.24 * centerBias);
    crackHalfWidth += smoothstep(0.72, 1.0, eased) * 0.5;
    crackHalfWidth += crackNoise * (0.05 + 0.08 * centerBias);
    crackHalfWidth = clamp(crackHalfWidth, 0.0, 0.5);

    float centerDist = abs(vUv.x - 0.5);
    float revealVisibility = smoothstep(0.04, 0.12, eased);
    float revealMask = (1.0 - smoothstep(crackHalfWidth, crackHalfWidth + 0.022, centerDist)) * revealVisibility;

    float side = vUv.x < 0.5 ? 1.0 : -1.0;
    float flapPush = eased * (0.055 + 0.18 * centerBias);
    vec2 tornUvA = uvA;
    tornUvA.x += side * flapPush;
    tornUvA.y += side * crackNoise * 0.35;

    bool tornInA = tornUvA.x >= 0.0 && tornUvA.x <= 1.0 && tornUvA.y >= 0.0 && tornUvA.y <= 1.0;
    vec4 tornColorA = tornInA ? texture2D(uTexA, tornUvA) : bg;

    float edgeDistance = abs(centerDist - crackHalfWidth);
    float seamHighlight = smoothstep(0.035, 0.0, edgeDistance) * revealVisibility;
    float seamShadow = smoothstep(0.08, 0.01, edgeDistance) * (1.0 - revealMask) * eased;

    vec4 openedColor = tornColorA;
    openedColor.rgb *= 1.0 - seamShadow * 0.24;
    openedColor.rgb += vec3(0.15, 0.04, 0.06) * seamShadow * 0.55;

    vec4 finalColor = mix(openedColor, colorB, revealMask);
    finalColor.rgb += vec3(0.98, 0.90, 0.80) * seamHighlight * 0.18 * eased;

    gl_FragColor = finalColor;
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
      duration: 1.05,
      ease: 'power3.inOut',
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
