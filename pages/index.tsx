import Canvas from '@/modules/canvas/components/Canvas';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return <Canvas />;
}
