import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { BagPattern } from '@/store/useCustomizerStore';

function createLeatherNormalMap(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  let seed = 42;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const grain = (rand() - 0.5) * 18;
      const pore =
        Math.sin(x * 0.25 + y * 0.1) * Math.cos(y * 0.3 - x * 0.05) * 10 +
        Math.sin(x * 0.6 + y * 0.4) * 4;
      data[idx]     = Math.max(0, Math.min(255, 128 + grain + pore));
      data[idx + 1] = Math.max(0, Math.min(255, 128 + grain - pore));
      data[idx + 2] = 255;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function drawPattern(ctx: CanvasRenderingContext2D, pattern: BagPattern, size: number) {
  const patternColor = 'rgba(0, 0, 0, 0.08)';

  switch (pattern) {
    case 'monogram': {
      ctx.fillStyle = patternColor;
      ctx.font = 'bold 32px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = -40; i <= size + 40; i += 80) {
        for (let j = -40; j <= size + 40; j += 80) {
          const offsetX = (Math.abs(j) / 80) % 2 === 0 ? 0 : 40;
          ctx.fillText('GG', i + offsetX, j);
          ctx.beginPath();
          ctx.arc(i + offsetX + 40, j + 40, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Green-Red-Green stripe
      const stripeWidth = 120;
      const centerX = size / 2;
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#115740';
      ctx.fillRect(centerX - stripeWidth / 2, 0, stripeWidth / 3, size);
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(centerX - stripeWidth / 6, 0, stripeWidth / 3, size);
      ctx.fillStyle = '#115740';
      ctx.fillRect(centerX + stripeWidth / 6, 0, stripeWidth / 3, size);
      ctx.globalAlpha = 1.0;
      break;
    }

    case 'stripes': {
      const stripeW = 40;
      for (let i = 0; i < size; i += stripeW * 2) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.fillRect(i, 0, stripeW, size);
      }
      // Accent center stripe
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(size / 2 - 20, 0, 40, size);
      ctx.globalAlpha = 1.0;
      break;
    }

    case 'diamond': {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.lineWidth = 2;
      const spacing = 60;
      // Diagonal lines one direction
      for (let i = -size; i < size * 2; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + size, size);
        ctx.stroke();
      }
      // Diagonal lines other direction
      for (let i = -size; i < size * 2; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, size);
        ctx.lineTo(i + size, 0);
        ctx.stroke();
      }
      // Small dots at intersections
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      for (let x = 0; x < size; x += spacing / 2) {
        for (let y = 0; y < size; y += spacing / 2) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'dots': {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
      const dotSpacing = 50;
      const dotRadius = 8;
      for (let x = dotSpacing / 2; x < size; x += dotSpacing) {
        for (let y = dotSpacing / 2; y < size; y += dotSpacing) {
          const offsetX = (Math.floor(y / dotSpacing) % 2) * (dotSpacing / 2);
          ctx.beginPath();
          ctx.arc(x + offsetX, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'checker': {
      const cellSize = 64;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      for (let x = 0; x < size; x += cellSize) {
        for (let y = 0; y < size; y += cellSize) {
          if ((x / cellSize + y / cellSize) % 2 === 0) {
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
      break;
    }

    case 'plain':
    default:
      // No pattern — just the solid color
      break;
  }
}

const TEXTURE_SIZE = 1024;

export function useDynamicTexture(color: string, pattern: BagPattern = 'monogram') {
  const { canvas, texture } = useMemo(() => {
    if (typeof document === 'undefined') {
      return { canvas: null, texture: new THREE.Texture() };
    }
    const c = document.createElement('canvas');
    c.width = TEXTURE_SIZE;
    c.height = TEXTURE_SIZE;
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, texture: tex };
  }, []);

  const normalMap = useMemo(() => {
    if (typeof document === 'undefined') return new THREE.Texture();
    return createLeatherNormalMap();
  }, []);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

    drawPattern(ctx, pattern, TEXTURE_SIZE);

    texture.needsUpdate = true;
  }, [color, pattern, canvas, texture]);

  useEffect(() => {
    return () => {
      texture.dispose();
      normalMap.dispose();
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [texture, normalMap, canvas]);

  return { texture, normalMap };
}
