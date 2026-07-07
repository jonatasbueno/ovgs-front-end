import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { FiltrosOrdemVenda } from "@/entities/ordem-venda/model/ordemVendaSchema";

interface FiltrosMonitoramentoState {
  filtros: FiltrosOrdemVenda;
  setFiltro: <K extends keyof FiltrosOrdemVenda>(
    campo: K,
    valor: FiltrosOrdemVenda[K],
  ) => void;
  limparFiltros: () => void;
}

export const useFiltrosMonitoramentoStore = create<FiltrosMonitoramentoState>()(
  immer((set) => ({
    filtros: {},
    setFiltro: (campo, valor) =>
      set((state) => {
        if (valor) {
          state.filtros[campo] = valor;
        } else {
          delete state.filtros[campo];
        }
      }),
    limparFiltros: () =>
      set((state) => {
        state.filtros = {};
      }),
  })),
);
