import Canvas from '@/modules/room/components/Canvas';
import Room from '@/modules/room/components/Room';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return <Room />;
}
