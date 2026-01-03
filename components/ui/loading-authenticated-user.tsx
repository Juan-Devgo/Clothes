import PendingIcon from '../icons/pending';

export default async function AuthenticatedUser() {
  return (
    <div className="flex gap-4 items-center">
      {/**<a href="/profile">**/}
      <div className="rounded-full bg-white">
        <PendingIcon />
      </div>
      {/**</a>**/}
      <span className="text-xl">Cargando usuario...</span>
    </div>
  );
}
