import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../lib/theme';

// A floating topographic relief tile for page headers. Height and contour
// shading run in shaders; routes, pins and the convoy are drawn on the surface.

export type SceneVariant = 'events' | 'trails' | 'campsites' | 'community' | 'brand' | 'event';

type Config = {
  seed: number;
  route?: boolean;
  convoy?: boolean;
  stars?: boolean;
  pins?: [number, number][];
  pinColor?: string;
  /** Float 3D map pins over each ground pin */
  markers?: boolean;
  /** Flatten a clearing in the middle and park a ring of rigs around a campfire */
  camp?: boolean;
};

const R = 60; // tile radius

const variants: Record<SceneVariant, Config> = {
  events: { seed: 2.1, pins: [[-26, 10], [12, -24], [30, 16], [-4, 30]], pinColor: '#f6b81a', markers: true },
  trails: { seed: 5.7, route: true },
  campsites: { seed: 8.3, stars: true, pins: [[-18, -14], [22, 8], [-4, 26]], pinColor: '#f6b81a' },
  community: { seed: 3.4, camp: true },
  brand: { seed: 1.1 },
  event: { seed: 6.6, route: true, pins: [[40, 0]] },
};

const MAX_PINS = 6;

const shared = /* glsl */ `
  uniform float uSeed;
  uniform float uClear;
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  float fbm(vec2 p) {
    float f = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { f += a * snoise(p); p *= 2.03; a *= 0.5; }
    return f;
  }
  // The route: a gentle S-curve across the tile.
  float routeZ(float x) { return sin(x * 0.07 + uSeed) * 14.0 + sin(x * 0.023 - uSeed) * 6.0; }
  float height(vec2 xz) {
    float h = fbm(xz * 0.028 + uSeed * 3.1) * 0.5 + 0.5;
    h = pow(h, 1.4) * 24.0;
    // Taper to the rim so the tile reads as a carved relief.
    float r = length(xz) / ${R.toFixed(1)};
    h *= 1.0 - smoothstep(0.55, 1.0, r);
    // Optional flat clearing in the middle for the camp.
    if (uClear > 0.0) h *= smoothstep(uClear * 0.7, uClear * 1.5, length(xz));
    return h;
  }
`;

const vertexShader = /* glsl */ `
  varying float vH;
  varying vec2 vXZ;
  ${shared}
  void main() {
    vec3 p = position;
    p.y = height(p.xz);
    vH = p.y;
    vXZ = p.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uRoute;
  uniform float uConvoy;
  uniform vec2 uPins[${MAX_PINS}];
  uniform int uPinCount;
  uniform vec3 uPinColor;
  uniform vec3 uLow;
  uniform vec3 uHigh;
  uniform vec3 uGold;
  uniform vec3 uBase;
  varying float vH;
  varying vec2 vXZ;
  ${shared}

  float aaLine(float v, float width) {
    float d = abs(fract(v - 0.5) - 0.5) / fwidth(v);
    return 1.0 - min(d / width, 1.0);
  }

  void main() {
    float r = length(vXZ) / ${R.toFixed(1)};
    if (r > 1.0) discard;

    float k = smoothstep(0.0, 22.0, vH);
    vec3 col = mix(uBase, uLow, 0.18 + k * 0.4);
    float line = aaLine(vH / 1.5, 1.0);
    float index = aaLine(vH / 7.5, 1.4);
    col = mix(col, mix(uHigh * 0.5, uHigh, k), clamp(line * 0.5 + index * 0.5, 0.0, 1.0));

    // Rim ring
    float rim = 1.0 - smoothstep(0.0, fwidth(r) * 1.5, abs(r - 0.985));
    col = mix(col, uHigh, rim * 0.7);

    if (uRoute > 0.5) {
      // Width in screen space so the line stays clean over steep slopes.
      float d = abs(vXZ.y - routeZ(vXZ.x));
      float fw = fwidth(d);
      float inside = 1.0 - smoothstep(0.82, 0.9, r);
      col = mix(col, uGold, (1.0 - smoothstep(0.45 - fw, 0.45 + fw, d)) * inside);
      col += uGold * 0.05 * (1.0 - smoothstep(0.6, 3.0, d)) * inside;

      if (uConvoy > 0.5) {
        // Five rigs rolling slowly along the route.
        for (int i = 0; i < 5; i++) {
          float t = fract(uTime * 0.018 + float(i) * 0.06);
          float x = mix(-0.8, 0.8, t) * ${R.toFixed(1)};
          vec2 c = vec2(x, routeZ(x));
          float dd = length(vXZ - c);
          col = mix(col, vec3(1.0), 1.0 - smoothstep(1.0, 1.4, dd));
        }
      }
    }

    for (int i = 0; i < ${MAX_PINS}; i++) {
      if (i >= uPinCount) break;
      float dd = length(vXZ - uPins[i]);
      float pulse = fract(uTime * 0.25 + float(i) * 0.37);
      float ring = 1.0 - smoothstep(0.0, 0.5, abs(dd - (1.5 + pulse * 6.0)));
      col = mix(col, uPinColor, ring * (1.0 - pulse) * 0.8);
      col = mix(col, uPinColor, 1.0 - smoothstep(1.1, 1.5, dd));
    }

    if (uClear > 0.0) {
      float flicker = 0.85 + 0.15 * sin(uTime * 9.0) * sin(uTime * 5.3 + 1.0);
      col += vec3(1.0, 0.55, 0.15) * 0.55 * flicker * (1.0 - smoothstep(0.0, uClear * 0.9, length(vXZ)));
    }

    // Fade toward the rim so the tile floats.
    float alpha = 1.0 - smoothstep(0.9, 1.0, r) * 0.6;
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

export default function HeaderScene({ variant, className = '' }: { variant: SceneVariant; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const cfg = variants[variant];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return; // No WebGL: the header still has its pattern and type.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 1, 1000);
    const tile = new THREE.Group();
    scene.add(tile);

    const geometry = new THREE.PlaneGeometry(R * 2, R * 2, 220, 220);
    geometry.rotateX(-Math.PI / 2);
    const pins = Array.from({ length: MAX_PINS }, (_, i) => new THREE.Vector2(...(cfg.pins?.[i] ?? [0, 0])));
    const uniforms = {
      uTime: { value: 0 },
      uSeed: { value: cfg.seed },
      uClear: { value: cfg.camp ? 30 : 0 },
      uRoute: { value: cfg.route ? 1 : 0 },
      uConvoy: { value: cfg.convoy ? 1 : 0 },
      uPins: { value: pins },
      uPinCount: { value: cfg.pins?.length ?? 0 },
      uPinColor: { value: new THREE.Color(cfg.pinColor ?? '#ffffff') },
      uLow: { value: new THREE.Color('#183b22') },
      uHigh: { value: new THREE.Color('#61ab73') },
      uGold: { value: new THREE.Color('#f6b81a') },
      // Blend the tile into whatever the header color is in this theme.
      uBase: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--deep').trim() || '#000') },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true });
    tile.add(new THREE.Mesh(geometry, material));

    let stars: THREE.Points | null = null;
    if (cfg.stars) {
      const pts = new Float32Array(260 * 3);
      for (let i = 0; i < 260; i++) {
        const a = Math.random() * Math.PI * 2;
        const rr = 20 + Math.random() * 80;
        pts.set([Math.cos(a) * rr, 30 + Math.random() * 50, Math.sin(a) * rr], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.75 }));
      tile.add(stars);
    }

    const animated: ((t: number) => void)[] = [];
    if (cfg.markers || cfg.camp) {
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.6);
      sunLight.position.set(40, 90, 30);
      scene.add(sunLight);
    }

    if (cfg.markers) {
      // 3D map pins, like the Trails icon, hovering over each pulsing ground ring.
      const gold = new THREE.MeshStandardMaterial({ color: 0xf6b81a, emissive: 0x6b4a00, roughness: 0.4 });
      const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      cfg.pins?.forEach(([x, z], i) => {
        const pin = new THREE.Group();
        const head = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16), gold);
        head.position.y = 6.2;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(2.25, 5.2, 24), gold);
        tip.rotation.x = Math.PI;
        tip.position.y = 2.9;
        const dot = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), white);
        dot.position.set(0, 6.4, 2.1);
        pin.add(head, tip, dot);
        const stem = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -2, z), new THREE.Vector3(x, 11, z)]),
          new THREE.LineBasicMaterial({ color: 0xf6b81a, transparent: true, opacity: 0.35 }),
        );
        tile.add(pin, stem);
        animated.push((t) => {
          pin.position.set(x, 12 + Math.sin(t * 0.8 + i * 1.7) * 1, z);
          pin.rotation.y = -tile.rotation.y; // keep the white dot facing the camera
        });
      });
    }

    if (cfg.camp) {
      // A ring of rigs parked around the fire. Low-poly, brand colors.
      const camp = new THREE.Group();
      camp.scale.setScalar(1.75);
      tile.add(camp);
      const paints = [0xf4f5f1, 0x61ab73, 0x3a3d3b, 0xf4f5f1, 0x224d2e, 0xd9d4c3];
      const dark = new THREE.MeshStandardMaterial({ color: 0x141615, roughness: 0.9 });
      const glass = new THREE.MeshStandardMaterial({ color: 0x0e2615, roughness: 0.2 });
      const lamp = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: 1.2 });
      const wheelGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.9, 14);
      wheelGeo.rotateX(Math.PI / 2);
      paints.forEach((paint, i) => {
        const body = new THREE.MeshStandardMaterial({ color: paint, roughness: 0.6 });
        const rig = new THREE.Group();
        const lower = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.9, 3.1), body);
        lower.position.y = 1.9;
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.7, 2.9), body);
        cabin.position.set(-0.5, 3.6, 0);
        const windows = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.9, 3.0), glass);
        windows.position.set(-0.5, 3.75, 0);
        const rack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 2.7), dark);
        rack.position.set(-0.5, 4.65, 0);
        const spare = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.6, 14), dark);
        spare.rotation.z = Math.PI / 2;
        spare.position.set(-3.5, 2.2, 0);
        rig.add(lower, cabin, windows, rack, spare);
        for (const [wx, wz] of [[2, 1.5], [2, -1.5], [-2, 1.5], [-2, -1.5]]) {
          const w = new THREE.Mesh(wheelGeo, dark);
          w.position.set(wx, 1.1, wz);
          rig.add(w);
        }
        for (const lz of [0.95, -0.95]) {
          const l = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.6), lamp);
          l.position.set(3.25, 2.2, lz);
          rig.add(l);
        }
        const a = (i / paints.length) * Math.PI * 2;
        rig.position.set(Math.cos(a) * 11, 0, Math.sin(a) * 11);
        rig.rotation.y = -a + Math.PI; // nose toward the fire
        camp.add(rig);
      });

      // The fire: logs, a flickering flame, warm light, and a few rising sparks.
      const logMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 1 });
      for (let k = 0; k < 3; k++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.4, 8), logMat);
        log.rotation.set(Math.PI / 2, (k * Math.PI) / 3, 0.3);
        log.position.y = 0.5;
        camp.add(log);
      }
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa83a, transparent: true, opacity: 0.9 });
      const flame = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.2, 10), flameMat);
      flame.position.y = 2;
      const core = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2, 10), new THREE.MeshBasicMaterial({ color: 0xfff1b0 }));
      core.position.y = 1.6;
      const fireLight = new THREE.PointLight(0xff9a3c, 300, 60, 2);
      fireLight.position.y = 4;
      camp.add(flame, core, fireLight);

      const sparkCount = 24;
      const sparkPos = new Float32Array(sparkCount * 3);
      const seeds = Array.from({ length: sparkCount }, () => [Math.random(), Math.random() * Math.PI * 2]);
      const sparkGeo = new THREE.BufferGeometry();
      sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
      const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xffc46b, size: 0.6, transparent: true, opacity: 0.85 }));
      camp.add(sparks);

      animated.push((t) => {
        const f = 1 + Math.sin(t * 9) * 0.08 + Math.sin(t * 13.7) * 0.06;
        flame.scale.set(f, 1 + (f - 1) * 2.5, f);
        fireLight.intensity = 260 * f;
        seeds.forEach(([off, ang], i) => {
          const life = (t * 0.25 + off) % 1;
          sparkPos.set([Math.cos(ang + t * 0.3) * life * 1.5, 2 + life * 14, Math.sin(ang + t * 0.3) * life * 1.5], i * 3);
        });
        sparkGeo.attributes.position.needsUpdate = true;
      });
    }
    animated.forEach((fn) => fn(0));

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Keep the whole tile in frame whatever the box shape.
      const fit = camera.aspect < 1.2 ? 1.2 / camera.aspect : 1;
      camera.position.set(0, 95 * fit, 150 * fit);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      render();
    };

    const render = () => {
      tile.rotation.x = pointer.y * 0.05;
      tile.rotation.z = pointer.x * 0.04;
      renderer.render(scene, camera);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    tile.rotation.y = cfg.seed;
    resize();
    setReady(true);

    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += dt;
      tile.rotation.y += dt * 0.04; // one slow turn every ~2.5 minutes
      animated.forEach((fn) => fn(uniforms.uTime.value));
      pointer.x += (pointer.tx - pointer.x) * 0.03;
      pointer.y += (pointer.ty - pointer.y) * 0.03;
      render();
    };
    if (!reduced) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      frame();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.Line) {
          o.geometry.dispose();
          for (const m of [o.material].flat()) m.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant, theme]);

  return (
    <div
      ref={host}
      aria-hidden
      className={`transition-opacity duration-[1500ms] [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full ${ready ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
