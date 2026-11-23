import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
      opacity: 0.14,
      wireframe: false
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: '#F3E5AB',
      transparent: true,
      opacity: 0.08
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

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      camera.position.x = mouse.x * 1.1;
      camera.position.y = -mouse.y * 0.7 - scrollY * 0.0015;
      camera.lookAt(0, -scrollY * 0.0015, 0);

      ringGroup.rotation.z = t * 0.04;
      torus1.rotation.y = Math.PI / 6 + t * 0.05;
      torus2.rotation.x = -Math.PI / 4 - t * 0.035;

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
