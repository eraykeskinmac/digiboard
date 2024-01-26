import { SocketMouse } from './SocketMouse';
import { useUserIds } from '@/common/recoil/users';

export const MouseRenderer = () => {
  const userIds = useUserIds();

  return (
    <>
      {userIds.map((userId) => {
        return <SocketMouse userId={userId} key={userId} />;
      })}
    </>
  );
};
