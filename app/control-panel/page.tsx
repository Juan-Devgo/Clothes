import { getCurrentUser } from '@/service/auth';

export default async function Dashboard() {
  const { user } = await getCurrentUser();

  return <main className='bg-white min-h-screen flex flex-col text-gray-800'>
    
    </main>;
}
