import HomeIcon from '@/components/icons/home';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <Link
        href="/"
        className="fixed top-6 left-6 w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors duration-300 z-50"
        title="Ir a inicio"
      >
        <HomeIcon />
      </Link>

      {children}
    </div>
  );
}
