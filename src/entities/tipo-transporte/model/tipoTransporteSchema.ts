import { z } from "zod";

export const tipoTransporteSchema = z.object({
  id: z.uuid(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
});

export const criarTipoTransporteSchema = tipoTransporteSchema.omit({
  id: true,
});

export type TipoTransporte = z.infer<typeof tipoTransporteSchema>;
export type CriarTipoTransporteInput = z.infer<
  typeof criarTipoTransporteSchema
>;
