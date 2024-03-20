import { useBoardPosition } from './useBoardPosition';
import { socket } from '@/common/lib/socket';
import { useOptions } from '@/common/recoil/options';
import { useCallback, useEffect, useState } from 'react';
import { drawAllMoves, handleMove } from '../helpers/Canvas.helpers';
import usersAtom, { useUsers } from '@/common/recoil/users';
import { getPos } from '@/common/lib/getPos';
import { useSetRecoilState } from 'recoil';

const movesWithoutUser: Move[] = [];
const savedMoves: Move[] = [];
let tempMoves: [number, number][] = [];

export const useDraw = (
  ctx: CanvasRenderingContext2D | undefined,
  blocked: boolean,
  handleEnd: () => void
) => {
  const users = useUsers();
  const options = useOptions();
  const [drawing, setDrawing] = useState(false);

  const boardPosition = useBoardPosition();
  const movedX = boardPosition.x;
  const movedY = boardPosition.y;

  useEffect(() => {
    if (ctx) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.lineColor;
    }
  });

  const handleUndo = useCallback(() => {
    if (ctx) {
      savedMoves.pop();
      socket.emit('undo');

      drawAllMoves(ctx, movesWithoutUser, savedMoves, users);

      handleEnd();
    }
  }, [ctx, handleEnd, users]);

  useEffect(() => {
    const handleUndoKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'z' && e.ctrlKey) {
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleUndoKeyboard);

    return () => {
      document.removeEventListener('keydown', handleUndoKeyboard);
    };
  }, [handleUndo]);

  const handleStartDrawing = (x: number, y: number) => {
    if (!ctx || blocked) return;

    setDrawing(true);

    ctx.beginPath();
    ctx.lineTo(getPos(x, movedX), getPos(y, movedY));
    ctx.stroke();

    tempMoves.push([getPos(x, movedX), getPos(y, movedY)]);
  };

  const handleEndDrawing = () => {
    if (!ctx || blocked) return;
    ctx.closePath();
    setDrawing(false);

    const move: Move = {
      path: tempMoves,
      options,
    };

    savedMoves.push(move);
    tempMoves = [];
    socket.emit('draw', move);

    drawAllMoves(ctx, movesWithoutUser, savedMoves, users);

    handleEnd();
  };

  const handleDraw = (x: number, y: number) => {
    if (!ctx || !drawing || blocked) {
      return;
    }
    ctx.lineTo(getPos(x, movedX), getPos(y, movedY));
    ctx.stroke();

    tempMoves.push([getPos(x, movedX), getPos(y, movedY)]);
  };

  return {
    handleDraw,
    handleEndDrawing,
    handleStartDrawing,
    handleUndo,
    drawing,
  };
};

export const useSocketDraw = (
  ctx: CanvasRenderingContext2D | undefined,
  drawing: boolean,
  handleEnd: () => void
) => {
  const setUsers = useSetRecoilState(usersAtom);

  useEffect(() => {
    if (ctx) socket.emit('joined_room');
  }, [ctx]);

  useEffect(() => {
    socket.on('joined', (room, usersToParse) => {
      if (!ctx) return;

      const users = new Map<string, Move[]>(JSON.parse(usersToParse));

      room.drawed.forEach((move) => {
        handleMove(move, ctx);
        movesWithoutUser.push(move);
      });

      users.forEach((userMoves, userId) => {
        userMoves.forEach((move) => handleMove(move, ctx));
        setUsers((prevUsers) => ({ ...prevUsers, [userId]: userMoves }));
      });

      handleEnd();
    });

    return () => {
      socket.off('room');
    };
  }, [ctx, handleEnd, setUsers]);

  useEffect(() => {
    let moveToDrawLater: Move | undefined;
    let userIdLater = '';
    socket.on('user_draw', (move, userId) => {
      if (ctx && !drawing) {
        handleMove(move, ctx);

        setUsers((prevUsers) => {
          const newUsers = { ...prevUsers };
          if (newUsers[userId]) newUsers[userdId] = [...newUsers[userId], move];
          return newUsers;
        });
      } else {
        moveToDrawLater = move;
        userIdLater = userId;
      }
    });

    return () => {
      socket.off('user_draw');
      if (moveToDrawLater && userIdLater && ctx) {
        handleMove(moveToDrawLater, ctx);
        handleEnd();
        setUsers((prevUsers) => {
          const newUsers = { ...prevUsers };
          newUsers[userIdLater] = [
            ...newUsers[userIdLater],
            moveToDrawLater as Move,
          ];
          return newUsers;
        });
      }
    };
  }, [ctx, handleEnd, setUsers, drawing]);

  useEffect(() => {
    socket.on('user_undo', (userId) => {
      setUsers((prevUsers) => {
        const newUsers = { ...prevUsers };
        newUsers[userId] = newUsers[userId]?.slice(0, -1);

        if (ctx) {
          drawAllMoves(ctx, movesWithoutUser, savedMoves, newUsers);
          handleEnd();
        }
        return newUsers;
      });
    });
    return () => {
      socket.off('user_undo');
    };
  }, [ctx, handleEnd, setUsers]);
};
