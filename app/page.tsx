import Navbar from "@/components/ui/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 sm:py-24 md:py-32 px-6 sm:px-10 md:px-16 bg-white sm:items-start my-4 sm:my-8">
          <h1 className="text-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl">Clothes Saldos Americanos</h1>
        </main>
      </div>
    </>
  );
}
