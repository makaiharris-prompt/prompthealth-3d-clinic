!(() => {
  if (typeof THREE === "undefined") {
    throw new Error("three.js did not load");
  }
  const t = {
    ground: 0xeae4df,
    plinth: 0xdcd9d5,
    wall: 0xe8e6e3,
    floor: 0xd0cdc8,
    gymFloor: 0xbcb8b3,
    furnLight: 0xc6c5c3,
    furn: 0xc9c5c0,
    furnMid: 0x7c7a77,
    furnDark: 0x6e6a68,
    device: 0x7d7873,
    red: 0xff5252,
    paper: 0xf3f1ec,
  };
  const e = {};
  for (const o in t) {
    e[o] = new THREE.MeshStandardMaterial({
      color: t[o],
      roughness: 0.92,
      metalness: 0,
      shadowSide: THREE.BackSide,
    });
  }
  e.screen = new THREE.MeshBasicMaterial({
    color: t.red,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  ["furnLight", "furn", "furnMid", "furnDark", "device", "paper"].forEach((t) => {
    e[t].vertexColors = true;
  });
  const o = document.querySelector("[data-clinic-stage]");
  if (!o || o.dataset.clinicInit) {
    return;
  }
  o.dataset.clinicInit = "1";
  const n = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  n.setClearColor(0, 0);
  n.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  n.shadowMap.enabled = true;
  n.shadowMap.type = THREE.PCFShadowMap;
  o.appendChild(n.domElement);
  let r = true;
  function a() {
    r = true;
  }
  const i = new THREE.Scene();
  const s = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const c = {
    pos: new THREE.Vector3(0, 38, 19),
    tgt: new THREE.Vector3(0, 0, 2.6),
  };
  s.position.copy(c.pos);
  const u = new THREE.OrbitControls(s, n.domElement);
  u.target.copy(c.tgt);
  u.enableDamping = true;
  u.dampingFactor = 0.08;
  u.maxPolarAngle = 0.48 * Math.PI;
  u.minDistance = 0.8;
  u.maxDistance = 70;
  u.addEventListener("change", a);
  i.add(new THREE.AmbientLight(0xffffff, 0.42));
  i.add(new THREE.HemisphereLight(0xffffff, 0xb9b4ad, 0.38));
  const h = new THREE.DirectionalLight(0xffffff, 0.3);
  h.position.set(-11, 24, 9);
  h.castShadow = true;
  const l =
    window.matchMedia("(pointer: coarse)").matches || n.capabilities.maxTextureSize < 4096
      ? 2048
      : 4096;
  h.shadow.mapSize.set(l, l);
  n.shadowMap.autoUpdate = false;
  n.shadowMap.needsUpdate = true;
  Object.assign(h.shadow.camera, {
    left: -14,
    right: 14,
    top: 14,
    bottom: -14,
    near: 10,
    far: 50,
  });
  h.shadow.bias = -0.00005;
  h.shadow.normalBias = 0;
  h.shadow.radius = 2;
  i.add(h);
  const d = new THREE.DirectionalLight(0xffffff, 0.05);
  function f(t) {
    const normal = t.attributes.normal;
    const o = new Float32Array(3 * normal.count);
    for (let t = 0; t < normal.count; t++) {
      const n = normal.getY(t);
      let r = n >= 0 ? 0.8 + 0.2 * n : 0.8 + 0.12 * n;
      r += 0.04 * Math.max(0, normal.getZ(t) - normal.getX(t)) * (1 - Math.abs(n));
      o[3 * t] = o[3 * t + 1] = o[3 * t + 2] = r;
    }
    t.setAttribute("color", new THREE.BufferAttribute(o, 3));
  }
  function p(t, e, o) {
    t.castShadow = true;
    t.receiveShadow = true;
    if (t.material.vertexColors) {
      f(t.geometry);
    }
    (e || i).add(t);
    return t;
  }
  function E(t, e, o, n, r, a, i, s, c) {
    const u = new THREE.Mesh(new THREE.BoxGeometry(t, e, o), n);
    u.position.set(r, a + e / 2, i);
    return p(u, s);
  }
  function w(t, e, o, n, r, a, i, s, c) {
    const u = new THREE.Mesh(new THREE.CylinderGeometry(t, c === undefined ? t : c, e, s || 20), o);
    u.position.set(n, r + e / 2, a);
    return p(u, i);
  }
  function M(t) {
    t.computeVertexNormals();
    const position = t.attributes.position;
    const normal = t.attributes.normal;
    const n = new Map();
    const r = (t) =>
      `${Math.round(10000 * position.getX(t))},${Math.round(10000 * position.getY(t))},${Math.round(10000 * position.getZ(t))}`;
    for (let t = 0; t < position.count; t++) {
      const e = r(t);
      const a = n.get(e) || [0, 0, 0];
      a[0] += normal.getX(t);
      a[1] += normal.getY(t);
      a[2] += normal.getZ(t);
      n.set(e, a);
    }
    for (let t = 0; t < position.count; t++) {
      const e = n.get(r(t));
      const a = Math.hypot(e[0], e[1], e[2]) || 1;
      normal.setXYZ(t, e[0] / a, e[1] / a, e[2] / a);
    }
    normal.needsUpdate = true;
  }
  function m(t, e, o) {
    const n = Math.min(o, t / 2, e / 2);
    const r = new THREE.Shape();
    if (n < 0.001) {
      return (
        r.moveTo(-t / 2, -e / 2),
        r.lineTo(t / 2, -e / 2),
        r.lineTo(t / 2, e / 2),
        r.lineTo(-t / 2, e / 2),
        r.closePath(),
        r
      );
    }
    return (
      r.moveTo(-t / 2 + n, -e / 2),
      r.lineTo(t / 2 - n, -e / 2),
      r.quadraticCurveTo(t / 2, -e / 2, t / 2, -e / 2 + n),
      r.lineTo(t / 2, e / 2 - n),
      r.quadraticCurveTo(t / 2, e / 2, t / 2 - n, e / 2),
      r.lineTo(-t / 2 + n, e / 2),
      r.quadraticCurveTo(-t / 2, e / 2, -t / 2, e / 2 - n),
      r.lineTo(-t / 2, -e / 2 + n),
      r.quadraticCurveTo(-t / 2, -e / 2, -t / 2 + n, -e / 2),
      r
    );
  }
  function g(t, e, o, n, r, a, i, s, c, u, h) {
    const l = h === "z";
    const d = t - 2 * r;
    const f = (l ? e : o) - 2 * r;
    const depth = Math.max((l ? o : e) - 2 * r, 0.001);
    const w = m(d, f, n);
    const M = new THREE.ExtrudeGeometry(w, {
      depth,
      bevelEnabled: true,
      bevelThickness: r,
      bevelSize: r,
      bevelSegments: 3,
      curveSegments: 6,
    });
    if (!l) {
      M.rotateX(-Math.PI / 2);
    }
    M.computeBoundingBox();
    M.center();
    M.computeVertexNormals();
    const g = new THREE.Mesh(M, a);
    g.position.set(i, s + e / 2, c);
    return p(g, u);
  }
  function k(t, e, o, n) {
    const r = new THREE.Group();
    r.position.set(t, n || 0, e);
    r.rotation.y = o || 0;
    i.add(r);
    return r;
  }
  function v(t, o, n, r, a, i, s, c) {
    const u = t - (s || 0.04);
    const h = o - (s || 0.04);
    const l = c ? new THREE.ShapeGeometry(m(u, h, c), 6) : new THREE.PlaneGeometry(u, h);
    const d = new THREE.Mesh(l, e.screen);
    d.position.set(r, a, i);
    n.add(d);
    return d;
  }
  d.position.set(12, 10, -8);
  i.add(d);
  const y = -10;
  const C = -2.1;
  const T = 10;
  const R = -5.75;
  const H = 1.65;
  const x = 5.75;
  const b = 1.1;
  const I = 0.3;
  const P = 0.18;
  const S = [
    {
      n: 1,
      name: "Front desk",
      x: [y, C],
      z: [R, H],
    },
    {
      n: 2,
      name: "Billing office",
      x: [y, C],
      z: [H, x],
    },
    {
      n: 3,
      name: "Break room",
      x: [C, 2.8],
      z: [H, x],
    },
    {
      n: 4,
      name: "Manager's office",
      x: [2.8, T],
      z: [H, x],
    },
    {
      n: 5,
      name: "Therapy gym",
      x: [C, T],
      z: [R, H],
    },
  ];
  function L(t) {
    const e = S.find((e) => e.n === t);
    const o = (t) => (t === y || t === T || t === R || t === x ? I : P) / 2;
    return [e.x[0] + o(e.x[0]), e.x[1] - o(e.x[1]), e.z[0] + o(e.z[0]), e.z[1] - o(e.z[1])];
  }
  const V = E(1, 1, 1, e.plinth, 0, 0, 0);
  V.castShadow = false;
  const D = E(20, 0.02, 11.5, e.floor, 0, 0, 0, null);
  D.castShadow = false;
  D.userData.shell = true;
  const O = E(12.1, 0.035, 7.4, e.gymFloor, 3.95, 0, -2.05, null);
  function j(t, o, n, r, a, i) {
    const s = (i || []).slice().sort((t, e) => t[0] - e[0]);
    let c = n;
    const u = [];
    s.forEach((t) => {
      u.push([c, t[0]]);
      c = t[1];
    });
    u.push([c, r]);
    u.forEach(([n, r]) => {
      if (r - n < 0.01) {
        return;
      }
      const i = r - n;
      const s = (n + r) / 2;
      (t === "x"
        ? E(i, b, a, e.wall, s, 0, o, null)
        : E(a, b, i, e.wall, o, 0, s, null)
      ).userData.shell = true;
    });
  }
  O.castShadow = false;
  O.userData.shell = true;
  const z = {
    entrance: [-7.25, -4.85],
    fdGym: [-3.25, 1.2 - 2.05],
    office: [-9.7, -8.7],
    breakRm: [1.55, 2.55],
    billingBreak: [3.4, 4.4],
    manager: [3, 4],
  };
  function A(t, o, n) {
    const r = k(t, o, n);
    for (let t = 0; t < 4; t++) {
      const o = Math.PI / 4 + (t * Math.PI) / 2;
      const n = E(0.3, 0.035, 0.045, e.furnDark, 0, 0.035, 0, r);
      n.rotation.y = o;
      n.position.x = 0.15 * Math.cos(o);
      n.position.z = 0.15 * -Math.sin(o);
      w(0.025, 0.035, e.device, 0.28 * Math.cos(o), 0, 0.28 * -Math.sin(o), r, 12);
    }
    w(0.05, 0.05, e.furnDark, 0, 0.035, 0, r, 16);
    w(0.028, 0.36, e.furnDark, 0, 0.07, 0, r, 12);
    g(0.5, 0.09, 0.48, 0.09, 0.025, e.furnMid, 0, 0.42, 0, r);
    g(0.46, 0.5, 0.07, 0.11, 0.025, e.furnMid, 0, 0.56, -0.24, r, "z");
    E(0.05, 0.16, 0.03, e.furnDark, 0, 0.45, -0.22, r);
    return r;
  }
  function B(t, o, n) {
    const r = k(t, o, n);
    [
      [-0.2, -0.2],
      [0.2, -0.2],
      [-0.2, 0.2],
      [0.2, 0.2],
    ].forEach(([t, o]) => w(0.02, 0.44, e.furnDark, t, 0, o, r, 8));
    g(0.46, 0.06, 0.46, 0, 0.015, e.furn, 0, 0.44, 0, r);
    g(0.46, 0.42, 0.05, 0, 0.015, e.furn, 0, 0.5, -0.21, r, "z");
    return r;
  }
  function F(t, o, n) {
    const r = k(t, o, n);
    [
      [-0.28, 0.26],
      [0.28, 0.26],
      [-0.28, -0.26],
      [0.28, -0.26],
    ].forEach(([t, o]) => E(0.05, 0.64, 0.05, e.furnDark, t, 0, o, r));
    [-0.28, 0.28].forEach((t) => E(0.06, 0.035, 0.62, e.furnDark, t, 0.64, 0, r));
    E(0.51, 0.07, 0.52, e.furnDark, 0, 0.33, 0, r);
    g(0.52, 0.09, 0.52, 0.03, 0.02, e.furn, 0, 0.4, 0.02, r);
    g(0.5, 0.32, 0.06, 0.04, 0.02, e.furn, 0, 0.56, -0.25, r, "z");
    return r;
  }
  function G(t, o, n, r, a, i) {
    const s = k(t, o, a);
    E(n, 0.04, r, i || e.furnLight, 0, 0.72, 0, s);
    E(0.04, 0.72, 0.9 * r, e.furnMid, -n / 2 + 0.05, 0, 0, s);
    E(0.04, 0.72, 0.9 * r, e.furnMid, n / 2 - 0.05, 0, 0, s);
    return s;
  }
  function W(t, o, n, r, a, i, s) {
    const c = new THREE.Group();
    c.position.set(o, n, r);
    c.rotation.y = a || 0;
    t.add(c);
    i = i || 0.56;
    s = s || 0.34;
    E(0.2, 0.015, 0.14, e.device, 0, 0, 0, c);
    E(0.04, 0.16, 0.03, e.device, 0, 0, -0.02, c);
    const u = g(i, s, 0.03, 0.008, 0.005, e.device, 0, 0.12, 0, c, "z");
    u.rotation.x = -0.12;
    v(i, s, u, 0, 0, 0.016);
    return c;
  }
  j("x", R, -10.15, 10.15, I, [z.entrance]);
  j("x", x, -10.15, 10.15, I);
  j("z", y, R, x, I);
  j("z", T, R, x, I);
  j("z", C, R, x, P, [z.fdGym, z.billingBreak]);
  j("z", 2.8, H, x, P);
  j("x", H, y, T, P, [z.office, z.breakRm, z.manager]);
  const Z = new THREE.SphereGeometry(1, 12, 8);
  f(Z);
  const X = new THREE.Vector3(0, 1, 0);
  function U(t, e, o, n, r) {
    const a = o.clone().sub(e);
    const i = a.length();
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.7 * n, n, i, 6), r);
    s.position.copy(e).addScaledVector(a, 0.5);
    s.quaternion.setFromUnitVectors(X, a.normalize());
    return p(s, t);
  }
  function q(t) {
    let e = t >>> 0;
    return () => {
      e = (e + 1831565813) >>> 0;
      let t = Math.imul(e ^ (e >>> 15), 1 | e);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function Y(t, o, n, r) {
    n = n || 1;
    let a = 0.2;
    const i = q(Math.round(131 * t + 517 * o + 7919));
    const s = k(t, o, i() * Math.PI * 2);
    s.scale.setScalar(n);
    w(0.2, 0.4, e.furnMid, 0, 0, 0, s, 20, 0.16);
    w(0.18, 0.012, e.furnDark, 0, 0.395, 0, s, 20);
    const c = new THREE.Vector3(0, 0.38, 0);
    const u = new THREE.Vector3(0, 0.58, 0);
    U(s, c, u, 0.025, e.furnDark);
    const h = u.clone().add(new THREE.Vector3(0.08 * (i() - 0.5), 0.5, 0.08 * (i() - 0.5)));
    U(s, u, h, 0.016, e.furnDark);
    const l = [[h, 14, 0.16]];
    const d = 5 + (i() < 0.5 ? 1 : 0);
    for (let t = 0; t < d; t++) {
      const o = (t / d) * Math.PI * 2 + 0.6 * i();
      const n = 0.35 + 0.55 * i();
      const r = 0.3 + 0.2 * i();
      const a = u.clone().add(new THREE.Vector3(0, 0.3 * i(), 0));
      const c = new THREE.Vector3(
        Math.cos(o) * Math.cos(n),
        Math.sin(n),
        Math.sin(o) * Math.cos(n),
      );
      const h = a.clone().addScaledVector(c, r);
      U(s, a, h, 0.013, e.furnDark);
      l.push([h, 13 + Math.floor(4 * i()), 0.16]);
      l.push([a.clone().addScaledVector(c, 0.55 * r), 7 + Math.floor(3 * i()), 0.1]);
    }
    const f = [[], []];
    const p = new THREE.Object3D();
    l.forEach(([t, e, o]) => {
      for (let n = 0; n < e; n++) {
        const e = 0.07 + 0.035 * i();
        const n = i() * Math.PI * 2;
        const r = 0.03 + i() * o;
        p.position.set(t.x + Math.cos(n) * r, t.y + (i() - 0.35) * o * 0.9, t.z + Math.sin(n) * r);
        a = Math.max(a, Math.hypot(p.position.x, p.position.z) + e);
        p.rotation.set(0.9 * (i() - 0.5), -n, -0.25 - 0.55 * i(), "YXZ");
        p.scale.set(e, 0.014, 0.58 * e);
        p.updateMatrix();
        f[i() < 0.5 ? 0 : 1].push(p.matrix.clone());
      }
    });
    [e.furnLight, e.furn].forEach((t, e) => {
      const o = new THREE.InstancedMesh(Z, t, f[e].length);
      f[e].forEach((t, e) => o.setMatrixAt(e, t));
      o.receiveShadow = true;
      s.add(o);
    });
    if (r) {
      const e = a * n + 0.03;
      s.position.x = Math.min(Math.max(t, r[0] + e), r[1] - e);
      s.position.z = Math.min(Math.max(o, r[2] + e), r[3] - e);
    }
    s.userData.reach = a * n;
    return s;
  }
  const N = new THREE.LatheGeometry(
    Array.from(
      {
        length: 14,
      },
      (t, e) => {
        const o = e / 13;
        return new THREE.Vector2(
          0.034 * Math.sin(Math.PI * (0.12 + 0.88 * o)) ** 0.75 * (1 - 0.2 * o),
          o,
        );
      },
    ),
    18,
  );
  function $(t, o, n) {
    const r = q(Math.round(337 * t + 911 * o + 101));
    const a = k(t, o, r() * Math.PI * 2, n || 0);
    g(0.15, 0.12, 0.15, 0.03, 0.01, e.furnMid, 0, 0, 0, a);
    w(0.06, 0.01, e.furnDark, 0, 0.115, 0, a, 16);
    const i = 6 + Math.floor(3 * r());
    for (let t = 0; t < i; t++) {
      const o = 0.17 + 0.17 * r();
      const n = (t / i) * Math.PI * 2 + 0.5 * r();
      const s = 0.012 + 0.03 * r();
      const c = new THREE.Mesh(N, r() < 0.55 ? e.furn : e.furnLight);
      c.position.set(Math.cos(n) * s, 0.11, Math.sin(n) * s);
      c.scale.set(1, o, 1);
      c.rotation.set(
        Math.sin(n) * (0.08 + 0.18 * r()),
        r() * Math.PI,
        -Math.cos(n) * (0.08 + 0.18 * r()),
        "YXZ",
      );
      p(c, a).castShadow = false;
    }
    return a;
  }
  function J(t, e, o) {
    const n = [
      new THREE.Vector2(0.0001, 0),
      new THREE.Vector2(0.9 * t, 0),
      new THREE.Vector2(t, 0.15 * t),
    ];
    for (let o = 1; o <= 6; o++) {
      n.push(new THREE.Vector2(t, ((e - t) * o) / 6));
    }
    for (let o = 1; o <= 8; o++) {
      const r = ((o / 8) * Math.PI) / 2;
      n.push(new THREE.Vector2(Math.max(t * Math.cos(r), 0.0001), e - t + t * Math.sin(r)));
    }
    const r = new THREE.LatheGeometry(n, 40);
    const position = r.attributes.position;
    for (let t = 0; t < position.count; t++) {
      const e = 1 + 0.09 * Math.cos(o * Math.atan2(position.getZ(t), position.getX(t)));
      position.setX(t, position.getX(t) * e);
      position.setZ(t, position.getZ(t) * e);
    }
    M(r);
    return r;
  }
  N.scale(1, 1, 0.26);
  N.computeVertexNormals();
  f(N);
  const _ = J(0.042, 0.14, 9);
  const K = J(0.02, 0.06, 7);
  function Q(t, o, n, r) {
    r = r || 0.9;
    const a = k(t, o, n);
    const i = Math.min(0.22, 0.4 * r);
    E(r, 0.72, 0.5, e.furn, 0, 0, 0, a);
    E(r, 0.008, 0.01, e.furnDark, 0, 0.36, 0.255, a);
    [0.36, 0.72].forEach((t) => {
      const o = t - 0.08;
      E(i, 0.018, 0.016, e.furnDark, 0, o, 0.278, a);
      [-i / 2 + 0.01, i / 2 - 0.01].forEach((t) =>
        E(0.014, 0.014, 0.03, e.furnDark, t, o + 0.002, 0.262, a),
      );
    });
    return a;
  }
  f(_);
  f(K);
  const tt = new THREE.BoxGeometry(1, 1, 1);
  function et(t, o, n, r) {
    const a = new THREE.Group();
    a.position.set(o, n, r);
    t.add(a);
    E(0.55, 0.32, 0.45, e.device, 0, 0, 0, a);
    E(0.4, 0.02, 0.18, e.furnMid, 0, 0.32, -0.05, a);
    E(0.14, 0.08, 0.02, e.furnDark, 0.15, 0.26, 0.23, a).rotation.x = -0.6;
    return a;
  }
  f(tt);
  const ot = -6.05;
  function nt(t, o, n) {
    const r = k(t, o, n);
    g(0.38, 0.025, 0.3, 0.02, 0.006, e.device, 0, 0, 0.02, r);
    w(0.022, 1, e.device, 0, 0.02, 0, r, 16);
    const a = g(0.42, 0.3, 0.04, 0.035, 0.006, e.device, 0, 0.88, 0, r, "z");
    a.rotation.x = -0.85;
    v(0.42, 0.3, a, 0, 0, 0.021, 0.04, 0.024);
  }
  !(() => {
    const t = k(ot, -0.6, 0);
    E(2.8, 1.05, 0.12, e.furn, 0, 0, -0.32, t);
    E(2.9, 0.04, 0.34, e.furnLight, 0, 1.05, -0.3, t);
    E(2.74, 0.04, 0.7, e.furnLight, 0, 0.74, 0.05, t);
    [-1.36, 1.36].forEach((o) => E(0.04, 0.74, 0.6, e.furnMid, o, 0, 0.05, t));
    W(t, -0.1, 0.78, 0.02, 0);
    E(0.42, 0.02, 0.14, e.device, -0.1, 0.78, 0.25, t);
    A(ot - 0.1, 0.35, Math.PI);
    et(G(ot - 1.4, H - 0.09 - 0.3, 0.75, 0.5, Math.PI), 0, 0.76, 0);
    Q(-4.75, H - 0.09 - 0.26, Math.PI);
  })();
  nt(-6.95, -3.1, Math.PI);
  nt(ot + 0.9, -3.1, Math.PI);
  [-4.7, -3.9, -3.1, -2.3, -1.5].forEach((t) => F(-9.4, t, Math.PI / 2));
  (() => {
    const t = k(-8.35, -3.3, 0);
    E(0.6, 0.42, 1.2, e.furnLight, 0, 0, 0, t);
  })();
  Y(-9.4, -0.4, 1.1, L(1));
  Y(C, H, 1, L(1));
  [-4.2, -3.4].forEach((t) => F(t, 0.36 - 5.6, 0));
  [-4.5, -3.7].forEach((t) => F(-2.55, t, -Math.PI / 2));
  (() => {
    const t = k(-2.54, 0.36 - 5.6, 0);
    E(0.5, 0.42, 0.5, e.furnLight, 0, 0, 0, t);
  })();
  const rt = [
    [-0.5, 1.15, 0.3, 0.38],
    [-0.08, 1.1, 0.34, 0.26],
    [0.36, 1.18, 0.3, 0.34],
    [-0.35, 0.72, 0.4, 0.24],
    [0.2, 0.7, 0.26, 0.3],
  ];
  const at = [];
  function it(t, o, n, r) {
    const a = k(t, o, n, r || 0);
    at.push(a);
    E(1.6, 0.9, 0.04, e.furnMid, 0, 0.55, 0, a);
    E(1.48, 0.78, 0.02, e.furnLight, 0, 0.61, 0.025, a);
    rt.forEach(([t, o, n, r]) => E(n, r, 0.01, e.paper, t, o - r / 2, 0.04, a));
    return a;
  }
  function st(t, e) {
    const o = [0, 0.72, -0.72];
    const n = new THREE.SphereGeometry(1, t, e);
    const position = n.attributes.position;
    const a = new THREE.Vector3();
    for (let t = 0; t < position.count; t++) {
      a.fromBufferAttribute(position, t);
      const e = Math.asin(Math.max(-1, Math.min(1, a.y)));
      let n = 0;
      o.forEach((t) => {
        n += Math.exp(-(((e - t) / 0.045) ** 2));
      });
      a.multiplyScalar(1 + 0.018 * n);
      position.setXYZ(t, a.x, a.y, a.z);
    }
    M(n);
    f(n);
    return n;
  }
  it((-9.85 + z.entrance[0]) / 2, 0.03 - 5.6, 0);
  it(-2.19 - 0.03, (z.fdGym[1] + H - 0.09) / 2, -Math.PI / 2);
  const ct = st(24, 56);
  const ut = st(16, 32);
  function ht(t, o, n, r) {
    const a = new THREE.Mesh(ct, r || e.furnLight);
    a.scale.setScalar(n);
    a.position.set(t, 0.02 + n, o);
    a.rotation.set(0.12, 1.7 * t, 0.08);
    return p(a);
  }
  const lt = (() => {
    const t = 0.008;
    const e = [new THREE.Vector2(0.0001, 0)];
    for (let o = 0; o <= 3; o++) {
      const n = -Math.PI / 2 + ((o / 3) * Math.PI) / 2;
      e.push(new THREE.Vector2(0.192 + t * Math.cos(n), t + t * Math.sin(n)));
    }
    for (let t = 0; t <= 8; t++) {
      const o = ((t / 8) * Math.PI) / 2;
      e.push(new THREE.Vector2(0.168 + 0.032 * Math.cos(o), 0.048 + 0.032 * Math.sin(o)));
    }
    e.push(new THREE.Vector2(0.0001, 0.08));
    const o = new THREE.LatheGeometry(e, 32);
    f(o);
    return o;
  })();
  function dt(t, o) {
    const n = k(t, o, 0);
    for (let t = 0; t < 3; t++) {
      const o = Math.PI / 6 + t * ((2 * Math.PI) / 3);
      E(0.26, 0.03, 0.04, e.furnDark, 0.13 * Math.cos(o), 0.03, 0.13 * -Math.sin(o), n).rotation.y =
        o;
      w(0.022, 0.03, e.device, 0.24 * Math.cos(o), 0, 0.24 * -Math.sin(o), n, 10);
    }
    w(0.026, 0.39, e.furnDark, 0, 0.05, 0, n, 12);
    p(new THREE.Mesh(lt, e.furnMid), n).position.y = 0.43;
    return n;
  }
  function ft(t, o, n, r) {
    const a = k(t, o, n);
    [
      [-0.2, -0.15],
      [0.2, -0.15],
      [-0.2, 0.15],
      [0.2, 0.15],
    ].forEach(([t, o]) => w(0.015, 0.83, e.furnDark, t, 0.04, o, a, 6));
    E(0.48, 0.03, 0.38, e.furnLight, 0, 0.3, 0, a);
    E(0.48, 0.03, 0.38, e.furnLight, 0, 0.86, 0, a);
    const i = q(Math.round(151 * t + 389 * o + 17));
    const s = 0.08 * (i() - 0.5);
    const c = 0.06 * (i() - 0.5);
    const u = 0.9 * (i() - 0.5);
    switch (r) {
      case "laptop":
        ((t, o, r, a) => {
          const n = 0;
          const i = new THREE.Group();
          i.position.set(o, 0.89, r);
          i.rotation.y = a || 0;
          t.add(i);
          g(0.32, 0.016, 0.22, 0.012, 0.003, e.device, 0, 0, 0, i);
          E(0.27, 0.003, 0.1, e.furnDark, 0, 0.017, -0.02, i).userData.noShadow = true;
          const s = new THREE.Group();
          s.position.set(0, 0.016, -0.105);
          s.rotation.x = -0.26;
          i.add(s);
          v(
            0.32,
            0.21,
            g(0.32, 0.21, 0.008, 0.012, 0.002, e.device, 0, 0, 0, s, "z"),
            0,
            0,
            0.0045,
            0.028,
            0.008,
          );
        })(a, 0.5 * s, 0.5 * c, 0.4 * u);
        break;
      case "phone":
        ((t, o, r, a) => {
          const n = 0;
          const i = g(0.075, 0.009, 0.15, 0.012, 0.002, e.device, o, 0.89, r, t);
          i.rotation.y = a || 0;
          v(0.075, 0.15, i, 0, 0.005, 0, 0.008, 0.009).rotation.x = -Math.PI / 2;
        })(a, s, c, u);
        break;
      default:
        pt(a, s, 0.89, c, u);
    }
  }
  function pt(t, o, n, r, a) {
    const i = g(0.3, 0.012, 0.21, 0.026, 0.003, e.device, o, n, r, t);
    i.rotation.y = a || 0;
    v(0.3, 0.21, i, 0, 0.0065, 0, 0.03, 0.018).rotation.x = -Math.PI / 2;
    return i;
  }
  const Et = Y(T, R, 1, L(5));
  const wt = (() => {
    const [t, , o] = L(5);
    const n = t + 0.35 + 0.05;
    const r = o + 0.6 + 0.05;
    !((t, o) => {
      const n = k(t, o, 0);
      const r = 0.31;
      const a = 0.6 - 0.04;
      g(0.7, 0.04, 1.2, 0.02, 0.008, e.furnLight, 0, 0.71, 0, n);
      [
        [-r, -a],
        [r, -a],
        [-r, a],
        [r, a],
      ].forEach(([t, o]) => E(0.04, 0.71, 0.04, e.furnMid, t, 0, o, n));
    })(n, r);
    const a = n + 0.35 + 0.27;
    B(a, r - 0.3, -Math.PI / 2);
    B(a, r + 0.3, -Math.PI / 2);
    B(n, r + 0.6 + 0.27, Math.PI);
    return {
      eastEdge: a + 0.25,
    };
  })();
  const Mt = (() => {
    const t = [-0.36, 1];
    const e = 3 * 1.9 - t[0] + t[1];
    let o = Infinity;
    Et.updateMatrixWorld(true);
    const n = new THREE.Matrix4();
    const r = new THREE.Vector3();
    Et.traverse((t) => {
      if (t.isInstancedMesh) {
        for (let e = 0; e < t.count; e++) {
          t.getMatrixAt(e, n);
          r.setFromMatrixPosition(n.premultiply(t.matrixWorld));
          o = Math.min(o, r.x - 0.06);
        }
      }
    });
    const wt_eastEdge = wt.eastEdge;
    const i = wt_eastEdge + (o - wt_eastEdge - e) / 2 - t[0];
    return [0, 1, 2, 3].map((t) => i + 1.9 * t);
  })();
  Mt.forEach((t, o) => {
    const n = q(71 * o + 13);
    !((t, n) => {
      const o = 0;
      const r = k(t, -4.6, 0);
      [
        [-0.31, -0.89],
        [0.31, -0.89],
        [-0.31, 0.89],
        [0.31, 0.89],
      ].forEach(([t, o]) => E(0.06, 0.6, 0.06, e.furnLight, t, 0, o, r));
      E(0.7 - 0.04, 0.1, 1.9 - 0.04, e.furnLight, 0, 0.5, 0, r);
      [-0.89, 0.89].forEach((t) => E(0.56, 0.05, 0.04, e.furnLight, 0, 0.14, t, r));
      E(0.04, 0.05, 1.72, e.furnLight, 0, 0.14, 0, r);
      g(0.7, 0.08, 1.28 - 0.005, 0.02, 0.018, e.furnMid, 0, 0.6, 0.31249999999999994, r);
      const a = new THREE.Group();
      a.position.set(0, 0.6, -0.33);
      a.rotation.x = n ? 0.6 : 0;
      r.add(a);
      g(0.7, 0.08, 0.95 - 0.33 - 0.005, 0.02, 0.018, e.furnMid, 0, 0, -0.31249999999999994, a);
    })(t, o % 2 == 1);
    dt(t + 0.75 + 0.25 * (n() - 0.5), 0.3 * (n() - 0.5) - 4.1);
    ft(t + 0.75, -5.2, 0, ["tablet", "phone", "laptop", "tablet"][o]);
  });
  (() => {
    const t = k(2.4, -1.75, 0);
    E(3.4, 0.04, 1.2, e.furnLight, 0, 0, 0, t);
    [-1.5, 0, 1.5].forEach((o) =>
      [-0.36, 0.36].forEach((n) => w(0.035, 0.88, e.furnDark, o, 0.04, n, t, 10)),
    );
    [-0.36, 0.36].forEach((o) => {
      const n = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.1, 10), e.furnMid);
      n.rotation.z = Math.PI / 2;
      n.position.set(0, 0.93, o);
      p(n, t);
    });
  })();
  (() => {
    const t = k(6.4, -1.75, 0);
    const o = 0.85;
    const n = 0.32;
    const r = 0.15;
    for (let a = 0; a < 3; a++) {
      E(n, r * (a + 1), o, e.furn, a * n - 1.15, 0, 0, t);
      E(n, r * (a + 1), o, e.furn, 1.15 - a * n, 0, 0, t);
    }
    E(0.66, 3 * r, o, e.furn, 0, 0, 0, t);
    const a = [
      [-1.3, 0.9],
      [-0.33, 1.35],
      [0.33, 1.35],
      [1.3, 0.9],
    ];
    [-0.5, 0.5].forEach((o) => {
      a.forEach(([n, r]) => w(0.035, r, e.furnDark, n, 0, o, t, 10));
      for (let n = 0; n < a.length - 1; n++) {
        U(
          t,
          new THREE.Vector3(a[n][0], a[n][1], o),
          new THREE.Vector3(a[n + 1][0], a[n + 1][1], o),
          0.03,
          e.furnMid,
        );
      }
    });
  })();
  const mt = [];
  [-4.2, -3.3, -2.4].forEach((t) =>
    ((o) => {
      const t = 0;
      const n = k(9.83, o, -Math.PI / 2);
      mt.push(n);
      E(0.62, 0.86, 0.03, e.furnDark, 0, 0.55, 0, n);
      E(0.56, 0.8, 0.012, e.paper, 0, 0.58, 0.018, n);
      n.children[1].castShadow = false;
      return n;
    })(t),
  );
  ((n) => {
    const t = 0;
    const o = 0;
    const r = k(-1.2, 0.45, n === undefined ? -Math.PI / 2 : n);
    E(0.8, 0.2, 1.9, e.furnDark, 0, 0, 0, r);
    E(0.56, 0.02, 1.6, e.device, 0, 0.2, 0.08, r);
    [-0.38, 0.38].forEach((t) => E(0.05, 1.05, 0.06, e.furnDark, t, 0.2, -0.82, r));
    [-0.38, 0.38].forEach((t) => E(0.04, 0.04, 0.5, e.furnMid, t, 1, -0.55, r));
    E(0.72, 0.3, 0.08, e.device, 0, 1.18, -0.82, r).rotation.x = -0.6;
  })(Math.PI);
  ((n) => {
    const t = 0;
    const o = 0;
    const r = k(0.2, 0.55, n === undefined ? -Math.PI / 2 : n);
    const a = (t, e, o) => new THREE.Vector3(t, e, o);
    E(0.12, 0.08, 1.5, e.furnDark, 0, 0.02, 0, r);
    [-0.72, 0.7].forEach((t) => g(0.56, 0.06, 0.09, 0.02, 0.01, e.furnDark, 0, 0, t, r));
    g(0.34, 0.36, 0.56, 0.04, 0.012, e.furnMid, 0, 0.08, 0.36, r);
    g(0.5, 0.1, 0.42, 0.06, 0.025, e.furnMid, 0, 0.44, 0.3, r);
    const i = new THREE.Group();
    i.position.set(0, 0.5, 0.56);
    i.rotation.x = 0.32;
    r.add(i);
    g(0.46, 0.6, 0.1, 0.08, 0.025, e.furnMid, 0, 0.02, 0, i, "z");
    [-0.33, 0.33].forEach((t) => {
      U(r, a(0.6 * t, 0.4, 0.46), a(t, 0.6, 0.42), 0.018, e.furnDark);
      U(r, a(t, 0.6, 0.42), a(t, 0.62, 0.14), 0.02, e.furnDark);
    });
    g(0.3, 0.44, 0.46, 0.06, 0.015, e.furnMid, 0, 0.08, -0.46, r);
    [-0.2, 0.2].forEach((t) => E(0.09, 0.03, 0.15, e.furnDark, t, 0.3, -0.36, r));
    U(r, a(0, 0.45, -0.62), a(0, 1.05, -0.5), 0.045, e.furnDark);
    E(0.34, 0.22, 0.06, e.device, 0, 1.02, -0.5, r).rotation.x = -0.55;
    U(r, a(-0.32, 0.9, -0.42), a(0.32, 0.9, -0.42), 0.018, e.furnDark);
    [-0.32, 0.32].forEach((t) =>
      U(r, a(t, 0.9, -0.42), a(1.05 * t, 1.02, -0.26), 0.018, e.furnDark),
    );
  })(Math.PI);
  const gt = new THREE.CylinderGeometry(0.016, 0.016, 0.13, 10);
  function kt(t, o, n, r, a) {
    const i = new THREE.Group();
    i.position.set(o, n + 0.87 * a, r);
    t.add(i);
    p(new THREE.Mesh(gt, e.furnMid), i);
    const s = new THREE.CylinderGeometry(a, a, 0.065, 6);
    s.rotateX(Math.PI / 2);
    s.rotateZ(Math.PI / 6);
    f(s);
    [-1, 1].forEach((t) => {
      p(new THREE.Mesh(s, e.device), i).position.z = 0.0975 * t;
    });
    return i;
  }
  gt.rotateX(Math.PI / 2);
  f(gt);
  (() => {
    const t = k(5.9, H - 0.09 - 0.4, 0);
    [-0.85, 0.85].forEach((o) => E(0.05, 0.75, 0.6, e.furnDark, o, 0, 0, t));
    E(1.66, 0.04, 0.32, e.furnMid, 0, 0.35, -0.12, t);
    E(1.66, 0.04, 0.32, e.furnMid, 0, 0.7, 0.12, t);
    for (let e = 0; e < 6; e++) {
      const o = 0.28 * e - 0.7;
      kt(t, o, 0.39, -0.12, 0.05 + 0.008 * e);
      kt(t, o, 0.74, 0.12, 0.04 + 0.006 * e);
    }
    !((o) => {
      const t = 0;
      const n = k(7.75, o, Math.PI);
      [-0.58, 0.58].forEach((t) => E(0.04, 0.95, 0.4, e.furnDark, t, 0, 0, n));
      [0.12, 0.45, 0.78].forEach((t, o) => {
        E(1.12, 0.03, 0.38, e.furnMid, 0, t, 0, n);
        E(1.12, 0.04, 0.02, e.furnDark, 0, t + 0.03, 0.18, n);
        [-0.42, -0.14, 0.14, 0.42].forEach((r, a) => {
          const i = 0.1 + ((a + o) % 3) * 0.01;
          const s = p(new THREE.Mesh(ut, (a + o) % 2 ? e.furnMid : e.furnDark), n);
          s.scale.setScalar(i);
          s.position.set(r, t + 0.03 + i, -0.01);
          s.rotation.y = 1.3 * a + o;
        });
      });
    })(H - 0.09 - 0.22);
    E(2.2, 0.03, 1.1, e.furnMid, 5.9, 0.035, 0.25, null);
    ht(9.45, 0.2, 0.33);
    ht(9.5, -0.5, 0.28);
    const o = k(9.82, -0.2, -Math.PI / 2);
    E(1.4, 0.08, 0.04, e.furnDark, 0, 1, 0, o);
    for (let t = 0; t < 5; t++) {
      const n = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.015, 6, 16),
        [e.furnLight, e.furn, e.furnMid, e.furnDark, e.device][t],
      );
      n.position.set(0.26 * t - 0.52, 0.86, 0.05);
      p(n, o);
    }
    [0, 0.35].forEach((t) => {
      const o = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 16), e.furnLight);
      o.rotation.z = Math.PI / 2;
      o.position.set(8.35, 0.1, 0.6 + t);
      p(o, null);
    });
  })();
  [-7.7, -5.2].forEach((t) => {
    const o = G(t, 2.15, 1.6, 0.7, 0);
    W(o, 0, 0.76, -0.05, 0);
    E(0.42, 0.02, 0.14, e.device, 0, 0.76, 0.2, o);
    A(t, 3, Math.PI);
    Q(t + 1.2, 2.01, 0, 0.6);
  });
  (() => {
    const t = k(-2.75, 2.6, -Math.PI / 2);
    E(0.9, 0.7, 0.55, e.furnLight, 0, 0, 0, t);
    et(t, 0, 0.7, 0);
  })();
  [-9.45, -8.95, -8.45].forEach((t) =>
    ((t) => {
      const o = k(t, 5.3, Math.PI);
      E(0.48, 1.3, 0.55, e.furnMid, 0, 0, 0, o);
      [0.3, 0.62, 0.94].forEach((t) => E(0.48, 0.008, 0.01, e.furnDark, 0, t, 0.28, o));
      [0.3, 0.62, 0.94, 1.3].forEach((t) => {
        const n = t - 0.08;
        E(0.16, 0.018, 0.016, e.furnDark, 0, n, 0.303, o);
        [-0.07, 0.07].forEach((t) => E(0.014, 0.014, 0.03, e.furnDark, t, n + 0.002, 0.287, o));
      });
      return o;
    })(t),
  );
  Q(-9.59, 3.6, Math.PI / 2);
  (() => {
    const [t, o] = L(2);
    const n = (t + o) / 2;
    [-0.95, 0, 0.95].forEach((t) =>
      ((t, n) => {
        const o = 0;
        const r = q(Math.round(97 * t + 1047.99 + 5));
        const a = k(t, 5.43, n);
        const i = 0.32;
        const s = 0.025;
        [-0.4375, 0.4375].forEach((t) => E(s, 1.3, i, e.furn, t, 0, 0, a));
        E(0.85, 0.06, 0.308, e.furn, 0, 0, 0.004, a);
        [0.45, 0.86].forEach((t) => E(0.85, s, 0.308, e.furn, 0, t - s + 0.02, 0.004, a));
        E(0.9, s, i, e.furn, 0, 1.3 - s, 0, a);
        E(0.85, 1.215, 0.01, e.furnMid, 0, 0.06, -0.154, a).castShadow = false;
        const c = [[], []];
        const u = new THREE.Object3D();
        [0.06, 0.47, 0.88].forEach((t) => {
          let e = 0.02 - 0.425;
          while (e < 0.365) {
            if (r() < 0.12) {
              e += 0.06 + 0.08 * r();
              continue;
            }
            const o = 0.025 + 0.035 * r();
            const n = 0.22 + 0.1 * r();
            const a = 0.19 + 0.05 * r();
            if (e + o > 0.415) {
              break;
            }
            u.position.set(e + o / 2, t + n / 2 + 0.001, -i / 2 + 0.015 + a / 2);
            u.rotation.set(0, 0, 0);
            u.scale.set(o, n, a);
            u.updateMatrix();
            c[r() < 0.5 ? 0 : 1].push(u.matrix.clone());
            e += o + 0.003;
          }
        });
        [e.furnLight, e.furnMid].forEach((t, e) => {
          const o = new THREE.InstancedMesh(tt, t, c[e].length);
          c[e].forEach((t, e) => o.setMatrixAt(e, t));
          o.castShadow = true;
          o.receiveShadow = true;
          a.add(o);
        });
        return a;
      })(n + t, Math.PI),
    );
  })();
  Y(-2.65, 5.25, 0.9, L(2));
  (() => {
    const t = k(-0.15, 5.6 - 0.32, Math.PI);
    E(3, 0.88, 0.62, e.furnLight, 0, 0, 0, t);
    E(3.06, 0.04, 0.64, e.furn, 0, 0.88, 0, t);
    E(0.6, 0.02, 0.4, e.furnDark, -0.6, 0.92, 0.02, t);
    w(0.02, 0.28, e.furnDark, -0.6, 0.92, -0.22, t, 8);
    E(0.52, 0.3, 0.38, e.furnMid, 0.85, 0.92, 0, t);
    E(0.24, 0.36, 0.3, e.furnDark, 0.25, 0.92, -0.05, t);
    E(0.05, 0.03, 0.08, e.furnLight, 0.25, 1.06, 0.12, t);
    const o = k(2.25, 5.6 - 0.36, Math.PI);
    E(0.72, 1.85, 0.68, e.furnLight, 0, 0, 0, o);
    E(0.72, 0.008, 0.01, e.furnMid, 0, 1.25, 0.345, o);
    E(0.03, 0.4, 0.03, e.furnMid, -0.3, 1.35, 0.36, o);
  })();
  (() => {
    const t = k(0.15, 3.25, 0);
    w(0.55, 0.04, e.furnLight, 0, 0.72, 0, t, 32);
    w(0.05, 0.72, e.furnMid, 0, 0, 0, t, 10);
    w(0.28, 0.03, e.furnMid, 0, 0, 0, t, 20);
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((t) =>
      B(0.15 + 0.85 * Math.sin(t), 3.25 + 0.85 * Math.cos(t), t + Math.PI),
    );
    pt(t, 0.27, 0.76, 0.08, -0.45);
  })();
  (() => {
    const [t, , o] = L(3);
    !((t, o) => {
      const n = k(t, o, Math.PI / 4);
      g(0.32, 0.92, 0.32, 0.02, 0.006, e.furnLight, 0, 0, 0, n);
      E(0.22, 0.26, 0.012, e.furnDark, 0, 0.44, 0.162, n);
      [-0.045, 0.045].forEach((t) => E(0.035, 0.04, 0.035, e.furnMid, t, 0.62, 0.17, n));
      E(0.2, 0.012, 0.06, e.furnMid, 0, 0.45, 0.18, n);
      w(0.06, 0.04, e.furnMid, 0, 0.92, 0, n, 16);
      w(0.13, 0.34, e.paper, 0, 0.96, 0, n, 24);
      w(0.05, 0.05, e.paper, 0, 1.3, 0, n, 16, 0.13);
    })(t + 0.24, o + 0.24);
  })();
  it(2.68, (L(4)[2] + L(4)[3]) / 2, -Math.PI / 2, 0.4);
  const vt = L(4);
  const z_1 = (vt[2] + vt[3]) / 2;
  !(() => {
    const t = G(vt[1] - 1.3, z_1, 1.8, 0.85, Math.PI / 2, e.furn);
    E(1.7, 0.6, 0.04, e.furnMid, 0, 0.12, -0.38, t);
    W(t, 0, 0.76, 0.1, 0, 0.62, 0.37);
    E(0.42, 0.02, 0.14, e.device, 0, 0.76, 0.32, t);
    A(vt[1] - 0.5, z_1, -Math.PI / 2);
    B(vt[1] - 2.3, z_1 - 0.55, Math.PI / 2);
    B(vt[1] - 2.3, z_1 + 0.55, Math.PI / 2);
  })();
  const Ct = {
    x: vt[0] + 0.03,
    z: z_1,
  };
  !(() => {
    const t = k(Ct.x, Ct.z, Math.PI / 2);
    v(1.6, 0.9, E(1.6, 0.9, 0.05, e.device, 0, 0.95, 0, t), 0, 0, 0.026, 0.06);
  })();
  [-0.42, -0.14, 0.14, 0.42].forEach((t) => dt(Ct.x + 2.3 * Math.cos(t), Ct.z + 2.3 * Math.sin(t)));
  ft(Ct.x + 0.3, Ct.z - 0.6, Math.PI / 2);
  it(7, 1.77, 0);
  (() => {
    const t = k((vt[0] + vt[1]) / 2, vt[3] - 0.25, Math.PI);
    E(1.8, 0.62, 0.45, e.furnLight, 0, 0.04, 0, t);
    [-0.55, 0.05, 0.6].forEach((o) => E(0.006, 0.5, 0.01, e.furnMid, o, 0.1, 0.23, t));
  })();
  Y(3.35, 5.25, 0.85, L(4));
  (() => {
    const t = q(Math.round(-1033.9 - 551.7 + 37));
    const o = k(-4.9, -0.9, t() * Math.PI * 2, 1.09);
    w(0.068, 0.1, e.furnMid, 0, 0, 0, o, 24, 0.052);
    w(0.074, 0.022, e.furnMid, 0, 0.088, 0, o, 24);
    w(0.06, 0.006, e.furnDark, 0, 0.11, 0, o, 20);
    const n = p(new THREE.Mesh(_, e.furn), o);
    n.position.y = 0.1;
    n.castShadow = false;
    const r = t() < 0.5 ? 1 : 2;
    for (let n = 0; n < r; n++) {
      const r = n === 0 ? 1 : -1;
      const a = 0.16 + 0.025 * t() - 0.012 * n;
      const i = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.05, 16), e.furn);
      i.rotation.z = Math.PI / 2;
      i.position.set(0.055 * r, a, 0);
      p(i, o).castShadow = false;
      const s = p(new THREE.Mesh(K, e.furn), o);
      s.castShadow = false;
      s.position.set(0.075 * r, a - 0.01, 0);
    }
  })();
  $(-8.35, -3, 0.42);
  $(0.15, 3.25, 0.76);
  $((vt[0] + vt[1]) / 2 - 0.55, vt[3] - 0.25, 0.66);
  ((t) => {
    const e = new THREE.Vector3();
    const o = new THREE.Vector3();
    t.updateMatrixWorld(true);
    t.traverse((t) => {
      if (t.isMesh && !t.isInstancedMesh) {
        if (t.userData.noShadow) {
          return ((t.castShadow = false), void (t.receiveShadow = false));
        }
        return void (
          t.castShadow &&
          (t.geometry.boundingBox || t.geometry.computeBoundingBox(),
          t.geometry.boundingBox.getSize(e).multiply(t.getWorldScale(o)),
          Math.min(e.x, e.y, e.z) < 0.03 && (t.castShadow = false))
        );
      }
    });
  })(i);
  const Tt = {};
  const Rt = {};
  function Ht(t, e) {
    const o = S.find((o) => t >= o.x[0] && t <= o.x[1] && e >= o.z[0] && e <= o.z[1]);
    if (o) {
      return o.n;
    }
    return 0;
  }
  const xt = {};
  function bt(t, material) {
    const o = (xt[t] = xt[t] || {});
    if (!o[material.uuid]) {
      const t = material.clone();
      t.userData.src = material;
      o[material.uuid] = t;
    }
    return o[material.uuid];
  }
  {
    i.updateMatrixWorld(true);
    const t = new Map();
    const o = [];
    const n = new THREE.Vector3();
    const r = new THREE.Box3();
    i.traverse((e) => {
      if (!e.isMesh || e.isInstancedMesh || e === V) {
        return;
      }
      r.setFromObject(e).getCenter(n);
      const room = e.userData.shell ? 0 : Ht(n.x, n.z);
      const i = !!e.userData.noShadow;
      const s = `${room}|${e.material.uuid}|${e.castShadow ? 1 : 0}${i ? "|n" : ""}`;
      if (!t.has(s)) {
        t.set(s, {
          room,
          material: e.material,
          cast: e.castShadow && !i,
          receive: !i,
          parts: [],
        });
      }
      t.get(s).parts.push(e);
      o.push(e);
    });
    o.forEach((t) => {
      if (t.parent) {
        t.parent.remove(t);
      }
    });
    t.forEach(({ room, material, cast, receive, parts }) => {
      let s = material;
      if (material === e.screen) {
        s = Tt[room] = Tt[room] || e.screen.clone();
      } else if (room !== 0) {
        s = bt(room, material);
      }
      const c = new THREE.Mesh(
        ((parts_1, e) => {
          let o = 0;
          const n = parts_1.map((t) => {
            const e = t.geometry.index ? t.geometry.toNonIndexed() : t.geometry.clone();
            e.applyMatrix4(t.matrixWorld);
            o += e.attributes.position.count;
            return e;
          });
          const r = new Float32Array(3 * o);
          const a = new Float32Array(3 * o);
          const i = e ? new Float32Array(3 * o) : null;
          let s = 0;
          n.forEach((t) => {
            const count = t.attributes.position.count;
            r.set(t.attributes.position.array, 3 * s);
            a.set(t.attributes.normal.array, 3 * s);
            i &&
              (t.attributes.color
                ? i.set(t.attributes.color.array, 3 * s)
                : i.fill(1, 3 * s, 3 * (s + count)));
            s += count;
            t.dispose();
          });
          const c = new THREE.BufferGeometry();
          c.setAttribute("position", new THREE.BufferAttribute(r, 3));
          c.setAttribute("normal", new THREE.BufferAttribute(a, 3));
          if (i) {
            c.setAttribute("color", new THREE.BufferAttribute(i, 3));
          }
          c.computeBoundingSphere();
          return c;
        })(parts, !!material.vertexColors),
        s,
      );
      c.castShadow = cast;
      c.receiveShadow = receive;
      if (!Rt[room]) {
        Rt[room] = new THREE.Group();
        Rt[room].name = `room-${room}`;
        i.add(Rt[room]);
      }
      Rt[room].add(c);
    });
  }
  !(() => {
    const t = new THREE.Vector3();
    i.updateMatrixWorld(true);
    i.traverse((e) => {
      if (!e.isInstancedMesh) {
        return;
      }
      e.getWorldPosition(t);
      const o = Ht(t.x, t.z);
      if (o) {
        e.material = bt(o, e.material);
      }
    });
  })();
  const It = {
    shadowSoft: 1.5,
    plinthH: 0.01,
    plinthO: 0.35,
    glowW: 2.2,
    glowS: 1,
    glowF: 2.2,
    glowR: 0,
    glowB: 0.48,
    glowP: 3.5,
    glowIn: 0.7,
    glowOut: 1,
    glowEaseIn: "inout",
    glowEaseOut: "inout",
    focusMode: "fade",
    focusAmt: 1,
    focusTint: "#ffffff",
    modalSide: "left",
    modalW: 20,
    modalH: 40,
    modalInset: 0,
    colors: {},
  };
  Object.keys(t).forEach((e) => {
    It.colors[e] = `#${t[e].toString(16).padStart(6, "0")}`;
  });
  const Pt = It;
  let St;
  let Lt;
  St = Pt.plinthH;
  Lt = Pt.plinthO;
  V.visible = St > 0.001;
  V.scale.set(20.3 + 2 * Lt, Math.max(St, 0.001), 11.8 + 2 * Lt);
  V.position.y = -St / 2;
  h.shadow.radius = (Pt.shadowSoft * l) / 2048;
  n.shadowMap.needsUpdate = true;
  (() => {
    for (let t = o; t && t !== document.documentElement; t = t.parentElement) {
      const e = getComputedStyle(t).backgroundColor;
      if (e && e !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(e)) {
        return void (Pt.colors.ground = e.replace(
          /^rgba\(([^,]+,[^,]+,[^,]+),[^)]*\)$/,
          "rgb($1)",
        ));
      }
    }
  })();
  const matches = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const Dt = (t) => new THREE.Vector3(t[0], t[1], t[2]);
  const Ot = {
    "front-office": 1,
    billing: 2,
    management: 4,
    clinical: 5,
  };
  let jt = JSON.parse(
    JSON.stringify({
      overview: {
        pos: [0, 31, 13.5],
        tgt: [0, 0, 0.3],
      },
      "front-office": {
        pos: [-7.84, 2.51, -8.5],
        tgt: [-5.74, 0.6, -2.09],
      },
      billing: {
        pos: [-1.89, 3.44, 6.35],
        tgt: [-5.82, 1.21, 2.82],
      },
      clinical: {
        pos: [-0.9, 3.53, 1.55],
        tgt: [2.98, 0.63, -3.11],
      },
      management: {
        pos: [12.01, 3.13, 5.97],
        tgt: [6.02, 1.21, 3.68],
      },
      intro: {
        pos: [-6.05, 3.36, -8.46],
        tgt: [-6.05, 1, -3],
      },
    }),
  );
  const zt = (t) => ({
    pos: Dt(jt[t].pos),
    tgt: Dt(jt[t].tgt),
  });
  const At = {
    side: Pt.modalSide,
    x: null,
    y: null,
  };
  function Bt(clientWidth, clientHeight) {
    const o_dataset = o.dataset;
    const r =
      o_dataset.clinicModalInset !== undefined ? +o_dataset.clinicModalInset : Pt.modalInset;
    const a = o_dataset.clinicModalWidth || `${Pt.modalW}%`;
    return {
      x:
        At.x !== null
          ? At.x
          : (/px$/.test(a) ? parseFloat(a) : (clientWidth * parseFloat(a)) / 100) + r,
      y:
        At.y !== null
          ? At.y
          : (clientHeight *
              (o_dataset.clinicModalPhoneHeight !== undefined
                ? +o_dataset.clinicModalPhoneHeight
                : Pt.modalH)) /
              100 +
            r,
    };
  }
  function Ft() {
    const t = Math.max(
      1,
      1.6 /
        (() => {
          const { clientWidth, clientHeight } = o;
          const n = clientWidth < 768;
          const r = n ? clientWidth : clientWidth - Bt(clientWidth, clientHeight).x * Gt.v;
          const a = n ? clientHeight - Bt(clientWidth, clientHeight).y * Gt.v : clientHeight;
          return r / Math.max(a, 1);
        })(),
    );
    if (ce === "free") {
      return Math.min(t, 1.25);
    }
    return t;
  }
  const Gt = {
    v: 0,
  };
  const Wt = zt("intro");
  let Zt = null;
  const Xt = new THREE.Spherical();
  const Ut = new THREE.Spherical();
  const qt = new THREE.Spherical();
  const Yt = new THREE.Vector3();
  function Nt(t) {
    const e = t ? "true" : "false";
    if (document.documentElement.dataset.clinicMoving !== e) {
      document.documentElement.dataset.clinicMoving = e;
      o.dataset.clinicMoving = e;
      if (!t) {
        o.dispatchEvent(
          new CustomEvent("clinic:arrived", {
            detail: {
              view: typeof ce === "string" ? ce : "overview",
            },
            bubbles: true,
          }),
        );
      }
    }
  }
  function $t(t, e, o) {
    Nt(true);
    Zt = {
      t: 0,
      dur: matches ? 0.001 : e,
      lift: o || 0,
      fromPos: Wt.pos.clone(),
      fromTgt: Wt.tgt.clone(),
      toPos: t.pos.clone(),
      toTgt: t.tgt.clone(),
    };
    Ut.setFromVector3(Yt.subVectors(Zt.fromPos, Zt.fromTgt));
    Zt.a = Ut.clone();
    qt.setFromVector3(Yt.subVectors(Zt.toPos, Zt.toTgt));
    Zt.b = qt.clone();
    let n = Zt.b.theta - Zt.a.theta;
    if (n > Math.PI) {
      n -= 2 * Math.PI;
    }
    if (n < -Math.PI) {
      n += 2 * Math.PI;
    }
    Zt.dTheta = n;
  }
  const Jt = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
  };
  o.addEventListener("pointermove", (t) => {
    if (t.pointerType !== "mouse" || matches) {
      return;
    }
    const e = o.getBoundingClientRect();
    Jt.tx = ((t.clientX - e.left) / e.width) * 2 - 1;
    Jt.ty = ((t.clientY - e.top) / e.height) * 2 - 1;
  });
  o.addEventListener("pointerleave", () => {
    Jt.tx = 0;
    Jt.ty = 0;
  });
  const _t = new THREE.Vector3();
  function Kt() {
    const t = Ft();
    Yt.subVectors(Wt.pos, Wt.tgt).multiplyScalar(t);
    if (ce !== "free") {
      Yt.applyAxisAngle(X, -Jt.x * THREE.MathUtils.degToRad(3));
      _t.crossVectors(Yt, X).normalize();
      Yt.applyAxisAngle(_t, Jt.y * THREE.MathUtils.degToRad(2));
    }
    s.position.copy(Wt.tgt).add(Yt);
    s.lookAt(Wt.tgt);
    u.target.copy(Wt.tgt);
  }
  const Qt = {};
  const te = {};
  Object.keys(Tt).forEach((t) => {
    Qt[t] = 1;
    te[t] = 1;
  });
  const ee = new THREE.Color();
  const oe = new THREE.Color();
  const ne = new THREE.Color();
  const re = {};
  const ae = (() => {
    const t = new THREE.Vector2(10.15, 5.9);
    const uniforms = {
      uReach: {
        value: 0,
      },
      uFade: {
        value: 1,
      },
      uWidth: {
        value: 1.4,
      },
      uStrength: {
        value: 0.85,
      },
      uFalloff: {
        value: 2.2,
      },
      uBlur: {
        value: 0.8,
      },
      uBreath: {
        value: 1,
      },
      uHalf: {
        value: t,
      },
      uCenter: {
        value: new THREE.Vector2(0, 0),
      },
      uColor: {
        value: e.screen.color,
      },
    };
    const n = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
      vertexShader:
        "uniform vec2 uCenter; varying vec2 vXZ;\n      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vXZ = w.xz - uCenter; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader:
        "uniform float uReach, uFade, uWidth, uStrength, uFalloff, uBlur, uBreath; uniform vec2 uHalf; uniform vec3 uColor; varying vec2 vXZ;\n      void main(){\n        float r = min(uBlur, min(uHalf.x, uHalf.y));\n        vec2 q = abs(vXZ) - uHalf + r;\n        float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;   // metres outside the rounded outline\n        float reach = max(uWidth * uReach, 1e-4);\n        if (d < -0.02 || d >= reach) discard;\n        float t = clamp(d / reach, 0.0, 1.0);\n        float a = uStrength * uBreath * uFade * pow(1.0 - t, uFalloff); // densest at the walls, thinning outward\n        a *= smoothstep(-0.02, 0.03 + 0.05 * uBlur, d);                  // just softens the seam where the glow meets the wall\n        gl_FragColor = vec4(uColor, a);\n      }",
    });
    const r = new THREE.PlaneGeometry(2 * t.x + 6, 2 * t.y + 6, 1, 1);
    r.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(r, n);
    mesh.position.set(0, 0.006, 0);
    mesh.renderOrder = 10;
    mesh.visible = false;
    mesh.name = "partnership-glow";
    i.add(mesh);
    return {
      mesh,
      uniforms,
      hover: false,
      on: false,
      t: 0,
    };
  })();
  const ie = {
    linear: (t) => t,
    out: (t) => 1 - (1 - t) ** 3,
    in: (t) => t * t * t,
    inout: (t) => {
      if (t < 0.5) {
        return 4 * t * t * t;
      }
      return 1 - (-2 * t + 2) ** 3 / 2;
    },
    outstrong: (t) => 1 - (1 - t) ** 5,
  };
  const se = (t) => t.target.closest && t.target.closest("[data-clinic-partnership]");
  document.addEventListener("pointerover", (t) => {
    if (t.pointerType === "mouse" && se(t)) {
      ae.hover = true;
      a();
    }
  });
  document.addEventListener("pointerout", (t) => {
    if (!(
      !se(t) ||
      (t.relatedTarget &&
        t.relatedTarget.closest &&
        t.relatedTarget.closest("[data-clinic-partnership]"))
    )) {
      ae.hover = false;
      a();
    }
  });
  document.addEventListener("focusin", (t) => {
    if (se(t)) {
      ae.hover = true;
      a();
    }
  });
  document.addEventListener("focusout", (t) => {
    if (se(t)) {
      ae.hover = false;
      a();
    }
  });
  ae.uniforms.uWidth.value = Pt.glowW;
  ae.uniforms.uBlur.value = Pt.glowR;
  ae.uniforms.uStrength.value = Pt.glowS;
  ae.uniforms.uFalloff.value = Pt.glowF;
  let ce = "overview";
  let ue = false;
  function he(view) {
    const e = ae.on ? "on" : "off";
    document.documentElement.dataset.clinicView = view;
    o.dataset.clinicView = view;
    document.documentElement.dataset.clinicGlow = e;
    o.dataset.clinicGlow = e;
    document
      .querySelectorAll("[data-role]:not(dialog), [data-clinic-partnership], [data-role-dismiss]")
      .forEach((e) => {
        const o =
          (e.dataset.role && e.dataset.role === view) ||
          (e.hasAttribute("data-clinic-partnership") && ae.on);
        e.classList.toggle("is-active", !!o);
        e.setAttribute("aria-pressed", o ? "true" : "false");
      });
    o.dispatchEvent(
      new CustomEvent("clinic:view", {
        detail: {
          view,
          partnership: ae.on,
        },
        bubbles: true,
      }),
    );
  }
  function le() {
    const t = ce === "free" ? 3 : Ot[ce];
    Object.keys(Qt).forEach((e) => {
      Qt[e] = !t || ae.on || +e === t ? 1 : 0;
    });
  }
  function de() {
    ce = "leaving-free";
    Wt.tgt.copy(u.target);
    Wt.pos.copy(Wt.tgt).add(Yt.subVectors(s.position, u.target).divideScalar(Ft()));
    ce = "free";
    u.enabled = false;
  }
  function fe(t) {
    ue = true;
    ae.on = false;
    if (ce === "free" && t !== "free") {
      de();
    }
    if (t !== ce) {
      const e = ce !== "overview";
      const o = t !== "overview";
      ce = t;
      $t(zt(t), 1.2, e && o ? 0.18 : 0.08);
    }
    le();
    he(ce);
    a();
  }
  const pe = {
    "front-office": new THREE.Vector3(-6.05, b + 0.6, -2.05),
    billing: new THREE.Vector3(-6.05, b + 0.6, 3.7),
    clinical: new THREE.Vector3(3.95, b + 0.6, -2.05),
    management: new THREE.Vector3(6.4, b + 0.6, 3.7),
    partnership: new THREE.Vector3(0, 0, 7.15),
  };
  const Ee = new THREE.Vector3();
  const we = new THREE.Vector3(0.42, 0.78, 3.33);
  const Me = new THREE.Sphere(we, 0.28);
  const me = new THREE.Raycaster();
  const ge = new THREE.Vector2();
  function ke(t) {
    if (ce === "free") {
      return false;
    }
    const e = n.domElement.getBoundingClientRect();
    ge.set(((t.clientX - e.left) / e.width) * 2 - 1, (-(t.clientY - e.top) / e.height) * 2 + 1);
    me.setFromCamera(ge, s);
    return me.ray.intersectsSphere(Me);
  }
  const ve = (() => {
    const t = 1024;
    const e = document.createElement("canvas");
    e.width = t;
    e.height = 683;
    const map = new THREE.CanvasTexture(e);
    map.anisotropy = n.capabilities.getMaxAnisotropy();
    const r = window.matchMedia("(pointer: coarse)").matches
      ? '<svg width="122" height="78" viewBox="0 0 122 78" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="4.5" y="4.5" width="33" height="69" rx="6.5" stroke="white"/> <path d="M21.0009 30C16.0304 30 12.0009 25.9706 12.0009 21C12.0009 16.0294 16.0304 12 21.0009 12C24.3322 12 27.2407 13.8099 28.7969 16.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M30 12V13.2782C30 15.47 30 16.566 29.2927 17.1651C28.5855 17.7643 27.5045 17.5841 25.3424 17.2237L24 17" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M21 21V20.2M20 21C20 20.4477 20.4477 20 21 20C21.5523 20 22 20.4477 22 21C22 21.5523 21.5523 22 21 22C20.4477 22 20 21.5523 20 21Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M20.4931 54V56.4211M20.4931 54V49C20.4931 48.1716 19.8215 47.5 18.9931 47.5C18.1646 47.5 17.4931 48.1716 17.4931 49V59L15.1854 56.8369C14.3869 56.238 13.2456 56.4616 12.7321 57.3174C12.4017 57.8681 12.4134 58.5587 12.7622 59.0979L15.3219 63.0095C16.3973 64.6529 16.935 65.4746 17.7433 65.9492C17.8245 65.9969 17.9074 66.0417 17.9918 66.0836C18.8315 66.5 19.8135 66.5 21.7775 66.5H22.4927C25.3017 66.5 26.7061 66.5 27.715 65.8259C28.1519 65.534 28.5269 65.1589 28.8188 64.7221C29.4928 63.7131 29.4927 62.3087 29.4926 59.4997L29.4925 58.6755C29.4925 58.0472 29.4925 57.733 29.4225 57.4754C29.2364 56.7908 28.7015 56.256 28.0169 56.07C27.7594 56 27.4452 56 26.8168 56M20.4931 54C21.4247 54 21.8906 54 22.258 54.1522C22.7481 54.3551 23.1374 54.7444 23.3405 55.2344C23.4927 55.6019 23.4928 56.0677 23.493 56.9993L23.4931 57.3546M26.4931 58L26.493 57.7667C26.4929 57.053 26.4929 56.6962 26.4028 56.4063C26.2073 55.7776 25.715 55.2854 25.0863 55.0901C24.7964 55 24.4396 55 23.7259 55" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <rect x="44.5" y="4.5" width="33" height="69" rx="6.5" stroke="white"/> <path d="M61 12V18" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M52 21H58" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M70 21H64" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M61 30V23.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M58 15L59.705 13.0482C60.3155 12.3494 60.6207 12 61 12C61.3793 12 61.6845 12.3494 62.295 13.0482L64 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M64 27L62.295 28.9518C61.6845 29.6506 61.3793 30 61 30C60.6207 30 60.3155 29.6506 59.705 28.9518L58 27" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M67 18L68.9518 19.705C69.6506 20.3155 70 20.6207 70 21C70 21.3793 69.6506 21.6845 68.9518 22.295L67 24" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M55 24L53.0482 22.295C52.3494 21.6845 52 21.3793 52 21C52 20.6207 52.3494 20.3155 53.0482 19.705L55 18" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M66.091 55.9999V56.9999M66.091 55.9999C66.091 54.8954 65.2227 53.9999 64.1516 53.9999C63.6161 53.9999 63.182 54.4477 63.182 54.9999L63.1816 55.9999V48.5C63.1816 47.6716 62.5304 47 61.7271 47C60.9237 47 60.2725 47.6716 60.2725 48.5L60.2727 50M66.091 55.9999C66.091 55.4765 66.5468 55.0783 67.0475 55.1643L67.3795 55.2214C68.3146 55.3821 69 56.2165 69 57.1942L68.9996 58.6667C68.9996 60.84 68.9996 61.9267 68.6786 62.7919C68.4924 63.2937 68.0011 63.9337 67.6083 64.3962C67.2685 64.7963 67.0603 65.3037 67.0603 65.8354V67M60.2727 50C60.2727 49.1715 59.6215 48.5 58.8182 48.5C58.0149 48.5 57.3637 49.1715 57.3637 50L57.3635 58.4623L55.7924 56.837C55.103 56.1238 53.9675 56.1889 53.3584 56.9764C52.8924 57.579 52.8796 58.4314 53.3271 59.0488L56.8177 63.647C57.4855 64.5267 57.8484 65.8827 57.8484 67M60.2727 50V54.9999" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <rect x="84.5" y="4.5" width="33" height="69" rx="6.5" stroke="white"/> <path d="M106 26L110 30" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M108 20C108 15.5817 104.418 12 100 12C95.5817 12 92 15.5817 92 20C92 24.4183 95.5817 28 100 28C104.418 28 108 24.4183 108 20Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M96.5 20H103.5M100 16.5V23.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M96.8712 57.6711L99.0051 59.5001L101.67 49.2853C101.867 48.5282 102.551 48 103.333 48C104.442 48 105.261 49.0344 105.007 50.1138L103.806 55.208L105.493 55.4777C107.422 55.767 108.386 55.9116 109.065 56.3186C110.187 56.9907 111 58.0001 111 59.4737C111 60.5001 110.746 61.1887 110.13 63.0388C109.738 64.2128 109.543 64.7998 109.224 65.2644C108.698 66.0294 107.923 66.5879 107.032 66.8444C106.49 67.0001 105.871 67.0001 104.634 67.0001H103.585C101.94 67.0001 101.117 67.0001 100.385 66.6982C100.253 66.6441 100.125 66.583 100 66.5152C99.304 66.1372 98.7853 65.4988 97.7479 64.222L94.3894 60.0884C93.8733 59.4533 93.8699 58.5442 94.3811 57.9051C94.9957 57.137 96.1244 57.0309 96.8712 57.6711Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M98.5578 50.0627C98.5578 50.0627 96.2824 50.3333 95.956 50.0119C95.7043 49.764 95.956 47.4906 95.956 47.4906M95.956 50.0119L99 47M91.4422 51.9373C91.4422 51.9373 93.7176 51.6667 94.044 51.9881C94.2957 52.236 94.044 54.5094 94.044 54.5094M94.044 51.9881L91 55" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>'
      : '<svg width="122" height="78" viewBox="0 0 122 78" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="4.5" y="4.5" width="33" height="69" rx="6.5" stroke="white"/> <path d="M21.0009 30C16.0304 30 12.0009 25.9706 12.0009 21C12.0009 16.0294 16.0304 12 21.0009 12C24.3322 12 27.2407 13.8099 28.7969 16.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M30 12V13.2782C30 15.47 30 16.566 29.2927 17.1651C28.5855 17.7643 27.5045 17.5841 25.3424 17.2237L24 17" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M21 21V20.2M20 21C20 20.4477 20.4477 20 21 20C21.5523 20 22 20.4477 22 21C22 21.5523 21.5523 22 21 22C20.4477 22 20 21.5523 20 21Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M19 47.0908C19.6655 47.0238 20.3389 47 21 47C21.9247 47 22.8373 47.0776 23.7349 47.1882C26.1758 47.4889 28.0694 49.5196 28.2593 51.9112C28.3909 53.5683 28.5 55.268 28.5 57C28.5 58.732 28.3909 60.4317 28.2593 62.0888C28.0694 64.4803 26.1758 66.511 23.7349 66.8118C22.8373 66.9223 21.9247 67 21 67C20.0752 67 19.1626 66.9223 18.265 66.8118C15.8242 66.511 13.9305 64.4803 13.7406 62.0888C13.609 60.4317 13.5 58.732 13.5 57C13.5 56.3283 13.5164 55.6614 13.5441 55" stroke="white" stroke-width="1.5" stroke-linecap="round"/> <path d="M21 47V56" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14 56H28" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M14.5 52.5C15.8807 52.5 17 51.3807 17 50C17 48.6193 15.8807 47.5 14.5 47.5C13.1193 47.5 12 48.6193 12 50C12 51.3807 13.1193 52.5 14.5 52.5Z" stroke="white" stroke-width="1.5"/> <rect x="44.5" y="4.5" width="33" height="69" rx="6.5" stroke="white"/> <path d="M61 12V18" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M52 21H58" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M70 21H64" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M61 30V23.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M58 15L59.705 13.0482C60.3155 12.3494 60.6207 12 61 12C61.3793 12 61.6845 12.3494 62.295 13.0482L64 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M64 27L62.295 28.9518C61.6845 29.6506 61.3793 30 61 30C60.6207 30 60.3155 29.6506 59.705 28.9518L58 27" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M67 18L68.9518 19.705C69.6506 20.3155 70 20.6207 70 21C70 21.3793 69.6506 21.6845 68.9518 22.295L67 24" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M55 24L53.0482 22.295C52.3494 21.6845 52 21.3793 52 21C52 20.6207 52.3494 20.3155 53.0482 19.705L55 18" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M62.5 47.0908C61.8345 47.0238 61.1611 47 60.5 47C59.5753 47 58.6627 47.0776 57.7651 47.1882C55.3242 47.4889 53.4306 49.5196 53.2407 51.9112C53.1091 53.5683 53 55.268 53 57C53 58.732 53.1091 60.4317 53.2407 62.0888C53.4306 64.4803 55.3242 66.511 57.7651 66.8118C58.6627 66.9223 59.5753 67 60.5 67C61.4248 67 62.3374 66.9223 63.235 66.8118C65.6758 66.511 67.5695 64.4803 67.7594 62.0888C67.891 60.4317 68 58.732 68 57C68 56.3283 67.9836 55.6614 67.9558 55" stroke="white" stroke-width="1.5" stroke-linecap="round"/> <path d="M60.5 47V56" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M67.5 56H53.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M66.5 52.5C65.1193 52.5 64 51.3807 64 50C64 48.6193 65.1193 47.5 66.5 47.5C67.8807 47.5 69 48.6193 69 50C69 51.3807 67.8807 52.5 66.5 52.5Z" stroke="white" stroke-width="1.5"/> <rect x="84.5" y="4.5" width="33" height="69" rx="6.5" stroke="white"/> <path d="M106 26L110 30" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M108 20C108 15.5817 104.418 12 100 12C95.5817 12 92 15.5817 92 20C92 24.4183 95.5817 28 100 28C104.418 28 108 24.4183 108 20Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M96.5 20H103.5M100 16.5V23.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M100.5 47V51M100.5 55V57" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M93.2406 62.0888C93.4305 64.4803 95.3242 66.511 97.765 66.8118C98.6626 66.9223 99.5752 67 100.5 67C101.425 67 102.337 66.9223 103.235 66.8118C105.676 66.511 107.569 64.4803 107.759 62.0888C107.891 60.4317 108 58.732 108 57C108 55.268 107.891 53.5683 107.759 51.9112C107.569 49.5196 105.676 47.4889 103.235 47.1882C102.337 47.0776 101.425 47 100.5 47C99.5752 47 98.6626 47.0776 97.765 47.1882C95.3242 47.4889 93.4305 49.5196 93.2406 51.9112C93.109 53.5683 93 55.268 93 57C93 58.732 93.109 60.4317 93.2406 62.0888Z" stroke="white" stroke-width="1.5"/> <path d="M102 52.5C102 52.0341 102 51.8011 101.924 51.6173C101.822 51.3723 101.628 51.1776 101.383 51.0761C101.199 51 100.966 51 100.5 51C100.034 51 99.8011 51 99.6173 51.0761C99.3723 51.1776 99.1776 51.3723 99.0761 51.6173C99 51.8011 99 52.0341 99 52.5V53.5C99 53.9659 99 54.1989 99.0761 54.3827C99.1776 54.6277 99.3723 54.8224 99.6173 54.9239C99.8011 55 100.034 55 100.5 55C100.966 55 101.199 55 101.383 54.9239C101.628 54.8224 101.822 54.6277 101.924 54.3827C102 54.1989 102 53.9659 102 53.5V52.5Z" stroke="white" stroke-width="1.5"/> </svg>';
    const s = new Image();
    s.onload = () => {
      const n = e.getContext("2d");
      n.clearRect(0, 0, t, 683);
      if (!s.complete || !s.naturalWidth) {
        return;
      }
      const r = 860.16;
      const i = (78 * r) / 122;
      n.drawImage(s, (t - r) / 2, (683 - i) / 2, r, i);
      map.needsUpdate = true;
      a();
    };
    s.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r.replace('width="122" height="78"', 'width="1220" height="780"'))}`;
    const m_1 = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -6,
      polygonOffsetUnits: -6,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.18), m_1);
    plane.rotation.order = "YXZ";
    plane.rotation.set(-Math.PI / 2, -0.45, 0);
    plane.position.set(we.x, 0.776, we.z);
    plane.renderOrder = 11;
    plane.visible = false;
    i.add(plane);
    return {
      plane,
      m: m_1,
    };
  })();
  const ye = (() => {
    function sources(t, e) {
      const o = [...document.querySelectorAll(`[${t}]`)]
        .map((e) => e.currentSrc || e.src || e.getAttribute(t))
        .filter(Boolean);
      if (o.length) {
        return o;
      }
      const n = document.querySelector(`[${e}]`);
      if (n) {
        return n
          .getAttribute(e)
          .split(/[\s,]+/)
          .filter(Boolean);
      }
      return [];
    }
    function loadAll(t) {
      const e = t.map(() => []);
      const o = new THREE.ImageLoader();
      o.setCrossOrigin("anonymous");
      t.forEach((t, n) =>
        o.load(t, (t) => {
          e[n].forEach((e) => e(t));
          a();
        }),
      );
      return e;
    }
    function slotTexture(t, e) {
      const o = new THREE.Texture(t);
      const r = t.width / t.height;
      if (r > e) {
        o.repeat.set(e / r, 1);
        o.offset.set((1 - e / r) / 2, 0);
      } else {
        o.repeat.set(1, r / e);
        o.offset.set(0, (1 - r / e) / 2);
      }
      o.anisotropy = n.capabilities.getMaxAnisotropy();
      o.needsUpdate = true;
      return o;
    }
    const r = sources("data-clinic-photo", "data-clinic-photos");
    const i = r.length || 5;
    const mats = [];
    const meshes = [];
    const u = Array.from(
      {
        length: 5,
      },
      (t, e) =>
        ((t) => {
          const e = [
            ["#f4c9a8", "#e9a27c", "#8f9b7a"],
            ["#c8dbe6", "#9fc0d6", "#7d8f6e"],
            ["#f1dcb5", "#e6b98a", "#a19476"],
            ["#d9cfe6", "#b9a9d2", "#8a8f7c"],
            ["#cfe3d6", "#a8cdb8", "#7f8c71"],
          ][t % 5];
          const o = document.createElement("canvas");
          o.width = o.height = 512;
          const n = o.getContext("2d");
          const r = n.createLinearGradient(0, 0, 0, 512);
          r.addColorStop(0, e[0]);
          r.addColorStop(1, e[1]);
          n.fillStyle = r;
          n.fillRect(0, 0, 512, 512);
          n.fillStyle = "rgba(255,255,255,.75)";
          n.beginPath();
          n.arc(150 + (t % 5) * 50, 150, 54, 0, 2 * Math.PI);
          n.fill();
          n.fillStyle = e[2];
          n.beginPath();
          n.moveTo(0, 380);
          n.quadraticCurveTo(160, 300 - (t % 5) * 10, 300, 360);
          n.quadraticCurveTo(420, 410, 512, 340);
          n.lineTo(512, 512);
          n.lineTo(0, 512);
          n.fill();
          n.fillStyle = "rgba(52,49,46,.75)";
          [
            [300, 1],
            [350, 0.85],
          ].forEach(([t, e]) => {
            n.beginPath();
            n.arc(t, 330 - 70 * e, 20 * e, 0, 2 * Math.PI);
            n.fill();
            n.fillRect(t - 22 * e, 335 - 50 * e, 44 * e, 90 * e);
          });
          return o;
        })(e),
    );
    const h = loadAll(r);
    at.forEach((t, e) => {
      const n = q(7919 * e + 11);
      const a = [...Array(i).keys()];
      for (let t = a.length - 1; t > 0; t--) {
        const e = Math.floor(n() * (t + 1));
        [a[t], a[e]] = [a[e], a[t]];
      }
      rt.forEach(([n, l, d, f], p) => {
        const E = d - 0.03;
        const w = f - 0.03;
        const M = E / w;
        const m = a[p % i];
        const g = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4,
        });
        g.map = slotTexture(u[(m + e) % 5], M);
        if (r.length) {
          h[m].push((t) => {
            g.map = slotTexture(t, M);
            g.needsUpdate = true;
          });
        }
        const k = new THREE.Mesh(new THREE.PlaneGeometry(E, w), g);
        k.position.set(n, l, 0.047);
        k.renderOrder = 11;
        k.visible = false;
        t.add(k);
        mats.push(g);
        meshes.push(k);
      });
    });
    return {
      mats,
      meshes,
      opacity: 0,
      sources,
      loadAll,
      slotTexture,
    };
  })();
  !(() => {
    const t = 0.56 / 0.8;
    const e = ye.sources("data-clinic-poster", "data-clinic-posters");
    const o = ye.loadAll(e);
    mt.forEach((n, r) => {
      const a = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });
      a.map = ye.slotTexture(
        ((t) => {
          const e = [
            ["#e9e2d6", "#c96f5f", "#3d3a37"],
            ["#dfe6e3", "#5f8fa3", "#3d3a37"],
            ["#ece4d2", "#c9a24f", "#3d3a37"],
          ][t % 3];
          const o = document.createElement("canvas");
          o.width = 700;
          o.height = 1000;
          const n = o.getContext("2d");
          n.fillStyle = e[0];
          n.fillRect(0, 0, 700, 1000);
          n.fillStyle = e[1];
          n.beginPath();
          n.arc(350, 400, 210 - 20 * t, 0, 2 * Math.PI);
          n.fill();
          n.fillStyle = e[2];
          n.fillRect(80, 720, 420, 36);
          n.globalAlpha = 0.5;
          [790, 830, 870].forEach((t, e) => n.fillRect(80, t, 540 - 90 * e, 16));
          n.globalAlpha = 1;
          return o;
        })(r),
        t,
      );
      if (e.length) {
        o[r % e.length].push((e) => {
          a.map = ye.slotTexture(e, t);
          a.needsUpdate = true;
        });
      }
      const i = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.8), a);
      i.position.set(0, 0.98, 0.026);
      i.renderOrder = 11;
      i.visible = false;
      n.add(i);
      ye.mats.push(a);
      ye.meshes.push(i);
    });
  })();
  let Ce = null;
  n.domElement.addEventListener("pointerdown", (t) => {
    Ce = [t.clientX, t.clientY];
  });
  n.domElement.addEventListener("pointerup", (t) => {
    !Ce ||
      Math.hypot(t.clientX - Ce[0], t.clientY - Ce[1]) > 6 ||
      (ke(t) &&
        ((ue = true),
        (ae.on = false),
        (ce = "free"),
        $t(
          {
            tgt: we.clone(),
            pos: we.clone().add(new THREE.Vector3(0, 0.85, 0.62).applyAxisAngle(X, -0.45)),
          },
          1.6,
          0.1,
        ),
        le(),
        he("free"),
        a()));
  });
  n.domElement.addEventListener("pointermove", (t) => {
    if (t.pointerType === "mouse") {
      n.domElement.style.cursor = ke(t) ? "pointer" : "";
    }
  });
  document.addEventListener("keydown", (t) => {
    if (t.key === "Escape" && ce === "free") {
      fe("overview");
    }
  });
  u.addEventListener("change", () => {
    if (ce !== "free") {
      return;
    }
    const u_target = u.target;
    u_target.x = THREE.MathUtils.clamp(u_target.x, y, T);
    u_target.z = THREE.MathUtils.clamp(u_target.z, R, x);
    u_target.y = THREE.MathUtils.clamp(u_target.y, 0, 3);
  });
  document.addEventListener("click", (t) => {
    const e = t.target.closest(
      "[data-role]:not(dialog), [data-role-dismiss], [data-clinic-partnership]",
    );
    e &&
      (e.hasAttribute("data-role-dismiss")
        ? fe("overview")
        : e.hasAttribute("data-clinic-partnership")
          ? ((ue = true),
            ae.on ||
              ((ae.on = true),
              ce === "free" && de(),
              ce !== "overview" && ((ce = "overview"), $t(zt("overview"), 1.2, 0)),
              le(),
              he(ce),
              a()))
          : Ot[e.dataset.role] && fe(e.dataset.role));
  });
  he("overview");
  if (!matches) {
    Nt(true);
  }
  if (matches) {
    const t = zt("overview");
    Wt.pos.copy(t.pos);
    Wt.tgt.copy(t.tgt);
  } else {
    new IntersectionObserver(
      (t, e) => {
        if (t.some((t) => t.isIntersecting)) {
          e.disconnect();
          if (!ue) {
            (() => {
              ce = "overview";
              ae.on = false;
              he("overview");
              Object.keys(Qt).forEach((t) => {
                Qt[t] = 1;
              });
              const t = zt("intro");
              Wt.pos.copy(t.pos);
              Wt.tgt.copy(t.tgt);
              $t(zt("overview"), 3.2, 0);
              a();
            })();
          }
        }
      },
      {
        threshold: 0.35,
      },
    ).observe(o);
  }
  function Te() {
    const { clientWidth, clientHeight } = o;
    if (clientWidth && clientHeight) {
      n.setSize(clientWidth, clientHeight, false);
      s.aspect = clientWidth / clientHeight;
      s.updateProjectionMatrix();
      (() => {
        const o_dataset = o.dataset;
        const e = document.querySelector("[data-clinic-modal]");
        At.side = o_dataset.clinicModalSide || Pt.modalSide;
        At.x = At.y = null;
        if (!(e && e.offsetWidth && e.offsetParent && e.offsetParent.contains(o))) {
          return;
        }
        const { clientWidth, clientHeight } = o;
        const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = e;
        At.side = offsetLeft + offsetWidth / 2 > clientWidth / 2 ? "right" : "left";
        At.x =
          offsetWidth +
          Math.max(0, At.side === "right" ? clientWidth - offsetLeft - offsetWidth : offsetLeft);
        At.y = offsetHeight + Math.max(0, clientHeight - offsetTop - offsetHeight);
      })();
      a();
    }
  }
  u.enabled = false;
  window.addEventListener("resize", Te);
  if (window.ResizeObserver) {
    new ResizeObserver(() => Te()).observe(o);
  }
  let Re = true;
  new IntersectionObserver((t) => {
    Re = t.some((t) => t.isIntersecting);
    if (Re) {
      a();
    }
  }).observe(o);
  Te();
  let He = performance.now();
  !(function t(c) {
    c = c || performance.now();
    if (!Re) {
      He = c;
      return void requestAnimationFrame(t);
    }
    const h = Math.min(0.05, (c - He) / 1000);
    He = c;
    let l = false;
    if (Zt) {
      ((t) => {
        Zt.t = Math.min(1, Zt.t + t / Zt.dur);
        const e = (n = Zt.t) < 0.5 ? 4 * n * n * n : 1 - (-2 * n + 2) ** 3 / 2;
        const o = Math.sin(Math.PI * e);
        var n;
        Wt.tgt.lerpVectors(Zt.fromTgt, Zt.toTgt, e);
        Xt.radius = THREE.MathUtils.lerp(Zt.a.radius, Zt.b.radius, e) * (1 + Zt.lift * o);
        Xt.phi = THREE.MathUtils.lerp(Zt.a.phi, Zt.b.phi, e) - 0.25 * Zt.lift * o;
        Xt.theta = Zt.a.theta + Zt.dTheta * e;
        Wt.pos.copy(Wt.tgt).add(Yt.setFromSpherical(Xt));
        if (Zt.t === 1) {
          Zt = null;
          Nt(false);
          if (ce === "free") {
            u.enabled = true;
            Kt();
            u.update();
          }
        }
      })(h);
      l = true;
    }
    if (Zt) {
      Kt();
    } else if (ce === "free") {
      u.update();
    } else {
      if (
        ((t) => {
          const e = 1 - Math.exp(4 * -t);
          Jt.x += (Jt.tx - Jt.x) * e;
          Jt.y += (Jt.ty - Jt.y) * e;
          return Math.abs(Jt.tx - Jt.x) > 0.0001 || Math.abs(Jt.ty - Jt.y) > 0.0001;
        })(h)
      ) {
        l = true;
      }
      Kt();
    }
    if (
      ((t) => {
        const e = (ce !== "overview" && ce !== "free") || ae.on ? 1 : 0;
        const n = e - Gt.v;
        if (Math.abs(n) < 0.001) {
          Gt.v = e;
        } else {
          Gt.v += n * (1 - Math.exp(-t * (matches ? 60 : 3.2)));
        }
        const { clientWidth, clientHeight } = o;
        const i = clientWidth < 768;
        const c = Bt(clientWidth, clientHeight);
        const u = i ? 0 : 0.5 * c.x * Gt.v * (At.side === "right" ? 1 : -1);
        const h = i ? 0.5 * c.y * Gt.v : 0;
        if (u || h) {
          s.setViewOffset(clientWidth, clientHeight, u, h, clientWidth, clientHeight);
        } else if (s.view) {
          s.clearViewOffset();
        }
        return Math.abs(n) >= 0.001;
      })(h)
    ) {
      l = true;
    }
    if (
      ((t) => {
        const e = Ot[ce];
        const o = Pt.focusMode !== "off" && e && !ae.on;
        ne.set(Pt.focusMode === "tint" ? Pt.focusTint : Pt.colors.ground || "#eae4df");
        let n = false;
        Object.keys(xt).forEach((r) => {
          const a = o && +r !== e ? Pt.focusAmt : 0;
          let i = re[r] || 0;
          const s = a - i;
          if (Math.abs(s) > 0.002) {
            i += s * (1 - Math.exp(-t * (matches ? 60 : 4)));
            n = true;
          } else {
            i = a;
          }
          re[r] = i;
          Object.values(xt[r]).forEach((t) => t.color.copy(t.userData.src.color).lerp(ne, i));
        });
        return n;
      })(h)
    ) {
      l = true;
    }
    if (
      ((t) => {
        const e = ce !== "free" || Zt ? 0 : 1;
        const opacity = ve.m.opacity;
        if (opacity === e) {
          return ((ve.plane.visible = opacity > 0), false);
        }
        return (
          (ve.plane.visible = true),
          (ve.m.opacity = e ? Math.min(1, opacity + t / 0.5) : Math.max(0, opacity - t / 0.25)),
          true
        );
      })(h)
    ) {
      l = true;
    }
    if (
      ((t) => {
        const e = ce !== "free" || Zt ? 0 : 1;
        const ye_opacity = ye.opacity;
        return (
          ye_opacity !== e &&
          ((ye.opacity = e
            ? Math.min(1, ye_opacity + t / 0.6)
            : Math.max(0, ye_opacity - t / 0.25)),
          ye.mats.forEach((t) => {
            t.opacity = ye.opacity;
          }),
          ye.meshes.forEach((t) => {
            t.visible = ye.opacity > 0;
          }),
          true)
        );
      })(h)
    ) {
      l = true;
    }
    if (
      ((t) => {
        ee.copy(e.screen.color);
        let o = false;
        Object.keys(Tt).forEach((n) => {
          const r = xt[n] && xt[n][e.device.uuid];
          oe.copy(r ? r.color : e.device.color).multiplyScalar(0.88);
          const a = Qt[n] - te[n];
          if (Math.abs(a) > 0.002) {
            te[n] += a * (1 - Math.exp(-t * (matches ? 60 : 6)));
            o = true;
          } else {
            te[n] = Qt[n];
          }
          Tt[n].color.copy(oe).lerp(ee, te[n]);
        });
        return o;
      })(h)
    ) {
      l = true;
    }
    if (
      ((t) => {
        const ae_uniforms = ae.uniforms;
        const o = ae.on || ae.hover;
        ae.pIn = ae.pIn || 0;
        ae.pOut = ae.pOut || 0;
        if (!o && ae.pIn === 0) {
          ae.mesh.visible = false;
          return false;
        }
        ae.mesh.visible = true;
        const n = ie[Pt.glowEaseIn] || ie.out;
        const r = ie[Pt.glowEaseOut] || ie.inout;
        let a;
        if (o) {
          ae.pOut = Math.max(0, ae.pOut - t / 0.15);
          ae.pIn = matches ? 1 : Math.min(1, ae.pIn + t / (Pt.glowIn || It.glowIn));
          a = ae.pIn < 1 || ae.pOut > 0;
        } else {
          ae.pOut = matches ? 1 : Math.min(1, ae.pOut + t / (Pt.glowOut || It.glowOut));
          if (ae.pOut === 1) {
            ae.pIn = 0;
            ae.pOut = 0;
            ae_uniforms.uReach.value = 0;
            ae_uniforms.uFade.value = 1;
            ae.mesh.visible = false;
            return true;
          }
          a = true;
        }
        ae_uniforms.uReach.value = n(ae.pIn);
        ae_uniforms.uFade.value = 1 - r(ae.pOut);
        if (!a && !matches && Pt.glowB > 0) {
          return (
            (ae.t += (2 * t * Math.PI) / (Pt.glowP || It.glowP)),
            (ae_uniforms.uBreath.value = 1 - Pt.glowB * (0.5 - 0.5 * Math.cos(ae.t))),
            true
          );
        }
        return (a || (ae_uniforms.uBreath.value = 1), a);
      })(h)
    ) {
      l = true;
    }
    if (l) {
      a();
    }
    if (r) {
      r = false;
      n.render(i, s);
      (() => {
        const t = document.querySelectorAll("[data-clinic-anchor]");
        if (!t.length) {
          return;
        }
        const { clientWidth, clientHeight } = o;
        t.forEach((t) => {
          const o =
            t.dataset.role ||
            (t.hasAttribute("data-clinic-partnership") ? "partnership" : null);
          if (o && pe[o]) {
            Ee.copy(pe[o]).project(s);
            t.style.setProperty("--clinic-x", `${(((Ee.x + 1) / 2) * clientWidth).toFixed(1)}px`);
            t.style.setProperty("--clinic-y", `${(((1 - Ee.y) / 2) * clientHeight).toFixed(1)}px`);
          }
        });
      })();
    }
    requestAnimationFrame(t);
  })();
})();
