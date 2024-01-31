import { useUserIds } from '@/common/recoil/users';
import { UserMouse } from './UserMouse';

export const MouseRenderer = () => {
  const userIds = useUserIds();

  return (
    <>
      {userIds.map((userId) => {
        return <UserMouse userId={userId} key={userId} />;
      })}
    </>
  );
};
