import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SCROLL_LOOP_EVENT } from "../hooks/useScrollLoop";
import { SOCIALS, SOCIAL_SELECT_EVENT } from "../data/socials";

/*
 * Igloo.inc-inspired WebGL particle background.
 *
 * - One Points cloud holds several target shapes per particle (sphere, torus
 *   knot, spiral galaxy, social icons). Scroll position picks the shape; particles
 *   travel between shapes with a per-particle delay and turbulence, so the
 *   cloud bursts apart and re-forms instead of sliding linearly.
 * - At the end of the page the cloud forms the selected social icon (GitHub,
 *   LinkedIn, Mail); picking another one bursts it into the next icon.
 * - The cursor stirs the particles: pushes them out and swirls them round,
 *   harder the faster it moves. Colours stay in the red palette.
 * - A second, sparse layer of drifting dust wraps around a box ("treadmill")
 *   and moves with scroll parallax, like Igloo's snow layer.
 */

// Section id -> shape index. Sections missing from the page are skipped.
const SHAPE_STOPS = [
  ["home", 0], // sphere
  ["about", 1], // torus knot
  ["projects", 2], // galaxy
  ["contact", 2], // galaxy holds behind the contact form
  ["finale", 3], // selected social icon, in the empty space after contact
  ["home-loop", 4], // sphere again on the hero copy, so the scroll loop is seamless
];

const COLORS = {
  deep: "#450a0a",
  base: "#dc2626",
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
  uniform float uIconFrom;
  uniform float uIconTo;
  uniform float uIconProgress;

  attribute vec3 aPosB;
  attribute vec3 aPosC;
  attribute vec3 aIcon0;
  attribute vec3 aIcon1;
  attribute vec3 aIcon2;
  attribute vec3 aRandom;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vSquare;

  ${flowGLSL}

  // Current social icon (mid-switch, a blend of the old and new one)
  vec3 gIcon;

  vec3 icon(float i) {
    if (i < 0.5) return aIcon0;
    if (i < 1.5) return aIcon1;
    return aIcon2;
  }

  vec3 shape(float i) {
    if (i < 0.5) return position;
    if (i < 1.5) return aPosB;
    if (i < 2.5) return aPosC;
    if (i < 3.5) return gIcon;
    return position; // 4 = sphere again, for the scroll loop
  }

  void main() {
    // Switching social icons: staggered, with a burst that only shows on the icon stop
    float ik = clamp((uIconProgress - aRandom.y * 0.4) / 0.6, 0.0, 1.0);
    ik = ik * ik * (3.0 - 2.0 * ik);
    gIcon = mix(icon(uIconFrom), icon(uIconTo), ik);
    float iconBurst = sin(ik * 3.14159) * (1.0 - smoothstep(0.0, 1.0, abs(uMorph - 3.0)));

    // Staggered transition between the two neighbouring shapes
    float seg = min(floor(uMorph), 3.0);
    float f = clamp(uMorph - seg, 0.0, 1.0);
    float k = clamp((f - aRandom.x * 0.4) / 0.6, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 pos = mix(shape(seg), shape(seg + 1.0), k);

    // Turbulence: always a little, a lot mid-transition or while scrolling fast
    float transition = sin(k * 3.14159);
    pos += flow(pos * 1.3 + aRandom * 4.0, uTime * 0.35) * (0.03 + transition * 0.45 + iconBurst * 0.6 + uEnergy * 0.25);

    // Intro: fly in from a wide scattered cloud
    vec3 scatter = (aRandom - 0.5) * vec3(16.0, 10.0, 10.0);
    float intro = clamp((uIntro - aRandom.y * 0.35) / 0.65, 0.0, 1.0);
    intro = 1.0 - pow(1.0 - intro, 3.0);
    pos = mix(scatter, pos, intro);

    // Cursor repulsion in world space
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec2 d = world.xy - uMouse.xy;
    // Cursor: push out and swirl round (uMouseStrength rises with cursor speed)
    vec2 dir = normalize(d + 1e-4);
    float push = smoothstep(1.0, 0.0, length(d)) * uMouseStrength;
    // Uneven per particle plus some noise, so it scatters rather than leaving a clean hole
    vec3 churn = flow(pos * 3.0 + aRandom * 6.0, uTime * 2.0);
    world.xy += dir * push * 0.3 * mix(0.3, 1.4, aRandom.z)
              + vec2(-dir.y, dir.x) * push * 0.3
              + churn.xy * push * 0.35;
    world.z += push * 0.6 * (aRandom.x - 0.3);

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;

    float size = uSize * mix(0.4, 1.4, aRandom.y * aRandom.y) * (1.0 + min(push, 1.0) * 0.8);
    gl_PointSize = size * uPixelRatio / -mv.z;

    vColor = mix(uColorDeep, uColorBase, smoothstep(0.0, 0.6, aRandom.z + transition * 0.3));

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

function iconShape(count, { path, viewBox }, size) {
  const res = 512;
  const canvas = document.createElement("canvas");
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext("2d");
  const [w, h] = viewBox;
  const fit = (res * 0.9) / Math.max(w, h);
  ctx.translate((res - w * fit) / 2, (res - h * fit) / 2);
  ctx.scale(fit, fit);
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D(path));

  const { data } = ctx.getImageData(0, 0, res, res);
  const pixels = [];
  for (let y = 0; y < res; y += 2) {
    for (let x = 0; x < res; x += 2) {
      if (data[(y * res + x) * 4 + 3] > 128) pixels.push(x, y);
    }
  }
  if (pixels.length === 0) return sphereShape(count, 1.6);

  const scale = size / res;
  const out = new Float32Array(count * 3);
  const n = pixels.length / 2;
  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * n) * 2;
    out[i * 3] = (pixels[j] - res / 2 + Math.random() * 2) * scale;
    out[i * 3 + 1] = -(pixels[j + 1] - res / 2 + Math.random() * 2) * scale;
    // A little depth; more smears the edges when the scene tilts
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
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
    // The shader has slots for three icons
    SOCIALS.slice(0, 3).forEach((social, i) => {
      geometry.setAttribute(`aIcon${i}`, new THREE.BufferAttribute(iconShape(count, social, isMobile ? 2.4 : 2.8), 3));
    });
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
      uIconFrom: { value: 0 },
      uIconTo: { value: 0 },
      uIconProgress: { value: 1 },
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
    const pointerPrev = new THREE.Vector2(0, 0);
    let stir = 0; // extra strength from cursor speed, decays when it stops
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
    // A shape is fully formed when its section's top meets the top of the
    // viewport, which is where the scroll loop stops (socials, hero)
    const targetMorphFromScroll = () => {
      const anchor = window.scrollY;
      const stops = SHAPE_STOPS.map(([id, shape]) => {
        const el = document.getElementById(id);
        return el ? { top: el.getBoundingClientRect().top + window.scrollY, shape } : null;
      }).filter(Boolean);
      if (stops.length < 2) return 0;

      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (anchor < b.top) {
          const t = THREE.MathUtils.clamp((anchor - a.top) / (b.top - a.top), 0, 1);
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
    let dustScroll = window.scrollY / window.innerHeight;

    // A loop jump moves scrollY by a whole page: shift our bookkeeping by the
    // same amount, and swap between the two identical sphere states (0 and 4).
    const onScrollLoop = (e) => {
      lastScrollY += e.detail.offset;
      const morph = uniforms.uMorph.value;
      if (e.detail.offset < 0 && morph > 3.5) uniforms.uMorph.value = morph - 4;
      if (e.detail.offset > 0 && morph < 0.5) uniforms.uMorph.value = morph + 4;
    };
    window.addEventListener(SCROLL_LOOP_EVENT, onScrollLoop);

    const onSocialSelect = (e) => {
      const next = e.detail.index;
      if (next === uniforms.uIconTo.value) return;
      // Mid-switch, start from whichever icon is closer to formed
      if (uniforms.uIconProgress.value > 0.5) uniforms.uIconFrom.value = uniforms.uIconTo.value;
      uniforms.uIconTo.value = next;
      uniforms.uIconProgress.value = 0;
    };
    window.addEventListener(SOCIAL_SELECT_EVENT, onSocialSelect);
    let frame;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += reducedMotion ? 0 : dt;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const scrollDelta = (scrollY - lastScrollY) / vh;
      const scrollVelocity = Math.abs(scrollDelta);
      dustScroll += scrollDelta;
      lastScrollY = scrollY;

      if (uniforms.uIconProgress.value < 1) {
        uniforms.uIconProgress.value = Math.min(1, uniforms.uIconProgress.value + dt * (reducedMotion ? 10 : 0.9));
      }

      // Intro assemble
      if (uniforms.uIntro.value < 1) uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + dt * 0.45);

      // Damped morph and scroll energy
      const targetMorph = targetMorphFromScroll();
      uniforms.uMorph.value += (targetMorph - uniforms.uMorph.value) * Math.min(1, dt * 2.5);
      uniforms.uEnergy.value += (Math.min(1, scrollVelocity * 25) - uniforms.uEnergy.value) * Math.min(1, dt * 4);

      // Bright in the hero and the finale, dimmer behind dense content
      const morph = uniforms.uMorph.value;
      const isFinale = morph > 2.5 && morph < 3.5;
      let targetOpacity = 0.4;
      if (morph < 1) targetOpacity = THREE.MathUtils.lerp(0.75, 0.4, morph);
      if (isFinale) targetOpacity = 0.9;
      if (morph >= 3.5) targetOpacity = THREE.MathUtils.lerp(0.9, 0.75, (morph - 3.5) * 2);
      uniforms.uOpacity.value += (targetOpacity - uniforms.uOpacity.value) * Math.min(1, dt * 3);

      // Cursor
      pointerSmooth.lerp(pointer, Math.min(1, dt * 5));
      raycaster.setFromCamera(pointerSmooth, camera);
      if (raycaster.ray.intersectPlane(plane, mouseWorld)) uniforms.uMouse.value.copy(mouseWorld);
      stir = Math.min(1.2, stir * Math.pow(0.2, dt) + pointer.distanceTo(pointerPrev) * 3);
      pointerPrev.copy(pointer);
      // A resting cursor barely dents the shape; moving it stirs things up
      const targetStrength = pointerActive && !reducedMotion ? 0.35 + stir : 0;
      uniforms.uMouseStrength.value += (targetStrength - uniforms.uMouseStrength.value) * Math.min(1, dt * 6);

      // Motion
      points.rotation.y += dt * (reducedMotion ? 0 : 0.08) * (1 + uniforms.uEnergy.value * 3);
      tiltGroup.rotation.x += (-pointerSmooth.y * 0.2 - tiltGroup.rotation.x) * Math.min(1, dt * 2);
      tiltGroup.rotation.y += (pointerSmooth.x * 0.3 - tiltGroup.rotation.y) * Math.min(1, dt * 2);
      // The icon should face the viewer: ease the spin back to 0 near it
      if (isFinale) {
        const r = points.rotation.y % (Math.PI * 2);
        const nearest = r > Math.PI ? Math.PI * 2 : 0;
        points.rotation.y = r + (nearest - r) * Math.min(1, dt * 2.5);
      }

      uniforms.uTime.value = elapsed;
      dustUniforms.uTime.value = elapsed;
      dustUniforms.uScroll.value = dustScroll;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener(SCROLL_LOOP_EVENT, onScrollLoop);
      window.removeEventListener(SOCIAL_SELECT_EVENT, onSocialSelect);
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
