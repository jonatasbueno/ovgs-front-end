"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  dadosAgendamentoSchema,
  JANELA_LABELS,
  JANELAS_ATENDIMENTO,
  type DadosAgendamento,
} from "@/entities/ordem-venda/model/ordemVendaSchema";
import { FormInput } from "@/shared/components/atoms/FormInput";
import { FormSelect } from "@/shared/components/atoms/FormSelect";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface ModalAgendamentoProps {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  onConfirmar: (dados: DadosAgendamento) => void;
  valoresIniciais?: DadosAgendamento;
  reagendamento?: boolean;
  enviando?: boolean;
}

/**
 * Modal para definir data e janela de atendimento de uma entrega.
 * Usado tanto para o agendamento inicial (PLANEJADA → AGENDADA)
 * quanto para reagendamentos.
 */
export function ModalAgendamento({
  aberto,
  onAbertoChange,
  onConfirmar,
  valoresIniciais,
  reagendamento = false,
  enviando = false,
}: ModalAgendamentoProps) {
  const form = useForm<DadosAgendamento>({
    resolver: zodResolver(dadosAgendamentoSchema),
    defaultValues: valoresIniciais ?? { data: "", janela: undefined },
  });

  useEffect(() => {
    if (aberto) {
      form.reset(valoresIniciais ?? { data: "", janela: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {reagendamento ? "Reagendar entrega" : "Agendar entrega"}
          </DialogTitle>
          <DialogDescription>
            {reagendamento
              ? "A alteração ficará registrada na auditoria da OV."
              : "Ao confirmar, a OV passará para o status Agendada."}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onConfirmar)}
            noValidate
            className="grid gap-4"
          >
            <FormInput<DadosAgendamento>
              name="data"
              label="Data da entrega"
              type="date"
            />
            <FormSelect<DadosAgendamento>
              name="janela"
              label="Janela de atendimento"
              placeholder="Selecione a janela"
              options={JANELAS_ATENDIMENTO.map((janela) => ({
                value: janela,
                label: JANELA_LABELS[janela],
              }))}
            />
            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onAbertoChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando && <Loader2 className="size-4 animate-spin" />}
                {reagendamento
                  ? "Confirmar reagendamento"
                  : "Confirmar agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
