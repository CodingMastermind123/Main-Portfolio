// ════════════════ 3.1 IMPORTS ════════════════
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  FiGithub, FiLinkedin, FiMail, FiExternalLink, FiDownload,
  FiSun, FiMoon, FiMenu, FiX, FiSearch, FiChevronDown,
  FiArrowRight, FiAward, FiCode, FiCpu, FiDatabase,
  FiGlobe, FiTerminal, FiTool, FiLayers, FiZap, FiUser,
  FiArrowUp, FiActivity, FiUsers, FiBox, FiCoffee,
} from 'react-icons/fi';
import {
  SiPython, SiJavascript, SiTensorflow,
  SiGit, SiLinux, SiHtml5, SiCss,
} from 'react-icons/si';

// ════════════════ 3.2 DATA CONSTANTS ════════════════

const NAV_LINKS = [
  { label: 'About',        href: '#about' },
  { label: 'Skills',       href: '#skills' },
  { label: 'Projects',     href: '#projects' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Contact',      href: '#contact' },
];

const TAGLINES = [
  'Computer Engineering Honors @ Texas A&M',
  'Building with ML & Hardware',
  'Eagle Scout & Problem Solver',
  'Open to Research & Internships',
];

const SOCIAL_LINKS = [
  { icon: FiGithub,   href: 'https://github.com/CodingMastermind123', label: 'GitHub' },
  { icon: FiLinkedin, href: '#',                                       label: 'LinkedIn' },
  { icon: FiMail,     href: 'mailto:aamrith@tamu.edu',                label: 'Email' },
];

const STATS = [
  { label: 'Projects',      value: 8,   suffix: '+' },
  { label: 'Hours Coding',  value: 500, suffix: '+' },
  { label: 'Hackathons',    value: 3,   suffix: '' },
  { label: 'Service Hours', value: 100, suffix: '+' },
];

const CURRENTLY_LEARNING = [
  { name: 'C++',     desc: 'Learning this summer',            stage: 'Fundamentals', width: 30 },
  { name: 'Arduino', desc: 'Hands-on with embedded projects', stage: 'Fundamentals', width: 30 },
  { name: 'React',   desc: 'Used in projects',                stage: 'Building',     width: 50 },
  { name: 'Verilog', desc: 'Getting started with HDL',        stage: 'Fundamentals', width: 16 },
];

const SKILLS = {
  Languages: [
    { name: 'Python',     icon: SiPython,     color: '#3776AB' },
    { name: 'HTML',       icon: SiHtml5,      color: '#E34F26' },
    { name: 'CSS',        icon: SiCss,        color: '#1572B6' },
    { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
    { name: 'Java',       icon: FiCoffee,     color: '#007396' },
  ],
  Frameworks: [
    { name: 'TensorFlow', icon: SiTensorflow, color: '#FF6F00' },
  ],
  Tools: [
    { name: 'Git',        icon: SiGit,  color: '#F05032' },
    { name: 'Linux',      icon: SiLinux, color: '#FCC624' },
    { name: 'SolidWorks', icon: FiBox,  color: '#FF0000' },
  ],
};

const RADAR_DATA = [
  { axis: 'ML',       value: 0.75 },
  { axis: 'Web',      value: 0.65 },
  { axis: 'Hardware', value: 0.70 },
  { axis: 'Embedded', value: 0.72 },
  { axis: 'Systems',  value: 0.60 },
];

const PROJECTS = [
  {
    id: 1,
    title: 'LegalDefender',
    summary: 'AI-powered tenant protection app that scans leases for illegal clauses and tracks landlord reputation on the blockchain.',
    description: 'Built at a hackathon to protect low-income renters from predatory landlords. Uses Gemini 1.5 Pro to audit lease PDFs against Texas Property Code, flagging illegal clauses in real time. Verified tenant reviews are permanently minted to the Solana blockchain so landlords can never delete negative feedback. Includes an OCR-based gatekeeper system to prevent fake reviews and an evidence locker for timestamped move-in photos.',
    stack: ['React', 'Gemini API', 'Solana', 'Next.js', 'DigitalOcean'],
    category: 'Other',
    github: '#',
    demo: '#',
  },
  {
    id: 2,
    title: 'Cosmos',
    summary: 'Interactive AI-guided knowledge graph of NASA exoplanet and mission data built at a hackathon.',
    description: 'Built at a hackathon using NASA\'s Exoplanet Archive and the Anthropic Claude API. Renders a force-directed knowledge graph using D3.js where users can explore connections between exoplanets, missions, and discoveries. Features an AI guide called Stella that answers questions about the data in natural language.',
    stack: ['React', 'D3.js', 'Claude API', 'NASA API', 'Vite'],
    category: 'Web',
    github: '#',
    demo: '#',
  },
  {
    id: 3,
    title: 'Biomedical ML',
    summary: 'Deep learning model classifying chest X-rays for pneumonia detection with high accuracy.',
    description: 'Trained a ResNet-50 convolutional neural network on a labeled chest X-ray dataset to classify images as normal or pneumonia. Handled class imbalance through weighted sampling and built a data pipeline with pandas for preprocessing and validation. Contributed the data engineering component including label mapping, sanity checks, and dataset splitting.',
    stack: ['Python', 'TensorFlow', 'ResNet-50', 'Pandas'],
    category: 'ML',
    github: '#',
    demo: '#',
  },
  {
    id: 4,
    title: 'GoodBeats',
    summary: 'Music recommendation app using Spotify audio features and machine learning to match songs to your taste.',
    description: 'Built a content-based music recommendation system using Spotify audio features like tempo, energy, and valence. Trained a TensorFlow model to compute similarity between tracks and surface personalized recommendations. Flask REST API serves the ML backend with a clean HTML/CSS frontend.',
    stack: ['Python', 'TensorFlow', 'Flask', 'Node.js', 'HTML', 'CSS'],
    category: 'Web',
    github: '#',
    demo: '#',
  },
  {
    id: 5,
    title: 'Hardware Graphics Engine',
    summary: 'Custom hardware graphics engine built in SystemVerilog and verified with Verilator.',
    description: 'Designed and implemented a hardware graphics engine from scratch using SystemVerilog as part of a team project. Responsible for RTL design, module integration, and simulation-based verification using Verilator. Demonstrates low-level understanding of how graphics pipelines work at the hardware level.',
    stack: ['SystemVerilog', 'C++', 'Verilator'],
    category: 'Hardware',
    github: '#',
    demo: '#',
  },
];

const PROJECT_CATEGORIES = ['All', 'ML', 'Hardware', 'Web', 'Other'];

const ACHIEVEMENTS = [
  {
    title: 'Eagle Scout',
    description: 'Earned Scouting America\'s highest rank, demonstrating leadership, community service, and a 12-year commitment to personal growth.',
    icon: 'eagle',
  },
  {
    title: 'Presidential Volunteer Service Award',
    description: 'Recognized by the President\'s Council on Service and Civic Participation for completing 100+ hours of community service.',
    icon: 'award',
  },
  {
    title: 'Varsity Tennis',
    description: 'Competed at the varsity level, developing discipline, strategic thinking, and resilience through high-pressure match play.',
    icon: 'tennis',
  },
  {
    title: 'TAMUhack Participant',
    description: 'Competed in Texas A&M\'s flagship hackathon, building a functional prototype under a 24-hour deadline alongside a cross-disciplinary team.',
    icon: 'code',
  },
  {
    title: 'Engineering Team Projects',
    description: 'Contributed to multiple collaborative engineering projects, applying coursework to real hardware and software systems with teammates.',
    icon: 'team',
  },
];

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

const COMMAND_ACTIONS = [
  { label: 'Go to About',        action: 'scroll',  target: '#about',        icon: FiUser },
  { label: 'Go to Skills',       action: 'scroll',  target: '#skills',       icon: FiCode },
  { label: 'Go to Projects',     action: 'scroll',  target: '#projects',     icon: FiLayers },
  { label: 'Go to Achievements', action: 'scroll',  target: '#achievements', icon: FiAward },
  { label: 'Go to Contact',      action: 'scroll',  target: '#contact',      icon: FiMail },
  { label: 'Toggle Theme',       action: 'theme',   target: null,            icon: FiSun },
  { label: 'Open Resume',        action: 'link',    target: '/resume.pdf',   icon: FiDownload },
  { label: 'Visit GitHub',       action: 'link',    target: 'https://github.com/CodingMastermind123', icon: FiGithub },
  { label: 'Visit LinkedIn',     action: 'link',    target: '#',             icon: FiLinkedin },
];

// ════════════════ 3.3 CUSTOM HOOKS ════════════════

function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);
  return [darkMode, toggleDarkMode];
}

function useScrollReveal(delay = 0) {
  const ref = useRef(null);
  const prefersReduced = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReduced.current) {
      el.classList.add('reveal-visible');
      return;
    }

    el.classList.add('reveal-hidden');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.remove('reveal-hidden');
            el.classList.add('reveal-visible');
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}

function useAnimatedCounter(target, duration = 2000) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();

          const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, count };
}

function useKonamiCode(callback) {
  const buffer = useRef([]);
  const timer = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      buffer.current.push(e.code);
      if (buffer.current.length > KONAMI_SEQUENCE.length) {
        buffer.current.shift();
      }

      clearTimeout(timer.current);
      timer.current = setTimeout(() => { buffer.current = []; }, 3000);

      if (buffer.current.join(',') === KONAMI_SEQUENCE.join(',')) {
        buffer.current = [];
        callback();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      clearTimeout(timer.current);
    };
  }, [callback]);
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ════════════════ UTILITY COMPONENTS ════════════════

function CustomCursor() { return null; }

// Reusable floating particle canvas — no vortex, just drifting dots
function FloatingParticles({ count = 45 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const setSize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();

    const particles = Array.from({ length: count }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 2 + 1,
      vx:      (Math.random() - 0.5) * 0.25,
      vy:      (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.4 + 0.3,
    }));

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();
      }
    };
    animate();

    const handleResize = () => setSize();
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}

function ScrollArrow({ shootRef }) {
  const [scrollY, setScrollY] = useState(0);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const handle = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    shootRef?.current?.();
    setTimeout(() => {
      setClicked(false);
      document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  };

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-8 left-1/2 text-gray-400 hover:text-purple-400 animate-bounce"
      style={{
        opacity: scrollY > 100 ? 0 : 1,
        transition: 'opacity 300ms ease, transform 200ms ease, color 200ms ease',
        transform: clicked ? 'translateX(-50%) scale(1.6)' : 'translateX(-50%) scale(1)',
        color: clicked ? '#a855f7' : undefined,
      }}
      aria-label="Scroll to About section"
    >
      <FiChevronDown size={28} />
    </button>
  );
}

// ════════════════ HERO COMPONENTS ════════════════

function ThreeHero({ isMobile, nameHoveredRef, shootRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


    // ── Ambient circular particles outside the vortex ───────────────────────
    // Soft-circle texture via 2D canvas (avoids a second custom shader)
    const circleCanvas = document.createElement('canvas');
    circleCanvas.width  = 32;
    circleCanvas.height = 32;
    const ctx2d  = circleCanvas.getContext('2d');
    const radGrad = ctx2d.createRadialGradient(16, 16, 0, 16, 16, 15);
    radGrad.addColorStop(0,   'rgba(255,255,255,1)');
    radGrad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    radGrad.addColorStop(1,   'rgba(255,255,255,0)');
    ctx2d.fillStyle = radGrad;
    ctx2d.fillRect(0, 0, 32, 32);
    const circleTex = new THREE.CanvasTexture(circleCanvas);

    const AMB = 160;
    const ambPos = new Float32Array(AMB * 3);
    for (let i = 0; i < AMB; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 3 + Math.random() * 4.5; // 3–7.5, well outside vortex
      ambPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      ambPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      ambPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const ambGeo = new THREE.BufferGeometry();
    ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
    const ambMat = new THREE.PointsMaterial({
      color:           0xc084fc,
      size:            0.04,
      map:             circleTex,
      transparent:     true,
      opacity:         0.45,
      sizeAttenuation: true,
      depthWrite:      false,
      alphaTest:       0.01,
    });
    const ambPoints = new THREE.Points(ambGeo, ambMat);
    ambPoints.renderOrder = 0;
    scene.add(ambPoints);

    // ── Vortex particle state arrays ─────────────────────────────────────────
    const N = 400;
    const angles       = new Float32Array(N);
    const baseRadii    = new Float32Array(N);
    const heights      = new Float32Array(N);
    const mouseExtra   = new Float32Array(N);
    const explodeTargR = new Float32Array(N);
    const shootVels    = new Float32Array(N);
    const breathePhase = new Float32Array(N);
    const baseAlpha    = new Float32Array(N);
    const twinkleFreq  = new Float32Array(N);
    const twinklePhase = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      angles[i]       = Math.random() * Math.PI * 2;
      baseRadii[i]    = 0.8 + Math.sqrt(Math.random()) * 1.7; // 0.8–2.5, center-weighted
      heights[i]      = (Math.random() - 0.5) * 3;
      explodeTargR[i] = 4 + Math.random() * 2;
      breathePhase[i] = Math.random() * Math.PI * 2;
      baseAlpha[i]    = 0.65 + Math.random() * 0.35;           // 0.65–1.0
      twinkleFreq[i]  = 0.3 + Math.random() * 0.5;            // 0.3–0.8 Hz
      twinklePhase[i] = Math.random() * Math.PI * 2;
    }

    // ── GPU buffers ───────────────────────────────────────────────────────────
    const positions = new Float32Array(N * 3);
    const aColorArr = new Float32Array(N * 3);
    const aSizeArr  = new Float32Array(N);
    const aAlphaArr = new Float32Array(N);

    // Size tiers: 60% small, 30% medium, 10% large (change 1)
    for (let i = 0; i < N; i++) {
      const roll = Math.random();
      if      (roll < 0.60) aSizeArr[i] = 0.02 + Math.random() * 0.01;  // 0.02–0.03
      else if (roll < 0.90) aSizeArr[i] = 0.03 + Math.random() * 0.02;  // 0.03–0.05
      else                  aSizeArr[i] = 0.05 + Math.random() * 0.02;  // 0.05–0.07
    }

    const vortexGeo = new THREE.BufferGeometry();
    const posAttr   = new THREE.BufferAttribute(positions, 3);
    const colAttr   = new THREE.BufferAttribute(aColorArr, 3);
    const szAttr    = new THREE.BufferAttribute(aSizeArr,  1);
    const alpAttr   = new THREE.BufferAttribute(aAlphaArr, 1);
    vortexGeo.setAttribute('position', posAttr);
    vortexGeo.setAttribute('aColor',   colAttr);
    vortexGeo.setAttribute('aSize',    szAttr);
    vortexGeo.setAttribute('aAlpha',   alpAttr);

    // ShaderMaterial: per-vertex size, color, alpha + global fade uniform
    const vortexMat = new THREE.ShaderMaterial({
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

    const vortex = new THREE.Points(vortexGeo, vortexMat);
    vortex.renderOrder = 1;
    scene.add(vortex);

    // Depth-based colours (change 5)
    const NEAR_COL = new THREE.Color(0xc084fc); // +Z, closest to camera
    const MID_COL  = new THREE.Color(0xa855f7); // mid
    const FAR_COL  = new THREE.Color(0x6d28d9); // −Z, furthest
    const tmpCol   = new THREE.Color();

    // ── Mouse tracking ────────────────────────────────────────────────────────
    const mouseNorm = { x: 0, y: 0 };
    const camTarget = { x: 0, y: 0 };
    const MAX_TILT  = 3 * Math.PI / 180;

    const handleMouse = (e) => {
      mouseNorm.x =  (e.clientX / w - 0.5) * 2;
      mouseNorm.y = -(e.clientY / h - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse);

    const mouseWorld = () => {
      const halfH = Math.tan((60 * Math.PI / 180) / 2) * camera.position.z;
      return { x: mouseNorm.x * halfH * (w / h), y: mouseNorm.y * halfH };
    };

    // ── Interaction state ─────────────────────────────────────────────────────
    let explodeProgress = 0;
    let shooting        = false;
    let shootT          = 0;

    const shoot = () => {
      if (shooting) return;
      shooting = true;
      shootT   = 0;
      for (let i = 0; i < N; i++) shootVels[i] = 0.02 + Math.random() * 0.03;
    };
    if (shootRef) shootRef.current = shoot;

    // ── Animation loop ────────────────────────────────────────────────────────
    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta   = clock.getDelta();
      const elapsed = clock.elapsedTime;

      // Camera parallax
      camTarget.x += (mouseNorm.x * MAX_TILT - camTarget.x) * 0.05;
      camTarget.y += (mouseNorm.y * MAX_TILT - camTarget.y) * 0.05;
      scene.rotation.y = camTarget.x;
      scene.rotation.x = camTarget.y;

      // Hover explosion
      const isHovered  = nameHoveredRef?.current || false;
      const explTgt    = isHovered ? 1 : 0;
      const explRate   = isHovered ? Math.min(delta * 2.5, 1) : Math.min(delta * 1.25, 1);
      explodeProgress += (explTgt - explodeProgress) * explRate;

      // Global alpha: explosion fades to 0.22, shoot fades to 0
      if (shooting) {
        shootT += delta;
        vortexMat.uniforms.uGlobalAlpha.value = Math.max(0, 1 - shootT / 0.6);
      } else {
        vortexMat.uniforms.uGlobalAlpha.value = 1 - explodeProgress * 0.78;
      }

      const mw = mouseWorld();

      for (let i = 0; i < N; i++) {
        // Differential rotation: inner particles orbit faster (change 2)
        angles[i] += 0.006 / baseRadii[i];

        // Radial breathe — vortex inhales/exhales slightly (change 2)
        const breathe = Math.sin(elapsed * 0.5 + breathePhase[i]) * 0.08;

        // Upward drift + wrap, or shoot downward
        if (!shooting) {
          heights[i] += delta * 0.12;
          if (heights[i] > 1.5) heights[i] = -1.5;
        } else {
          shootVels[i] += 0.008;
          heights[i]   -= shootVels[i];
        }

        // Explosion expansion
        const explR = baseRadii[i] + (explodeTargR[i] - baseRadii[i]) * explodeProgress;

        // Mouse proximity push
        const px   = explR * Math.cos(angles[i]);
        const py   = heights[i];
        const dist = Math.sqrt((px - mw.x) ** 2 + (py - mw.y) ** 2);
        if (dist < 1.5 && !shooting) {
          mouseExtra[i] = Math.max(mouseExtra[i], (1.5 - dist) / 1.5 * 1.5);
        } else {
          mouseExtra[i] += (0 - mouseExtra[i]) / 60;
        }

        const r = explR + mouseExtra[i] + breathe;

        positions[i * 3]     = r * Math.cos(angles[i]);
        positions[i * 3 + 1] = heights[i];
        positions[i * 3 + 2] = r * Math.sin(angles[i]);

        // Depth-based colour: Z in [-2.5, 2.5] (change 5)
        const zNorm = Math.max(0, Math.min(1, (positions[i * 3 + 2] + 2.5) / 5));
        if (zNorm > 0.5) {
          tmpCol.copy(MID_COL).lerp(NEAR_COL, (zNorm - 0.5) * 2);
        } else {
          tmpCol.copy(FAR_COL).lerp(MID_COL, zNorm * 2);
        }
        aColorArr[i * 3]     = tmpCol.r;
        aColorArr[i * 3 + 1] = tmpCol.g;
        aColorArr[i * 3 + 2] = tmpCol.b;

        // Per-particle twinkle opacity (change 4)
        aAlphaArr[i] = baseAlpha[i] * (0.85 + 0.15 * Math.sin(elapsed * twinkleFreq[i] + twinklePhase[i]));
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      alpAttr.needsUpdate = true;

      // Shoot completion: reset
      if (shooting && shootT >= 0.6) {
        shooting = false;
        vortexMat.uniforms.uGlobalAlpha.value = 1;
        for (let i = 0; i < N; i++) {
          angles[i]     = Math.random() * Math.PI * 2;
          heights[i]    = (Math.random() - 0.5) * 3;
          shootVels[i]  = 0;
          mouseExtra[i] = 0;
        }
      }

      ambPoints.rotation.y += 0.0002;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
      ambGeo.dispose();
      ambMat.dispose();
      circleTex.dispose();
      vortexGeo.dispose();
      vortexMat.dispose();
      renderer.dispose();
      if (shootRef) shootRef.current = null;
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.22) 0%, #030712 65%)' }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

// Step 4.3 — Typing animation: forward 50ms/char, pause 2s, delete 30ms/char
function TypedText({ strings }) {
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex,   setCharIndex]   = useState(0);
  const [isDeleting,  setIsDeleting]  = useState(false);

  const displayText = strings[stringIndex].slice(0, charIndex);

  useEffect(() => {
    const current = strings[stringIndex];
    let timeout;

    if (!isDeleting) {
      if (charIndex < current.length) {
        timeout = setTimeout(() => setCharIndex(i => i + 1), 50);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => setCharIndex(i => i - 1), 30);
      } else {
        setIsDeleting(false);
        setStringIndex(i => (i + 1) % strings.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, stringIndex, strings]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse ml-0.5 text-indigo-500">|</span>
    </span>
  );
}

// Step 4.4 — Pulsing "currently building" badge
function CurrentlyBuildingBadge() {
  return null;
}

// ════════════════ SECTION COMPONENTS ════════════════

// Step 5.1 — Sticky navbar: transparent → frosted glass on scroll, active section highlighting
function Navbar({ darkMode, toggleDarkMode, setMobileMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  // Track which section is in view — last section whose top edge is at or above navbar bottom (80px)
  useEffect(() => {
    const sectionIds = ['hero', ...NAV_LINKS.map(l => l.href.replace('#', ''))];
    const handleScroll = () => {
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 80) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800'
          : ''
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          AA
        </button>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => {
            const id = href.replace('#', '');
            const isActive = activeSection === id;
            return (
              <li key={href}>
                <button
                  onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}
                  className={`relative text-sm font-medium py-1 transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                  <span
                    className="absolute bottom-0 left-0 h-0.5 bg-indigo-500 transition-all duration-300"
                    style={{ width: isActive ? '100%' : '0%' }}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            <span style={{ display: 'inline-block', transform: darkMode ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 300ms' }}>
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </span>
          </button>

          {/* Resume pill — desktop only */}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors"
          >
            <FiDownload size={14} /> Resume
          </a>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <FiMenu size={22} />
          </button>
        </div>
      </nav>
    </header>
  );
}

function HeroSection({ isMobile }) {
  const parallaxRef    = useRef(null);
  const heroRef        = useRef(null);
  const nameHoveredRef = useRef(false);
  const shootRef       = useRef(null);

  useEffect(() => {
    if (isMobile) return;
    const handle = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.5}px)`;
      }
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, [isMobile]);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950"
    >
      {/* Three.js full-viewport background */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ willChange: 'transform' }}
      >
        <ThreeHero
          isMobile={isMobile}
          nameHoveredRef={nameHoveredRef}
          shootRef={shootRef}
        />
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950 pointer-events-none" />

      {/* Purple radial glow behind name (change 3) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Hero content — absolute center */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white cursor-default select-none"
          style={{ fontFamily: 'var(--font-display)' }}
          onMouseEnter={() => { nameHoveredRef.current = true; }}
          onMouseLeave={() => { nameHoveredRef.current = false; }}
        >
          Amrith<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            Akshintala
          </span>
        </h1>

        <p className="mt-4 text-xl md:text-2xl text-gray-400 min-h-[2rem]">
          <TypedText strings={TAGLINES} />
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#projects"
            onClick={e => {
              e.preventDefault();
              document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 transition-colors"
          >
            View Projects <FiArrowRight />
          </a>
          <a
            href="#contact"
            onClick={e => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-full border border-gray-700 hover:border-indigo-500 text-gray-300 font-semibold flex items-center gap-2 transition-colors"
          >
            Contact Me <FiMail />
          </a>
        </div>
      </div>

      <ScrollArrow shootRef={shootRef} />
    </section>
  );
}

// Phase 6 — About section: two-column layout, bio, social links, animated stat chips
function AboutSection() {
  const headingRef  = useScrollReveal(0);
  const photoRef    = useScrollReveal(100);
  const bioRef      = useScrollReveal(200);

  return (
    <section id="about" className="relative overflow-hidden py-24 bg-white dark:bg-gray-950">
      <FloatingParticles count={80} />
      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            About Me
          </h2>
          <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-indigo-500" />
        </div>

        {/* Step 6.1 — Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left — profile photo placeholder with gradient border */}
          <div ref={photoRef} className="flex justify-center">
            <div className="relative group">
              {/* Gradient ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-900 transition-transform duration-300 group-hover:scale-105">
                {/* Initials placeholder */}
                <span
                  className="text-6xl md:text-7xl font-black text-indigo-500 select-none"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  AA
                </span>
              </div>
            </div>
          </div>

          {/* Right — bio + social links */}
          <div ref={bioRef} className="space-y-6">
            {/* Step 6.2 — Bio heading */}
            <h3
              className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Hi, I'm Amrith!
            </h3>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              I'm a Computer Engineering freshman at Texas A&M, driven by one thing: building systems that actually work in the real world. Whether that's training an ML model, programming a microcontroller, or shipping a web app, I care about the full picture, not just one layer of the stack. More than anything, I want the things I build to actually matter and make an impact on people's lives.
            </p>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Outside the lab I play tennis and basketball, hit the gym, and unwind with video games and good TV. I'm also an Eagle Scout, and that experience of leading projects and solving problems under pressure has stuck with me ever since.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 pt-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors text-sm font-medium"
                >
                  <Icon size={16} /> {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Step 6.3 — Animated stat chips */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ label, value, suffix }, i) => (
            <StatChip key={label} label={label} value={value} suffix={suffix} delay={i * 100} />
          ))}
        </div>

      </div>
    </section>
  );
}

function StatChip({ label, value, suffix, delay }) {
  const { ref, count } = useAnimatedCounter(value);
  const revealRef = useScrollReveal(delay);

  return (
    <div
      ref={(el) => { ref.current = el; revealRef.current = el; }}
      className="flex flex-col items-center gap-1 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
    >
      <span
        className="text-3xl font-black text-indigo-600 dark:text-indigo-400"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {count}{suffix}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
    </div>
  );
}
// ════════════════ PHASE 7: SKILLS SECTION + RADAR CHART ════════════════

// Step 7.1 — Individual skill card with brand-color hover glow
function SkillCard({ skill, delay }) {
  const ref = useScrollReveal(delay);
  const [hovered, setHovered] = useState(false);
  const Icon = skill.icon;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered ? `0 0 18px ${skill.color}55, 0 0 6px ${skill.color}33` : 'none',
        borderColor: hovered ? skill.color : undefined,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease',
      }}
      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 cursor-default"
    >
      <Icon size={26} style={{ color: skill.color }} />
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">
        {skill.name}
      </span>
    </div>
  );
}

// Skill category block with label + grid of cards
function SkillCategory({ category, skills, baseDelay }) {
  const labelRef = useScrollReveal(baseDelay);

  return (
    <div>
      <div ref={labelRef} className="mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          {category}
        </h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {skills.map((skill, i) => (
          <SkillCard key={skill.name} skill={skill} delay={baseDelay + i * 50} />
        ))}
      </div>
    </div>
  );
}

// Step 7.1 — Skills section: categories grid + radar chart
function LearningCard({ item, started }) {
  const [hovered, setHovered] = useState(false);
  const { name, desc, stage, width } = item;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered ? '0 0 18px rgba(168,85,247,0.35), 0 0 6px rgba(168,85,247,0.2)' : 'none',
        borderColor: hovered ? '#a855f7' : undefined,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease',
      }}
      className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{stage}</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{desc}</p>
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ background: '#1e1e2e' }}
      >
        <div
          style={{
            width: started ? `${width}%` : '0%',
            height: '100%',
            borderRadius: '999px',
            background: 'linear-gradient(to right, #7c3aed, #a855f7)',
            transition: 'width 800ms ease-out',
          }}
        />
      </div>
    </div>
  );
}

function CurrentlyLearning() {
  const containerRef = useRef(null);
  const [started, setStarted] = useState(false);
  const labelRef = useScrollReveal(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="mt-12">
      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 mb-8" />

      {/* Label with pulsing dot */}
      <div ref={labelRef} className="flex items-center gap-2 mb-4">
        <span className="pulse-dot" aria-hidden="true" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Currently Learning
        </h3>
      </div>

      {/* Progress bar items */}
      <div className="flex flex-col gap-3">
        {CURRENTLY_LEARNING.map((item) => (
          <LearningCard key={item.name} item={item} started={started} />
        ))}
      </div>
    </div>
  );
}

function SkillsSection() {
  const headingRef = useScrollReveal(0);
  const radarRef   = useScrollReveal(150);

  return (
    <section id="skills" className="relative overflow-hidden py-24 bg-white dark:bg-gray-950">
      <FloatingParticles count={80} />
      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Skills
          </h2>
          <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-indigo-500" />
        </div>

        {/* Two-column: skill cards left, radar chart right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* Skill categories — span 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {Object.entries(SKILLS).map(([category, skills], ci) => (
              <SkillCategory
                key={category}
                category={category}
                skills={skills}
                baseDelay={ci * 100}
              />
            ))}
          </div>

          {/* Radar chart */}
          <div ref={radarRef} className="flex flex-col items-center gap-4">
            <h3
              className="text-base font-semibold text-gray-700 dark:text-gray-300 text-center"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Proficiency Overview
            </h3>
            <SkillRadarChart />
          </div>
        </div>

        {/* Currently Learning subsection */}
        <CurrentlyLearning />

      </div>
    </section>
  );
}

// Step 7.2 — SVG radar chart, animates from center on scroll
function SkillRadarChart() {
  const svgRef      = useRef(null);
  const [prog, setProg] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start    = performance.now();
          const duration = 1000;

          const tick = (now) => {
            const elapsed = now - start;
            const p       = Math.min(elapsed / duration, 1);
            const eased   = 1 - Math.pow(1 - p, 3);
            setProg(eased);
            if (p < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cx = 150, cy = 150, maxR = 100;
  const N  = RADAR_DATA.length; // 5

  const angleOf  = (i) => (i * (2 * Math.PI) / N) - Math.PI / 2;
  const pointAt  = (r, i) => ({
    x: cx + r * Math.cos(angleOf(i)),
    y: cy + r * Math.sin(angleOf(i)),
  });
  const toPath   = (pts) =>
    pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';

  // 3 concentric grid pentagons
  const gridRings = [0.33, 0.66, 1].map(scale =>
    toPath(Array.from({ length: N }, (_, i) => pointAt(maxR * scale, i)))
  );

  // Axis endpoints (full radius)
  const axes = Array.from({ length: N }, (_, i) => pointAt(maxR, i));

  // Data polygon — animated by `prog`
  const dataPath = toPath(RADAR_DATA.map((d, i) => pointAt(maxR * d.value * prog, i)));

  // Dot positions for animated data points
  const dots = RADAR_DATA.map((d, i) => pointAt(maxR * d.value * prog, i));

  // Label positions slightly outside maxR
  const labels = RADAR_DATA.map((d, i) => ({ ...pointAt(maxR + 22, i), axis: d.axis }));

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 300"
      className="w-full max-w-[280px] mx-auto"
      aria-label="Skill proficiency radar chart"
    >
      {/* Grid rings */}
      {gridRings.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axes.map((pt, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={pt.x} y2={pt.y}
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <path
        d={dataPath}
        fill="rgba(99,102,241,0.22)"
        stroke="rgb(99,102,241)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {dots.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="rgb(99,102,241)" />
      ))}

      {/* Axis labels */}
      {labels.map(({ x, y, axis }, i) => (
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="500"
          className="fill-gray-600 dark:fill-gray-400"
        >
          {axis}
        </text>
      ))}
    </svg>
  );
}
// ════════════════ PHASE 8 — PROJECTS ════════════════

function ProjectCard({ project, onExpand, index, pulsing }) {
  const revealRef = useScrollReveal(index * 100);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={revealRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onExpand(project)}
      className={`h-72 flex flex-col p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 cursor-pointer ${pulsing ? 'card-pulse-anim' : ''}`}
      style={{
        position: 'relative',
        boxShadow: hovered && !pulsing ? '0 0 18px rgba(99,102,241,0.35), 0 0 6px rgba(99,102,241,0.2)' : 'none',
        borderColor: hovered && !pulsing ? '#6366f1' : undefined,
        transform: hovered && !pulsing ? 'translateY(-3px)' : undefined,
        transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease',
      }}
    >
      {pulsing && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.6)',
            animation: 'card-ripple 150ms ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
          {project.category}
        </span>
        <FiCode className="text-gray-400" size={18} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
        {project.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
        {project.summary}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {project.stack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExpandedProjectCard({ project, onClose }) {
  const [phase, setPhase] = useState('entering');
  const closeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Double RAF: first paint at scale(0.85), second triggers the spring transition
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setPhase('open'));
      return () => cancelAnimationFrame(r2);
    });
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(timerRef.current);
      document.body.style.overflow = '';
    };
  }, []);

  // Always-fresh close handler via ref so the key listener doesn't need re-registration
  const handleClose = () => {
    if (phase === 'closing-charge' || phase === 'closing-retract') return;
    setPhase('closing-charge');
    timerRef.current = setTimeout(() => {
      setPhase('closing-retract');
      timerRef.current = setTimeout(onClose, 250);
    }, 100);
  };
  closeRef.current = handleClose;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeRef.current(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isOpen     = phase === 'open';
  const isCharging = phase === 'closing-charge';

  // Scaler transform/opacity/transition per phase
  const scalerStyle = (() => {
    switch (phase) {
      case 'entering':       return { transform: 'scale(0.85)', opacity: 0, transition: 'none' };
      case 'open':           return { transform: 'scale(1)',    opacity: 1, transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease' };
      case 'closing-charge': return { transform: 'scale(1.05)', opacity: 1, transition: 'transform 100ms ease-in-out' };
      case 'closing-retract':return { transform: 'scale(0.85)', opacity: 0, transition: 'transform 250ms cubic-bezier(0.36, 0, 0.66, -0.56), opacity 200ms ease' };
      default:               return {};
    }
  })();

  const backdropOpacity = (phase === 'entering' || phase === 'closing-retract') ? 0 : 1;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => closeRef.current()}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(10, 0, 20, 0.75)',
          backdropFilter: 'blur(6px)',
          opacity: backdropOpacity,
          transition: 'opacity 250ms ease',
        }}
      />

      {/* Positioner — flex centering, no transform on this element */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        {/* Scaler — handles scale/opacity stage transitions */}
        <div
          style={{
            ...scalerStyle,
            width: '90%',
            maxWidth: '680px',
            pointerEvents: 'auto',
          }}
        >
          {/* Floater+Glow card — float and breathe animations live here */}
          <div
            className={`bg-white dark:bg-gray-900 rounded-2xl border p-8 ${isOpen ? 'card-float-anim card-glow-anim' : ''}`}
            style={{
              maxHeight: '85vh',
              overflowY: 'auto',
              borderColor: 'rgba(168, 85, 247, 0.4)',
              // During charge-up: freeze animations, jump to max glow
              ...(isCharging ? {
                animation: 'none',
                boxShadow: '0 0 24px 5px rgba(168,85,247,0.38), 0 0 55px 10px rgba(168,85,247,0.13)',
              } : {}),
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                {project.category}
              </span>
              <button
                onClick={() => closeRef.current()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {project.title}
            </h2>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              <FiGithub size={16} /> View Code
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function ProjectsSection({ activeFilter, setActiveFilter }) {
  const [expandedProject, setExpandedProject] = useState(null);
  const [pulsingId, setPulsingId] = useState(null);
  const expandTimerRef = useRef(null);
  const headingRef = useScrollReveal(0);
  const filterRef  = useScrollReveal(100);

  const filteredProjects = activeFilter === 'All'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeFilter);

  const handleExpand = (project) => {
    // Cancel any in-flight expansion and immediately close any open card
    clearTimeout(expandTimerRef.current);
    setExpandedProject(null);
    setPulsingId(null);

    // Stage 1: pulse + ripple on the clicked card for 150ms
    setPulsingId(project.id);
    expandTimerRef.current = setTimeout(() => {
      setPulsingId(null);
      setExpandedProject(project);
    }, 150);
  };

  useEffect(() => () => clearTimeout(expandTimerRef.current), []);

  return (
    <section id="projects" className="py-24 px-6 max-w-6xl mx-auto">
      {/* Heading */}
      <div ref={headingRef} className="text-center mb-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Projects
        </h2>
        <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-indigo-500" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          A selection of things I've built — spanning ML, embedded hardware, and the web.
        </p>
      </div>

      {/* Filter buttons */}
      <div ref={filterRef} className="flex flex-wrap justify-center gap-2 mb-12">
        {PROJECT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveFilter(cat);
              clearTimeout(expandTimerRef.current);
              setExpandedProject(null);
              setPulsingId(null);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              activeFilter === cat
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              pulsing={pulsingId === project.id}
              onExpand={handleExpand}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-16">No projects in this category yet.</p>
      )}

      {expandedProject && (
        <ExpandedProjectCard
          project={expandedProject}
          onClose={() => setExpandedProject(null)}
        />
      )}
    </section>
  );
}

function AchievementsSection() { return null; }
function ContactSection() { return null; }
function Footer() { return null; }

// ════════════════ OVERLAY COMPONENTS ════════════════

// Step 5.2 — Full-screen mobile nav with staggered entrance and body scroll lock
function MobileNav({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLink = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <FiX size={28} />
        </button>

        {/* Staggered nav links */}
        <nav>
          <ul className="flex flex-col items-center gap-8">
            {NAV_LINKS.map(({ label, href }, i) => (
              <li
                key={href}
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 300ms ease, transform 300ms ease`,
                  transitionDelay: open ? `${i * 75}ms` : '0ms',
                }}
              >
                <button
                  onClick={() => handleLink(href)}
                  className="text-3xl font-bold text-white hover:text-indigo-400 transition-colors"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
function ProjectModal({ project, onClose }) {
  const modalRef = useRef(null);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Focus trap
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    el.addEventListener('keydown', trap);
    first?.focus();
    return () => el.removeEventListener('keydown', trap);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <FiX size={20} />
        </button>

        {/* Category badge */}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-4 inline-block">
          {project.category}
        </span>

        <h2
          className="text-2xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {project.title}
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {project.description}
        </p>

        {/* Stack */}
        <div className="flex flex-wrap gap-2 mb-8">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <FiGithub size={16} /> View Code
          </a>
          {project.demo !== '#' && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:border-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <FiExternalLink size={16} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
function CommandPalette() { return null; }
function EasterEggConfetti() { return null; }

// ════════════════ 3.5 ROOT APP COMPONENT ════════════════

export default function App() {
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [easterEggActive, setEasterEggActive] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isFineCursor = useMediaQuery('(pointer: fine)');

  useKonamiCode(useCallback(() => setEasterEggActive(true), []));

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setMobileMenuOpen(false);
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileNav
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main>
        <HeroSection isMobile={isMobile} />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        <AchievementsSection />
        <ContactSection />
      </main>
      <Footer />
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          toggleDarkMode={toggleDarkMode}
        />
      )}
      {easterEggActive && (
        <EasterEggConfetti onComplete={() => setEasterEggActive(false)} />
      )}
      {isFineCursor && <CustomCursor />}
    </div>
  );
}
