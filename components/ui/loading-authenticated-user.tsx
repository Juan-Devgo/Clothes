import PendingIcon from '../icons/pending';

export default async function AuthenticatedUser() {
  return (
    <div className="flex gap-2 sm:gap-4 items-center shrink-0">
      {/**<a href="/profile">**/}
      <div className="hidden sm:block rounded-full bg-white">
        <PendingIcon />
      </div>
      {/**</a>**/}
      <span className="text-xs sm:text-sm md:text-base lg:text-xl font-medium">Cargando...</span>
    </div>
  );
}
