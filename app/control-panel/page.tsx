import { getCurrentUser } from '@/service/auth';

export default async function Dashboard() {
  const { user } = await getCurrentUser();

  return <>Ey {user?.username}</>;
}
