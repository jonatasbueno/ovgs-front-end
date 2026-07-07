"use client";

import { X } from "lucide-react";
import type { Cliente } from "@/entities/cliente/model/clienteSchema";
import type { TipoTransporte } from "@/entities/tipo-transporte/model/tipoTransporteSchema";
import type { FiltrosOrdemVenda } from "@/entities/ordem-venda/model/ordemVendaSchema";
import {
  STATUS_LABELS,
  STATUS_ORDEM_VENDA,
} from "@/entities/ordem-venda/model/statusOrdemVenda";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const TODOS = "__todos__";

interface FiltrosMonitoramentoProps {
  filtros: FiltrosOrdemVenda;
  clientes: Cliente[];
  tiposTransporte: TipoTransporte[];
  onFiltroChange: <K extends keyof FiltrosOrdemVenda>(
    campo: K,
    valor: FiltrosOrdemVenda[K],
  ) => void;
  onLimpar: () => void;
}

/**
 * Filtros combinados do painel de monitoramento: status, cliente,
 * tipo de transporte e data (de agendamento ou criação).
 */
export function FiltrosMonitoramento({
  filtros,
  clientes,
  tiposTransporte,
  onFiltroChange,
  onLimpar,
}: FiltrosMonitoramentoProps) {
  const temFiltros = Object.keys(filtros).length > 0;

  const handleSelect = (campo: keyof FiltrosOrdemVenda) => (valor: string) => {
    onFiltroChange(campo, valor === TODOS ? undefined : valor);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="filtro-status">Status</Label>
        <Select
          value={filtros.status ?? TODOS}
          onValueChange={handleSelect("status")}
        >
          <SelectTrigger id="filtro-status" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos</SelectItem>
            {STATUS_ORDEM_VENDA.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="filtro-cliente">Cliente</Label>
        <Select
          value={filtros.clienteId ?? TODOS}
          onValueChange={handleSelect("clienteId")}
        >
          <SelectTrigger id="filtro-cliente" className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos</SelectItem>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="filtro-transporte">Tipo de transporte</Label>
        <Select
          value={filtros.tipoTransporteId ?? TODOS}
          onValueChange={handleSelect("tipoTransporteId")}
        >
          <SelectTrigger id="filtro-transporte" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos</SelectItem>
            {tiposTransporte.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id}>
                {tipo.descricao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="filtro-data">Data</Label>
        <Input
          id="filtro-data"
          type="date"
          className="w-40"
          value={filtros.data ?? ""}
          onChange={(e) => onFiltroChange("data", e.target.value || undefined)}
        />
      </div>

      {temFiltros && (
        <Button variant="ghost" size="sm" onClick={onLimpar}>
          <X className="size-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
