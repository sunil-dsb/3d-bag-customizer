'use client';

import { useRef, Suspense, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { RoundedBox, Decal } from '@react-three/drei';
import * as THREE from 'three';
import { useCustomizerStore } from '@/store/useCustomizerStore';
import { useShallow } from 'zustand/react/shallow';
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
  const { model, colors, pattern, logo, logoPosition, logoScale } = useCustomizerStore(
    useShallow((s) => ({ model: s.model, colors: s.colors, pattern: s.pattern, logo: s.logo, logoPosition: s.logoPosition, logoScale: s.logoScale }))
  );
  const groupRef = useRef<THREE.Group>(null);

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  const { texture: bodyTexture, normalMap } = useDynamicTexture(colors.body, pattern);

  const materials = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({
      map: bodyTexture,
      normalMap,
      normalScale: new THREE.Vector2(0.3, 0.3),
      roughness: 0.85,
      envMapIntensity: 0.6,
    }),
    straps: new THREE.MeshStandardMaterial({
      color: colors.straps,
      normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.9,
      envMapIntensity: 0.4,
    }),
    strapsSmooth: new THREE.MeshStandardMaterial({
      color: colors.straps,
      normalMap,
      normalScale: new THREE.Vector2(0.2, 0.2),
      roughness: 0.6,
      envMapIntensity: 0.5,
    }),
    zippers: new THREE.MeshStandardMaterial({
      color: colors.zippers,
      metalness: 1,
      roughness: 0.2,
      envMapIntensity: 1.0,
    }),
    zippersDull: new THREE.MeshStandardMaterial({
      color: colors.zippers,
      metalness: 0.8,
      roughness: 0.3,
      envMapIntensity: 0.8,
    }),
  }), [bodyTexture, normalMap, colors.body, pattern, colors.straps, colors.zippers]);

  // Dispose old materials when they are replaced or on unmount
  useEffect(() => {
    return () => {
      Object.values(materials).forEach((mat) => mat.dispose());
    };
  }, [materials]);

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
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
      <RoundedBox args={[1.4, 1.8, 0.8]} radius={0.3} smoothness={4} position={[0, 0, 0]} material={materials.body} />

      {/* Leather Base */}
      <RoundedBox args={[1.42, 0.3, 0.82]} radius={0.1} smoothness={4} position={[0, -0.75, 0]} material={materials.straps} />

      {/* Front Pocket */}
      <RoundedBox args={[1.1, 0.9, 0.3]} radius={0.2} smoothness={4} position={[0, -0.2, 0.4]} material={materials.body}>
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
      <RoundedBox args={[1.12, 0.04, 0.31]} radius={0.01} smoothness={4} position={[0, 0.25, 0.4]} material={materials.zippersDull} />

      {/* Leather Patch on Front Pocket */}
      <RoundedBox args={[0.4, 0.25, 0.02]} radius={0.02} smoothness={4} position={[0, -0.2, 0.56]} material={materials.straps} />

      {/* Top Handle */}
      <group position={[0, 0.95, -0.1]}>
        <mesh material={materials.straps}>
          <torusGeometry args={[0.2, 0.04, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[-0.2, -0.05, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
        </mesh>
        <mesh position={[0.2, -0.05, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
        </mesh>
      </group>

      {/* Shoulder Straps — flat like real straps */}
      {/* Left Strap */}
      <group position={[-0.35, 0.3, -0.45]}>
        <RoundedBox args={[0.22, 1.4, 0.04]} radius={0.02} smoothness={4} rotation={[0.2, 0.1, -0.1]} material={materials.straps} />
      </group>
      {/* Right Strap */}
      <group position={[0.35, 0.3, -0.45]}>
        <RoundedBox args={[0.22, 1.4, 0.04]} radius={0.02} smoothness={4} rotation={[0.2, -0.1, 0.1]} material={materials.straps} />
      </group>

      {/* Side Pockets */}
      <RoundedBox args={[0.2, 0.7, 0.5]} radius={0.08} smoothness={4} position={[-0.7, -0.3, 0]} material={materials.body} />
      <RoundedBox args={[0.2, 0.7, 0.5]} radius={0.08} smoothness={4} position={[0.7, -0.3, 0]} material={materials.body} />
    </group>
  );
}

function ToteBag({ materials, logo, logoPosition, logoScale }: BagProps) {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Main Body — rectangular tote shape */}
      <RoundedBox args={[1.8, 1.4, 0.6]} radius={0.12} smoothness={4} position={[0, 0, 0]} material={materials.body}>
        {logo && (
          <Suspense fallback={null}>
            <DecalImage
              url={logo}
              position={[(logoPosition.x - 0.5) * 1.6, (0.5 - logoPosition.y) * 1.2, 0.3]}
              scale={logoScale * 1.0}
              depth={0.2}
            />
          </Suspense>
        )}
      </RoundedBox>

      {/* Leather Base */}
      <RoundedBox args={[1.82, 0.15, 0.62]} radius={0.05} smoothness={4} position={[0, -0.63, 0]} material={materials.strapsSmooth} />

      {/* Leather Trim (Top Edge) */}
      <RoundedBox args={[1.82, 0.08, 0.62]} radius={0.03} smoothness={4} position={[0, 0.7, 0]} material={materials.strapsSmooth} />

      {/* Gold Rings */}
      <mesh position={[-0.5, 0.73, 0.32]} material={materials.zippers}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
      </mesh>
      <mesh position={[0.5, 0.73, 0.32]} material={materials.zippers}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
      </mesh>
      <mesh position={[-0.5, 0.73, -0.32]} material={materials.zippers}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
      </mesh>
      <mesh position={[0.5, 0.73, -0.32]} material={materials.zippers}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
      </mesh>

      {/* Leather Tabs Front */}
      <RoundedBox args={[0.15, 0.3, 0.05]} radius={0.02} position={[-0.5, 0.55, 0.32]} material={materials.strapsSmooth} />
      <RoundedBox args={[0.15, 0.3, 0.05]} radius={0.02} position={[0.5, 0.55, 0.32]} material={materials.strapsSmooth} />

      {/* Leather Tabs Back */}
      <RoundedBox args={[0.15, 0.3, 0.05]} radius={0.02} position={[-0.5, 0.55, -0.32]} material={materials.strapsSmooth} />
      <RoundedBox args={[0.15, 0.3, 0.05]} radius={0.02} position={[0.5, 0.55, -0.32]} material={materials.strapsSmooth} />

      {/* Front Handle */}
      <group position={[0, 0.79, 0.32]}>
        <mesh material={materials.strapsSmooth}>
          <torusGeometry args={[0.5, 0.04, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[-0.5, -0.05, 0]} material={materials.strapsSmooth}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
        </mesh>
        <mesh position={[0.5, -0.05, 0]} material={materials.strapsSmooth}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
        </mesh>
        <mesh position={[-0.5, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.strapsSmooth}>
          <torusGeometry args={[0.04, 0.02, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[0.5, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.strapsSmooth}>
          <torusGeometry args={[0.04, 0.02, 16, 32, Math.PI]} />
        </mesh>
      </group>

      {/* Back Handle */}
      <group position={[0, 0.79, -0.32]}>
        <mesh material={materials.strapsSmooth}>
          <torusGeometry args={[0.5, 0.04, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[-0.5, -0.05, 0]} material={materials.strapsSmooth}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
        </mesh>
        <mesh position={[0.5, -0.05, 0]} material={materials.strapsSmooth}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
        </mesh>
        <mesh position={[-0.5, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.strapsSmooth}>
          <torusGeometry args={[0.04, 0.02, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[0.5, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.strapsSmooth}>
          <torusGeometry args={[0.04, 0.02, 16, 32, Math.PI]} />
        </mesh>
      </group>

      {/* Hanging Leather Tag */}
      <group position={[-0.5, 0.4, 0.35]} rotation={[0, 0, 0.2]}>
        <mesh position={[0, 0.1, 0]} material={materials.strapsSmooth}>
          <cylinderGeometry args={[0.01, 0.01, 0.2]} />
        </mesh>
        <RoundedBox args={[0.2, 0.3, 0.02]} radius={0.02} position={[0, -0.1, 0]} material={materials.strapsSmooth} />
      </group>
    </group>
  );
}

function MessengerBag({ materials, logo, logoPosition, logoScale }: BagProps) {
  return (
    <group position={[0, 0.1, 0]}>
      {/* Main Body — wide landscape satchel */}
      <RoundedBox args={[1.8, 1.05, 0.5]} radius={0.15} smoothness={4} position={[0, 0, 0]} material={materials.body} />

      {/* Leather base strip */}
      <RoundedBox args={[1.82, 0.08, 0.52]} radius={0.03} smoothness={4} position={[0, -0.47, 0]} material={materials.straps} />

      {/* Flap — two pieces for convincing wrap-over look */}
      {/* Top cap — sits on top of body, bridging back to front */}
      <RoundedBox args={[1.82, 0.06, 0.52]} radius={0.02} smoothness={4} position={[0, 0.55, 0]} material={materials.body} />

      {/* Front drape — hangs from top cap down the front face */}
      <RoundedBox args={[1.82, 0.8, 0.06]} radius={0.03} smoothness={4} position={[0, 0.17, 0.28]} material={materials.body}>
        {logo && (
          <Suspense fallback={null}>
            <DecalImage
              url={logo}
              position={[(logoPosition.x - 0.5) * 1.5, (0.5 - logoPosition.y) * 0.65, 0.03]}
              scale={logoScale * 0.8}
              depth={0.05}
            />
          </Suspense>
        )}
      </RoundedBox>

      {/* Flap bottom leather trim */}
      <RoundedBox args={[1.83, 0.06, 0.07]} radius={0.02} smoothness={4} position={[0, -0.2, 0.28]} material={materials.straps} />

      {/* Front pocket (behind the flap) */}
      <RoundedBox args={[1.3, 0.5, 0.04]} radius={0.05} smoothness={4} position={[0, -0.15, 0.24]} material={materials.body} />

      {/* Turn-lock closure */}
      <mesh position={[0, -0.05, 0.315]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
      </mesh>
      <mesh position={[0, -0.05, 0.325]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <torusGeometry args={[0.03, 0.008, 12, 24]} />
      </mesh>
      {/* Lock base plate on body */}
      <RoundedBox args={[0.14, 0.14, 0.015]} radius={0.02} position={[0, -0.05, 0.26]} material={materials.zippers} />

      {/* Top Handle */}
      <group position={[0, 0.62, -0.05]}>
        <mesh material={materials.straps}>
          <torusGeometry args={[0.2, 0.03, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[-0.2, -0.04, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.03, 0.03, 0.08]} />
        </mesh>
        <mesh position={[0.2, -0.04, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.03, 0.03, 0.08]} />
        </mesh>
      </group>

      {/* Side D-rings */}
      <mesh position={[-0.92, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <torusGeometry args={[0.05, 0.015, 16, 32]} />
      </mesh>
      <mesh position={[0.92, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <torusGeometry args={[0.05, 0.015, 16, 32]} />
      </mesh>

      {/* Leather tabs holding D-rings */}
      <RoundedBox args={[0.04, 0.15, 0.1]} radius={0.02} position={[-0.92, 0.18, 0]} material={materials.straps} />
      <RoundedBox args={[0.04, 0.15, 0.1]} radius={0.02} position={[0.92, 0.18, 0]} material={materials.straps} />

      {/* Back pocket */}
      <RoundedBox args={[1.2, 0.65, 0.04]} radius={0.06} smoothness={4} position={[0, -0.05, -0.27]} material={materials.body} />
      {/* Back pocket top trim */}
      <RoundedBox args={[1.22, 0.025, 0.045]} radius={0.01} smoothness={4} position={[0, 0.28, -0.27]} material={materials.straps} />
    </group>
  );
}

function BaulettoBag({ materials, logo, logoPosition, logoScale }: BagProps) {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Main Body */}
      <RoundedBox args={[1.6, 1.1, 0.7]} radius={0.15} smoothness={4} position={[0, 0, 0]} material={materials.body}>
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
      <RoundedBox args={[0.12, 0.8, 0.05]} radius={0.02} position={[-0.4, -0.1, 0.36]} material={materials.straps} />
      <RoundedBox args={[0.12, 0.8, 0.05]} radius={0.02} position={[0.4, -0.1, 0.36]} material={materials.straps} />

      {/* Vertical Leather Straps (Back) */}
      <RoundedBox args={[0.12, 0.8, 0.05]} radius={0.02} position={[-0.4, -0.1, -0.36]} material={materials.straps} />
      <RoundedBox args={[0.12, 0.8, 0.05]} radius={0.02} position={[0.4, -0.1, -0.36]} material={materials.straps} />

      {/* Hardware Buckles (Front) */}
      <mesh position={[-0.4, 0.35, 0.38]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <torusGeometry args={[0.08, 0.02, 16, 4]} />
      </mesh>
      <mesh position={[0.4, 0.35, 0.38]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <torusGeometry args={[0.08, 0.02, 16, 4]} />
      </mesh>

      {/* Hardware Buckles (Back) */}
      <mesh position={[-0.4, 0.35, -0.38]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <torusGeometry args={[0.08, 0.02, 16, 4]} />
      </mesh>
      <mesh position={[0.4, 0.35, -0.38]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <torusGeometry args={[0.08, 0.02, 16, 4]} />
      </mesh>

      {/* Front Handle */}
      <group position={[0, 0.35, 0.38]}>
        <mesh position={[0, 0.4, 0]} material={materials.straps}>
          <torusGeometry args={[0.4, 0.03, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[-0.4, 0.2, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        </mesh>
        <mesh position={[0.4, 0.2, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        </mesh>
      </group>

      {/* Back Handle */}
      <group position={[0, 0.35, -0.38]}>
        <mesh position={[0, 0.4, 0]} material={materials.straps}>
          <torusGeometry args={[0.4, 0.03, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[-0.4, 0.2, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        </mesh>
        <mesh position={[0.4, 0.2, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        </mesh>
      </group>

      {/* Side D-rings */}
      <mesh position={[-0.82, 0.2, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.zippers}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
      </mesh>
      <mesh position={[0.82, 0.2, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.zippers}>
        <torusGeometry args={[0.06, 0.02, 16, 32]} />
      </mesh>

      {/* Top Zipper */}
      <RoundedBox args={[1.4, 0.02, 0.04]} radius={0.01} position={[0, 0.56, 0]} material={materials.zippersDull} />
    </group>
  );
}

function CassiopeaBag({ materials, logo, logoPosition, logoScale }: BagProps) {
  return (
    <group position={[0, 0.15, 0]}>
      {/* Main Body — true dome/bowling bag shape (high radius = very rounded) */}
      <RoundedBox args={[1.4, 1.0, 0.7]} radius={0.33} smoothness={6} position={[0, 0.05, 0]} material={materials.body}>
        {logo && (
          <Suspense fallback={null}>
            <DecalImage
              url={logo}
              position={[(logoPosition.x - 0.5) * 1.2, (0.5 - logoPosition.y) * 0.8, 0.35]}
              scale={logoScale * 0.85}
            />
          </Suspense>
        )}
      </RoundedBox>

      {/* Thin structured base */}
      <RoundedBox args={[1.2, 0.06, 0.6]} radius={0.03} smoothness={4} position={[0, -0.42, 0]} material={materials.straps} />

      {/* Bottom feet — 4 metal studs */}
      <mesh position={[-0.4, -0.47, 0.2]} material={materials.zippers}>
        <cylinderGeometry args={[0.03, 0.035, 0.04, 12]} />
      </mesh>
      <mesh position={[0.4, -0.47, 0.2]} material={materials.zippers}>
        <cylinderGeometry args={[0.03, 0.035, 0.04, 12]} />
      </mesh>
      <mesh position={[-0.4, -0.47, -0.2]} material={materials.zippers}>
        <cylinderGeometry args={[0.03, 0.035, 0.04, 12]} />
      </mesh>
      <mesh position={[0.4, -0.47, -0.2]} material={materials.zippers}>
        <cylinderGeometry args={[0.03, 0.035, 0.04, 12]} />
      </mesh>

      {/* Center front clasp — elegant round lock */}
      <mesh position={[0, 0.1, 0.355]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 24]} />
      </mesh>
      <mesh position={[0, 0.1, 0.365]} rotation={[Math.PI / 2, 0, 0]} material={materials.zippers}>
        <torusGeometry args={[0.035, 0.01, 12, 24]} />
      </mesh>

      {/* Leather clasp tab */}
      <RoundedBox args={[0.14, 0.2, 0.03]} radius={0.02} position={[0, 0.2, 0.35]} material={materials.straps} />

      {/* Top zipper track — curved along dome */}
      <RoundedBox args={[0.85, 0.02, 0.04]} radius={0.01} position={[0, 0.53, 0]} material={materials.zippersDull} />

      {/* Zipper pull */}
      <mesh position={[0.44, 0.52, 0]} rotation={[0, 0, -Math.PI / 5]} material={materials.zippers}>
        <boxGeometry args={[0.08, 0.03, 0.015]} />
      </mesh>

      {/* Front Handle — shorter, elegant */}
      <group position={[0, 0.28, 0.34]}>
        <mesh position={[0, 0.3, 0]} material={materials.straps}>
          <torusGeometry args={[0.2, 0.025, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[-0.2, 0.15, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.025, 0.025, 0.3]} />
        </mesh>
        <mesh position={[0.2, 0.15, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.025, 0.025, 0.3]} />
        </mesh>
      </group>

      {/* Back Handle — mirror of front */}
      <group position={[0, 0.28, -0.34]}>
        <mesh position={[0, 0.3, 0]} material={materials.straps}>
          <torusGeometry args={[0.2, 0.025, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[-0.2, 0.15, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.025, 0.025, 0.3]} />
        </mesh>
        <mesh position={[0.2, 0.15, 0]} material={materials.straps}>
          <cylinderGeometry args={[0.025, 0.025, 0.3]} />
        </mesh>
      </group>

      {/* Side D-rings for detachable strap */}
      <mesh position={[0.68, 0.15, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.zippers}>
        <torusGeometry args={[0.045, 0.012, 16, 32]} />
      </mesh>
      <mesh position={[-0.68, 0.15, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.zippers}>
        <torusGeometry args={[0.045, 0.012, 16, 32]} />
      </mesh>

      {/* Leather tabs holding D-rings */}
      <RoundedBox args={[0.04, 0.1, 0.08]} radius={0.02} position={[0.68, 0.1, 0]} material={materials.straps} />
      <RoundedBox args={[0.04, 0.1, 0.08]} radius={0.02} position={[-0.68, 0.1, 0]} material={materials.straps} />
    </group>
  );
}
