import React, { useRef, useState } from 'react';

const Tilt3DCard = ({
  children,
  className = '',
  maxTilt = 8,
  scale = 1.02,
  onClick,
  style = {}
}) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState(
    'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  );
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * (maxTilt * 2);
    const rotateX = (0.5 - py) * (maxTilt * 2);

    setTransform(
      `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
    );
    setGlare({ x: px * 100, y: py * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-3d-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        transform,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        position: 'relative'
      }}
    >
      {children}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          opacity: glare.opacity,
          transition: 'opacity 0.3s ease',
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(243, 229, 171, 0.16) 0%, rgba(212, 175, 55, 0.04) 40%, transparent 72%)`,
          zIndex: 5
        }}
      />
    </div>
  );
};

export default Tilt3DCard;
