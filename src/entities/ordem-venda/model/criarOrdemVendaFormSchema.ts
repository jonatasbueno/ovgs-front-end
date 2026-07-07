import {
  clienteAutorizaTransporte,
  type Cliente,
} from "@/entities/cliente/model/clienteSchema";
import { criarOrdemVendaSchema } from "./ordemVendaSchema";

/**
 * Constrói o schema do formulário de criação de OV com validação cruzada:
 * o tipo de transporte selecionado precisa estar autorizado para o cliente.
 */
export function buildCriarOrdemVendaFormSchema(clientes: Cliente[]) {
  return criarOrdemVendaSchema.superRefine((dados, ctx) => {
    const cliente = clientes.find((c) => c.id === dados.clienteId);
    if (!cliente) return;

    if (!clienteAutorizaTransporte(cliente, dados.tipoTransporteId)) {
      ctx.addIssue({
        code: "custom",
        path: ["tipoTransporteId"],
        message: `Este transporte não está autorizado para ${cliente.nome}`,
      });
    }
  });
}
