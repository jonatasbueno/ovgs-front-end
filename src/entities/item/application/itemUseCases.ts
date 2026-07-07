import {
  criarItemSchema,
  type CriarItemInput,
  type Item,
} from "../model/itemSchema";
import { itemApi } from "../infrastructure/itemApi";

export async function executeListarItens(): Promise<Item[]> {
  return itemApi.listar();
}

export async function executeCriarItem(input: CriarItemInput): Promise<Item> {
  const parsed = criarItemSchema.parse(input);
  return itemApi.criar(parsed);
}
