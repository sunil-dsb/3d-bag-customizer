import { Scene } from '@/components/Scene';
import { UIControls } from '@/components/UIControls';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-gray-50">
      <Scene />
      <UIControls />
    </main>
  );
}
