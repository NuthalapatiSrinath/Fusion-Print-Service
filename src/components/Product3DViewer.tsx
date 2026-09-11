import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  RoundedBox,
  useTexture,
} from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

export type MockupKind = "tshirt" | "polo" | "cap" | "mug" | "bag" | "business-card";

type Props = {
  type: MockupKind;
  color: string;
  side: "front" | "back";
  designUrl?: string | null;
  className?: string;
};

function DesignDecal({
  url,
  position,
  scale,
  rotation,
}: {
  url: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
}) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]}>
      <planeGeometry args={[scale[0], scale[1]]} />
      <meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

function TShirtBody({
  color,
  side,
  designUrl,
  polo,
}: {
  color: string;
  side: "front" | "back";
  designUrl?: string | null;
  polo?: boolean;
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.72,
        metalness: 0.05,
      }),
    [color]
  );

  const z = side === "front" ? 0.52 : -0.52;
  const rotY = side === "front" ? 0 : Math.PI;

  return (
    <group>
      {/* torso */}
      <mesh material={mat} castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[1.6, 2.05, 0.95]} />
      </mesh>
      {/* sleeves */}
      <mesh material={mat} castShadow position={[-1.15, 0.55, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.85, 0.55, 0.75]} />
      </mesh>
      <mesh material={mat} castShadow position={[1.15, 0.55, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.85, 0.55, 0.75]} />
      </mesh>
      {/* collar / neck */}
      {polo ? (
        <group position={[0, 1.15, 0.15]}>
          <mesh material={mat} castShadow>
            <boxGeometry args={[0.7, 0.18, 0.55]} />
          </mesh>
          <mesh material={mat} position={[-0.22, 0.12, 0.05]} rotation={[0.2, 0, 0.4]}>
            <boxGeometry args={[0.35, 0.08, 0.4]} />
          </mesh>
          <mesh material={mat} position={[0.22, 0.12, 0.05]} rotation={[0.2, 0, -0.4]}>
            <boxGeometry args={[0.35, 0.08, 0.4]} />
          </mesh>
        </group>
      ) : (
        <mesh material={mat} position={[0, 1.18, 0]} castShadow>
          <torusGeometry args={[0.28, 0.1, 12, 24]} />
        </mesh>
      )}
      {/* soft shoulder caps */}
      <mesh material={mat} position={[-0.75, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
      </mesh>
      <mesh material={mat} position={[0.75, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
      </mesh>
      {designUrl && (
        <Suspense fallback={null}>
          <DesignDecal
            url={designUrl}
            position={[0, 0.25, z]}
            scale={polo ? [0.7, 0.7, 1] : [0.85, 0.85, 1]}
            rotation={[0, rotY, 0]}
          />
        </Suspense>
      )}
    </group>
  );
}

/** Procedural baseball cap with curved brim — looks like a real cap in orbit view */
function BaseballCap({ color, designUrl }: { color: string; designUrl?: string | null }) {
  const crownMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: 0.08,
      }),
    [color]
  );
  const brimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).offsetHSL(0, 0, -0.08),
        roughness: 0.45,
        metalness: 0.12,
      }),
    [color]
  );

  const brimGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.15, 0);
    shape.quadraticCurveTo(-0.9, 0.55, 0, 0.72);
    shape.quadraticCurveTo(0.9, 0.55, 1.15, 0);
    shape.quadraticCurveTo(0.5, 0.08, 0, 0.05);
    shape.quadraticCurveTo(-0.5, 0.08, -1.15, 0);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    geo.rotateX(-Math.PI / 2.35);
    geo.translate(0, -0.05, 0.55);
    return geo;
  }, []);

  return (
    <group rotation={[0.15, 0, 0]} position={[0, -0.2, 0]}>
      {/* structured 6-panel-ish crown */}
      <mesh material={crownMat} castShadow receiveShadow position={[0, 0.35, 0]} scale={[1, 0.78, 1.05]}>
        <sphereGeometry args={[0.95, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
      </mesh>
      {/* button */}
      <mesh material={crownMat} castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
      </mesh>
      {/* brim */}
      <mesh geometry={brimGeo} material={brimMat} castShadow receiveShadow />
      {/* sweatband hint */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78, 0.04, 8, 48]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {designUrl && (
        <Suspense fallback={null}>
          <DesignDecal url={designUrl} position={[0, 0.55, 0.78]} scale={[0.55, 0.35, 1]} />
        </Suspense>
      )}
    </group>
  );
}

function MugModel({ color, designUrl }: { color: string; designUrl?: string | null }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.65, 1.5, 48]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
      </mesh>
      <mesh position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.35, 0.08, 12, 32, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
      {designUrl && (
        <Suspense fallback={null}>
          <DesignDecal url={designUrl} position={[0, 0.1, 0.71]} scale={[0.7, 0.7, 1]} />
        </Suspense>
      )}
    </group>
  );
}

function BagModel({ color, designUrl }: { color: string; designUrl?: string | null }) {
  return (
    <group>
      <RoundedBox args={[1.6, 1.9, 0.45]} radius={0.05} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.7} />
      </RoundedBox>
      <mesh position={[-0.35, 1.1, 0]}>
        <torusGeometry args={[0.25, 0.04, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[0.35, 1.1, 0]}>
        <torusGeometry args={[0.25, 0.04, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {designUrl && (
        <Suspense fallback={null}>
          <DesignDecal url={designUrl} position={[0, 0.1, 0.24]} scale={[0.8, 0.8, 1]} />
        </Suspense>
      )}
    </group>
  );
}

function CardModel({ color, designUrl }: { color: string; designUrl?: string | null }) {
  return (
    <group>
      <RoundedBox args={[2.2, 1.3, 0.04]} radius={0.04} castShadow>
        <meshStandardMaterial color={color} roughness={0.4} />
      </RoundedBox>
      {designUrl && (
        <Suspense fallback={null}>
          <DesignDecal url={designUrl} position={[0, 0, 0.03]} scale={[1.2, 0.7, 1]} />
        </Suspense>
      )}
    </group>
  );
}

function Scene({ type, color, side, designUrl }: Omit<Props, "className">) {
  const group = useRef<THREE.Group>(null);

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight castShadow position={[4, 6, 3]} intensity={1.35} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#00AEEF" />
      <spotLight position={[0, 5, 2]} angle={0.4} penumbra={0.6} intensity={0.5} color="#F37021" />
      <group ref={group}>
        {(type === "tshirt" || type === "polo") && (
          <TShirtBody color={color} side={side} designUrl={designUrl} polo={type === "polo"} />
        )}
        {type === "cap" && <BaseballCap color={color} designUrl={designUrl} />}
        {type === "mug" && <MugModel color={color} designUrl={designUrl} />}
        {type === "bag" && <BagModel color={color} designUrl={designUrl} />}
        {type === "business-card" && <CardModel color={color} designUrl={designUrl} />}
      </group>
      <ContactShadows position={[0, -1.35, 0]} opacity={0.45} scale={10} blur={2.5} far={4} />
      <Environment preset="city" />
      <OrbitControls
        enablePan={false}
        minDistance={2.2}
        maxDistance={7}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 1.7}
        autoRotate={!designUrl}
        autoRotateSpeed={0.6}
      />
    </>
  );
}

export function Product3DViewer({ type, color, side, designUrl, className }: Props) {
  const resolvedDesign = designUrl || "/logo-fp.png";
  return (
    <div className={className || "w-full h-full min-h-[320px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200"}>
      <Canvas
        shadows
        camera={{ position: [0, 0.4, 4.2], fov: 42 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Suspense fallback={null}>
          <Scene type={type} color={color} side={side} designUrl={resolvedDesign} />
        </Suspense>
      </Canvas>
    </div>
  );
}
