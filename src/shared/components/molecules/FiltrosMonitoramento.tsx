"use client";

import { useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { ptBR as ptBRDateFns } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { ptBR as ptBRDayPicker } from "react-day-picker/locale";
import type { Cliente } from "@/entities/cliente/model/clienteSchema";
import type { TipoTransporte } from "@/entities/tipo-transporte/model/tipoTransporteSchema";
import type { FiltrosOrdemVenda } from "@/entities/ordem-venda/model/ordemVendaSchema";
import {
  STATUS_LABELS,
  STATUS_ORDEM_VENDA,
} from "@/entities/ordem-venda/model/statusOrdemVenda";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const TODOS = "__todos__";

type OpcaoCliente = {
  label: string;
  value: string;
};

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
  const [dataAberta, setDataAberta] = useState(false);
  const temFiltros = Object.keys(filtros).length > 0;

  const opcoesCliente = useMemo<OpcaoCliente[]>(
    () => [
      { label: "Todos", value: TODOS },
      ...clientes.map((cliente) => ({
        label: cliente.nome,
        value: cliente.id,
      })),
    ],
    [clientes],
  );

  const clienteSelecionado =
    opcoesCliente.find(
      (opcao) => opcao.value === (filtros.clienteId ?? TODOS),
    ) ?? opcoesCliente[0];

  const dataSelecionada = filtros.data
    ? parse(filtros.data, "yyyy-MM-dd", new Date())
    : undefined;

  const handleSelect = (campo: keyof FiltrosOrdemVenda) => (valor: string) => {
    onFiltroChange(campo, valor === TODOS ? undefined : valor);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="filtro-cliente">Cliente</Label>
        <Combobox
          items={opcoesCliente}
          value={clienteSelecionado}
          onValueChange={(opcao) => {
            if (!opcao) {
              onFiltroChange("clienteId", undefined);
              return;
            }
            onFiltroChange(
              "clienteId",
              opcao.value === TODOS ? undefined : opcao.value,
            );
          }}
          itemToStringValue={(opcao) => opcao.label}
        >
          <ComboboxInput
            id="filtro-cliente"
            placeholder="Buscar cliente..."
            className="w-full"
            showClear={Boolean(filtros.clienteId)}
          />
          <ComboboxContent>
            <ComboboxEmpty>Nenhum cliente encontrado.</ComboboxEmpty>
            <ComboboxList>
              {(opcao) => (
                <ComboboxItem key={opcao.value} value={opcao}>
                  {opcao.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

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
          <Popover open={dataAberta} onOpenChange={setDataAberta}>
            <PopoverTrigger asChild>
              <Button
                id="filtro-data"
                variant="outline"
                data-empty={!dataSelecionada}
                className="w-40 justify-start font-normal data-[empty=true]:text-muted-foreground"
              >
                <CalendarIcon />
                {dataSelecionada
                  ? format(dataSelecionada, "P", { locale: ptBRDateFns })
                  : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dataSelecionada}
                defaultMonth={dataSelecionada}
                onSelect={(data) => {
                  onFiltroChange(
                    "data",
                    data ? format(data, "yyyy-MM-dd") : undefined,
                  );
                  setDataAberta(false);
                }}
                locale={ptBRDayPicker}
              />
            </PopoverContent>
          </Popover>
        </div>

        {temFiltros && (
          <Button variant="ghost" size="sm" onClick={onLimpar}>
            <X className="size-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
