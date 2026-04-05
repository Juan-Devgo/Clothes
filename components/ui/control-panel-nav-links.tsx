"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

const links = [
  { href: "/control-panel", label: "Dashboard" },
  { href: "/control-panel/customers", label: "Clientes" },
  { href: "/control-panel/sales", label: "Ventas" },
  { href: "/control-panel/products", label: "Productos" },
  { href: "/control-panel/messages", label: "Mensajes" },
  { href: "/control-panel/promos", label: "Promociones" },
  { href: "/control-panel/events", label: "Eventos" },
  { href: "/control-panel/supplies", label: "Insumos" },
];

// Bar: which links are visible at each breakpoint
function linkVisibilityClass(index: number) {
  if (index < 3) return "flex";
  if (index < 5) return "hidden lg:flex";
  return "hidden xl:flex";
}

// Dropdown: inverse — only show links that are hidden in the bar
function dropdownItemClass(index: number) {
  if (index < 3) return "hidden";
  if (index < 5) return "block lg:hidden";
  return "block";
}

export default function NavLinks() {
  const pathname = usePathname();
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const itemClass = (href: string) =>
    `transition-colors duration-200 px-2 py-1 rounded-full whitespace-nowrap block text-base font-bold ${
      pathname === href ? "bg-[#fc86b3]" : "hover:bg-[#f7d0df]"
    }`;

  return (
    <div className="flex items-center justify-center gap-1 flex-1 min-w-0">
      <ul className="flex flex-row gap-1">
        {links.map((link, index) => (
          <li
            key={link.href}
            className={`shrink-0 ${linkVisibilityClass(index)}`}
          >
            <Link href={link.href} className={itemClass(link.href)}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* "Más" — visible at md/lg, hidden at xl when all links fit */}
      <div ref={moreMenuRef} className="relative shrink-0 xl:hidden">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          className={`px-2 py-1 rounded-full text-base font-bold transition-colors whitespace-nowrap cursor-pointer ${
            dropdownOpen ? "bg-[#fc86b3]" : "hover:bg-[#f7d0df]"
          }`}
        >
          Más
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-44 py-1">
            {links.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDropdownOpen(false)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#fc86b3] text-gray-800"
                      : "hover:bg-[#f7d0df] text-gray-700"
                  } ${dropdownItemClass(index)}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
