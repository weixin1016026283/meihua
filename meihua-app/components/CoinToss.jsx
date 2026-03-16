"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const FRONT_IMG = "/coins/coin-front.jpg";
const BACK_IMG = "/coins/coin-back.jpg";
const EDGE_IMG = "/coins/coin-edge.jpg";

// Physics
const GRAVITY = -16;
const BOUNCE_DAMPING = 0.3;
const SPIN_FRICTION = 0.97;
const COIN_RADIUS = 1.0;
const COIN_THICKNESS = 0.22;
const TABLE_Y = 0;
const NUM_COINS = 3;
const TOTAL_ROUNDS = 6;

const LAND_X = [-2.6, 0, 2.6];
const LAND_Z = [3.15, 2.9, 3.2];

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

function getMinY(rotX) {
  const sinA = Math.abs(Math.sin(rotX));
  const cosA = Math.abs(Math.cos(rotX));
  return TABLE_Y + COIN_RADIUS * sinA + (COIN_THICKNESS / 2) * cosA + 0.005;
}

function makePhysicsState() {
  return {
    phase: "idle", vy: 0, spinX: 0, spinZ: 0, bounceCount: 0,
    targetRotX: 0, result: null, landX: 0, landZ: 0,
    delay: 0, elapsed: 0, settleTime: 0,
  };
}

function getYaoValue(coins) {
  const frontCount = coins.filter(c => c === 'front').length;
  return [6, 8, 7, 9][frontCount]; // 0F=老阴6, 1F=少阴8, 2F=少阳7, 3F=老阳9
}

const ORD_ZH = ['一', '二', '三', '四', '五', '六'];
const ORD_EN = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
const YAO_ZH = { 9: '老阳', 7: '少阳', 8: '少阴', 6: '老阴' };
const YAO_EN = { 9: 'Old Yang', 7: 'Young Yang', 8: 'Young Yin', 6: 'Old Yin' };
const COIN_ZH = { front: '正', back: '背' };
const COIN_EN = { front: 'Heads', back: 'Tails' };

export default function CoinToss({ onComplete, lang = 'en' }) {
  const containerRef = useRef(null);
  const physicsRef = useRef(Array.from({ length: NUM_COINS }, makePhysicsState));
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Refs for animation loop (synchronous reads)
  const roundRef = useRef(0);
  const phaseRef = useRef('ready'); // 'ready' | 'tossing' | 'landed' | 'complete'
  const yaoLinesRef = useRef([]);
  const shakeLastRef = useRef(0);
  const motionSetupRef = useRef(false);

  // State for UI rendering
  const [ui, setUi] = useState({
    round: 0, phase: 'ready', yaoLines: [], lastCoins: null, lastYao: null,
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 9, 10);
    camera.lookAt(0, 0, 0);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Lights (even, bright white) ---
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(2, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-4, 8, 2);
    scene.add(fillLight);

    const backFill = new THREE.DirectionalLight(0xffffff, 0.4);
    backFill.position.set(0, 6, -6);
    scene.add(backFill);

    // --- Table ---
    const table = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.0 })
    );
    table.rotation.x = -Math.PI / 2;
    table.position.z = 3;
    table.receiveShadow = true;
    scene.add(table);

    // --- Textures ---
    const loader = new THREE.TextureLoader();
    const frontTex = loader.load(FRONT_IMG);
    frontTex.center.set(0.5, 0.5);
    const backTex = loader.load(BACK_IMG);
    backTex.center.set(0.5, 0.5);
    const edgeTex = loader.load(EDGE_IMG);
    edgeTex.wrapS = THREE.RepeatWrapping;
    edgeTex.repeat.set(10, 1);

    // --- Coin geometry & materials ---
    const coinGeo = new THREE.CylinderGeometry(COIN_RADIUS, COIN_RADIUS, COIN_THICKNESS, 64, 1);
    const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTex, color: 0xf0d8d0, metalness: 0.15, roughness: 0.4 });
    const frontMat = new THREE.MeshStandardMaterial({ map: frontTex, metalness: 0.1, roughness: 0.5, color: 0xffffff });
    const backMat = new THREE.MeshStandardMaterial({ map: backTex, metalness: 0.1, roughness: 0.5, color: 0xffffff });

    const coins = [];
    for (let i = 0; i < NUM_COINS; i++) {
      const coin = new THREE.Mesh(coinGeo, [edgeMat, frontMat, backMat]);
      coin.castShadow = true;
      coin.receiveShadow = true;
      coin.position.set(LAND_X[i], getMinY(0), LAND_Z[i]);
      coin.rotation.set(0, Math.random() * Math.PI * 2, 0);
      scene.add(coin);
      coins.push(coin);
    }

    // --- Toss logic (shared by tap and shake) ---
    const triggerToss = () => {
      if (phaseRef.current === 'tossing') return;
      if (phaseRef.current === 'complete') return;

      phaseRef.current = 'tossing';
      const physics = physicsRef.current;

      for (let i = 0; i < NUM_COINS; i++) {
        const p = physics[i];
        p.phase = "tossing";
        p.vy = 12 + Math.random() * 4;
        p.spinX = (14 + Math.random() * 12) * (Math.random() > 0.5 ? 1 : -1);
        p.spinZ = (Math.random() - 0.5) * 2;
        p.bounceCount = 0;
        p.result = Math.random() > 0.5 ? "front" : "back";
        p.targetRotX = p.result === "front" ? 0 : Math.PI;
        p.landX = LAND_X[i] + (Math.random() - 0.5) * 0.4;
        p.landZ = LAND_Z[i] + (Math.random() - 0.5) * 0.3;
        p.delay = i * 0.06;
        p.elapsed = 0;
        p.settleTime = 0;

        coins[i].position.set(
          (Math.random() - 0.5) * 0.5,
          getMinY(0) + 0.3,
          3 + (Math.random() - 0.5) * 0.3
        );
        coins[i].rotation.set(0, Math.random() * Math.PI * 2, 0);
      }

      setUi(prev => ({ ...prev, phase: 'tossing', lastCoins: null, lastYao: null }));
    };

    // --- Shake handler ---
    const onShake = (e) => {
      if (phaseRef.current === 'tossing' || phaseRef.current === 'complete') return;
      const now = Date.now();
      if (now - shakeLastRef.current < 1200) return;
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      if (mag > 20) {
        shakeLastRef.current = now;
        triggerToss();
      }
    };

    const setupMotion = () => {
      if (motionSetupRef.current) return;
      motionSetupRef.current = true;
      window.addEventListener('devicemotion', onShake);
    };

    // --- Click/tap handler ---
    const onPointerDown = async () => {
      // iOS 13+ requires explicit permission for DeviceMotion
      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function' &&
        !motionSetupRef.current
      ) {
        try {
          const perm = await DeviceMotionEvent.requestPermission();
          if (perm === 'granted') setupMotion();
        } catch (_) {}
      }
      triggerToss();
    };

    // Android / non-iOS: motion available without permission
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission !== 'function'
    ) {
      setupMotion();
    }

    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // --- Animation loop ---
    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const physics = physicsRef.current;
      let doneCount = 0;

      for (let i = 0; i < NUM_COINS; i++) {
        const p = physics[i];
        const coin = coins[i];

        if (p.phase === "tossing") {
          p.elapsed += dt;
          if (p.elapsed < p.delay) continue;

          p.vy += GRAVITY * dt;
          coin.position.y += p.vy * dt;
          coin.rotation.x += p.spinX * dt;
          coin.rotation.z += p.spinZ * dt;
          p.spinZ *= 0.995;
          coin.position.x += (p.landX - coin.position.x) * 0.02;
          coin.position.z += (p.landZ - coin.position.z) * 0.02;

          const minY = getMinY(coin.rotation.x);
          if (coin.position.y <= minY && p.vy < 0) {
            coin.position.y = minY;
            p.bounceCount++;
            if (p.bounceCount >= 3 || Math.abs(p.vy) < 1.5) {
              p.phase = "settling";
              p.vy = 0;
              p.settleTime = 0;
            } else {
              p.vy = -p.vy * BOUNCE_DAMPING;
              p.spinX *= 0.5;
              p.spinZ *= 0.3;
            }
          }
        } else if (p.phase === "settling") {
          p.spinX *= SPIN_FRICTION;
          const normX = normalizeAngle(coin.rotation.x, p.targetRotX);
          const diff = p.targetRotX - normX;
          const torqueStrength = Math.abs(p.spinX) < 1 ? 8 : 3;
          p.spinX += diff * torqueStrength * dt;
          if (Math.abs(diff) < 0.5) p.spinX *= 0.94;
          coin.rotation.x += p.spinX * dt;

          p.spinZ *= 0.88;
          coin.rotation.z += p.spinZ * dt;
          coin.rotation.z *= 0.93;

          const minY = getMinY(coin.rotation.x);
          coin.position.y = Math.max(coin.position.y, minY);
          coin.position.y += (minY - coin.position.y) * 0.12;
          coin.position.x += (p.landX - coin.position.x) * 0.05;
          coin.position.z += (p.landZ - coin.position.z) * 0.05;

          p.settleTime += dt;
          const finalDiff = Math.abs(p.targetRotX - normalizeAngle(coin.rotation.x, p.targetRotX));
          if ((finalDiff < 0.015 && Math.abs(p.spinX) < 0.05) || p.settleTime > 3) {
            p.phase = "done";
            coin.rotation.x = p.targetRotX;
            coin.rotation.z = 0;
            coin.position.x = p.landX;
            coin.position.z = p.landZ;
            coin.position.y = getMinY(p.targetRotX);
          }
        } else if (p.phase === "idle" || p.phase === "done") {
          const restY = getMinY(coin.rotation.x);
          coin.position.y = restY + Math.sin(clock.elapsedTime * 1.5 + i * 0.7) * 0.002;
          doneCount++;
        }
      }

      // All coins settled — record yao for this round
      if (doneCount === NUM_COINS && phaseRef.current === 'tossing') {
        const allDone = physics.every(p => p.phase === "done");
        if (allDone) {
          const coinResults = physics.map(p => p.result);
          const yao = getYaoValue(coinResults);
          yaoLinesRef.current = [...yaoLinesRef.current, yao];
          roundRef.current++;

          if (roundRef.current >= TOTAL_ROUNDS) {
            phaseRef.current = 'complete';
            const finalYao = [...yaoLinesRef.current];
            setUi({ round: TOTAL_ROUNDS, phase: 'complete', yaoLines: finalYao, lastCoins: coinResults, lastYao: yao });
            if (onCompleteRef.current) onCompleteRef.current(finalYao);
          } else {
            phaseRef.current = 'landed';
            setUi({ round: roundRef.current, phase: 'landed', yaoLines: [...yaoLinesRef.current], lastCoins: coinResults, lastYao: yao });
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // --- Resize ---
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("devicemotion", onShake);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // --- Derive display strings ---
  const isZh = lang === 'zh';
  const ord = isZh ? ORD_ZH : ORD_EN;
  const yaoName = isZh ? YAO_ZH : YAO_EN;
  const coinName = isZh ? COIN_ZH : COIN_EN;

  const tapOrShake = isMobile
    ? (isZh ? '点击或摇晃手机' : 'Tap or shake')
    : (isZh ? '点击' : 'Tap');

  const hint = (() => {
    if (ui.phase === 'ready') return isZh ? `${tapOrShake}掷出第${ord[0]}爻` : `${tapOrShake} to cast ${ord[0]} line`;
    if (ui.phase === 'tossing') return '...';
    if (ui.phase === 'landed') return isZh ? `${tapOrShake}掷出第${ord[ui.round]}爻` : `${tapOrShake} to cast ${ord[ui.round]} line`;
    if (ui.phase === 'complete') return isZh ? '卦象已成' : 'Hexagram complete';
    return '';
  })();

  // Build per-line result labels
  const lineLabels = ui.yaoLines.map((yao, i) => {
    const coinStr = (i === ui.round - 1 && ui.lastCoins)
      ? ui.lastCoins.map(c => coinName[c]).join(' ')
      : null;
    return { yao, label: yaoName[yao], coinStr };
  });

  return (
    <div style={{
      width: "100%", height: "100%",
      position: "relative", overflow: "hidden",
      cursor: ui.phase === 'complete' ? 'default' : 'pointer',
    }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Round counter — top left */}
      <div style={{
        position: "absolute", top: 12, left: 16,
        fontSize: 13, color: '#8e8e93', fontFamily: FONT,
        pointerEvents: "none",
      }}>
        {ui.round} / {TOTAL_ROUNDS}
      </div>

      {/* Hexagram progress + results — top right */}
      {lineLabels.length > 0 && (
        <div style={{
          position: "absolute", top: 10, right: 16,
          display: "flex", flexDirection: "column-reverse", gap: 6,
          pointerEvents: "none", alignItems: "flex-end",
        }}>
          {lineLabels.map(({ yao, label, coinStr }, i) => {
            const isYang = yao === 7 || yao === 9;
            const isChanging = yao === 6 || yao === 9;
            const color = isChanging ? '#c0392b' : '#3a3a3c';
            const isLatest = i === lineLabels.length - 1;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11, fontFamily: FONT,
                  color: isLatest ? '#3a3a3c' : '#aeaeb2',
                  whiteSpace: 'nowrap',
                }}>
                  {coinStr ? `${coinStr} → ` : ''}{label}
                </span>
                {isYang ? (
                  <div style={{ width: 36, height: 4, background: color, borderRadius: 1, flexShrink: 0 }} />
                ) : (
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <div style={{ width: 14, height: 4, background: color, borderRadius: 1 }} />
                    <div style={{ width: 14, height: 4, background: color, borderRadius: 1 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hint — bottom center, clearly visible */}
      <div style={{
        position: "absolute", bottom: 16, left: 0, right: 0,
        display: "flex", justifyContent: "center", pointerEvents: "none",
      }}>
        <div style={{
          color: "#6e6e73", fontSize: 13, fontFamily: FONT, fontWeight: 500,
          background: "rgba(255,255,255,0.85)",
          padding: "6px 16px", borderRadius: 8,
        }}>
          {hint}
        </div>
      </div>
    </div>
  );
}

function normalizeAngle(angle, target) {
  let a = angle % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;
  const candidates = [a, a - Math.PI * 2, a + Math.PI * 2];
  let best = a, bestDist = Infinity;
  for (const c of candidates) {
    const d = Math.abs(c - target);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best;
}
