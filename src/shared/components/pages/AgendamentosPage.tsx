"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, ExternalLink } from "lucide-react";
import {
  JANELA_LABELS,
  useOrdensVenda,
  type OrdemVenda,
} from "@/entities/ordem-venda";
import { useClientes } from "@/entities/cliente";
import { useAgendamentoEntrega } from "@/features/central-agendamento";
import { BadgeStatus } from "@/shared/components/atoms/BadgeStatus";
import { ModalAgendamento } from "@/shared/components/organisms/ModalAgendamento";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

/**
 * Central de Agendamento.
 * OVs planejadas aguardam o primeiro agendamento; OVs agendadas
 * podem ser reagendadas (com registro de auditoria).
 */
export function AgendamentosPage() {
  const planejadasQuery = useOrdensVenda({ status: "PLANEJADA" });
  const agendadasQuery = useOrdensVenda({ status: "AGENDADA" });
  const clientesQuery = useClientes();
  const agendamento = useAgendamentoEntrega();

  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemVenda | null>(
    null,
  );

  const nomeCliente = (clienteId: string) =>
    clientesQuery.data?.find((c) => c.id === clienteId)?.nome ?? "—";

  const reagendamento = ordemSelecionada?.status === "AGENDADA";

  const renderLista = (
    ordens: OrdemVenda[] | undefined,
    carregando: boolean,
    vazio: string,
  ) => {
    if (carregando) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }
    if (!ordens?.length) {
      return (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {vazio}
        </p>
      );
    }
    return (
      <div className="grid gap-3">
        {ordens.map((ordem) => (
          <Card key={ordem.id} className="py-4">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">
                    OV {ordem.id.slice(-8).toUpperCase()}
                  </span>
                  <BadgeStatus status={ordem.status} />
                </div>
                <p className="text-muted-foreground text-sm">
                  {nomeCliente(ordem.clienteId)} · {ordem.itensIds.length}{" "}
                  item(ns)
                </p>
                {ordem.dadosAgendamento && (
                  <p className="text-sm">
                    <CalendarClock className="mr-1 inline size-3.5" />
                    {ordem.dadosAgendamento.data
                      .split("-")
                      .reverse()
                      .join("/")}{" "}
                    · {JANELA_LABELS[ordem.dadosAgendamento.janela]}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={ordem.status === "PLANEJADA" ? "default" : "outline"}
                  onClick={() => setOrdemSelecionada(ordem)}
                >
                  {ordem.status === "PLANEJADA" ? "Agendar" : "Reagendar"}
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link
                    href={`/ordens-venda/${ordem.id}`}
                    aria-label="Abrir detalhes da OV"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Central de agendamento
        </h1>
        <p className="text-muted-foreground text-sm">
          Defina data e janela de atendimento para as entregas.
        </p>
      </div>

      <Tabs defaultValue="planejadas">
        <TabsList>
          <TabsTrigger value="planejadas">
            Aguardando agendamento ({planejadasQuery.data?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="agendadas">
            Agendadas ({agendadasQuery.data?.length ?? 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="planejadas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>OVs planejadas</CardTitle>
              <CardDescription>
                Ao agendar, a OV avança para o status Agendada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLista(
                planejadasQuery.data,
                planejadasQuery.isLoading,
                "Nenhuma OV aguardando agendamento.",
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="agendadas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>OVs agendadas</CardTitle>
              <CardDescription>
                Reagendamentos são registrados na auditoria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLista(
                agendadasQuery.data,
                agendadasQuery.isLoading,
                "Nenhuma OV agendada.",
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ModalAgendamento
        aberto={Boolean(ordemSelecionada)}
        onAbertoChange={(aberto) => {
          if (!aberto) setOrdemSelecionada(null);
        }}
        reagendamento={reagendamento}
        valoresIniciais={ordemSelecionada?.dadosAgendamento}
        enviando={agendamento.enviando}
        onConfirmar={(dados) => {
          if (!ordemSelecionada) return;
          agendamento.agendar(ordemSelecionada.id, dados, {
            reagendamento,
            onSuccess: () => setOrdemSelecionada(null),
          });
        }}
      />
    </div>
  );
}
