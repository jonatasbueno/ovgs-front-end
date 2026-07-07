import { httpClient } from "@/shared/api/httpClient";
import type { CriarItemInput, Item } from "../model/itemSchema";

export const itemApi = {
  listar: async (): Promise<Item[]> => {
    const { data } = await httpClient.get<Item[]>("/itens");
    return data;
  },

  criar: async (input: CriarItemInput): Promise<Item> => {
    const { data } = await httpClient.post<Item>("/itens", input);
    return data;
  },
};
