import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

export function useDynamicTexture(color: string) {
  const { canvas, texture } = useMemo(() => {
    if (typeof document === 'undefined') {
      return { canvas: null, texture: new THREE.Texture() };
    }
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, texture: tex };
  }, []);
  
  // High resolution for crisp textures
  const size = 1024;
  
  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBackground = () => {
      // Fill background color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, size, size);

      // Draw Monogram Pattern
      ctx.fillStyle = 'rgba(74, 44, 17, 0.15)'; // Subtle dark brown
      ctx.font = 'bold 32px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = -40; i <= size + 40; i += 80) {
        for (let j = -40; j <= size + 40; j += 80) {
          const offsetX = (Math.abs(j) / 80) % 2 === 0 ? 0 : 40;
          ctx.fillText('GG', i + offsetX, j);
          
          // Diamond dots
          ctx.beginPath();
          ctx.arc(i + offsetX + 40, j + 40, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Center Stripe (Green - Red - Green)
      const stripeWidth = 120;
      const centerX = size / 2;
      
      ctx.fillStyle = '#115740'; // Deep Green
      ctx.fillRect(centerX - stripeWidth/2, 0, stripeWidth/3, size);
      ctx.fillStyle = '#8B0000'; // Deep Red
      ctx.fillRect(centerX - stripeWidth/6, 0, stripeWidth/3, size);
      ctx.fillStyle = '#115740'; // Deep Green
      ctx.fillRect(centerX + stripeWidth/6, 0, stripeWidth/3, size);
    };

    const updateTexture = () => {
      // eslint-disable-next-line
      texture.needsUpdate = true;
    };

    // Draw synchronously
    drawBackground();
    updateTexture();

  }, [color, canvas, texture, size]);

  return texture;
}
