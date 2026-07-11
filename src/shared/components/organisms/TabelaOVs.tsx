"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OrdemVenda } from "@/entities/ordem-venda/model/ordemVendaSchema";
import { formatarAgendamentoOrdem } from "@/entities/ordem-venda/model/ordemVendaSchema";
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

function LinhaVazia() {
  return (
    <p className="text-muted-foreground py-10 text-center text-sm">
      Nenhuma ordem de venda encontrada.
    </p>
  );
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
    <>
      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OV</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Transporte</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead className="text-center">Status</TableHead>
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
                  <div className="flex justify-center">
                    <BadgeStatus status={ordem.status} />
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="max-[1174px]:hidden">
                    {formatarAgendamentoOrdem(ordem)}
                  </span>
                  <span className="hidden max-[1174px]:inline">
                    {formatarAgendamentoOrdem(ordem, true)}
                  </span>
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

      <div className="space-y-3 md:hidden">
        {ordens.length === 0 && <LinhaVazia />}
        {ordens.map((ordem) => (
          <article
            key={ordem.id}
            className="bg-card text-card-foreground space-y-3 rounded-lg border p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs">
                  {ordem.id.slice(-8).toUpperCase()}
                </p>
                <p className="truncate font-medium">
                  {nomesClientes[ordem.clienteId] ?? "—"}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" asChild>
                <Link
                  href={`/ordens-venda/${ordem.id}`}
                  aria-label={`Detalhes da OV ${ordem.id.slice(-8)}`}
                >
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">Transporte</dt>
                <dd>{nomesTransportes[ordem.tipoTransporteId] ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Itens</dt>
                <dd>{ordem.itensIds.length}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Agendamento</dt>
                <dd>
                  <span className="max-[1174px]:hidden">
                    {formatarAgendamentoOrdem(ordem)}
                  </span>
                  <span className="hidden max-[1174px]:inline">
                    {formatarAgendamentoOrdem(ordem, true)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Criada em</dt>
                <dd>{formatarData(ordem.criadaEm)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Status</dt>
                <dd className="flex justify-center">
                  <BadgeStatus status={ordem.status} />
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
