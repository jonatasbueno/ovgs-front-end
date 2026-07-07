import { z } from "zod";

export const clienteSchema = z.object({
  id: z.uuid(),
  nome: z.string().min(1, "Nome é obrigatório"),
  /** Tipos de transporte que este cliente aceita receber */
  transportesAutorizadosIds: z
    .array(z.uuid())
    .min(1, "Selecione ao menos um transporte autorizado"),
});

export const criarClienteSchema = clienteSchema.omit({ id: true });
export const atualizarClienteSchema = criarClienteSchema.partial();

export type Cliente = z.infer<typeof clienteSchema>;
export type CriarClienteInput = z.infer<typeof criarClienteSchema>;
export type AtualizarClienteInput = z.infer<typeof atualizarClienteSchema>;

/**
 * Regra de negócio: um transporte só pode ser usado em uma OV
 * se estiver na lista de transportes autorizados do cliente.
 */
export function clienteAutorizaTransporte(
  cliente: Pick<Cliente, "transportesAutorizadosIds">,
  tipoTransporteId: string,
): boolean {
  return cliente.transportesAutorizadosIds.includes(tipoTransporteId);
}
