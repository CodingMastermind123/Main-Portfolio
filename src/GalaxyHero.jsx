import { memo, useEffect, useRef, createRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Config ─────────────────────────────────────────────────────────────────
const N       = 3200;   // total particles
const DISPERSE = 480;   // ~15% disperse outward instead of joining sphere
const BRANCHES = 5;
const GALAXY_R = 3.6;   // tighter radius → galaxy reads as a distinct object
const SPIN     = 2.0;   // spiral twist per unit radius — more winding = clearer arms
const SCATTER  = 0.13;  // arm thickness as a fraction of radius (azimuthal blur)
const SCATTER_POW = 3.5;// higher → particles hug the arm spine; dark inter-arm gaps
const ARM_RADIAL = 2.0; // radial scatter is wider than azimuthal → thin, long arms
const CORE_POW = 1.35;  // radius concentration toward the bright core (u^CORE_POW)
const SPHERE_R = 2.0;
const TILT_X   = 0.52;  // galaxy disc tilt: low angle from edge-on → reads as a
                        // clear inclined ellipse with depth (sin≈0.5 axis ratio),
                        // not a flat face-on pinwheel
const GALAXY_X = 1.7;   // world-X offset of the galaxy disc → sits in the right
                        // half of the viewport (~67% from left). Decays to 0 as
                        // the disc morphs into the centered nav sphere.

// Always-present ambient terrain — a persistent grid-based particle heightmap
// living behind every section below the hero. The aerial perspective comes
// from sinking the near-horizontal plane well below the camera's eye line and
// tilting the far edge up. The heightmap is ALWAYS fully formed at a constant
// ambient brightness — it never disperses or hides. Its shape stays frozen
// while the user is settled and only reshapes while actively scrolling: the
// noise sampling offset is advanced directly by scroll distance (scrolling
// down advances it, up reverses), never by a continuous time-based drift.
const TERRAIN_W      = 5.6;  // grid half-width (x, world units)
const TERRAIN_D      = 2.5;  // grid half-depth (z, world units)
const TERRAIN_ZOFF   = -1.0; // push grid center away from the camera
const TERRAIN_AMP    = 0.5;  // noise heightmap amplitude — gentle, not spiky
const TERRAIN_FREQ   = 0.26; // low frequency → a few broad rolling dunes, not
                             // many small bumps (which read as static noise)
const TERRAIN_TILT   = 0.22; // gentle tilt raising the far edge (radians)
const TERRAIN_Y      = -1.6; // sink plane below the camera eye line → aerial view
const TERRAIN_SCROLL_K = 0.0013; // reshape noise-offset advanced per scrolled pixel
const TERRAIN_GLIDE_K = 0.005; // forward-glide: world-depth translation per scrolled
                               // pixel. The grid slides toward the camera and wraps,
                               // so perspective makes near particles stream past
                               // faster than far ones — a parallax fly-over illusion
                               // that is independent of the height-reshape above.
const TERRAIN_Z_MIN  = -TERRAIN_D + TERRAIN_ZOFF; // near... far depth band edges that
const TERRAIN_Z_SPAN = 2 * TERRAIN_D;             // the glide wraps particles within
const TERRAIN_GLIDE_FADE = 0.55; // depth-band margin over which recycled particles
                                 // fade in/out so the wrap seam stays invisible
const AMBIENT_ALPHA  = 0.16; // resting site-wide field alpha multiplier
const TERRAIN_ALPHA  = 0.62; // alpha multiplier at terrain peaks
const HIT_RADIUS = 36;  // px — 2D screen-space hover radius around nav nodes
const LOCK_MS  = 700;  // scroll pause (ms) when the sphere lands — 600–800 range

// Precomputed terrain tilt rotation (about x-axis, same scheme as the galaxy disc)
const T_COS = Math.cos(TERRAIN_TILT);
const T_SIN = Math.sin(TERRAIN_TILT);

const NODES = [
  { label: 'About',        descriptor: 'Who I am',         href: '#about' },
  { label: 'Skills',       descriptor: 'What I work with', href: '#skills' },
  { label: 'Projects',     descriptor: "What I've built",  href: '#projects' },
  { label: 'Achievements', descriptor: "What I've earned", href: '#achievements' },
  { label: 'Contact',      descriptor: 'Get in touch',     href: '#contact' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function makeCircleTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 15);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.8)');
  g.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

// Returns per-particle spiral-arm data in the untilted galaxy plane.
function buildGalaxyData() {
  const armAngles = new Float32Array(N); // initial angle in untilted plane
  const radii     = new Float32Array(N);
  const scatterX  = new Float32Array(N);
  const scatterZ  = new Float32Array(N);
  const scatterY  = new Float32Array(N); // thin vertical scatter (untilted y)

  const s = (r) =>
    Math.pow(Math.random(), SCATTER_POW) *
    (Math.random() < 0.5 ? 1 : -1) *
    SCATTER * r;

  for (let i = 0; i < N; i++) {
    // u^CORE_POW (>1) packs particles toward the center → dense bright bulge,
    // sparser arms reaching out. (sqrt would give flat areal density instead.)
    const r      = Math.pow(Math.random(), CORE_POW) * GALAXY_R;
    const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
    const angle  = branch + r * SPIN;

    armAngles[i] = angle;
    radii[i]     = r;

    // Split scatter along the spine: wide radial component (long, continuous
    // arms) but narrow azimuthal component (arms stay thin so inter-arm gaps
    // read dark instead of the arms merging into a uniform field).
    const radial = s(r) * ARM_RADIAL;
    const azim   = s(r);
    const ca = Math.cos(angle), sa = Math.sin(angle);
    scatterX[i]  = radial * ca - azim * sa;
    scatterZ[i]  = radial * sa + azim * ca;
    scatterY[i]  = s(r) * 0.3; // flatten disc
  }
  return { armAngles, radii, scatterX, scatterZ, scatterY };
}

// Fibonacci-sphere distribution for N particles; last DISPERSE get random far targets.
function buildSphereTargets() {
  const targets = new Float32Array(N * 3);
  const golden  = (1 + Math.sqrt(5)) / 2;
  const sphereN = N - DISPERSE;

  for (let i = 0; i < sphereN; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / sphereN);
    const phi   = 2 * Math.PI * i / golden;
    targets[i*3]   = SPHERE_R * Math.sin(theta) * Math.cos(phi);
    targets[i*3+1] = SPHERE_R * Math.cos(theta);
    targets[i*3+2] = SPHERE_R * Math.sin(theta) * Math.sin(phi);
  }
  for (let i = sphereN; i < N; i++) {
    const phi  = Math.random() * Math.PI * 2;
    const cosT = 2 * Math.random() - 1;
    const sinT = Math.sqrt(1 - cosT * cosT);
    const r    = 5 + Math.random() * 3;
    targets[i*3]   = r * sinT * Math.cos(phi);
    targets[i*3+1] = r * cosT;
    targets[i*3+2] = r * sinT * Math.sin(phi);
  }
  return targets;
}

// Dispersed resting positions covering the visible viewport volume — the
// site-wide ambient field particles drift gently around these.
function buildAmbientTargets() {
  const t = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    t[i*3]   = (Math.random() * 2 - 1) * 5.2; // spans viewport width at z≈0
    t[i*3+1] = (Math.random() * 2 - 1) * 3.2; // spans viewport height
    t[i*3+2] = (Math.random() * 2 - 1) * 1.4; // shallow depth
  }
  return t;
}

// Compact 2D simplex noise (Gustavson's public-domain reference, trimmed).
// Seeded LCG permutation so the terrain looks identical every load.
const snoise2D = (() => {
  const grad = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  const perm = new Uint8Array(512);
  let seed = 1337;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const base = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  return (x, y) => {
    const s = (x + y) * F2;
    const i = Math.floor(x + s), j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - (i - t), y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;
    const x1 = x0 - i1 + G2,     y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2,  y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t0 > 0) { const g = grad[perm[ii + perm[jj]] & 7];           t0 *= t0; n += t0 * t0 * (g[0] * x0 + g[1] * y0); }
    if (t1 > 0) { const g = grad[perm[ii + i1 + perm[jj + j1]] & 7]; t1 *= t1; n += t1 * t1 * (g[0] * x1 + g[1] * y1); }
    if (t2 > 0) { const g = grad[perm[ii + 1 + perm[jj + 1]] & 7];   t2 *= t2; n += t2 * t2 * (g[0] * x2 + g[1] * y2); }
    return 70 * n; // ≈ [-1, 1]
  };
})();

// (x, z) grid for the section-transition terrain — each particle owns a fixed
// grid cell (with slight jitter so rows don't read as ruled lines); its height
// is sampled per-frame from drifting simplex noise. The DISPERSE subset never
// joins the terrain, so the background field never fully empties.
function buildTerrainData() {
  const gridX = new Float32Array(N);
  const gridZ = new Float32Array(N);
  const cols  = Math.ceil(Math.sqrt(N * (TERRAIN_W / TERRAIN_D)));
  const rows  = Math.ceil(N / cols);
  for (let i = 0; i < N; i++) {
    const c = i % cols;
    const r = (i / cols) | 0;
    gridX[i] = (c / (cols - 1) * 2 - 1) * TERRAIN_W + (((i * 0.61803) % 1) - 0.5) * 0.03;
    gridZ[i] = (r / (rows - 1) * 2 - 1) * TERRAIN_D + TERRAIN_ZOFF + (((i * 0.7548) % 1) - 0.5) * 0.03;
  }
  return { gridX, gridZ };
}

// 5 Fibonacci-sphere positions for node meshes (slightly outside particle sphere).
function getNodePositions(radius) {
  const pts    = [];
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < 5; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / 5);
    const phi   = 2 * Math.PI * i / golden;
    pts.push(new THREE.Vector3(
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi)
    ));
  }
  return pts;
}

// ── Component ──────────────────────────────────────────────────────────────

export const GalaxyScene = memo(function GalaxyScene({ isMobile, nameHoveredRef }) {
  const canvasRef      = useRef(null);
  const morphProgressRef = useRef(0);
  // One ref per label div, created once
  const labelRefs = useRef(NODES.map(() => createRef()));
  // Cursor-following tooltip for far-side node hovers (labels stay hidden there)
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // No pin/scrub — show the formed nav sphere statically; click-nav still works
      morphProgressRef.current = 1;
    }

    let w = window.innerWidth;
    let h = window.innerHeight;

    // ── Scene ─────────────────────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Galaxy data ───────────────────────────────────────────────────────
    const { armAngles, radii, scatterX, scatterZ, scatterY } = buildGalaxyData();
    const sphereTargets  = buildSphereTargets();
    const ambientTargets = buildAmbientTargets();
    const { gridX, gridZ } = buildTerrainData();

    // Slow ambient drift around each particle's resting position
    const driftFreq  = Float32Array.from({ length: N }, () => 0.12 + Math.random() * 0.25);
    const driftPhase = Float32Array.from({ length: N }, () => Math.random() * Math.PI * 2);

    // Live position buffer — starts at galaxy positions, morphs toward sphere
    const positions = new Float32Array(N * 3);

    // Size + base brightness keyed to galaxy radius: a dense, bright, large-
    // particle core fading to small, dim outer-arm particles. core2 (the
    // squared core factor) gives a steep, concentrated falloff so the core
    // clearly out-sizes and out-shines the arms.
    const aSizeArr  = new Float32Array(N);
    const baseAlpha = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const nr    = Math.min(1, radii[i] / GALAXY_R);
      const core2 = (1 - nr) * (1 - nr);
      aSizeArr[i]  = (0.015 + core2 * 0.050) * (0.80 + Math.random() * 0.30);
      baseAlpha[i] = (0.40 + core2 * 0.60)  * (0.85 + Math.random() * 0.15);
    }
    // Immutable copy — terrain peaks scale aSizeArr per-frame, then restore
    const baseSize = aSizeArr.slice();

    // Color: radius-based gradient — bright lavender core → violet outer arms
    const aColorArr   = new Float32Array(N * 3);
    const CORE_COL    = new THREE.Color(0xc4b5fd);
    const MID_COL     = new THREE.Color(0xa78bfa);
    const OUTER_COL   = new THREE.Color(0x7c3aed);
    const tmpCol      = new THREE.Color();

    for (let i = 0; i < N; i++) {
      const t = Math.min(1, radii[i] / GALAXY_R);
      if (t < 0.5) tmpCol.copy(CORE_COL).lerp(MID_COL, t * 2);
      else         tmpCol.copy(MID_COL).lerp(OUTER_COL, (t - 0.5) * 2);
      aColorArr[i*3]   = tmpCol.r;
      aColorArr[i*3+1] = tmpCol.g;
      aColorArr[i*3+2] = tmpCol.b;
    }

    // Twinkle
    const twinkleFreq  = Float32Array.from({ length: N }, () => 0.3 + Math.random() * 0.5);
    const twinklePhase = Float32Array.from({ length: N }, () => Math.random() * Math.PI * 2);
    const aAlphaArr    = new Float32Array(N);

    // Name-hover scatter targets
    const explodeTargR = Float32Array.from({ length: N }, () => 4.5 + Math.random() * 2);

    // ── BufferGeometry ────────────────────────────────────────────────────
    const geo     = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    const colAttr = new THREE.BufferAttribute(aColorArr, 3);
    const szAttr  = new THREE.BufferAttribute(aSizeArr,  1);
    const alpAttr = new THREE.BufferAttribute(aAlphaArr, 1);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('aColor',   colAttr);
    geo.setAttribute('aSize',    szAttr);
    geo.setAttribute('aAlpha',   alpAttr);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uGlobalAlpha: { value: 1.0 },
        uPixelRatio:  { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        uniform float uPixelRatio;
        attribute vec3  aColor;
        attribute float aSize;
        attribute float aAlpha;
        varying   vec3  vColor;
        varying   float vAlpha;
        void main() {
          vColor = aColor;
          vAlpha = aAlpha;
          vec4 mvPos   = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (900.0 / -mvPos.z) * uPixelRatio;
          gl_Position  = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float uGlobalAlpha;
        varying vec3  vColor;
        varying float vAlpha;
        void main() {
          float d    = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float soft = 1.0 - smoothstep(0.3, 0.5, d);
          gl_FragColor = vec4(vColor, vAlpha * uGlobalAlpha * soft);
        }
      `,
      transparent: true,
      depthWrite:  false,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ── Ambient background particles ──────────────────────────────────────
    const circleTex = makeCircleTex();
    const AMB    = 160;
    const ambPos = new Float32Array(AMB * 3);
    for (let i = 0; i < AMB; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 3.5 + Math.random() * 4;
      ambPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      ambPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      ambPos[i*3+2] = r * Math.cos(phi);
    }
    const ambGeo = new THREE.BufferGeometry();
    ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
    const ambMat = new THREE.PointsMaterial({
      color: 0xc084fc, size: 0.04, map: circleTex,
      transparent: true, opacity: 0.4,
      sizeAttenuation: true, depthWrite: false, alphaTest: 0.01,
    });
    const ambPoints = new THREE.Points(ambGeo, ambMat);
    scene.add(ambPoints);

    // ── Sphere group + node meshes ────────────────────────────────────────
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    const nodePositions = getNodePositions(SPHERE_R + 0.22);
    const nodeMeshes    = NODES.map((_, i) => {
      const g    = new THREE.SphereGeometry(0.07, 8, 8);
      const m    = new THREE.MeshBasicMaterial({ color: 0xc4b5fd, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.copy(nodePositions[i]);
      sphereGroup.add(mesh);
      return mesh;
    });

    // Scratch vector for per-frame world-position math (no per-frame allocs)
    const nodeWorldPos = new THREE.Vector3();

    // ── 2D screen-space node picking ──────────────────────────────────────
    // Nodes are hit-tested against their projected screen coords (computed
    // every frame alongside the label projection), ignoring depth — so all 5
    // stay clickable even on the far side of the sphere. No raycaster needed.
    const nodeScreen   = new Float32Array(NODES.length * 3); // sx, sy, worldZ
    const mouseClient  = { x: -9999, y: -9999 };
    let hoveredIndex   = -1;

    const handlePointerMove = (e) => {
      mouseClient.x = e.clientX;
      mouseClient.y = e.clientY;
    };
    window.addEventListener('pointermove', handlePointerMove);

    const handleClick = () => {
      if (hoveredIndex < 0 || morphProgressRef.current < 0.7) return;
      const { href } = NODES[hoveredIndex];
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('click', handleClick);

    // ── Mouse ─────────────────────────────────────────────────────────────
    const mouseNorm = { x: 0, y: 0 };
    const camTarget = { x: 0, y: 0 };
    const MAX_TILT  = 3 * Math.PI / 180;

    const handleMouseMove = (e) => {
      mouseNorm.x =  (e.clientX / w - 0.5) * 2;
      mouseNorm.y = -(e.clientY / h - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── State ─────────────────────────────────────────────────────────────
    let explodeProgress = 0;
    let galaxyRotation  = 0;
    // post: 0 = hero/sphere phase, 1 = site-wide ambient field phase.
    // Smoothed toward postTarget each frame in the animate loop.
    let post       = 0;
    let postTarget = 0;
    // terrain: eases to 1 and holds — the heightmap is always fully formed.
    // Kept as a smoothed value only so it ramps in cleanly on first load.
    let terrain    = 0;
    // Noise-sampling flow. Advanced ONLY by scroll distance (sign = direction,
    // so scrolling up reverses). Constant between scroll events → frozen shape.
    let scrollFlow = 0;
    // Forward-glide: a world-depth translation of the terrain grid (NOT the noise
    // input — height/reshape is untouched). The grid slides toward the camera and
    // wraps, so perspective makes near particles stream past faster than far ones.
    // Advanced ONLY by scroll distance, so its rate scales with scroll velocity and
    // it freezes the instant scrolling stops (same mechanism as scrollFlow).
    let depthGlide = 0;
    // Whether aSizeArr held terrain-scaled values last frame (needs restore)
    let sizesWereScaled = false;

    // ── Scroll velocity / flow tracking ───────────────────────────────────
    // Drives terrain formed-ness (fast scroll → more formed) and the noise
    // flow direction (scrolling down advances it, up reverses). No per-section
    // triggers — the terrain is a persistent layer, not a boundary event.
    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    const onScroll = () => {
      const y  = window.scrollY || window.pageYOffset || 0;
      const dy = y - lastScrollY;
      scrollFlow += dy * TERRAIN_SCROLL_K;           // sign → reshape direction
      depthGlide += dy * TERRAIN_GLIDE_K;            // sign → forward / backward glide
      lastScrollY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Completion scroll-lock ────────────────────────────────────────────
    // When the sphere is essentially settled (progress > 0.97) we briefly
    // swallow wheel/touch input so it visibly "lands" before scroll resumes.
    // Fires once per entry; hasLocked resets only when the user scrolls fully
    // back out of the sphere section (onLeaveBack), so end-of-pin jitter near
    // progress≈1 can't re-trigger it.
    let hasLocked = false;
    let lockTimer = 0;
    const blockScrollEvent = (e) => e.preventDefault();
    const engageLock = () => {
      window.addEventListener('wheel', blockScrollEvent, { passive: false });
      window.addEventListener('touchmove', blockScrollEvent, { passive: false });
    };
    // Smooth release: drop the block on the next frame so the wheel event in
    // flight at unlock isn't consumed mid-handler (which reads as an abrupt
    // jump) — scroll resumes from rest instead of bursting.
    const releaseLock = () => {
      requestAnimationFrame(() => {
        window.removeEventListener('wheel', blockScrollEvent);
        window.removeEventListener('touchmove', blockScrollEvent);
      });
    };

    // ── ScrollTrigger ─────────────────────────────────────────────────────
    // The hero section itself is the pinned morph stage: text and galaxy are
    // one scroll unit. Scrolling scrubs the morph in place — the hero content
    // fades/lifts out as part of it — instead of the text scrolling away
    // first and the (fixed) galaxy morphing afterwards.
    let st;
    let heroFade;
    if (!prefersReduced) {
      heroFade = gsap.timeline()
        .to('#hero [data-hero-fade="content"]', { autoAlpha: 0, y: -70, ease: 'power1.in', duration: 0.35 }, 0)
        .to({}, { duration: 1 }, 0); // pad timeline to the full pin length

      st = ScrollTrigger.create({
        trigger: '#hero',
        animation: heroFade,
        pin: true,
        scrub: true,
        start: 'top top',
        end: '+=180%',
        onUpdate: (self) => {
          morphProgressRef.current = self.progress;
          // Engage once the sphere is settled (>0.97), not at the exact end
          // where scrub jitter lives — so the lock catches a clean landing.
          if (self.progress > 0.97 && !hasLocked) {
            hasLocked = true;
            engageLock();
            clearTimeout(lockTimer);
            lockTimer = setTimeout(releaseLock, LOCK_MS);
          } else if (self.progress < 0.5 && hasLocked) {
            // Genuine scroll back out of the formed-sphere zone (morph undone
            // past halfway) re-arms the lock. The hero is pinned at top top, so
            // onLeaveBack can never fire (no scroll space above start) — this
            // threshold is the reliable "scrolled back out" signal, and being
            // well below the 0.97 engage point, end-of-pin jitter can't re-arm.
            hasLocked = false;
            clearTimeout(lockTimer);
            releaseLock();
          }
        },
        onLeave:     () => { postTarget = 1; },
        onEnterBack: () => { postTarget = 0; },
      });
    }

    // ── Animation loop ────────────────────────────────────────────────────
    let rafId = 0;
    const clock = new THREE.Clock();

    function animate() {
      if (!onScreen) { rafId = 0; return; }
      rafId = requestAnimationFrame(animate);

      const delta   = clock.getDelta();
      const elapsed = clock.elapsedTime;
      const morphP  = morphProgressRef.current;

      // Phase scalars. post: sphere phase → ambient field phase, smoothed to
      // absorb scroll jitter. Reduced motion: no ScrollTriggers exist, so
      // derive the phase from whether the hero is on screen (instant).
      if (prefersReduced) {
        const heroRect = document.getElementById('hero')?.getBoundingClientRect();
        postTarget = (heroRect && heroRect.bottom > 0 && heroRect.top < h) ? 0 : 1;
        post = postTarget;
      } else {
        post += (postTarget - post) * Math.min(1, delta * 2.5);
      }

      // The heightmap is always fully formed — terrain eases to 1 and holds,
      // so the dunes are a constant presence rather than a scroll-triggered
      // moment that disperses back to scattered ambient when the user settles.
      terrain += (1 - terrain) * Math.min(1, delta * 3);

      // Noise flow is advanced ONLY by scroll distance (see onScroll). Between
      // scroll events scrollFlow is constant, so the dune shape freezes exactly
      // where it is — no continuous idle drift, no snap back to a rest shape.
      const flow = scrollFlow;

      // Sample terrain noise only in the field phase (skips hero/sphere).
      const terrainActive = post > 0.01 && terrain > 0.001;
      const updateSizes   = terrainActive || sizesWereScaled;

      // Camera parallax (fades with morph)
      camTarget.x += (mouseNorm.x * MAX_TILT - camTarget.x) * 0.05;
      camTarget.y += (mouseNorm.y * MAX_TILT - camTarget.y) * 0.05;
      scene.rotation.y = camTarget.x * (1 - morphP * 0.8);
      scene.rotation.x = camTarget.y * (1 - morphP * 0.8);

      // Name-hover scatter (disappears during morph)
      const isHovered = nameHoveredRef?.current || false;
      const explTgt   = isHovered ? 1 : 0;
      const explRate  = isHovered ? Math.min(delta * 2.5, 1) : Math.min(delta * 1.25, 1);
      explodeProgress += (explTgt - explodeProgress) * explRate * (1 - morphP);

      // Galaxy slow rotation (stops during morph)
      galaxyRotation += delta * 0.04 * (1 - morphP);

      const driftAmp = prefersReduced ? 0 : 1;

      for (let i = 0; i < N; i++) {
        const angle = armAngles[i] + galaxyRotation;
        const r     = radii[i] * (1 + explodeProgress * ((explodeTargR[i] / (radii[i] || 0.01)) - 1));

        // Untilted galaxy plane position
        const ux = Math.cos(angle) * r + scatterX[i];
        const uy = scatterY[i];
        const uz = Math.sin(angle) * r + scatterZ[i];

        // Tilt galaxy disc toward camera, offset into the right half of the
        // viewport. The X offset rides on gx, so the morph lerp below carries
        // the disc back to the centered sphere target as morphP advances.
        const gx =  ux + GALAXY_X;
        const gy =  uy * Math.cos(TILT_X) - uz * Math.sin(TILT_X);
        const gz =  uy * Math.sin(TILT_X) + uz * Math.cos(TILT_X);

        // Per-particle stagger: outer-arm particles complete morph last
        // (normalized radius 0→1; stagger 0→0.35)
        const normR   = Math.min(1, radii[i] / GALAXY_R);
        const stagger = normR * 0.35;
        const pP      = Math.max(0, Math.min(1, (morphP - stagger) / (1 - stagger)));
        // Smoothstep ease
        const eased   = pP * pP * (3 - 2 * pP);

        // Phase A — galaxy → sphere morph position
        const mx = gx + (sphereTargets[i*3]   - gx) * eased;
        const my = gy + (sphereTargets[i*3+1] - gy) * eased;
        const mz = gz + (sphereTargets[i*3+2] - gz) * eased;

        const isDispersal = i >= (N - DISPERSE);

        // Phase B — ambient field position (slow drift), converging into the
        // transition terrain while `terrain` is up. Same lerp/stagger
        // mechanism as the sphere morph, just a different target set in the
        // same buffer: an (x, z) grid whose height is drifting simplex noise,
        // tilted toward the camera so it reads as an aerial view of dunes.
        const ax = ambientTargets[i*3]   + Math.sin(elapsed * driftFreq[i] + driftPhase[i]) * 0.2 * driftAmp;
        const ay = ambientTargets[i*3+1] + Math.cos(elapsed * driftFreq[i] * 0.83 + driftPhase[i] * 1.7) * 0.16 * driftAmp;
        const az = ambientTargets[i*3+2];
        let fx = ax, fy = ay, fz = az;
        let terrainEase = 0;
        let heightN     = 0.5; // normalized terrain height (0 valley → 1 peak)
        let recycleFade = 1;   // edge fade so the glide's wrap seam stays hidden
        if (!isDispersal && terrainActive) {
          const tStagger = normR * 0.3;
          const tp = Math.max(0, Math.min(1, (terrain - tStagger) / (1 - tStagger)));
          terrainEase = tp * tp * (3 - 2 * tp);
          const txu = gridX[i];
          const tzu = gridZ[i];
          // Height / reshape: sampled at the FIXED grid cell (+ flow), independent
          // of the forward-glide below. Offsetting the sampling coords (not the
          // grid) morphs the dunes in place — peaks rise and valleys form as the
          // scroll-driven flow drifts (forward on scroll-down, reversed on up).
          const nv  = snoise2D(txu * TERRAIN_FREQ + flow, tzu * TERRAIN_FREQ - flow * 0.35);
          heightN   = nv * 0.5 + 0.5;
          const tyu = nv * TERRAIN_AMP;
          // Forward-glide: translate the particle's DEPTH (not its noise input)
          // toward the camera and wrap it within the terrain band so it recycles.
          // Perspective then makes near particles stream past faster than far ones
          // — a parallax fly-over that runs independently of the height reshape.
          const zEff = TERRAIN_Z_MIN +
            ((((tzu + depthGlide - TERRAIN_Z_MIN) % TERRAIN_Z_SPAN) + TERRAIN_Z_SPAN) % TERRAIN_Z_SPAN);
          // Fade particles in/out within a margin of either band edge so the
          // recycle (near edge → far edge) is invisible.
          const edgeDist = Math.min(zEff - TERRAIN_Z_MIN, TERRAIN_Z_MIN + TERRAIN_Z_SPAN - zEff);
          recycleFade = Math.min(1, edgeDist / TERRAIN_GLIDE_FADE);
          // Sunk below the camera eye line with a gentle far-edge tilt, the
          // plane reads as terrain seen from above — an aerial perspective
          // without moving the shared camera out from under the other phases.
          const ty = tyu * T_COS - zEff * T_SIN + TERRAIN_Y;
          const tz = tyu * T_SIN + zEff * T_COS;
          fx = ax + (txu - ax) * terrainEase;
          fy = ay + (ty  - ay) * terrainEase;
          fz = az + (tz  - az) * terrainEase;
        }

        // Blend morph phase → field phase
        positions[i*3]   = mx + (fx - mx) * post;
        positions[i*3+1] = my + (fy - my) * post;
        positions[i*3+2] = mz + (fz - mz) * post;

        // Alpha: twinkle everywhere; dispersal subset dims as the sphere
        // forms; the field phase is dim ambient that brightens as the
        // terrain converges — peaks glow brighter than valleys. The random
        // per-particle baseAlpha is flattened out as the terrain forms so it
        // doesn't drown the heightmap's spatial brightness pattern.
        const tw     = 0.85 + 0.15 * Math.sin(elapsed * twinkleFreq[i] + twinklePhase[i]);
        const morphA = baseAlpha[i] * tw * (isDispersal ? (1 - eased) : 1);
        const fieldBase = baseAlpha[i] + (0.95 - baseAlpha[i]) * terrainEase;
        const fieldA = fieldBase * tw * recycleFade *
          (AMBIENT_ALPHA + (TERRAIN_ALPHA - AMBIENT_ALPHA) * terrainEase * (0.55 + 0.45 * heightN));
        aAlphaArr[i] = morphA + (fieldA - morphA) * post;

        // Size: peaks swell slightly, valleys shrink; restored to base when
        // the terrain disperses (updateSizes stays true one extra frame).
        if (updateSizes) {
          aSizeArr[i] = baseSize[i] * (1 + 0.7 * (heightN - 0.5) * terrainEase * post);
        }
      }

      posAttr.needsUpdate = true;
      alpAttr.needsUpdate = true;
      if (updateSizes) szAttr.needsUpdate = true;
      sizesWereScaled = terrainActive;

      // ── Sphere group rotation (scales in with morphP) ─────────────────
      sphereGroup.rotation.y += delta * 0.18 * morphP;

      // ── Node opacity (fade in after morphP > 0.7, out as field takes over)
      const sphereVis   = 1 - Math.min(1, post * 2);
      const nodeOpacity = Math.max(0, Math.min(1, (morphP - 0.7) / 0.3)) * sphereVis;
      for (let i = 0; i < nodeMeshes.length; i++) {
        nodeMeshes[i].material.opacity = nodeOpacity;
      }

      // ── Project every node to screen space (shared by hit-test + labels)
      for (let i = 0; i < nodeMeshes.length; i++) {
        nodeMeshes[i].getWorldPosition(nodeWorldPos);
        nodeScreen[i*3+2] = nodeWorldPos.z; // sign: + faces camera, − far side
        nodeWorldPos.project(camera);
        nodeScreen[i*3]   = (nodeWorldPos.x *  0.5 + 0.5) * w;
        nodeScreen[i*3+1] = (nodeWorldPos.y * -0.5 + 0.5) * h;
      }

      // ── 2D screen-space hover (only while the sphere is formed and
      // active). Depth is ignored, so far-side nodes stay interactive; a
      // small bias prefers the near-side node when two overlap on screen.
      let newHovered = -1;
      if (nodeOpacity > 0.05) {
        let bestScore = HIT_RADIUS;
        for (let i = 0; i < nodeMeshes.length; i++) {
          const dx = nodeScreen[i*3]   - mouseClient.x;
          const dy = nodeScreen[i*3+1] - mouseClient.y;
          const d  = Math.hypot(dx, dy);
          if (d > HIT_RADIUS) continue;
          const score = d - (nodeScreen[i*3+2] >= 0 ? 6 : 0);
          if (score < bestScore) { bestScore = score; newHovered = i; }
        }
      }
      if (newHovered !== hoveredIndex) {
        if (hoveredIndex >= 0) {
          nodeMeshes[hoveredIndex].scale.setScalar(1);
          nodeMeshes[hoveredIndex].material.color.setHex(0xc4b5fd);
        }
        hoveredIndex = newHovered;
        if (hoveredIndex >= 0) {
          nodeMeshes[hoveredIndex].scale.setScalar(1.6);
          nodeMeshes[hoveredIndex].material.color.setHex(0xfaf5ff);
          document.body.style.cursor = 'pointer';
          // Refresh tooltip copy for the newly hovered node
          const tipEl = tooltipRef.current;
          if (tipEl) {
            tipEl.children[0].textContent = NODES[hoveredIndex].label;
            tipEl.children[1].textContent = NODES[hoveredIndex].descriptor;
          }
        } else {
          document.body.style.cursor = '';
        }
      }

      // ── HTML label projection (screen coords computed above) ──────────
      for (let i = 0; i < nodeMeshes.length; i++) {
        const labelEl = labelRefs.current[i]?.current;
        if (!labelEl) continue;

        // Hide labels for far-side nodes (behind the sphere from camera at +z)
        if (nodeScreen[i*3+2] < 0 || nodeOpacity <= 0) {
          labelEl.style.display = 'none';
          continue;
        }

        labelEl.style.display   = 'block';
        labelEl.style.opacity   = nodeOpacity;
        labelEl.style.transform = `translate(${nodeScreen[i*3]}px, ${nodeScreen[i*3+1]}px) translate(-50%, calc(-100% - 14px))`;

        // Highlight hovered label
        labelEl.firstChild.style.color = i === hoveredIndex ? '#faf5ff' : '#c4b5fd';
      }

      // ── Far-side hover tooltip — the projected label stays hidden there,
      // so surface the node's copy next to the cursor instead.
      const tipEl = tooltipRef.current;
      if (tipEl) {
        if (hoveredIndex >= 0 && nodeScreen[hoveredIndex*3+2] < 0 && nodeOpacity > 0.05) {
          tipEl.style.display   = 'block';
          tipEl.style.opacity   = nodeOpacity;
          tipEl.style.transform = `translate(${mouseClient.x + 16}px, ${mouseClient.y + 16}px)`;
        } else {
          tipEl.style.display = 'none';
        }
      }

      // The 160 legacy background points read too strong over section
      // content — dim them once the ambient field takes over.
      ambMat.opacity = 0.4 - 0.25 * post;

      ambPoints.rotation.y += 0.0002;
      renderer.render(scene, camera);
    }

    // rAF pauses only when the canvas is fully off-screen — it never is
    // while position:fixed, but this guards display:none and future layout
    // changes without costing anything per-frame.
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      const was = onScreen;
      onScreen = entry.isIntersecting;
      if (onScreen && !was && !rafId) {
        clock.getDelta(); // swallow the paused interval
        animate();
      }
    });
    io.observe(canvas);
    animate();

    // ── Resize ────────────────────────────────────────────────────────────
    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      st?.kill(true); // revert pin-spacer DOM/styles (StrictMode-safe)
      heroFade?.revert(); // restore hero-content inline opacity/transform
      clearTimeout(lockTimer);
      window.removeEventListener('wheel', blockScrollEvent);
      window.removeEventListener('touchmove', blockScrollEvent);
      io.disconnect();
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleClick);
      document.body.style.cursor = '';
      nodeMeshes.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
      geo.dispose();
      mat.dispose();
      ambGeo.dispose();
      ambMat.dispose();
      circleTex.dispose();
      renderer.dispose();
    };
  }, [isMobile, nameHoveredRef]);

  if (isMobile) return null;

  return (
    <>
      {/* Fixed Three.js canvas — full-viewport background for the whole site.
          zIndex 1 paints it above section background colors (sections are
          position:relative with z-index:auto) but below every section's
          `relative z-10` content wrapper, so ambient particles sit behind
          text without being buried under opaque section backgrounds. */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
          display: 'block',
        }}
      />

      {/* Far-side hover tooltip — follows the cursor when the hovered nav
          node is behind the sphere and its projected label is hidden */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          pointerEvents: 'none',
          zIndex: 20,
          display: 'none',
          padding: '6px 10px',
          borderRadius: '8px',
          background: 'rgba(3, 7, 18, 0.85)',
          border: '1px solid rgba(167, 139, 250, 0.35)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ color: '#faf5ff', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }} />
        <div style={{ color: 'rgba(167,139,250,0.8)', fontSize: '0.65rem', marginTop: '2px' }} />
      </div>

      {/* HTML label overlays — projected each frame in the animate loop */}
      {NODES.map((node, i) => (
        <div
          key={node.label}
          ref={labelRefs.current[i]}
          style={{
            position: 'fixed',
            top: 0, left: 0,
            pointerEvents: 'none',
            zIndex: 20,
            display: 'none',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          <div style={{ color: '#c4b5fd', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {node.label}
          </div>
          <div style={{ color: 'rgba(167,139,250,0.6)', fontSize: '0.65rem', marginTop: '2px' }}>
            {node.descriptor}
          </div>
        </div>
      ))}
    </>
  );
});
