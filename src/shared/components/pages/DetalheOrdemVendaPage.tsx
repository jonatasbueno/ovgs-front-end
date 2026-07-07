"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, ChevronRight } from "lucide-react";
import {
  useOrdemVenda,
  STATUS_LABELS,
  JANELA_LABELS,
} from "@/entities/ordem-venda";
import { useCliente } from "@/entities/cliente";
import { useTiposTransporte } from "@/entities/tipo-transporte";
import { useItens } from "@/entities/item";
import { useAuditorias } from "@/entities/auditoria";
import { useProgressaoStatus } from "@/features/gestao-ovs";
import { useAgendamentoEntrega } from "@/features/central-agendamento";
import { BadgeStatus } from "@/shared/components/atoms/BadgeStatus";
import { StepProgress } from "@/shared/components/molecules/StepProgress";
import { CardAuditoria } from "@/shared/components/molecules/CardAuditoria";
import { ModalAgendamento } from "@/shared/components/organisms/ModalAgendamento";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface DetalheOrdemVendaPageProps {
  id: string;
}

/** Detalhes de uma OV: fluxo de status, ações e trilha de auditoria. */
export function DetalheOrdemVendaPage({ id }: DetalheOrdemVendaPageProps) {
  const ordemQuery = useOrdemVenda(id);
  const ordem = ordemQuery.data;

  const clienteQuery = useCliente(ordem?.clienteId);
  const transportesQuery = useTiposTransporte();
  const itensQuery = useItens();
  const auditoriasQuery = useAuditorias(id);

  const { statusSeguinte, avancoBloqueadoPorAgendamento, avancar, enviando } =
    useProgressaoStatus(ordem);
  const agendamento = useAgendamentoEntrega();
  const [modalAberto, setModalAberto] = useState(false);

  if (ordemQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ordem) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">Ordem de venda não encontrada.</p>
        <Button variant="outline" asChild>
          <Link href="/ordens-venda">
            <ArrowLeft className="size-4" />
            Voltar para a listagem
          </Link>
        </Button>
      </div>
    );
  }

  const transporte = transportesQuery.data?.find(
    (t) => t.id === ordem.tipoTransporteId,
  );
  const itensDaOrdem = (itensQuery.data ?? []).filter((item) =>
    ordem.itensIds.includes(item.id),
  );
  const podeAgendar = ordem.status === "PLANEJADA";
  const podeReagendar = ordem.status === "AGENDADA";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/ordens-venda">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            OV {ordem.id.slice(-8).toUpperCase()}
          </h1>
          <BadgeStatus status={ordem.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo operacional</CardTitle>
          <CardDescription>
            As transições seguem o fluxo estrito, sem saltos ou retrocessos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <StepProgress statusAtual={ordem.status} />
          <Separator />
          <div className="flex flex-wrap items-center gap-3">
            {statusSeguinte && (
              <Button
                onClick={avancar}
                disabled={enviando || avancoBloqueadoPorAgendamento}
              >
                <ChevronRight className="size-4" />
                Avançar para {STATUS_LABELS[statusSeguinte]}
              </Button>
            )}
            {(podeAgendar || podeReagendar) && (
              <Button
                variant={podeAgendar ? "default" : "outline"}
                onClick={() => setModalAberto(true)}
                disabled={agendamento.enviando}
              >
                <CalendarClock className="size-4" />
                {podeAgendar ? "Agendar entrega" : "Reagendar entrega"}
              </Button>
            )}
            {!statusSeguinte && (
              <p className="text-muted-foreground text-sm">
                Esta OV concluiu o fluxo operacional. 🎉
              </p>
            )}
          </div>
          {avancoBloqueadoPorAgendamento && (
            <p className="text-muted-foreground text-sm">
              Para mover a OV para <strong>Agendada</strong>, defina a data e a
              janela de atendimento pelo botão “Agendar entrega”.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados da ordem</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-medium">
                {clienteQuery.data?.nome ?? "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tipo de transporte</span>
              <span className="font-medium">
                {transporte?.descricao ?? "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Agendamento</span>
              <span className="font-medium">
                {ordem.dadosAgendamento
                  ? `${ordem.dadosAgendamento.data.split("-").reverse().join("/")} · ${JANELA_LABELS[ordem.dadosAgendamento.janela]}`
                  : "Não agendada"}
              </span>
            </div>
            <Separator />
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Itens ({itensDaOrdem.length})
            </p>
            <ul className="grid gap-1.5">
              {itensDaOrdem.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span>{item.descricao}</span>
                  <span className="text-muted-foreground">
                    {[
                      item.pesoKg ? `${item.pesoKg} kg` : null,
                      item.volumeM3 ? `${item.volumeM3} m³` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>
              Histórico de eventos registrados para esta OV.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {(auditoriasQuery.data ?? []).length === 0 && (
              <p className="text-muted-foreground text-sm">
                Nenhum evento registrado.
              </p>
            )}
            {(auditoriasQuery.data ?? []).map((auditoria) => (
              <CardAuditoria key={auditoria.id} auditoria={auditoria} />
            ))}
          </CardContent>
        </Card>
      </div>

      <ModalAgendamento
        aberto={modalAberto}
        onAbertoChange={setModalAberto}
        reagendamento={podeReagendar}
        valoresIniciais={ordem.dadosAgendamento}
        enviando={agendamento.enviando}
        onConfirmar={(dados) =>
          agendamento.agendar(ordem.id, dados, {
            reagendamento: podeReagendar,
            onSuccess: () => setModalAberto(false),
          })
        }
      />
    </div>
  );
}
