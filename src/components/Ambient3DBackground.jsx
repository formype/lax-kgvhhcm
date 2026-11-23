import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function drawStar(ctx, cx, cy, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function createFlagTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep crimson silk base
  const bgGrad = ctx.createLinearGradient(0, 0, 768, 512);
  bgGrad.addColorStop(0, '#a6141c');
  bgGrad.addColorStop(0.5, '#850e14');
  bgGrad.addColorStop(1, '#5e080d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 768, 512);

  // Subtle silk highlight
  const sheen = ctx.createRadialGradient(384, 256, 20, 384, 256, 360);
  sheen.addColorStop(0, 'rgba(255, 215, 130, 0.14)');
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 768, 512);

  // Golden emblem
  const goldGrad = ctx.createLinearGradient(260, 140, 508, 372);
  goldGrad.addColorStop(0, '#F7E7B4');
  goldGrad.addColorStop(0.5, '#D4AF37');
  goldGrad.addColorStop(1, '#B8891E');
  ctx.fillStyle = goldGrad;
  ctx.shadowColor = 'rgba(243, 229, 171, 0.45)';
  ctx.shadowBlur = 18;

  if (type === 'nation') {
    drawStar(ctx, 384, 256, 118, 46);
  } else {
    ctx.font = '700 220px "Segoe UI Symbol", "Arial Unicode MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☭', 384, 266);
  }

  // Soft edge feathering so the flag blends seamlessly into the background
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = 'destination-in';
  const mask = ctx.createRadialGradient(384, 256, 110, 384, 256, 380);
  mask.addColorStop(0, 'rgba(255, 255, 255, 1)');
  mask.addColorStop(0.68, 'rgba(255, 255, 255, 0.72)');
  mask.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, 768, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const Ambient3DBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 16;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Subtle 3D Golden Rings in deep space
    const ringGroup = new THREE.Group();
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: '#D4AF37',
      transparent: true,
      opacity: 0.12
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: '#F3E5AB',
      transparent: true,
      opacity: 0.07
    });

    const torus1 = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.02, 12, 120), ringMat1);
    torus1.rotation.x = Math.PI / 3;
    torus1.rotation.y = Math.PI / 6;
    ringGroup.add(torus1);

    const torus2 = new THREE.Mesh(new THREE.TorusGeometry(9.8, 0.018, 12, 120), ringMat2);
    torus2.rotation.x = -Math.PI / 4;
    torus2.rotation.y = -Math.PI / 5;
    ringGroup.add(torus2);
    scene.add(ringGroup);

    // Subtle lighting so waving silk folds catch realistic highlights
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.1);
    scene.add(ambientLight);
    const windLight = new THREE.DirectionalLight('#ffe4b5', 1.2);
    windLight.position.set(2, 6, 10);
    scene.add(windLight);

    // Subtle waving 3D Flags (Party Flag & National Flag)
    const partyTex = createFlagTexture('party');
    const nationTex = createFlagTexture('nation');

    const flagW = 18.0;
    const flagH = 12.0;
    const partyGeo = new THREE.PlaneGeometry(flagW, flagH, 40, 26);
    const nationGeo = new THREE.PlaneGeometry(flagW, flagH, 40, 26);

    const partyMat = new THREE.MeshStandardMaterial({
      map: partyTex,
      transparent: true,
      opacity: 0.28,
      roughness: 0.48,
      metalness: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const nationMat = new THREE.MeshStandardMaterial({
      map: nationTex,
      transparent: true,
      opacity: 0.28,
      roughness: 0.48,
      metalness: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const flagsGroup = new THREE.Group();

    const partyFlag = new THREE.Mesh(partyGeo, partyMat);
    partyFlag.position.set(-7.5, 2.8, -5.2);
    partyFlag.rotation.set(0.06, 0.24, -0.04);
    flagsGroup.add(partyFlag);

    const nationFlag = new THREE.Mesh(nationGeo, nationMat);
    nationFlag.position.set(7.5, -2.4, -5.2);
    nationFlag.rotation.set(-0.05, -0.24, 0.04);
    flagsGroup.add(nationFlag);

    scene.add(flagsGroup);

    // 3D Floating Golden Dust Particles across Z-depth
    const count = 320;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
      speeds[i] = 0.003 + Math.random() * 0.006;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: '#F3E5AB',
      size: 0.09,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(geo, pMat);
    scene.add(particles);

    // Smooth mouse & scroll parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollY = window.scrollY;

    const onMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    let animId;
    const clock = new THREE.Clock();

    const waveFlag = (flagGeo, time, phaseOffset, reverseDirection = false) => {
      const pos = flagGeo.attributes.position;
      const halfW = flagW / 2;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // Wind travels from anchor edge toward free edge with increasing amplitude
        const factor = reverseDirection
          ? 0.25 + 0.75 * ((halfW - x) / flagW)
          : 0.25 + 0.75 * ((x + halfW) / flagW);
        const dir = reverseDirection ? 1 : -1;
        const primaryWave = Math.sin(x * 0.52 + dir * time * 2.1 + phaseOffset) * 0.65;
        const secondaryRipple = Math.sin(x * 1.15 - y * 0.6 + dir * time * 3.1 + phaseOffset) * 0.22;
        const verticalFlutter = Math.cos(y * 0.45 + time * 1.4 + phaseOffset) * 0.14;
        pos.setZ(i, (primaryWave + secondaryRipple + verticalFlutter) * factor);
      }
      pos.needsUpdate = true;
      flagGeo.computeVertexNormals();
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const scrollOffset = scrollY * 0.0014;
      camera.position.x = mouse.x * 1.05;
      camera.position.y = -mouse.y * 0.65 - scrollOffset;
      camera.lookAt(0, -scrollOffset, 0);

      // Keep only the 2 flags fixed in the viewport while rings & particles scroll
      flagsGroup.position.y = -scrollOffset;

      ringGroup.rotation.z = t * 0.04;
      torus1.rotation.y = Math.PI / 6 + t * 0.05;
      torus2.rotation.x = -Math.PI / 4 - t * 0.035;

      // Realistic wind fluttering on both flags
      waveFlag(partyGeo, t, 0, false);
      waveFlag(nationGeo, t, 1.8, true);

      const posAttr = geo.attributes.position;
      for (let i = 0; i < count; i++) {
        let y = posAttr.array[i * 3 + 1] + speeds[i];
        if (y > 12) y = -12;
        posAttr.array[i * 3 + 1] = y;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      geo.dispose();
      pMat.dispose();
      partyGeo.dispose();
      nationGeo.dispose();
      partyMat.dispose();
      nationMat.dispose();
      partyTex.dispose();
      nationTex.dispose();
      torus1.geometry.dispose();
      torus2.geometry.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default Ambient3DBackground;
