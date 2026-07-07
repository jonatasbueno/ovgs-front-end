"use client";

import { useEffect, useState, type ReactNode } from "react";

const mockHabilitado =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

/**
 * Inicializa o MSW no navegador antes de renderizar a aplicação,
 * evitando que as primeiras queries escapem do interceptador.
 */
export function MockProvider({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState(!mockHabilitado);

  useEffect(() => {
    if (pronto) return;

    let ativo = true;

    import("@/shared/api/configMock/browser")
      .then(({ worker }) =>
        worker.start({ onUnhandledRequest: "bypass", quiet: true }),
      )
      .then(() => {
        if (ativo) setPronto(true);
      });

    return () => {
      ativo = false;
    };
  }, [pronto]);

  if (!pronto) return null;

  return <>{children}</>;
}
