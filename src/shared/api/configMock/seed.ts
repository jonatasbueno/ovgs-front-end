import type { Cliente } from "@/entities/cliente/model/clienteSchema";
import type { TipoTransporte } from "@/entities/tipo-transporte/model/tipoTransporteSchema";
import type { Item } from "@/entities/item/model/itemSchema";
import type { OrdemVenda } from "@/entities/ordem-venda/model/ordemVendaSchema";
import type { Auditoria } from "@/entities/auditoria/model/auditoriaSchema";

export const TRANSPORTE_CAMINHAO = "1a6f4c1e-9b2d-4c3a-8f5e-000000000001";
export const TRANSPORTE_CARRETA = "1a6f4c1e-9b2d-4c3a-8f5e-000000000002";
export const TRANSPORTE_BITRUCK = "1a6f4c1e-9b2d-4c3a-8f5e-000000000003";
export const TRANSPORTE_VAN = "1a6f4c1e-9b2d-4c3a-8f5e-000000000004";

export const CLIENTE_AURORA = "2b7e5d2f-8c3e-4d4b-9a6f-000000000001";
export const CLIENTE_LITORAL = "2b7e5d2f-8c3e-4d4b-9a6f-000000000002";
export const CLIENTE_HORIZONTE = "2b7e5d2f-8c3e-4d4b-9a6f-000000000003";

export const ITEM_CIMENTO = "3c8f6e3a-7d4f-4e5c-8b7a-000000000001";
export const ITEM_ARROZ = "3c8f6e3a-7d4f-4e5c-8b7a-000000000002";
export const ITEM_ACO = "3c8f6e3a-7d4f-4e5c-8b7a-000000000003";
export const ITEM_BEBIDAS = "3c8f6e3a-7d4f-4e5c-8b7a-000000000004";
export const ITEM_HIGIENE = "3c8f6e3a-7d4f-4e5c-8b7a-000000000005";
export const ITEM_MADEIRA = "3c8f6e3a-7d4f-4e5c-8b7a-000000000006";

export const OV_CRIADA = "4d9a7f4b-6e5a-4f6d-9c8b-000000000001";
export const OV_PLANEJADA = "4d9a7f4b-6e5a-4f6d-9c8b-000000000002";
export const OV_AGENDADA = "4d9a7f4b-6e5a-4f6d-9c8b-000000000003";
export const OV_EM_TRANSPORTE = "4d9a7f4b-6e5a-4f6d-9c8b-000000000004";
export const OV_ENTREGUE = "4d9a7f4b-6e5a-4f6d-9c8b-000000000005";

export interface MockDb {
  clientes: Cliente[];
  tiposTransporte: TipoTransporte[];
  itens: Item[];
  ordensVenda: OrdemVenda[];
  auditorias: Auditoria[];
}

export function criarSeed(): MockDb {
  const agora = new Date();
  const diasAtras = (dias: number) =>
    new Date(agora.getTime() - dias * 24 * 60 * 60 * 1000).toISOString();
  const emDias = (dias: number) =>
    new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

  return {
    tiposTransporte: [
      { id: TRANSPORTE_CAMINHAO, descricao: "Caminhão" },
      { id: TRANSPORTE_CARRETA, descricao: "Carreta" },
      { id: TRANSPORTE_BITRUCK, descricao: "Bi-truck" },
      { id: TRANSPORTE_VAN, descricao: "Van" },
    ],
    clientes: [
      {
        id: CLIENTE_AURORA,
        nome: "Distribuidora Aurora",
        transportesAutorizadosIds: [TRANSPORTE_CAMINHAO, TRANSPORTE_CARRETA],
      },
      {
        id: CLIENTE_LITORAL,
        nome: "Supermercados Litoral",
        transportesAutorizadosIds: [TRANSPORTE_CAMINHAO, TRANSPORTE_VAN],
      },
      {
        id: CLIENTE_HORIZONTE,
        nome: "Construtora Horizonte",
        transportesAutorizadosIds: [TRANSPORTE_CARRETA, TRANSPORTE_BITRUCK],
      },
    ],
    itens: [
      { id: ITEM_CIMENTO, descricao: "Cimento CP-II 50kg", pesoKg: 50 },
      { id: ITEM_ARROZ, descricao: "Arroz tipo 1 - fardo 30kg", pesoKg: 30 },
      { id: ITEM_ACO, descricao: "Vergalhão de aço 12m", pesoKg: 8.9 },
      {
        id: ITEM_BEBIDAS,
        descricao: "Engradado de bebidas",
        pesoKg: 15,
        volumeM3: 0.04,
      },
      {
        id: ITEM_HIGIENE,
        descricao: "Kit higiene e limpeza",
        pesoKg: 12,
        volumeM3: 0.06,
      },
      { id: ITEM_MADEIRA, descricao: "Madeira serrada m³", volumeM3: 1 },
    ],
    ordensVenda: [
      {
        id: OV_CRIADA,
        clienteId: CLIENTE_AURORA,
        tipoTransporteId: TRANSPORTE_CAMINHAO,
        itensIds: [ITEM_ARROZ, ITEM_BEBIDAS],
        status: "CRIADA",
        criadaEm: diasAtras(1),
      },
      {
        id: OV_PLANEJADA,
        clienteId: CLIENTE_HORIZONTE,
        tipoTransporteId: TRANSPORTE_CARRETA,
        itensIds: [ITEM_CIMENTO, ITEM_ACO],
        status: "PLANEJADA",
        criadaEm: diasAtras(2),
      },
      {
        id: OV_AGENDADA,
        clienteId: CLIENTE_LITORAL,
        tipoTransporteId: TRANSPORTE_VAN,
        itensIds: [ITEM_HIGIENE],
        status: "AGENDADA",
        dadosAgendamento: { data: emDias(2), janela: "MANHA" },
        criadaEm: diasAtras(3),
      },
      {
        id: OV_EM_TRANSPORTE,
        clienteId: CLIENTE_AURORA,
        tipoTransporteId: TRANSPORTE_CARRETA,
        itensIds: [ITEM_BEBIDAS, ITEM_ARROZ, ITEM_HIGIENE],
        status: "EM_TRANSPORTE",
        dadosAgendamento: { data: emDias(0), janela: "TARDE" },
        criadaEm: diasAtras(5),
      },
      {
        id: OV_ENTREGUE,
        clienteId: CLIENTE_HORIZONTE,
        tipoTransporteId: TRANSPORTE_BITRUCK,
        itensIds: [ITEM_MADEIRA],
        status: "ENTREGUE",
        dadosAgendamento: { data: emDias(-2), janela: "NOITE" },
        entregueEm: diasAtras(2),
        criadaEm: diasAtras(9),
      },
    ],
    auditorias: [
      {
        id: "5e0b8a5c-5f6b-4a7e-8d9c-000000000001",
        dataHora: diasAtras(1),
        tipoAcao: "CRIACAO_OV",
        entidadeAfetada: OV_CRIADA,
        estadoPosterior: { status: "CRIADA" },
      },
      {
        id: "5e0b8a5c-5f6b-4a7e-8d9c-000000000002",
        dataHora: diasAtras(3),
        tipoAcao: "AGENDAMENTO",
        entidadeAfetada: OV_AGENDADA,
        estadoAnterior: { status: "PLANEJADA" },
        estadoPosterior: {
          status: "AGENDADA",
          data: emDias(2),
          janela: "MANHA",
        },
      },
    ],
  };
}
