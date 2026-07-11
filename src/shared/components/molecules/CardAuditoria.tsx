import {
  TIPO_ACAO_LABELS,
  type Auditoria,
} from "@/entities/auditoria/model/auditoriaSchema";
import {
  STATUS_LABELS,
  statusOrdemVendaSchema,
} from "@/entities/ordem-venda/model/statusOrdemVenda";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

interface CardAuditoriaProps {
  auditoria: Auditoria;
}

function formatarDataHora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatarValorEstado(chave: string, valor: unknown): string {
  if (chave === "status" && typeof valor === "string") {
    const parsed = statusOrdemVendaSchema.safeParse(valor);
    if (parsed.success) return STATUS_LABELS[parsed.data];
  }

  return String(valor).replace(/_/g, " ");
}

function resumoEstado(estado?: Record<string, unknown>): string | null {
  if (!estado) return null;
  return Object.entries(estado)
    .map(([chave, valor]) => `${chave}: ${formatarValorEstado(chave, valor)}`)
    .join(" · ");
}

export function CardAuditoria({ auditoria }: CardAuditoriaProps) {
  const anterior = resumoEstado(auditoria.estadoAnterior);
  const posterior = resumoEstado(auditoria.estadoPosterior);

  return (
    <Card className="py-3">
      <CardContent className="flex flex-col gap-1.5 px-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">
            {TIPO_ACAO_LABELS[auditoria.tipoAcao]}
          </Badge>
          <time
            dateTime={auditoria.dataHora}
            className="text-muted-foreground text-xs"
          >
            {formatarDataHora(auditoria.dataHora)}
          </time>
        </div>
        {anterior && (
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">Antes:</span> {anterior}
          </p>
        )}
        {posterior && (
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">Depois:</span> {posterior}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
