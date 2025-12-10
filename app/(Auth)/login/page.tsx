export default function Login() {
  return (
    <main className="bg-white min-h-screen flex flex-col items-center justify-center text-gray-800">
      <div className="rounded-3xl border border-gray-200 shadow-2xl">
        <div className="text-center my-4 mx-2">
          <h1 className="text-4xl">Iniciar Sesión</h1>
          <p className="text-sm text-gray-500">
            Formulario para ingresar al sistema
          </p>
        </div>
        <form className="flex flex-col gap-2 my-4 px-6">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="rounded border border-black"
          />
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="rounded border border-black"
          />
          <button type="submit" className="rounded-2xl bg-[#F7D2E0] p-1 mt-3">
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}
