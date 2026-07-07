"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Package,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const NAV_PRINCIPAL = [
  { href: "/", label: "Monitoramento", icone: LayoutDashboard },
  { href: "/ordens-venda", label: "Ordens de venda", icone: ClipboardList },
  { href: "/agendamentos", label: "Agendamentos", icone: CalendarClock },
] as const;

const NAV_CADASTROS = [
  { href: "/cadastros/clientes", label: "Clientes", icone: Users },
  { href: "/cadastros/transportes", label: "Transportes", icone: Truck },
  { href: "/cadastros/itens", label: "Itens", icone: Package },
] as const;

function NavLink({
  href,
  label,
  icone: Icone,
}: {
  href: string;
  label: string;
  icone: typeof LayoutDashboard;
}) {
  const pathname = usePathname();
  const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        ativo
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icone className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

/** Layout principal: sidebar de navegação + área de conteúdo. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="bg-card sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r md:flex">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <Boxes className="text-primary size-6" />
          <div>
            <p className="text-sm font-semibold leading-none">OVGS</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Gestão de Ordens de Venda
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Principal">
          {NAV_PRINCIPAL.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <p className="text-muted-foreground mt-4 mb-1 px-3 text-xs font-medium uppercase tracking-wide">
            Cadastros
          </p>
          {NAV_CADASTROS.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 backdrop-blur md:hidden">
          <Boxes className="text-primary size-5" />
          <span className="text-sm font-semibold">OVGS</span>
          <nav
            className="ml-auto flex gap-1 overflow-x-auto"
            aria-label="Principal"
          >
            {[...NAV_PRINCIPAL, ...NAV_CADASTROS].map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
