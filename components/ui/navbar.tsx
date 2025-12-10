import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex flex-row justify-between items-center p-4 bg-white shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          [Clothes Saldos Americanos Logo]
        </h1>
      </div>
      <div className="flex gap-4">
        <Link href="/login">
          <button className="rounded-2xl bg-[#F3B3CB] text-gray-800 hover:bg-[#F7D2E0] px-3 py-1 cursor-pointer">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="rounded-2xl bg-[#F3B3CB] text-gray-800 hover:bg-[#F7D2E0] px-3 py-1 cursor-pointer">
            Regsitrarse
          </button>
        </Link>
      </div>
    </nav>
  );
}
