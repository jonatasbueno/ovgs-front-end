import { Check } from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_ORDEM_VENDA,
  type StatusOrdemVenda,
} from "@/entities/ordem-venda/model/statusOrdemVenda";
import { cn } from "@/shared/lib/utils";

interface StepProgressProps {
  statusAtual: StatusOrdemVenda;
  className?: string;
}

/**
 * Linha do tempo do fluxo operacional da OV, destacando as etapas
 * concluídas, a atual e as futuras.
 */
export function StepProgress({ statusAtual, className }: StepProgressProps) {
  const indiceAtual = STATUS_ORDEM_VENDA.indexOf(statusAtual);

  return (
    <ol
      className={cn("flex w-full items-center gap-0", className)}
      aria-label="Progresso da ordem de venda"
    >
      {STATUS_ORDEM_VENDA.map((status, indice) => {
        const concluida = indice < indiceAtual;
        const atual = indice === indiceAtual;

        return (
          <li
            key={status}
            className="flex flex-1 items-center last:flex-none"
            aria-current={atual ? "step" : undefined}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  concluida && "border-emerald-500 bg-emerald-500 text-white",
                  atual && "border-primary bg-primary text-primary-foreground",
                  !concluida && !atual && "border-border text-muted-foreground",
                )}
              >
                {concluida ? <Check className="size-4" /> : indice + 1}
              </span>
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  atual
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
            {indice < STATUS_ORDEM_VENDA.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-5 h-0.5 flex-1",
                  indice < indiceAtual ? "bg-emerald-500" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
