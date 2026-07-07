"use client";

import { useQuery } from "@tanstack/react-query";
import { executeListarAuditorias } from "../../application/auditoriaUseCases";

export const auditoriaKeys = {
  all: ["auditorias"] as const,
  byEntidade: (entidadeAfetada?: string) =>
    ["auditorias", entidadeAfetada ?? "todas"] as const,
};

export function useAuditorias(entidadeAfetada?: string) {
  return useQuery({
    queryKey: auditoriaKeys.byEntidade(entidadeAfetada),
    queryFn: () => executeListarAuditorias(entidadeAfetada),
  });
}
