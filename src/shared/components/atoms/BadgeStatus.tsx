import { cva, type VariantProps } from "class-variance-authority";
import {
  STATUS_LABELS,
  type StatusOrdemVenda,
} from "@/entities/ordem-venda/model/statusOrdemVenda";
import { cn } from "@/shared/lib/utils";

const badgeStatusVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      status: {
        CRIADA: "border-slate-200 bg-slate-100 text-slate-700",
        PLANEJADA: "border-blue-200 bg-blue-50 text-blue-700",
        AGENDADA: "border-violet-200 bg-violet-50 text-violet-700",
        EM_TRANSPORTE: "border-amber-200 bg-amber-50 text-amber-700",
        ENTREGUE: "border-emerald-200 bg-emerald-50 text-emerald-700",
      },
    },
    defaultVariants: {
      status: "CRIADA",
    },
  },
);

interface BadgeStatusProps extends VariantProps<typeof badgeStatusVariants> {
  status: StatusOrdemVenda;
  className?: string;
}

export function BadgeStatus({ status, className }: BadgeStatusProps) {
  return (
    <span className={cn(badgeStatusVariants({ status }), className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
