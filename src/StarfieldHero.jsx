// ════════════════ Starfield Close ════════════════
// A dense volume of dim lavender stars wrapping the camera and
// streaming past as an endless tunnel of starlight. Each star twinkles on its
// own phase while the whole field slowly barrel-rolls; scrolling surges the
// drift and dives the camera forward down the tunnel, and the cursor steers the
// heading and gently pushes nearby stars aside.
//
// Ported verbatim from the "Starfield Close" spec (originally a standalone
// index.html on three r0.143 + importmap). Adapted for this project's bundled
// three@0.184 (WebGL1Renderer → WebGLRenderer) and wired to the real page
// scroll instead of a 300vh scroll-host. Rendered as the deepest fixed
// full-viewport background layer (zIndex 1) behind GalaxyScene (zIndex 2), so
// the particle galaxy + terrain composite on top of the starlight tunnel.
import { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';

// ── Fixed parameters (baked in per spec) ─────────────────────────────────────
const CONFIG = {
  bgColor: '#0a0a24',      // dark complementary background tint
  flameColor: '#aee9ff',   // corner-flame color A
  flameColor2: '#c79bff',  // corner-flame color B
  flameAmt: 0.2,           // corner-flame intensity
  colorA: '#c4b5fd',       // star tint A (lavender)
  colorB: '#c4b5fd',       // star tint B (lavender)
  colorC: '#dcd2ff',       // star tint C (bright lavender, ~10% of stars)
  opacity: 1.2,
  pointSize: 50,
  brightness: 1.0,
  drift: 1.5,              // steady tunnel speed (slowed from 2.35)
  twinkle: 1,
  spin: 0.02,              // barrel rotation rate (slowed from 0.03)
  repelRadius: 5,
  repelStrength: 0.35,
  scrollPush: 8,           // forward camera dive on scroll
  scrollDrift: 4,          // extra drift surge on scroll (slowed from 6)
  scrollSpin: 0.07,        // extra spin on scroll (slowed from 0.1)
  parallax: 0.6,           // cursor camera offset
};

const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 };

const hexToVec3 = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

// ── Vertex shader (verbatim) ─────────────────────────────────────────────────
const VERT = /* glsl */ `
uniform float uTime; uniform float uSize; uniform float uDrift; uniform float uDepth; uniform float uTwinkle;
uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC;
attribute float aScale; attribute float aPhase; attribute float aPalette; attribute float aBright;
varying vec3 vColor; varying float vTwinkle;
void main() {
  vec3 pos = position;
  // Endless drift toward +Z with mod-wrap.
  pos.z = mod(pos.z + uDrift + (uDepth * 0.5), uDepth) - (uDepth * 0.5);

  float tw = sin(uTime * 1.6 + aPhase * 6.2831);
  vTwinkle = (1.0 - uTwinkle) + uTwinkle * (0.55 + 0.45 * tw);

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);

  vec3 toParticle = modelPosition.xyz - uCursor;
  float dist = length(toParticle);
  float falloff = smoothstep(uRepelRadius, 0.0, dist);
  modelPosition.xyz += normalize(toParticle + vec3(0.0001)) * falloff * uRepelStrength * uActivity;

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = uSize * aScale;
  gl_PointSize *= (1.0 / -viewPosition.z);

  vec3 base = aPalette < 0.5 ? uColorA : (aPalette < 1.5 ? uColorB : uColorC);
  vColor = base * aBright;
}
`;

// ── Fragment shader (verbatim) ───────────────────────────────────────────────
const FRAG = /* glsl */ `
uniform float uOpacity; uniform float uBrightness;
varying vec3 vColor; varying float vTwinkle;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float strength = pow(1.0 - d * 2.0, 4.0);
  vec3 color = mix(vec3(0.0), vColor, strength);
  gl_FragColor = vec4(color * uBrightness, strength * uOpacity * vTwinkle);
}
`;

// ── Composite FinalPass shaders (verbatim) ───────────────────────────────────
const FINAL_VERT = /* glsl */ `
varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const FINAL_FRAG = /* glsl */ `
uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
uniform vec3 uBg; uniform vec3 uFlameA; uniform vec3 uFlameB; uniform float uFlameAmt;
varying vec2 vUv;
vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.;
  pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x);
  pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y);
  pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z);
  return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); }
void main(){
  vec2 uv = 2.*vUv - 1.;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
  vec3 flame = 1.5*uFlameA*w.x; flame*=w.y; flame += uFlameB*w.z;
  flame *= smoothstep(0.25, 1., abs(uv.y));
  float md = smoothstep(-0.7, 1., -uv.y*uv.x); flame *= md*md;
  vec3 bg = uBg * (1.0 - 0.4 * length(uv));
  vec3 halo = texture2D(haloTexture, vUv).xyz;
  gl_FragColor = vec4(bg + flame*uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
}
`;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const StarfieldHero = memo(function StarfieldHero({ isMobile }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = window.innerWidth;
    let h = window.innerHeight;

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    // Spec uses window.devicePixelRatio; cap it here since this runs as a
    // full-page background alongside the galaxy scene's own render loop.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    // ── Scene + camera ─────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 0, 15);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 80);
    camera.position.set(0, 0, 5);
    camera.layers.enable(LAYERS.TORUS_SCENE);
    camera.layers.enable(LAYERS.BLOOM_SCENE);
    camera.layers.enable(LAYERS.ENTIRE_SCENE);
    scene.add(camera);

    // ── Geometry ───────────────────────────────────────────────────────────
    const count = 4200;
    const depth = 30;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    const palette = new Float32Array(count);
    const bright = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 24;       // x: box width 24
      positions[i3 + 1] = (Math.random() - 0.5) * 16;   // y: box height 16
      positions[i3 + 2] = (Math.random() - 0.5) * 30;   // z: box depth 30 (== depth)
      const r = Math.random();
      palette[i] = r < 0.1 ? 2 : (r < 0.55 ? 0 : 1);  // ~10% bright lavender, rest dim
      bright[i] = palette[i] === 2 ? (0.9 + Math.random() * 0.4) : (0.5 + Math.random() * 0.4);
      scales[i] = 0.5 + Math.pow(Math.random(), 1.4) * 2.5;
      phases[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1));
    geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
    geometry.setAttribute('aPalette', new THREE.Float32BufferAttribute(palette, 1));
    geometry.setAttribute('aBright', new THREE.Float32BufferAttribute(bright, 1));

    // ── Material ───────────────────────────────────────────────────────────
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 50 },
        uOpacity: { value: 0 },
        uDrift: { value: 0 },
        uDepth: { value: depth },
        uTwinkle: { value: CONFIG.twinkle },
        uCursor: { value: new THREE.Vector3() },
        uRepelRadius: { value: CONFIG.repelRadius },
        uRepelStrength: { value: CONFIG.repelStrength },
        uActivity: { value: 0 },
        uColorA: { value: hexToVec3(CONFIG.colorA) },
        uColorB: { value: hexToVec3(CONFIG.colorB) },
        uColorC: { value: hexToVec3(CONFIG.colorC) },
        uBrightness: { value: CONFIG.brightness },
      },
    });

    const points = new THREE.Points(geometry, material);
    points.layers.enable(LAYERS.ENTIRE_SCENE);
    const group = new THREE.Group();
    group.add(points);
    scene.add(group);

    // ── Postprocessing — three composers sharing one RenderPass ─────────────
    const renderScene = new RenderPass(scene, camera);

    const torusComposer = new EffectComposer(renderer);
    torusComposer.renderToScreen = false;
    torusComposer.addPass(renderScene);
    torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
    torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.22, 0.2, 0));
    torusComposer.addPass(new ShaderPass(CopyShader));

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.4, 0.55, 0));
    bloomComposer.addPass(new ShaderPass(GammaCorrectionShader));

    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          iTime: { value: 0 },
          tDiffuse: { value: null },
          torusTexture: { value: null },
          bloomTexture: { value: null },
          haloTexture: { value: null },
          uBg: { value: hexToVec3(CONFIG.bgColor) },
          uFlameA: { value: hexToVec3(CONFIG.flameColor) },
          uFlameB: { value: hexToVec3(CONFIG.flameColor2) },
          uFlameAmt: { value: CONFIG.flameAmt },
        },
        vertexShader: FINAL_VERT,
        fragmentShader: FINAL_FRAG,
      }),
      'tDiffuse',
    );
    finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture;
    finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture;

    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(finalPass);

    // ── Pointer ("void") ────────────────────────────────────────────────────
    const POINTER = {
      ndc: new THREE.Vector2(0, 0),
      world: new THREE.Vector3(0, 0, 0),
      activity: 0,
      active: false,
      lastMove: performance.now(),
    };
    const planeTarget = new THREE.Vector3();
    const ray = new THREE.Vector3();

    const onMouseMove = (e) => {
      POINTER.ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
      POINTER.ndc.y = -((e.clientY / window.innerHeight) * 2 - 1);
      POINTER.active = true;
      POINTER.lastMove = performance.now();
    };
    const onMouseOut = () => { POINTER.active = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseout', onMouseOut);

    const updatePointer = () => {
      if (POINTER.active) {
        ray.set(POINTER.ndc.x, POINTER.ndc.y, 0.5).unproject(camera);
        ray.sub(camera.position).normalize();
        if (Math.abs(ray.z) > 1e-4) {
          const t = -camera.position.z / ray.z;
          if (t > 0 && isFinite(t)) {
            planeTarget.copy(camera.position).addScaledVector(ray, t);
          } else {
            planeTarget.set(0, 0, 0);
          }
        } else {
          planeTarget.set(0, 0, 0);
        }
      } else {
        planeTarget.set(0, 0, 0);
      }
      POINTER.world.lerp(planeTarget, 0.12);

      const idle = (performance.now() - POINTER.lastMove) / 1000;
      const want = POINTER.active && idle < 3 ? 1 : 0;
      POINTER.activity += (want - POINTER.activity) * 0.06;

      material.uniforms.uCursor.value.copy(POINTER.world);
      material.uniforms.uActivity.value = POINTER.activity;
    };

    // ── Scroll (double-damped) + parallax ───────────────────────────────────
    let scrollTarget = 0;
    let scrollSmooth = 0;
    let scrollCurrent = 0;
    const mouseSmooth = { x: 0, y: 0 };

    const computeScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    };
    computeScroll();
    window.addEventListener('scroll', computeScroll, { passive: true });

    // ── Appear fade ─────────────────────────────────────────────────────────
    const appearStart = performance.now();

    let t0 = performance.now() / 1000;
    const update = () => {
      const scroll = scrollCurrent;
      const m = mouseSmooth;

      const t = performance.now() / 1000;
      const dt = Math.min(0.05, t - t0);
      t0 = t;
      material.uniforms.uTime.value = t;

      if (!prefersReduced) {
        material.uniforms.uDrift.value += dt * (CONFIG.drift + scroll * CONFIG.scrollDrift);
        group.rotation.z += dt * (CONFIG.spin + scroll * CONFIG.scrollSpin);
      }

      camera.position.set(m.x * CONFIG.parallax, m.y * CONFIG.parallax, 5 - scroll * CONFIG.scrollPush);
      camera.lookAt(m.x * CONFIG.parallax, m.y * CONFIG.parallax, -10);

      const elapsed = performance.now() - appearStart;
      const fade = clamp((elapsed - 300) / 1400, 0, 1);
      material.uniforms.uOpacity.value = fade * CONFIG.opacity;
    };

    // ── Render loop ──────────────────────────────────────────────────────────
    let raf = 0;
    let running = true;
    const animate = () => {
      if (!running) return;
      raf = requestAnimationFrame(animate);

      finalPass.uniforms.iTime.value = performance.now() / 1000;

      scrollSmooth = lerp(scrollSmooth, scrollTarget, 0.1);
      scrollCurrent = lerp(scrollCurrent, scrollSmooth, 0.06);
      mouseSmooth.x = lerp(mouseSmooth.x, POINTER.ndc.x, 0.06);
      mouseSmooth.y = lerp(mouseSmooth.y, POINTER.ndc.y, 0.06);

      updatePointer();
      update();

      camera.layers.set(LAYERS.TORUS_SCENE); torusComposer.render();
      camera.layers.set(LAYERS.BLOOM_SCENE); bloomComposer.render();
      camera.layers.set(LAYERS.ENTIRE_SCENE); finalComposer.render();
    };
    animate();

    // ── Pause while fully off-screen / tab hidden (perf) ────────────────────
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        t0 = performance.now() / 1000;
        animate();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      for (const c of [torusComposer, bloomComposer, finalComposer]) {
        c.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        c.setSize(w, h);
      }
      computeScroll();
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('scroll', computeScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      geometry.dispose();
      material.dispose();
      torusComposer.dispose();
      bloomComposer.dispose();
      finalComposer.dispose();
      renderer.dispose();
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
});
