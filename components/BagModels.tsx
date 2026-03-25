'use client';

import { useRef, Suspense, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { RoundedBox, Cylinder, Torus, Decal } from '@react-three/drei';
import * as THREE from 'three';
import { useCustomizerStore } from '@/store/useCustomizerStore';
import { useDynamicTexture } from '@/hooks/useDynamicTexture';

function DecalImage({ url, position, scale, rotation = [0, 0, 0], depth = 0.15 }: { url: string, position: [number, number, number], scale: number, rotation?: [number, number, number], depth?: number }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return (
    <Decal position={position} rotation={rotation} scale={[scale, scale, depth]}>
      <meshStandardMaterial
        map={texture}
        transparent
        polygonOffset
        polygonOffsetFactor={-1}
        depthTest={true}
        depthWrite={false}
      />
    </Decal>
  );
}

type BagProps = {
  materials: {
    body: THREE.MeshStandardMaterial;
    straps: THREE.MeshStandardMaterial;
    strapsSmooth: THREE.MeshStandardMaterial;
    zippers: THREE.MeshStandardMaterial;
    zippersDull: THREE.MeshStandardMaterial;
  };
  logo: string | null;
  logoPosition: { x: number; y: number };
  logoScale: number;
};

export function BagModels() {
  const { model, colors, logo, logoPosition, logoScale } = useCustomizerStore();
  const groupRef = useRef<THREE.Group>(null);

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  const bodyTexture = useDynamicTexture(colors.body);

  const materials = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ map: bodyTexture, roughness: 0.8 }),
    straps: new THREE.MeshStandardMaterial({ color: colors.straps, roughness: 0.9 }),
    strapsSmooth: new THREE.MeshStandardMaterial({ color: colors.straps, roughness: 0.6 }),
    zippers: new THREE.MeshStandardMaterial({ color: colors.zippers, metalness: 1, roughness: 0.2 }),
    zippersDull: new THREE.MeshStandardMaterial({ color: colors.zippers, metalness: 0.8, roughness: 0.2 })
  }), [bodyTexture, colors.straps, colors.zippers]);

  return (
    <group ref={groupRef}>
      {model === 'backpack' && <Backpack materials={materials} logo={logo} logoPosition={logoPosition} logoScale={logoScale} />}
      {model === 'tote' && <ToteBag materials={materials} logo={logo} logoPosition={logoPosition} logoScale={logoScale} />}
      {model === 'messenger' && <MessengerBag materials={materials} logo={logo} logoPosition={logoPosition} logoScale={logoScale} />}
      {model === 'bauletto' && <BaulettoBag materials={materials} logo={logo} logoPosition={logoPosition} logoScale={logoScale} />}
      {model === 'cassiopea' && <CassiopeaBag materials={materials} logo={logo} logoPosition={logoPosition} logoScale={logoScale} />}
    </group>
  );
}

function Backpack({ materials, logo, logoPosition, logoScale }: BagProps) {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Main Body */}
      <RoundedBox args={[1.4, 1.8, 0.8]} radius={0.3} smoothness={4} position={[0, 0, 0]}>
        <primitive object={materials.body} attach="material" />
      </RoundedBox>
      
      {/* Leather Base */}
      <RoundedBox args={[1.42, 0.3, 0.82]} radius={0.1} smoothness={4} position={[0, -0.75, 0]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>

      {/* Front Pocket */}
      <RoundedBox args={[1.1, 0.9, 0.3]} radius={0.2} smoothness={4} position={[0, -0.2, 0.4]}>
        <primitive object={materials.body} attach="material" />
        {logo && (
          <Suspense fallback={null}>
            <DecalImage 
              url={logo} 
              position={[(logoPosition.x - 0.5) * 1.0, (0.5 - logoPosition.y) * 0.8, 0.15]} 
              scale={logoScale * 0.8} 
            />
          </Suspense>
        )}
      </RoundedBox>

      {/* Front Pocket Zipper */}
      <RoundedBox args={[1.12, 0.04, 0.31]} radius={0.01} smoothness={4} position={[0, 0.25, 0.4]}>
        <primitive object={materials.zippersDull} attach="material" />
      </RoundedBox>

      {/* Leather Patch on Front Pocket */}
      <RoundedBox args={[0.4, 0.25, 0.02]} radius={0.02} smoothness={4} position={[0, -0.2, 0.56]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>

      {/* Top Handle */}
      <group position={[0, 0.95, -0.1]}>
        <mesh>
          <torusGeometry args={[0.2, 0.04, 16, 32, Math.PI]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[-0.2, -0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[0.2, -0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
      </group>

      {/* Shoulder Straps */}
      {/* Left Strap */}
      <group position={[-0.35, 0.3, -0.45]}>
        <mesh rotation={[0.2, 0.1, -0.1]}>
          <cylinderGeometry args={[0.1, 0.1, 1.4, 16]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
      </group>
      {/* Right Strap */}
      <group position={[0.35, 0.3, -0.45]}>
        <mesh rotation={[0.2, -0.1, 0.1]}>
          <cylinderGeometry args={[0.1, 0.1, 1.4, 16]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
      </group>

      {/* Side Pockets */}
      <RoundedBox args={[0.2, 0.7, 0.5]} radius={0.08} smoothness={4} position={[-0.7, -0.3, 0]}>
        <primitive object={materials.body} attach="material" />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.7, 0.5]} radius={0.08} smoothness={4} position={[0.7, -0.3, 0]}>
        <primitive object={materials.body} attach="material" />
      </RoundedBox>
    </group>
  );
}

function ToteBag({ materials, logo, logoPosition, logoScale }: BagProps) {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Flatten the cylinder to make it a tote shape */}
      <mesh position={[0, 0, 0]} scale={[1, 1, 0.4]}>
        <cylinderGeometry args={[1.0, 0.8, 1.4, 32]} />
        <primitive object={materials.body} attach="material" />
        {logo && (
          <Suspense fallback={null}>
            <DecalImage 
              url={logo} 
              position={[(logoPosition.x - 0.5) * 1.6, (0.5 - logoPosition.y) * 1.2, 1.0]} 
              scale={logoScale * 1.0} 
              depth={0.5}
            />
          </Suspense>
        )}
      </mesh>

      {/* Leather Base */}
      <mesh position={[0, -0.65, 0]} scale={[1, 1, 0.4]}>
        <cylinderGeometry args={[0.81, 0.81, 0.2, 32]} />
        <primitive object={materials.strapsSmooth} attach="material" />
      </mesh>

      {/* Leather Trim (Top Edge) */}
      <mesh position={[0, 0.68, 0]} scale={[1, 1, 0.4]}>
        <cylinderGeometry args={[1.02, 1.02, 0.1, 32]} />
        <primitive object={materials.strapsSmooth} attach="material" />
      </mesh>

      {/* Gold Rings */}
      <mesh position={[-0.5, 0.75, 0.4]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[0.5, 0.75, 0.4]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[-0.5, 0.75, -0.4]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[0.5, 0.75, -0.4]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>

      {/* Leather Tabs Front */}
      <RoundedBox args={[0.15, 0.3, 0.05]} radius={0.02} position={[-0.5, 0.55, 0.4]}>
        <primitive object={materials.strapsSmooth} attach="material" />
      </RoundedBox>
      <RoundedBox args={[0.15, 0.3, 0.05]} radius={0.02} position={[0.5, 0.55, 0.4]}>
        <primitive object={materials.strapsSmooth} attach="material" />
      </RoundedBox>
      
      {/* Leather Tabs Back */}
      <RoundedBox args={[0.15, 0.3, 0.05]} radius={0.02} position={[-0.5, 0.55, -0.4]}>
        <primitive object={materials.strapsSmooth} attach="material" />
      </RoundedBox>
      <RoundedBox args={[0.15, 0.3, 0.05]} radius={0.02} position={[0.5, 0.55, -0.4]}>
        <primitive object={materials.strapsSmooth} attach="material" />
      </RoundedBox>

      {/* Front Handle */}
      <group position={[0, 0.81, 0.4]}>
        <mesh>
          <torusGeometry args={[0.5, 0.04, 16, 32, Math.PI]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
        <mesh position={[-0.5, -0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
        <mesh position={[0.5, -0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
        {/* Handle loops through rings */}
        <mesh position={[-0.5, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.04, 0.02, 16, 32, Math.PI]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
        <mesh position={[0.5, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.04, 0.02, 16, 32, Math.PI]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
      </group>
      
      {/* Back Handle */}
      <group position={[0, 0.81, -0.4]}>
        <mesh>
          <torusGeometry args={[0.5, 0.04, 16, 32, Math.PI]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
        <mesh position={[-0.5, -0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
        <mesh position={[0.5, -0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
        {/* Handle loops through rings */}
        <mesh position={[-0.5, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.04, 0.02, 16, 32, Math.PI]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
        <mesh position={[0.5, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.04, 0.02, 16, 32, Math.PI]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
      </group>

      {/* Hanging Leather Tag */}
      <group position={[-0.5, 0.4, 0.45]} rotation={[0, 0, 0.2]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.2]} />
          <primitive object={materials.strapsSmooth} attach="material" />
        </mesh>
        <RoundedBox args={[0.2, 0.3, 0.02]} radius={0.02} position={[0, -0.1, 0]}>
          <primitive object={materials.strapsSmooth} attach="material" />
        </RoundedBox>
      </group>
    </group>
  );
}

function MessengerBag({ materials, logo, logoPosition, logoScale }: BagProps) {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Main Body (Inner) */}
      <RoundedBox args={[1.8, 1.3, 0.6]} radius={0.15} smoothness={4} position={[0, -0.1, 0]}>
        <primitive object={materials.body} attach="material" />
      </RoundedBox>

      {/* Leather Base */}
      <RoundedBox args={[1.82, 0.2, 0.62]} radius={0.05} smoothness={4} position={[0, -0.65, 0]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>

      {/* Front Pocket Under Flap */}
      <RoundedBox args={[1.5, 0.8, 0.2]} radius={0.1} smoothness={4} position={[0, -0.2, 0.35]}>
        <primitive object={materials.body} attach="material" />
      </RoundedBox>

      {/* Flap (Covers top and front) */}
      <group position={[0, 0.55, -0.3]}>
        {/* The pivot is at the top back edge */}
        <RoundedBox args={[1.85, 1.4, 0.1]} radius={0.05} smoothness={4} position={[0, -0.6, 0.35]} rotation={[-0.15, 0, 0]}>
          <primitive object={materials.body} attach="material" />
          {logo && (
            <Suspense fallback={null}>
              <DecalImage 
                url={logo} 
                position={[(logoPosition.x - 0.5) * 1.6, (0.5 - logoPosition.y) * 1.2, 0.05]} 
                scale={logoScale * 1.0} 
                depth={0.08}
              />
            </Suspense>
          )}
        </RoundedBox>
        
        {/* Leather Trim at the bottom of the flap */}
        <RoundedBox args={[1.86, 0.15, 0.12]} radius={0.05} smoothness={4} position={[0, -1.25, 0.45]} rotation={[-0.15, 0, 0]}>
          <primitive object={materials.straps} attach="material" />
        </RoundedBox>

        {/* Leather Straps on Front Flap */}
        <RoundedBox args={[0.18, 0.9, 0.06]} radius={0.02} smoothness={4} position={[-0.45, -0.6, 0.42]} rotation={[-0.15, 0, 0]}>
          <primitive object={materials.straps} attach="material" />
        </RoundedBox>
        <RoundedBox args={[0.18, 0.9, 0.06]} radius={0.02} smoothness={4} position={[0.45, -0.6, 0.42]} rotation={[-0.15, 0, 0]}>
          <primitive object={materials.straps} attach="material" />
        </RoundedBox>

        {/* Metal Buckles */}
        <mesh position={[-0.45, -1.0, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.03, 16, 4]} />
          <primitive object={materials.zippers} attach="material" />
        </mesh>
        <mesh position={[0.45, -1.0, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.03, 16, 4]} />
          <primitive object={materials.zippers} attach="material" />
        </mesh>
      </group>

      {/* Top Handle */}
      <group position={[0, 0.7, 0.05]}>
        <mesh>
          <torusGeometry args={[0.3, 0.04, 16, 32, Math.PI]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[-0.3, -0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[0.3, -0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        {/* Leather Patches at Base */}
        <RoundedBox args={[0.12, 0.04, 0.12]} radius={0.01} position={[-0.3, -0.1, 0]}>
          <primitive object={materials.straps} attach="material" />
        </RoundedBox>
        <RoundedBox args={[0.12, 0.04, 0.12]} radius={0.01} position={[0.3, -0.1, 0]}>
          <primitive object={materials.straps} attach="material" />
        </RoundedBox>
      </group>

      {/* Hardware Rings for Shoulder Strap */}
      <mesh position={[-0.95, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 32]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[0.95, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 32]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>

      {/* Leather Patches holding the rings */}
      <RoundedBox args={[0.05, 0.15, 0.15]} radius={0.02} position={[-0.95, 0.2, 0]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>
      <RoundedBox args={[0.05, 0.15, 0.15]} radius={0.02} position={[0.95, 0.2, 0]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>

      {/* Shoulder Strap (Flattened Torus) */}
      <group position={[0, 0.38, 0]}>
        <mesh scale={[1, 1.5, 0.2]}>
          <torusGeometry args={[0.95, 0.08, 16, 64, Math.PI]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[-0.95, -0.05, 0]} scale={[1, 1, 0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[0.95, -0.05, 0]} scale={[1, 1, 0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        {/* Strap loops through rings */}
        <mesh position={[-0.95, -0.08, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 0.2]}>
          <torusGeometry args={[0.06, 0.04, 16, 32, Math.PI]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[0.95, -0.08, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 0.2]}>
          <torusGeometry args={[0.06, 0.04, 16, 32, Math.PI]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function BaulettoBag({ materials, logo, logoPosition, logoScale }: BagProps) {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Main Body */}
      <RoundedBox args={[1.6, 1.1, 0.7]} radius={0.15} smoothness={4} position={[0, 0, 0]}>
        <primitive object={materials.body} attach="material" />
        {logo && (
          <Suspense fallback={null}>
            <DecalImage 
              url={logo} 
              position={[(logoPosition.x - 0.5) * 1.4, (0.5 - logoPosition.y) * 0.9, 0.35]} 
              scale={logoScale * 0.9} 
            />
          </Suspense>
        )}
      </RoundedBox>

      {/* Vertical Leather Straps (Front) */}
      <RoundedBox args={[0.12, 0.8, 0.05]} radius={0.02} position={[-0.4, -0.1, 0.36]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.8, 0.05]} radius={0.02} position={[0.4, -0.1, 0.36]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>

      {/* Vertical Leather Straps (Back) */}
      <RoundedBox args={[0.12, 0.8, 0.05]} radius={0.02} position={[-0.4, -0.1, -0.36]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.8, 0.05]} radius={0.02} position={[0.4, -0.1, -0.36]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>

      {/* Hardware Buckles (Front) */}
      <mesh position={[-0.4, 0.35, 0.38]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 4]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[0.4, 0.35, 0.38]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 4]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>

      {/* Hardware Buckles (Back) */}
      <mesh position={[-0.4, 0.35, -0.38]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 4]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[0.4, 0.35, -0.38]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 4]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>

      {/* Front Handle */}
      <group position={[0, 0.35, 0.38]}>
        <mesh position={[0, 0.4, 0]}>
          <torusGeometry args={[0.4, 0.03, 16, 32, Math.PI]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[-0.4, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[0.4, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
      </group>

      {/* Back Handle */}
      <group position={[0, 0.35, -0.38]}>
        <mesh position={[0, 0.4, 0]}>
          <torusGeometry args={[0.4, 0.03, 16, 32, Math.PI]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[-0.4, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[0.4, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
      </group>

      {/* Side D-rings and strap */}
      <mesh position={[-0.82, 0.2, 0]} rotation={[0, Math.PI/2, 0]}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[0.82, 0.2, 0]} rotation={[0, Math.PI/2, 0]}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      
      {/* Top Zipper */}
      <RoundedBox args={[1.4, 0.02, 0.04]} radius={0.01} position={[0, 0.56, 0]}>
        <primitive object={materials.zippersDull} attach="material" />
      </RoundedBox>
    </group>
  );
}

function CassiopeaBag({ materials, logo, logoPosition, logoScale }: BagProps) {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Main Body - Dome shape approximated with RoundedBox */}
      <RoundedBox args={[1.6, 1.1, 0.6]} radius={0.3} smoothness={4} position={[0, 0.05, 0]}>
        <primitive object={materials.body} attach="material" />
        {logo && (
          <Suspense fallback={null}>
            <DecalImage 
              url={logo} 
              position={[(logoPosition.x - 0.5) * 1.4, (0.5 - logoPosition.y) * 0.9, 0.3]} 
              scale={logoScale * 0.9} 
            />
          </Suspense>
        )}
      </RoundedBox>
      
      {/* Leather Trim Base */}
      <RoundedBox args={[1.62, 0.3, 0.62]} radius={0.05} position={[0, -0.4, 0]}>
        <primitive object={materials.straps} attach="material" />
      </RoundedBox>

      {/* Front Hardware */}
      <mesh position={[-0.3, 0.2, 0.31]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.31]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>

      {/* Back Hardware */}
      <mesh position={[-0.3, 0.2, -0.31]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[0.3, 0.2, -0.31]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>

      {/* Front Handle */}
      <group position={[0, 0.2, 0.32]}>
        <mesh position={[0, 0.4, 0]}>
          <torusGeometry args={[0.3, 0.03, 16, 32, Math.PI]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[-0.3, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[0.3, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
      </group>

      {/* Back Handle */}
      <group position={[0, 0.2, -0.32]}>
        <mesh position={[0, 0.4, 0]}>
          <torusGeometry args={[0.3, 0.03, 16, 32, Math.PI]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[-0.3, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
        <mesh position={[0.3, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <primitive object={materials.straps} attach="material" />
        </mesh>
      </group>

      {/* Side Zipper Pulls */}
      <mesh position={[0.78, 0.1, 0]} rotation={[0, 0, -Math.PI/4]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      <mesh position={[-0.78, 0.1, 0]} rotation={[0, 0, Math.PI/4]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        <primitive object={materials.zippers} attach="material" />
      </mesh>
      
      {/* Top Zipper Track */}
      <RoundedBox args={[1.0, 0.02, 0.04]} radius={0.01} position={[0, 0.59, 0]}>
        <primitive object={materials.zippersDull} attach="material" />
      </RoundedBox>
    </group>
  );
}
