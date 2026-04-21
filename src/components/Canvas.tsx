import { useRef, useMemo, useEffect } from 'react';
import { Canvas as R3FCanvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

/* ─── Scene image paths ───────────────────────────────── */
const sceneImages = {
  main:        '/images/scene-main.jpg',
  programming: '/images/scene-programming.png',
  photography: '/images/scene-photography.png',
  youtube:     '/images/scene-youtube.png',
  journey:     '/images/scene-journey.png',
  social:      '/images/scene-social.png',
} as const;

type SceneKey = keyof typeof sceneImages;

/* ─── Shaders — UV + crossfade ───────────────────────── */
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

/* ─── Background with crossfade ───────────────────────── */
function Background({
  mouseRef, activeSceneId,
}: {
  mouseRef: React.MutableRefObject<THREE.Vector2>;
  activeSceneId: string | null;
}) {
  const matRef   = useRef<THREE.ShaderMaterial>(null);
  const blendObj = useRef({ v: 0 });

  const textures = useTexture(sceneImages);
  /* LinearSRGBColorSpace = no GPU linearisation; combined with linear renderer
     output this gives straight-through sRGB display — original file colours */
  Object.values(textures).forEach(t => { t.colorSpace = THREE.LinearSRGBColorSpace; });

  const { viewport } = useThree();
  const vpAspect = viewport.width / viewport.height;

  const getAspect = (tex: THREE.Texture) => {
    const img = tex.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap | null;
    if (!img) return 16 / 9;
    const w = 'naturalWidth' in img ? img.naturalWidth : img.width;
    const h = 'naturalHeight' in img ? img.naturalHeight : img.height;
    return h > 0 ? w / h : 16 / 9;
  };

  const uniforms = useMemo(() => ({
    uTexA:     { value: textures.main },
    uTexB:     { value: textures.main },
    uBlend:    { value: 0 },
    uMouse:    { value: new THREE.Vector2() },
    uVpAspect: { value: vpAspect },
    uAspectA:  { value: getAspect(textures.main) },
    uAspectB:  { value: getAspect(textures.main) },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.uVpAspect.value = viewport.width / viewport.height;
      matRef.current.uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
    }
  });

  useEffect(() => {
    if (!matRef.current) return;
    const key: SceneKey = (activeSceneId && activeSceneId in textures)
      ? (activeSceneId as SceneKey)
      : 'main';
    const next = textures[key];

    matRef.current.uniforms.uTexB.value    = next;
    matRef.current.uniforms.uAspectB.value = getAspect(next);
    blendObj.current.v = 0;

    gsap.killTweensOf(blendObj.current);
    gsap.to(blendObj.current, {
      v: 1,
      duration: 0.9,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (matRef.current) matRef.current.uniforms.uBlend.value = blendObj.current.v;
      },
      onComplete: () => {
        if (matRef.current) {
          matRef.current.uniforms.uTexA.value    = next;
          matRef.current.uniforms.uAspectA.value = getAspect(next);
          matRef.current.uniforms.uBlend.value   = 0;
          blendObj.current.v = 0;
        }
      },
    });
  }, [activeSceneId]); // eslint-disable-line

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

/* ─── Scene ───────────────────────────────────────────── */
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

/* ─── Exported wrapper ────────────────────────────────── */
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
