import { Suspense } from "react";
import AuthenticatedUser from "./authenticated-user";
import LoadingAuthenticatedUser from "./loading-authenticated-user";
import NavLinks from "./control-panel-nav-links";
import MobileNavMenu from "./mobile-nav-menu";
import Logo from "./logo";

export default function ControlPanelNavbar() {
  return (
    <nav className="flex flex-row justify-between items-center p-2 sm:p-3 md:p-4 mx-2 sm:mx-4 mt-2 sm:mt-4 mb-0 bg-white text-gray-800 shadow-md rounded-xl border-b-4 border-[#F3B3CB] gap-2">
      <div className="shrink-0">
        <Logo />
      </div>

      {/* Nav links — visible solo en md+; flex-1 min-w-0 restringe el ancho */}
      <div className="hidden md:flex flex-1 min-w-0 items-center">
        <NavLinks />
      </div>

      {/* Hamburger — visible solo en pantallas < md */}
      <MobileNavMenu />

      <Suspense fallback={<LoadingAuthenticatedUser />}>
        <AuthenticatedUser />
      </Suspense>
    </nav>
  );
}
