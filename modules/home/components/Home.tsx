import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { socket } from '@/common/lib/socket';

const Home = () => {
  const [roomId, setRoomId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    socket.on('created', (roomIdFromServer) => {
      router.push(roomIdFromServer);
    });

    socket.on('joined', (roomIdFromServer, failed) => {
      if (!failed) router.push(roomIdFromServer);
      else console.log('failed to join room');
    });
    return () => {
      socket.off('created');
      socket.off('joined');
    };
  }, [router]);

  const handleCreateRoom = () => {
    socket.emit('create_room');
  };

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit('join_room', roomId);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="mt-24 text-extra font-extrabold leading-tight">
        Digiboard
      </h1>
      <h3 className="text-2xl">Real time whiteboard</h3>

      <form
        className="mt-8 flex flex-col items-center gap-2"
        onSubmit={handleJoinRoom}
      >
        <label htmlFor="room-id" className="self-start font-bold leading-tight">
          Enter Room id
        </label>
        <input
          className="rounded-xl border p-5 py-1"
          id="room-id"
          placeholder="Room id..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          className="rounded-xl mt-2 bg-black p-5 py-1 text-white transition-all hover:scale-105 active:scale-100"
          type="submit"
        >
          Join
        </button>
      </form>
    </div>
  );
};
