'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BagModels } from './BagModels';
import { useCustomizerStore } from '@/store/useCustomizerStore';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function SceneLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial color="#d4d4d4" wireframe />
    </mesh>
  );
}

function CameraController() {
  const activeMenu = useCustomizerStore((s) => s.activeMenu);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    const target = controlsRef.current.target;
    const camera = controlsRef.current.object;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(target);

    const onUpdate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
    };

    switch (activeMenu) {
      case 'colors':
        gsap.to(camera.position, { x: 3.5, y: 2, z: 3.5, duration: 1.5, ease: 'power3.inOut', onUpdate });
        gsap.to(target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut', onUpdate });
        break;
      case 'logos':
        gsap.to(camera.position, { x: 0, y: 0, z: 3, duration: 1.5, ease: 'power3.inOut', onUpdate });
        gsap.to(target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut', onUpdate });
        break;
      case 'options':
        gsap.to(camera.position, { x: -3.5, y: 1, z: 4.5, duration: 1.5, ease: 'power3.inOut', onUpdate });
        gsap.to(target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut', onUpdate });
        break;
      default:
        gsap.to(camera.position, { x: 0, y: 0, z: 5, duration: 1.5, ease: 'power3.inOut', onUpdate });
        gsap.to(target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut', onUpdate });
        break;
    }

    return () => {
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(target);
    };
  }, [activeMenu]);

  return (
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
  );
}

export function Scene() {
  return (
    <div className="w-full h-full absolute inset-0 z-0" data-scene>
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={<SceneLoader />}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Environment preset="city" />

          <BagModels />

          <ContactShadows position={[0, -1.7, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        </Suspense>
        <CameraController />
      </Canvas>
    </div>
  );
}
