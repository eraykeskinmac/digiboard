import { CANVAS_SIZE } from '@/common/constants/canvasSize';
import { useViewportSize } from '@/common/hooks/useViewportSize';
import { useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useKeyPressEvent } from 'react-use';
import { useDraw } from '../hooks/Canvas.hooks';
import { socket } from '@/common/lib/socket';
import { drawFromSocket } from '../helpers/Canvas.helpers';

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smallCanvasRef = useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [dragging, setDragging] = useState(false);
  const [, setMovedMiniMap] = useState(false);

  const { width, height } = useViewportSize();

  useKeyPressEvent('Control', (e) => {
    if (e.ctrlKey && !drawing) {
      setDragging(true);
    }
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const copyCanvasToSmall = () => {
    if (canvasRef.current) {
      smallCanvasRef.current
        ?.getContext('2d')
        ?.drawImage(
          canvasRef.current,
          0,
          0,
          CANVAS_SIZE.width,
          CANVAS_SIZE.height
        );
    }
  };

  const { handleDraw, handleEndDrawing, handleStartDrawing, drawing } = useDraw(
    ctx,
    dragging,
    -x.get(),
    -y.get(),
    copyCanvasToSmall
  );

  useEffect(() => {
    const newCtx = canvasRef.current?.getContext('2d');
    if (newCtx) setCtx(newCtx);

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && dragging) {
        setDragging(false);
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dragging]);

  useEffect(() => {
    let movesToDrawLater: [number, number][] = [];

    let optionsUseLater: CtxOptions = {
      lineColor: '',
      lineWidth: 0,
    };

    socket.on('socket_draw', (movesToDraw, socketOptions) => {
      if (ctx && !drawing) {
        drawFromSocket(movesToDraw, socketOptions, ctx!, copyCanvasToSmall);
      } else {
        movesToDrawLater = movesToDraw;
        optionsUseLater = socketOptions;
      }
    });

    return () => {
      socket.off('socket_draw');

      if (movesToDrawLater.length && ctx) {
        drawFromSocket(
          movesToDrawLater,
          optionsUseLater,
          ctx,
          copyCanvasToSmall
        );
      }
    };
  }, [drawing, ctx]);

  return <div>canvas</div>;
};
