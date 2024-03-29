import { CANVAS_SIZE } from '@/common/constants/canvasSize';
import { useViewportSize } from '@/common/hooks/useViewportSize';
import { MotionValue, motion, useMotionValue } from 'framer-motion';
import {
  Dispatch,
  SetStateAction,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useBoardPosition } from '../hooks/useBoardPosition';

const Minimap = forwardRef<
  HTMLCanvasElement,
  {
    dragging: boolean;
    setMovedMiniMap: Dispatch<SetStateAction<boolean>>;
  }
>(({ dragging, setMovedMiniMap }, ref) => {
  const { x, y } = useBoardPosition();
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useViewportSize();

  const miniX = useMotionValue(0);
  const miniY = useMotionValue(0);

  useEffect(() => {
    miniX.onChange((newX) => {
      if (!dragging) x.set(-newX * 10);
    });
    miniY.onChange((newY) => {
      if (!dragging) y.set(-newY * 10);
    });
    return () => {
      miniX.clearListeners();
      miniY.clearListeners();
    };
  }, [dragging, miniX, miniY, x, y]);

  return (
    <>
      <div
        className="absolute right-10 top-10 z-50 bg-zinc-400"
        ref={containerRef}
        style={{
          width: CANVAS_SIZE.width / 10,
          height: CANVAS_SIZE.height / 10,
        }}
      >
        <canvas
          ref={ref as any}
          width={CANVAS_SIZE.width}
          height={CANVAS_SIZE.height}
          className="h-full w-full"
        />
        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0}
          dragTransition={{ power: 0, timeConstant: 0 }}
          onDragStart={() => setMovedMiniMap((prev) => !prev)}
          onDragEnd={() => setMovedMiniMap((prev: boolean) => !prev)}
          className="absolute top-0 left-0 cursor-grab border-2 border-red-500"
          style={{ width: width / 10, height: height / 10, x: miniX, y: miniY }}
          animate={{ x: -x.get() / 10, y: -y.get() }}
          transition={{ duration: 0 }}
        ></motion.div>
      </div>
    </>
  );
});

Minimap.displayName = 'MiniMap';

export default Minimap;
