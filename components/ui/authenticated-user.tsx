import { getCurrentUser } from '@/service/auth';
import PersonIcon from '../icons/person';

export default async function AuthenticatedUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser.user) return null;

  return (
    <div className="flex gap-4 items-center">
      {/**<a href="/profile">**/}
      <div className="rounded-full bg-white">
        <PersonIcon />
      </div>
      {/**</a>**/}
      <span className="text-xl">{currentUser.user?.username}</span>
    </div>
  );
}
