/**
 * MicrogridScene3D
 * ─────────────────────────────────────────────────────────────────────────────
 * A self-contained Three.js isometric scene that replaces the 2D canvas in the
 * Community Grid page.  No external loaders — every model is built procedurally
 * from primitive geometries so the bundle stays lightweight and never breaks due
 * to missing asset files.
 *
 * Props
 *  mode      'day' | 'night'   — controls which energy sources emit particles
 *  blackout  boolean           — pauses grid→BESS flow, shows island-mode glow
 *  socPct    number            — live battery state-of-charge (0-100)
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'day' | 'night';

interface SceneRefs {
  renderer:  THREE.WebGLRenderer;
  scene:     THREE.Scene;
  camera:    THREE.PerspectiveCamera;
  controls:  OrbitControls;
  particles: ParticleTrack[];
  gridLine:  THREE.Line | null;     // main-grid → BESS cable (fades on blackout)
  bessGlow:  THREE.PointLight;
  groundGrid:THREE.GridHelper;
  rafId:     number;
}

interface ParticleTrack {
  mesh:     THREE.Mesh;
  light:    THREE.PointLight;
  from:     THREE.Vector3;
  to:       THREE.Vector3;
  t:        number;          // 0→1 progress along segment
  speed:    number;
  active:   boolean;
  isGrid:   boolean;         // true = main-grid particle (hide on blackout)
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  // Particles — vivid, high-contrast for light background
  solar:     0xd97706,  // amber-600 (dark enough to read on white)
  biogas:    0x059669,  // emerald-600
  bess:      0x0891b2,  // cyan-600
  homes:     0x2563eb,  // blue-600
  clinic:    0xdb2777,  // pink-600
  // Cables
  wire:      0x94a3b8,  // slate-400 — subtle on light bg
  wireFaded: 0xcbd5e1,  // slate-300
  grid:      0x64748b,  // slate-500
  // Scene
  ground:    0xf1f5f9,  // slate-100 — light ground
};

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function hex(c: number) { return new THREE.Color(c); }

/** Standard material — lit, looks correct on the light background. */
function flatMat(color: number, emissive = 0.0) {
  return new THREE.MeshStandardMaterial({
    color: hex(color),
    emissive: hex(color),
    emissiveIntensity: emissive,
    roughness: 0.55,
    metalness: 0.15,
  });
}

/** Solar PV array — flat rectangular panel cluster */
function buildSolarArray(): THREE.Group {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 0.15, 3.5),
    flatMat(0x1e40af, 0.15),
  );
  frame.castShadow = true;
  g.add(frame);

  // Panel grid lines
  for (let xi = -2; xi <= 2; xi++) {
    for (let zi = -1; zi <= 1; zi++) {
      const cell = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.12, 0.9),
        flatMat(0x2563eb, 0.55),
      );
      cell.position.set(xi * 1.0, 0.1, zi * 1.0);
      g.add(cell);
    }
  }

  // Mount legs
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6);
  const legMat = flatMat(0x475569, 0);
  for (const [lx, lz] of [[-2.5, -1.5], [2.5, -1.5], [-2.5, 1.5], [2.5, 1.5]] as [number,number][]) {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lx, -0.65, lz);
    g.add(leg);
  }

  // Glowing halo sprite
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 5),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.06, side: THREE.DoubleSide }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -1.1;
  g.add(halo);
  return g;
}

/** Biogas digester — cylinder + dome + engine shed */
function buildBiogasPlant(): THREE.Group {
  const g = new THREE.Group();

  // Main tank cylinder
  const tank = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 2.8, 20),
    flatMat(0x166534, 0.2),
  );
  tank.position.y = 1.4;
  tank.castShadow = true;
  g.add(tank);

  // Dome cap
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.62, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    flatMat(0x15803d, 0.35),
  );
  dome.position.y = 2.8;
  g.add(dome);

  // GOBARdhan label band
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(1.62, 0.07, 8, 40),
    flatMat(0x22c55e, 0.6),
  );
  band.position.y = 2.0;
  band.rotation.x = Math.PI / 2;
  g.add(band);

  // Engine shed (rectangular box to the side)
  const shed = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.0, 1.2),
    flatMat(0x374151, 0.1),
  );
  shed.position.set(2.4, 0.5, 0);
  shed.castShadow = true;
  g.add(shed);

  const shedRoof = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.12, 1.4),
    flatMat(0x4b5563, 0.05),
  );
  shedRoof.position.set(2.4, 1.06, 0);
  g.add(shedRoof);

  // Pipe from tank to shed
  const pipeCurve = new THREE.LineCurve3(
    new THREE.Vector3(1.65, 1.5, 0),
    new THREE.Vector3(2.4, 1.0, 0),
  );
  const pipeGeo = new THREE.TubeGeometry(pipeCurve, 4, 0.07, 6, false);
  g.add(new THREE.Mesh(pipeGeo, flatMat(0x4ade80, 0.5)));

  // Glow underneath
  const glow = new THREE.PointLight(0x4ade80, 0.8, 8);
  glow.position.set(0, 0, 0);
  g.add(glow);

  return g;
}

/** BESS enclosure — prominent central glowing battery box */
function buildBESS(socPct: number): THREE.Group {
  const g = new THREE.Group();
  const socCol = socPct >= 60 ? 0x34d399 : socPct >= 30 ? 0xfbbf24 : 0xf87171;

  // Main enclosure
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 2.2, 2.0),
    flatMat(0x042f2e, 0.05),
  );
  box.castShadow = true;
  g.add(box);

  // Front panel detail strip
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 1.6, 0.05),
    flatMat(0x0f4036, 0.1),
  );
  panel.position.set(0, 0, 1.03);
  g.add(panel);

  // SOC bar on front face
  const barBg = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.22, 0.06),
    new THREE.MeshBasicMaterial({ color: 0x1e3a32 }),
  );
  barBg.position.set(0, -0.35, 1.04);
  g.add(barBg);

  const barFill = new THREE.Mesh(
    new THREE.BoxGeometry(2.2 * (socPct / 100), 0.22, 0.07),
    new THREE.MeshBasicMaterial({ color: socCol }),
  );
  barFill.position.set(-1.1 + (1.1 * (socPct / 100)), -0.35, 1.05);
  g.add(barFill);

  // Ventilation slots
  for (let s = 0; s < 4; s++) {
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.5, 0.04),
      new THREE.MeshBasicMaterial({ color: 0x0d9488 }),
    );
    slot.position.set(-0.45 + s * 0.3, 0.25, 1.04);
    g.add(slot);
  }

  // Glowing light (pulsed in animation loop)
  const glow = new THREE.PointLight(socCol, 2.5, 12);
  glow.position.set(0, 1.5, 0);
  g.add(glow);

  return g;
}

/** Small house cluster */
function buildHomes(): THREE.Group {
  const g = new THREE.Group();
  const offsets: [number, number][] = [[-1.2, 0], [1.2, 0], [0, 1.6], [-1.0, 2.8], [1.0, 2.8]];
  for (const [ox, oz] of offsets) {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.0, 1.1),
      flatMat(0xd97706, 0.1),
    );
    body.position.set(ox, 0.5, oz);
    body.castShadow = true;
    g.add(body);

    // Roof (triangular prism via cone)
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 0.7, 4),
      flatMat(0xb45309, 0.12),
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.set(ox, 1.35, oz);
    g.add(roof);
  }
  return g;
}

/** Health clinic — cross symbol on front face */
function buildClinic(): THREE.Group {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 1.8, 2.2),
    flatMat(0xfafafa, 0.05),
  );
  body.castShadow = true;
  g.add(body);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.12, 2.4),
    flatMat(0xe2e8f0, 0.05),
  );
  roof.position.y = 0.96;
  g.add(roof);

  // Red cross bars
  const crossH = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.14, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  );
  crossH.position.set(0, 0.1, 1.12);
  g.add(crossH);

  const crossV = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.7, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  );
  crossV.position.set(0, 0.1, 1.12);
  g.add(crossV);

  const pLight = new THREE.PointLight(0xef4444, 0.4, 5);
  pLight.position.set(0, 2, 0);
  g.add(pLight);

  return g;
}

/** Streetlight pole */
function buildStreetlight(): THREE.Group {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.1, 3.0, 8),
    flatMat(0x64748b, 0),
  );
  pole.position.y = 1.5;
  g.add(pole);

  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.07, 0.07),
    flatMat(0x64748b, 0),
  );
  arm.position.set(0.3, 3.0, 0);
  g.add(arm);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfde68a }),
  );
  bulb.position.set(0.6, 3.0, 0);
  g.add(bulb);

  const light = new THREE.PointLight(0xfde68a, 0.5, 6);
  light.position.set(0.6, 3.1, 0);
  g.add(light);

  return g;
}

/** Water pump unit */
function buildWaterPump(): THREE.Group {
  const g = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.3, 0.8),
    flatMat(0x1e40af, 0.1),
  );
  base.position.y = 0.15;
  g.add(base);

  const pump = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.8, 10),
    flatMat(0x2563eb, 0.2),
  );
  pump.position.y = 0.7;
  g.add(pump);

  const outlet = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.5, 0.14),
    flatMat(0x38bdf8, 0.4),
  );
  outlet.position.set(0.35, 0.6, 0);
  g.add(outlet);

  return g;
}

/** Main-grid tower (power line poles + overhead wire suggestion) */
function buildGridTower(): THREE.Group {
  const g = new THREE.Group();

  for (const xo of [-0.5, 0.5] as number[]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.09, 4, 6),
      flatMat(0x94a3b8, 0),
    );
    pole.position.set(xo, 2, 0);
    g.add(pole);
  }

  const crossbar = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.08, 0.08),
    flatMat(0x94a3b8, 0),
  );
  crossbar.position.y = 4.1;
  g.add(crossbar);

  // Insulators (small spheres)
  for (const xo of [-0.6, 0.6] as number[]) {
    const ins = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xe2e8f0 }),
    );
    ins.position.set(xo, 4.1, 0);
    g.add(ins);
  }

  return g;
}

/** Dashed cable line between two 3-D points */
function buildCable(from: THREE.Vector3, to: THREE.Vector3, color: number, dashed = false): THREE.Line {
  const points = [from.clone(), to.clone()];
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = dashed
    ? new THREE.LineDashedMaterial({ color, dashSize: 0.4, gapSize: 0.25, linewidth: 1 })
    : new THREE.LineBasicMaterial({ color, linewidth: 1 });
  const line = new THREE.Line(geo, mat);
  if (dashed) line.computeLineDistances();
  return line;
}

/** Create one particle sphere + its point light */
function buildParticle(color: number): { mesh: THREE.Mesh; light: THREE.PointLight } {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 8),
    new THREE.MeshBasicMaterial({ color }),
  );
  const light = new THREE.PointLight(color, 0.9, 2.5);
  mesh.add(light);
  return { mesh, light };
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface MicrogridScene3DProps {
  mode:     Mode;
  blackout: boolean;
  socPct:   number;
}

export default function MicrogridScene3D({ mode, blackout, socPct }: MicrogridScene3DProps) {
  const mountRef  = useRef<HTMLDivElement>(null);
  const sceneRef  = useRef<SceneRefs | null>(null);
  const propsRef  = useRef({ mode, blackout, socPct });

  // Keep props accessible inside the RAF loop without re-creating the scene
  useEffect(() => {
    propsRef.current = { mode, blackout, socPct };
  }, [mode, blackout, socPct]);

  // ── Setup (runs once on mount) ─────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xf8fafc, 1);
    el.appendChild(renderer.domElement);

    // Canvas fills the container absolutely — this is the only reliable way to
    // guarantee it covers the full 420 px height without a flex wrapper.
    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.inset    = '0';
    canvas.style.width    = '100%';
    canvas.style.height   = '100%';
    canvas.style.display  = 'block';

    const setSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight || 420;   // fallback if layout hasn't run yet
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    // ── Camera ──
    // Scene spans roughly x:[-15,15], z:[-20,14] → centre ≈ (0, 0, -3)
    // FOV=42, auto-fit: maxDim≈35, cameraZ = 35/(2·tan(21°))·1.25 ≈ 58
    // We add a vertical offset for the isometric feel.
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 220);
    camera.position.set(0, 28, 38);
    camera.lookAt(0, 0, -3);

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    // Light, airy fog that fades distant models into the white bg
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.014);

    // Bright ambient — fills shadows so models look clean on white bg
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    // Key directional light — warm sunlight from upper-right
    const sun = new THREE.DirectionalLight(0xfff8f0, 1.1);
    sun.position.set(20, 40, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far  = 120;
    // Fill light from the opposite side to soften harsh shadows
    const fill = new THREE.DirectionalLight(0xe0f2fe, 0.4);
    fill.position.set(-15, 20, -10);
    scene.add(sun);
    scene.add(fill);

    // ── Ground plane — light slate ──
    const groundGeo = new THREE.PlaneGeometry(70, 70);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,   // slate-100
      roughness: 0.85,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper — subtle mint / slate lines on the light ground
    const groundGrid = new THREE.GridHelper(60, 30, 0xa7f3d0, 0xcbd5e1);
    groundGrid.position.y = 0.01;
    scene.add(groundGrid);

    // ── OrbitControls ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping    = true;
    controls.dampingFactor    = 0.07;
    controls.minPolarAngle    = Math.PI / 8;
    controls.maxPolarAngle    = Math.PI / 2.4;
    // Tighter zoom range so users can't get lost; default view already fits all models
    controls.minDistance      = 22;
    controls.maxDistance      = 70;
    // Target the scene's geometric centre so orbit feels natural
    controls.target.set(0, 0, -3);

    // ──────────────────────────────────────────────────────────────────────────
    //  NODE POSITIONS  (x, y, z)  — matches the spec, y=0 is ground level
    // ──────────────────────────────────────────────────────────────────────────
    const POS = {
      solar:  new THREE.Vector3(-15,  1.0, -10),
      biogas: new THREE.Vector3( 15,  1.4, -10),
      bess:   new THREE.Vector3(  0,  1.1,   0),
      homes:  new THREE.Vector3(-12,  0,     12),
      clinic: new THREE.Vector3( 12,  0,     12),
      water:  new THREE.Vector3( -4,  0,     14),
      lights: new THREE.Vector3(  7,  0,      9),
      grid:   new THREE.Vector3(  0,  2.1,  -20),
    };

    // BESS is at origin, particle cables connect to centroid of each model
    const CABLE_ANCHOR = {
      solar:  POS.solar .clone().add(new THREE.Vector3(0,  1,  0)),
      biogas: POS.biogas.clone().add(new THREE.Vector3(0,  2,  0)),
      bess:   POS.bess  .clone().add(new THREE.Vector3(0,  1.5, 0)),
      homes:  POS.homes .clone().add(new THREE.Vector3(0,  1,  0)),
      clinic: POS.clinic.clone().add(new THREE.Vector3(0,  1,  0)),
      water:  POS.water .clone().add(new THREE.Vector3(0,  0.7, 0)),
      lights: POS.lights.clone().add(new THREE.Vector3(0,  3,  0)),
      grid:   POS.grid  .clone().add(new THREE.Vector3(0,  2,  0)),
    };

    // ── Build & place models ──
    const solarGroup  = buildSolarArray();  solarGroup.position.copy(POS.solar);  scene.add(solarGroup);
    const biogasGroup = buildBiogasPlant(); biogasGroup.position.copy(POS.biogas); scene.add(biogasGroup);
    const bessGroup   = buildBESS(socPct);  bessGroup.position.copy(POS.bess);   scene.add(bessGroup);
    const homesGroup  = buildHomes();       homesGroup.position.copy(POS.homes);  scene.add(homesGroup);
    const clinicGroup = buildClinic();      clinicGroup.position.copy(POS.clinic);scene.add(clinicGroup);
    const waterGroup  = buildWaterPump();   waterGroup.position.copy(POS.water);  scene.add(waterGroup);
    const gridGroup   = buildGridTower();   gridGroup.position.copy(POS.grid);    scene.add(gridGroup);

    // Streetlights — scatter a few around the perimeter
    const lightPositions: THREE.Vector3[] = [
      new THREE.Vector3(-6, 0, 10),
      new THREE.Vector3( 3, 0, 14),
      new THREE.Vector3( 8, 0, 4),
    ];
    for (const lp of lightPositions) {
      const sl = buildStreetlight(); sl.position.copy(lp); scene.add(sl);
    }

    // ── Cables ──
    const cables: THREE.Line[] = [];

    // Source → BESS
    cables.push(buildCable(CABLE_ANCHOR.solar,  CABLE_ANCHOR.bess, C.wire));
    cables.push(buildCable(CABLE_ANCHOR.biogas, CABLE_ANCHOR.bess, C.wire));

    // BESS → loads
    cables.push(buildCable(CABLE_ANCHOR.bess, CABLE_ANCHOR.homes,  C.wire));
    cables.push(buildCable(CABLE_ANCHOR.bess, CABLE_ANCHOR.clinic, C.wire));
    cables.push(buildCable(CABLE_ANCHOR.bess, CABLE_ANCHOR.water,  C.wire));
    cables.push(buildCable(CABLE_ANCHOR.bess, CABLE_ANCHOR.lights, C.wire));

    // Grid → BESS (dashed, will be toggled)
    const gridCable = buildCable(CABLE_ANCHOR.grid, CABLE_ANCHOR.bess, C.grid, true);
    cables.push(gridCable);

    for (const c of cables) scene.add(c);

    // ── BESS glow light (pulsed) ──
    const bessGlow = new THREE.PointLight(C.bess, 2.0, 14);
    bessGlow.position.copy(POS.bess).add(new THREE.Vector3(0, 2, 0));
    scene.add(bessGlow);

    // ── Label sprites (canvas-drawn text → sprite) ──
    const LABELS = [
      { text: 'Solar PV',     pos: POS.solar .clone().add(new THREE.Vector3(0, 3, 0)) },
      { text: 'Biogas Plant', pos: POS.biogas.clone().add(new THREE.Vector3(0, 5, 0)) },
      { text: 'BESS',         pos: POS.bess  .clone().add(new THREE.Vector3(0, 3.2, 0)) },
      { text: 'Village Homes',pos: POS.homes .clone().add(new THREE.Vector3(0, 2.5, 0)) },
      { text: 'Clinic',       pos: POS.clinic.clone().add(new THREE.Vector3(0, 2.8, 0)) },
      { text: 'Water Pump',   pos: POS.water .clone().add(new THREE.Vector3(0, 1.8, 0)) },
      { text: 'Main Grid',    pos: POS.grid  .clone().add(new THREE.Vector3(0, 5.2, 0)) },
    ];

    for (const { text, pos } of LABELS) {
      const canvas2 = document.createElement('canvas');
      canvas2.width = 256; canvas2.height = 64;
      const ctx = canvas2.getContext('2d')!;
      ctx.clearRect(0, 0, 256, 64);
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 32);
      const tex = new THREE.CanvasTexture(canvas2);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }),
      );
      sprite.scale.set(4, 1, 1);
      sprite.position.copy(pos);
      scene.add(sprite);
    }

    // ── Particle tracks ──────────────────────────────────────────────────────
    // Using an explicit 'type' string tag avoids fragile Vector3.equals() comparisons
    type ParticleType = 'solar' | 'biogas' | 'load' | 'grid';
    interface TaggedParticle extends ParticleTrack { type: ParticleType }
    const particles: TaggedParticle[] = [];

    function addParticles(
      from: THREE.Vector3,
      to:   THREE.Vector3,
      color:  number,
      count:  number,
      isGrid: boolean,
      type: ParticleType,
    ) {
      for (let i = 0; i < count; i++) {
        const { mesh, light } = buildParticle(color);
        scene.add(mesh);
        particles.push({
          mesh, light,
          from: from.clone(),
          to:   to.clone(),
          t:    i / count,               // stagger start positions
          speed: 0.0035 + Math.random() * 0.002,
          active: true,
          isGrid,
          type,
        });
      }
    }

    // Day sources
    addParticles(CABLE_ANCHOR.solar,  CABLE_ANCHOR.bess, C.solar,  4, false, 'solar');
    // Night sources
    addParticles(CABLE_ANCHOR.biogas, CABLE_ANCHOR.bess, C.biogas, 3, false, 'biogas');
    // BESS → loads (always)
    addParticles(CABLE_ANCHOR.bess, CABLE_ANCHOR.homes,  C.homes,  2, false, 'load');
    addParticles(CABLE_ANCHOR.bess, CABLE_ANCHOR.water,  C.homes,  2, false, 'load');
    addParticles(CABLE_ANCHOR.bess, CABLE_ANCHOR.clinic, C.clinic, 2, false, 'load');
    addParticles(CABLE_ANCHOR.bess, CABLE_ANCHOR.lights, C.solar,  2, false, 'load');
    // Grid → BESS (hidden on blackout)
    addParticles(CABLE_ANCHOR.grid, CABLE_ANCHOR.bess, C.grid, 2, true, 'grid');

    // ── Resize observer ──────────────────────────────────────────────────────
    const ro = new ResizeObserver(setSize);
    ro.observe(el);
    // Defer initial setSize — browser may not have laid out the container yet
    // (clientHeight === 0 on first synchronous call → blank WebGL canvas)
    setTimeout(setSize, 0);

    // ── Assign sceneRef BEFORE starting the animation loop ───────────────────
    // The RAF callback reads sceneRef.current to store the rafId, so it must
    // be non-null when animate() runs for the first time.
    let localRafId = 0;
    sceneRef.current = {
      renderer, scene, camera, controls,
      particles, gridLine: gridCable, bessGlow, groundGrid,
      rafId: 0,
    };

    // ── Animation loop ───────────────────────────────────────────────────────
    let clock = 0;
    function animate() {
      localRafId = requestAnimationFrame(animate);
      sceneRef.current!.rafId = localRafId;
      clock += 0.016;

      const { mode: m, blackout: bo, socPct: soc } = propsRef.current;

      // BESS glow pulse
      bessGlow.intensity = 1.8 + Math.sin(clock * 2.5) * 0.6;
      bessGlow.color.set(soc >= 60 ? C.bess : soc >= 30 ? C.solar : 0xf87171);

      // Grid cable visibility
      (gridCable.material as THREE.LineBasicMaterial).color.set(bo ? C.wireFaded : C.grid);
      gridCable.visible = !bo;

      // Particle animation — use explicit 'type' tag instead of Vector3.equals()
      for (const p of particles) {
        // Decide visibility per mode/blackout
        if (p.type === 'grid') {
          p.mesh.visible = !bo;
        } else if (p.type === 'solar') {
          p.mesh.visible = m === 'day';
        } else if (p.type === 'biogas') {
          p.mesh.visible = m === 'night';
        } else {
          p.mesh.visible = true; // loads always receive power
        }

        if (!p.mesh.visible) continue;

        // Advance along segment
        p.t += p.speed;
        if (p.t > 1) p.t -= 1;

        p.mesh.position.lerpVectors(p.from, p.to, p.t);

        // Slight bob perpendicular to path for visual depth
        const up = new THREE.Vector3(0, Math.sin(clock * 5 + p.t * 20) * 0.12, 0);
        p.mesh.position.add(up);

        // Pulse scale
        const s = 0.8 + Math.sin(clock * 6 + p.t * 10) * 0.2;
        p.mesh.scale.setScalar(s);
        p.light.intensity = 0.7 + s * 0.3;
      }

      // Solar panel tilt animation (subtle glint)
      solarGroup.rotation.x = Math.sin(clock * 0.3) * 0.015;

      // Biogas dome ambient rotation
      biogasGroup.rotation.y += 0.0008;

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.rafId);
        sceneRef.current.controls.dispose();
        sceneRef.current.renderer.dispose();
      }
      ro.disconnect();
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // intentionally run once — props are read via propsRef

  return (
    <div
      ref={mountRef}
      aria-label="3D Community Microgrid Visualizer — rotate with mouse / touch"
      style={{
        /* position:relative + fixed pixel height gives the canvas a real box to fill */
        width: '100%',
        height: '420px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        background: '#f8fafc',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Hint overlay */}
      <div
        className="absolute bottom-2 right-3 text-[10px] text-slate-400 pointer-events-none select-none"
        style={{ zIndex: 10 }}
      >
        🖱 Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}
