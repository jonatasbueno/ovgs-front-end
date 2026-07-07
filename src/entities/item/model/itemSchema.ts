import { z } from "zod";

export const itemSchema = z.object({
  /** SKU do item */
  id: z.uuid(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  pesoKg: z.number().positive().optional(),
  volumeM3: z.number().positive().optional(),
});

export const criarItemSchema = itemSchema.omit({ id: true });

export type Item = z.infer<typeof itemSchema>;
export type CriarItemInput = z.infer<typeof criarItemSchema>;
