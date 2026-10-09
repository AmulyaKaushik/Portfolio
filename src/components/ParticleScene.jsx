import { useEffect, useRef } from "react";
import * as THREE from "three";

/*
 * Igloo.inc-inspired WebGL particle background.
 *
 * - One Points cloud holds four target shapes per particle (sphere, torus knot,
 *   spiral galaxy, "AK" monogram). Scroll position picks the shape; particles
 *   travel between shapes with a per-particle delay and turbulence, so the
 *   cloud bursts apart and re-forms instead of sliding linearly.
 * - The cursor pushes particles away and heats them up (red -> white).
 * - A second, sparse layer of drifting dust wraps around a box ("treadmill")
 *   and moves with scroll parallax, like Igloo's snow layer.
 */

// Section id -> shape index. Sections missing from the page are skipped.
const SHAPE_STOPS = [
  ["home", 0], // sphere
  ["about", 1], // torus knot
  ["projects", 2], // galaxy
  ["contact", 3], // "AK" monogram
];

const COLORS = {
  deep: "#450a0a",
  base: "#dc2626",
  hot: "#ffe4e6",
};

const flowGLSL = /* glsl */ `
  vec3 flow(vec3 p, float t) {
    return vec3(
      sin(p.y * 1.7 + t) + sin(p.z * 2.3 - t * 0.7),
      sin(p.z * 1.9 + t * 0.8) + sin(p.x * 2.1 + t * 0.5),
      sin(p.x * 1.6 - t * 0.6) + sin(p.y * 2.7 + t * 0.9)
    ) * 0.5;
  }
`;

const morphVertex = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uIntro;
  uniform float uEnergy;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  uniform float uMouseStrength;
  uniform vec3 uColorDeep;
  uniform vec3 uColorBase;
  uniform vec3 uColorHot;

  attribute vec3 aPosB;
  attribute vec3 aPosC;
  attribute vec3 aPosD;
  attribute vec3 aRandom;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vSquare;

  ${flowGLSL}

  vec3 shape(float i) {
    if (i < 0.5) return position;
    if (i < 1.5) return aPosB;
    if (i < 2.5) return aPosC;
    return aPosD;
  }

  void main() {
    // Staggered transition between the two neighbouring shapes
    float seg = min(floor(uMorph), 2.0);
    float f = clamp(uMorph - seg, 0.0, 1.0);
    float k = clamp((f - aRandom.x * 0.4) / 0.6, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 pos = mix(shape(seg), shape(seg + 1.0), k);

    // Turbulence: always a little, a lot mid-transition or while scrolling fast
    float transition = sin(k * 3.14159);
    pos += flow(pos * 1.3 + aRandom * 4.0, uTime * 0.35) * (0.03 + transition * 0.45 + uEnergy * 0.25);

    // Intro: fly in from a wide scattered cloud
    vec3 scatter = (aRandom - 0.5) * vec3(16.0, 10.0, 10.0);
    float intro = clamp((uIntro - aRandom.y * 0.35) / 0.65, 0.0, 1.0);
    intro = 1.0 - pow(1.0 - intro, 3.0);
    pos = mix(scatter, pos, intro);

    // Cursor repulsion in world space
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec2 d = world.xy - uMouse.xy;
    float push = smoothstep(1.4, 0.0, length(d)) * uMouseStrength;
    world.xy += normalize(d + 1e-4) * push * 0.55;
    world.z += push * 0.4;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;

    float size = uSize * mix(0.4, 1.4, aRandom.y * aRandom.y) * (1.0 + push * 1.2);
    gl_PointSize = size * uPixelRatio / -mv.z;

    float heat = clamp(push + transition * 0.6 + aRandom.z * 0.2, 0.0, 1.0);
    vColor = mix(uColorDeep, uColorBase, smoothstep(0.0, 0.6, aRandom.z + transition * 0.3));
    vColor = mix(vColor, uColorHot, heat * heat);

    float twinkle = sin(uTime * 1.5 + aRandom.z * 40.0) * 0.5 + 0.5;
    vAlpha = mix(0.35, 1.0, twinkle) * intro;
    vSquare = step(0.92, aRandom.x);
  }
`;

const morphFragment = /* glsl */ `
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vSquare;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float a;
    if (vSquare > 0.5) {
      // A few crisp square "pixels", like Igloo's plexus points
      vec2 q = abs(uv);
      a = step(max(q.x, q.y), 0.2);
    } else {
      a = smoothstep(0.5, 0.0, length(uv));
      a *= a;
    }
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
  }
`;

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;

  attribute vec3 aRandom;

  varying float vAlpha;

  void main() {
    vec3 pos = position;
    // Rise slowly, and parallax with scroll (nearer = faster)
    pos.y += uTime * mix(0.04, 0.15, aRandom.x) + uScroll * mix(0.4, 1.6, aRandom.y);
    pos.x += sin(uTime * 0.3 + aRandom.z * 6.28) * 0.3;
    // Treadmill: wrap inside a 12-unit tall box
    pos.y = mod(pos.y + 6.0, 12.0) - 6.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = mix(6.0, 18.0, aRandom.z) * uPixelRatio / -mv.z;

    vAlpha = (sin(uTime * 0.8 + aRandom.y * 12.43) * 0.5 + 0.5)
           * (sin(uTime * 1.73 + aRandom.z * 7.16) * 0.5 + 0.5);
    vAlpha *= smoothstep(0.5, 2.0, -mv.z);
    vAlpha *= 0.6;
  }
`;

const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a * a * vAlpha);
  }
`;

/* ---------- shape generators (each returns Float32Array of count * 3) ---------- */

function sphereShape(count, radius) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    // Mostly on the shell, some inside for depth
    const rr = radius * (Math.random() < 0.85 ? 1 + (Math.random() - 0.5) * 0.06 : Math.cbrt(Math.random()));
    out[i * 3] = Math.cos(theta) * r * rr;
    out[i * 3 + 1] = y * rr;
    out[i * 3 + 2] = Math.sin(theta) * r * rr;
  }
  return out;
}

function torusKnotShape(count) {
  const geo = new THREE.TorusKnotGeometry(1.05, 0.32, 400, 40);
  const src = geo.attributes.position.array;
  const n = src.length / 3;
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * n) * 3;
    out[i * 3] = src[j] + (Math.random() - 0.5) * 0.05;
    out[i * 3 + 1] = src[j + 1] + (Math.random() - 0.5) * 0.05;
    out[i * 3 + 2] = src[j + 2] + (Math.random() - 0.5) * 0.05;
  }
  geo.dispose();
  return out;
}

function galaxyShape(count) {
  const out = new Float32Array(count * 3);
  const arms = 3;
  const tilt = 1.05;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.6) * 3.4;
    const arm = (i % arms) * ((Math.PI * 2) / arms);
    const spread = (Math.random() - 0.5) * (0.25 + r * 0.18);
    const angle = r * 1.3 + arm + spread;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = (Math.random() - 0.5) * 0.25 * (1.2 - r / 3.4);
    // Tilt toward the camera
    out[i * 3] = x;
    out[i * 3 + 1] = y * cosT - z * sinT;
    out[i * 3 + 2] = y * sinT + z * cosT;
  }
  return out;
}

function textShape(count, text, width) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 380px Inter, system-ui, sans-serif";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = [];
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      if (data[(y * canvas.width + x) * 4 + 3] > 128) pixels.push(x, y);
    }
  }
  if (pixels.length === 0) return sphereShape(count, 1.6);

  const scale = width / canvas.width;
  const out = new Float32Array(count * 3);
  const n = pixels.length / 2;
  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * n) * 2;
    out[i * 3] = (pixels[j] - canvas.width / 2 + Math.random() * 2) * scale;
    out[i * 3 + 1] = -(pixels[j + 1] - canvas.height / 2 + Math.random() * 2) * scale;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  return out;
}

/* ---------------------------------------------------------------------------- */

export default function ParticleScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the page still works without the background
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const count = isMobile ? 9000 : 22000;
    const dustCount = isMobile ? 400 : 1000;

    const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    /* ---- morphing cloud ---- */
    const geometry = new THREE.BufferGeometry();
    const randoms = new Float32Array(count * 3);
    for (let i = 0; i < randoms.length; i++) randoms[i] = Math.random();

    geometry.setAttribute("position", new THREE.BufferAttribute(sphereShape(count, 1.6), 3));
    geometry.setAttribute("aPosB", new THREE.BufferAttribute(torusKnotShape(count), 3));
    geometry.setAttribute("aPosC", new THREE.BufferAttribute(galaxyShape(count), 3));
    geometry.setAttribute("aPosD", new THREE.BufferAttribute(textShape(count, "AK", isMobile ? 3.4 : 6.4), 3));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 3));

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uIntro: { value: reducedMotion ? 1 : 0 },
      uEnergy: { value: 0 },
      uSize: { value: 30 },
      uPixelRatio: { value: pixelRatio * (window.innerHeight / 900) },
      uMouse: { value: new THREE.Vector3(999, 999, 0) },
      uMouseStrength: { value: 0 },
      uOpacity: { value: 0.75 },
      uColorDeep: { value: new THREE.Color(COLORS.deep) },
      uColorBase: { value: new THREE.Color(COLORS.base) },
      uColorHot: { value: new THREE.Color(COLORS.hot) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: morphVertex,
      fragmentShader: morphFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    // Outer group follows the cursor (tilt), inner points spin on their own
    const tiltGroup = new THREE.Group();
    tiltGroup.add(points);
    if (isMobile) tiltGroup.scale.setScalar(0.8);
    scene.add(tiltGroup);

    /* ---- ambient dust ---- */
    const dustGeometry = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustRand = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 16;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      dustPos[i * 3 + 2] = Math.random() * 9 - 6;
      dustRand[i * 3] = Math.random();
      dustRand[i * 3 + 1] = Math.random();
      dustRand[i * 3 + 2] = Math.random();
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeometry.setAttribute("aRandom", new THREE.BufferAttribute(dustRand, 3));

    const dustUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: uniforms.uPixelRatio,
      uColor: { value: new THREE.Color("#fca5a5") },
    };
    const dustMaterial = new THREE.ShaderMaterial({
      uniforms: dustUniforms,
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    dust.frustumCulled = false;
    scene.add(dust);

    /* ---- input ---- */
    const pointer = new THREE.Vector2(0, 0);
    const pointerSmooth = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouseWorld = new THREE.Vector3();
    let pointerActive = false;

    const onPointerMove = (e) => {
      pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      pointerActive = true;
    };
    const onPointerLeave = () => {
      pointerActive = false;
    };

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      uniforms.uPixelRatio.value = pixelRatio * (h / 900);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);

    /* ---- scroll -> shape ---- */
    const targetMorphFromScroll = () => {
      const center = window.scrollY + window.innerHeight * 0.5;
      const stops = SHAPE_STOPS.map(([id, shape]) => {
        const el = document.getElementById(id);
        return el ? { top: el.getBoundingClientRect().top + window.scrollY, shape } : null;
      }).filter(Boolean);
      if (stops.length < 2) return 0;

      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (center < b.top) {
          const t = THREE.MathUtils.clamp((center - a.top) / (b.top - a.top), 0, 1);
          // Hold the current shape, then transform over the last part of the section
          return THREE.MathUtils.lerp(a.shape, b.shape, THREE.MathUtils.smoothstep(t, 0.35, 1));
        }
      }
      return stops[stops.length - 1].shape;
    };

    /* ---- loop ---- */
    const clock = new THREE.Clock();
    let elapsed = 0;
    let lastScrollY = window.scrollY;
    let frame;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += reducedMotion ? 0 : dt;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const scrollVelocity = Math.abs(scrollY - lastScrollY) / vh;
      lastScrollY = scrollY;

      // Intro assemble
      if (uniforms.uIntro.value < 1) uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + dt * 0.45);

      // Damped morph and scroll energy
      const targetMorph = targetMorphFromScroll();
      uniforms.uMorph.value += (targetMorph - uniforms.uMorph.value) * Math.min(1, dt * 2.5);
      uniforms.uEnergy.value += (Math.min(1, scrollVelocity * 25) - uniforms.uEnergy.value) * Math.min(1, dt * 4);

      // Bright in the hero and the finale, dimmer behind dense content
      const heroFade = THREE.MathUtils.clamp(scrollY / vh, 0, 1);
      let targetOpacity = THREE.MathUtils.lerp(0.75, 0.4, heroFade);
      if (uniforms.uMorph.value > 2.5) targetOpacity = 0.65;
      uniforms.uOpacity.value += (targetOpacity - uniforms.uOpacity.value) * Math.min(1, dt * 3);

      // Cursor
      pointerSmooth.lerp(pointer, Math.min(1, dt * 5));
      raycaster.setFromCamera(pointerSmooth, camera);
      if (raycaster.ray.intersectPlane(plane, mouseWorld)) uniforms.uMouse.value.copy(mouseWorld);
      const targetStrength = pointerActive && !reducedMotion ? 1 : 0;
      uniforms.uMouseStrength.value += (targetStrength - uniforms.uMouseStrength.value) * Math.min(1, dt * 3);

      // Motion
      points.rotation.y += dt * (reducedMotion ? 0 : 0.08) * (1 + uniforms.uEnergy.value * 3);
      tiltGroup.rotation.x += (-pointerSmooth.y * 0.2 - tiltGroup.rotation.x) * Math.min(1, dt * 2);
      tiltGroup.rotation.y += (pointerSmooth.x * 0.3 - tiltGroup.rotation.y) * Math.min(1, dt * 2);
      // The monogram should face the viewer: ease the spin back to 0 near the last shape
      if (uniforms.uMorph.value > 2.5) {
        const r = points.rotation.y % (Math.PI * 2);
        const nearest = r > Math.PI ? Math.PI * 2 : 0;
        points.rotation.y = r + (nearest - r) * Math.min(1, dt * 2.5);
      }

      uniforms.uTime.value = elapsed;
      dustUniforms.uTime.value = elapsed;
      dustUniforms.uScroll.value = scrollY / vh;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none" />;
}
