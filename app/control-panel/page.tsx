import { getCurrentUser } from '@/service/auth';
import { redirect } from 'next/navigation';
import { routes } from '@/lib/paths';

export default async function Dashboard() {
  const { user } = await getCurrentUser();

  // Redirección adicional del lado del servidor si no hay usuario
  if (!user) {
    redirect(routes.LOGIN);
  }

  return <>Ey {user?.username}</>;
}
