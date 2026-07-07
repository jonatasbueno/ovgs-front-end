import {
  atualizarClienteSchema,
  criarClienteSchema,
  type AtualizarClienteInput,
  type Cliente,
  type CriarClienteInput,
} from "../model/clienteSchema";
import { clienteApi } from "../infrastructure/clienteApi";

export async function executeListarClientes(): Promise<Cliente[]> {
  return clienteApi.listar();
}

export async function executeBuscarCliente(id: string): Promise<Cliente> {
  return clienteApi.buscarPorId(id);
}

export async function executeCriarCliente(
  input: CriarClienteInput,
): Promise<Cliente> {
  const parsed = criarClienteSchema.parse(input);
  return clienteApi.criar(parsed);
}

export async function executeAtualizarCliente(
  id: string,
  input: AtualizarClienteInput,
): Promise<Cliente> {
  const parsed = atualizarClienteSchema.parse(input);
  return clienteApi.atualizar(id, parsed);
}
