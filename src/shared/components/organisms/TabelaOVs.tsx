"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OrdemVenda } from "@/entities/ordem-venda/model/ordemVendaSchema";
import { JANELA_LABELS } from "@/entities/ordem-venda/model/ordemVendaSchema";
import { BadgeStatus } from "@/shared/components/atoms/BadgeStatus";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface TabelaOVsProps {
  ordens: OrdemVenda[];
  nomesClientes: Record<string, string>;
  nomesTransportes: Record<string, string>;
  carregando?: boolean;
}

function formatarData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
    new Date(iso),
  );
}

function formatarAgendamento(ordem: OrdemVenda): string {
  if (!ordem.dadosAgendamento) return "—";
  const [ano, mes, dia] = ordem.dadosAgendamento.data.split("-");
  return `${dia}/${mes}/${ano} · ${JANELA_LABELS[ordem.dadosAgendamento.janela]}`;
}

export function TabelaOVs({
  ordens,
  nomesClientes,
  nomesTransportes,
  carregando = false,
}: TabelaOVsProps) {
  if (carregando) {
    return (
      <div
        className="space-y-2"
        aria-busy="true"
        aria-label="Carregando ordens"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>OV</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Transporte</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agendamento</TableHead>
            <TableHead>Criada em</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordens.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-muted-foreground h-24 text-center"
              >
                Nenhuma ordem de venda encontrada.
              </TableCell>
            </TableRow>
          )}
          {ordens.map((ordem) => (
            <TableRow key={ordem.id}>
              <TableCell className="font-mono text-xs">
                {ordem.id.slice(-8).toUpperCase()}
              </TableCell>
              <TableCell className="font-medium">
                {nomesClientes[ordem.clienteId] ?? "—"}
              </TableCell>
              <TableCell>
                {nomesTransportes[ordem.tipoTransporteId] ?? "—"}
              </TableCell>
              <TableCell>{ordem.itensIds.length}</TableCell>
              <TableCell>
                <BadgeStatus status={ordem.status} />
              </TableCell>
              <TableCell className="text-sm">
                {formatarAgendamento(ordem)}
              </TableCell>
              <TableCell className="text-sm">
                {formatarData(ordem.criadaEm)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link
                    href={`/ordens-venda/${ordem.id}`}
                    aria-label={`Detalhes da OV ${ordem.id.slice(-8)}`}
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
