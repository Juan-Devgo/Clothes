import { getCurrentUser } from '@/service/auth';
import PersonIcon from '../icons/person';

export default async function AuthenticatedUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser.user) return null;

  return (
    <div className="flex gap-2 sm:gap-4 items-center shrink-0">
      {/**<a href="/profile">**/}
      <div className="hidden sm:block rounded-full bg-gray-100">
        <PersonIcon size="8" color="black" />
      </div>
      {/**</a>**/}
      <span className="text-xs sm:text-sm md:text-base lg:text-xl font-medium">{currentUser.user?.username}</span>
    </div>
  );
}
