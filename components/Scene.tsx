'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BagModels } from './BagModels';
import { useCustomizerStore } from '@/store/useCustomizerStore';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function Scene() {
  const { activeMenu } = useCustomizerStore();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    const target = controlsRef.current.target;
    const camera = controlsRef.current.object;

    const onUpdate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
    };

    // GSAP transitions based on active menu
    switch (activeMenu) {
      case 'colors': // Angled view
        gsap.to(camera.position, { x: 3, y: 2, z: 3, duration: 1.5, ease: 'power3.inOut', onUpdate });
        gsap.to(target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut', onUpdate });
        break;
      case 'logos': // Close up front
        gsap.to(camera.position, { x: 0, y: 0, z: 2.5, duration: 1.5, ease: 'power3.inOut', onUpdate });
        gsap.to(target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut', onUpdate });
        break;
      case 'options': // Full view
        gsap.to(camera.position, { x: -3, y: 1, z: 4, duration: 1.5, ease: 'power3.inOut', onUpdate });
        gsap.to(target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut', onUpdate });
        break;
      default: // Default front view
        gsap.to(camera.position, { x: 0, y: 0, z: 4, duration: 1.5, ease: 'power3.inOut', onUpdate });
        gsap.to(target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut', onUpdate });
        break;
    }
  }, [activeMenu]);

  return (
    <div className="w-full h-full absolute inset-0 z-0 pb-[40vh] md:pb-0">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 4], fov: 45 }} 
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <Environment preset="city" />
        
        <BagModels />
        
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <OrbitControls 
          ref={controlsRef}
          makeDefault
          autoRotate
          autoRotateSpeed={1.5}
          enablePan={false}
          minDistance={2}
          maxDistance={6}
          maxPolarAngle={Math.PI / 2 + 0.1}
        />
      </Canvas>
    </div>
  );
}
