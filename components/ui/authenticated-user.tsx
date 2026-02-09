import { getCurrentUser } from '@/service/auth';
import PersonIcon from '../icons/person';

export default async function AuthenticatedUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser.user) return null;

  return (
    <div className="flex gap-4 items-center">
      {/**<a href="/profile">**/}
      <div className="rounded-full bg-gray-100">
        <PersonIcon size="8" color="black" />
      </div>
      {/**</a>**/}
      <span className="text-xl">{currentUser.user?.username}</span>
    </div>
  );
}
