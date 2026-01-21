import { useEffect, useRef } from 'react';

export default function ParticleSystem() {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Create particles more frequently with varying intensity
      if (Math.random() > 0.80) {
        createParticle(e.clientX, e.clientY);
      }
    };

    const createParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'particle-spark particle-spark-animate';
      
      // Varied sizes with glow effect
      const size = Math.random() * 6 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      
      // Vary velocity for more dynamic effect
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 150 + 80;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      // Random glow intensity
      const glowIntensity = Math.random() * 0.6 + 0.4;
      particle.style.boxShadow = `0 0 ${size * 2}px rgba(220, 38, 38, ${glowIntensity})`;
      
      document.body.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => particle.remove(), 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <div ref={containerRef} />;
}
