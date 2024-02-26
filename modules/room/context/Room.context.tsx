import { socket } from '@/common/lib/socket';
import usersAtom, { useUserIds } from '@/common/recoil/users';
import { MotionValue, useMotionValue } from 'framer-motion';
import { ReactChild, createContext, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const roomContext = createContext<{
  x: MotionValue<number>;
  y: MotionValue<number>;
}>(null!);

const RoomContextProvider = ({ children }: { children: ReactChild }) => {
  const setUsers = useSetRecoilState(usersAtom);
  const userIds = useUserIds();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    socket.on('new_user', (newUser) => {
      setUsers((prevUsers) => ({ ...prevUsers, [newUser]: [] }));
    });
    socket.on('user_disconnected', (userId) => {
      setUsers((prevUsers) => {
        const newUsers = { ...prevUsers };
        delete newUsers[userId];
        return newUsers;
      });
    });
    return () => {
      socket.off('new_user');
      socket.off('user_disconnected');
    };
  }, [setUsers, userIds]);

  return (
    <roomContext.Provider value={{ x, y }}>{children}</roomContext.Provider>
  );
};

export default RoomContextProvider;
