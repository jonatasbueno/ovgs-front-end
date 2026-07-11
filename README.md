# OVGS — Sistema de Gestão de Ordens de Venda (Front-end)

Front-end do sistema de gestão de Ordens de Venda (OVs), com rastreabilidade,
visibilidade e governança sobre todo o ciclo de vida operacional:
`CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE`.

A API back-end é simulada por um **mock inteligente (MSW)** que inicia
automaticamente em desenvolvimento — basta rodar o projeto e usar.

---

## 🚀 Como executar

**Pré-requisitos:** Node.js 20+ e npm.

```bash
# 1. Instalar dependências
npm install

# 2. Instalar o navegador do Playwright (obrigatório para testes E2E e git push)
npm run test:e2e:install

# 3. Subir o ambiente de desenvolvimento (mock inicia automaticamente)
npm run dev
# → http://localhost:3000
```

> O `npm install` também tenta baixar o Chromium via `postinstall`. Se os testes E2E ou o hook de pre-push falharem com _Executable doesn't exist_, rode novamente o passo 2.

### Scripts disponíveis

| Script                     | Descrição                                 |
| -------------------------- | ----------------------------------------- |
| `npm run dev`              | Ambiente de desenvolvimento com MSW ativo |
| `npm run build`            | Build de produção                         |
| `npm run start`            | Servir o build de produção                |
| `npm run test`             | Testes unitários e de integração (Vitest) |
| `npm run test:watch`       | Testes em modo watch                      |
| `npm run test:e2e`         | Teste E2E happy path (Playwright)         |
| `npm run test:e2e:install` | Instala o Chromium usado pelo Playwright  |
| `npm run lint`             | ESLint (flat config)                      |
| `npm run typecheck`        | Verificação de tipos (`tsc --noEmit`)     |
| `npm run format`           | Formatação com Prettier                   |

---

## 🧰 Tecnologias

- **React 19 + Next.js 16 (App Router, Turbopack, React Compiler)**
- **TypeScript** em modo estrito
- **Tailwind CSS v4 + CVA + Radix UI / shadcn** — estilização e primitivas acessíveis
- **Zustand + Immer** — estado global de UI (filtros do monitoramento)
- **TanStack Query** — estado de servidor (cache, invalidação, re-fetch reativo)
- **React Hook Form + Zod** — formulários e validação (inclusive cruzada)
- **Axios** — HTTP centralizado via `httpClient`
- **MSW (Mock Service Worker)** — API simulada na camada de rede
- **Vitest + Testing Library** — testes unitários e de integração
- **Playwright** — teste E2E do happy path
- **ESLint (flat config), Prettier, Husky + Conventional Commits**

---

## 🏗️ Decisões arquiteturais

### Clean Architecture + Feature First

```
src/
  app/            # Rotas do Next.js — apenas re-exports finos das pages
  entities/       # Domínio isolado por entidade
    <entidade>/
      model/           # Schemas Zod, types e regras puras de domínio
      application/     # Casos de uso (executeX) — orquestram regras + infra
      infrastructure/  # Chamadas HTTP (Axios via httpClient)
      presentation/    # Hooks de queries/mutações (TanStack Query)
  features/       # Lógica de negócio composta, pronta para as pages
    gestao-ovs/ | monitoramento-operacional/ | central-agendamento/ | cadastros/
  shared/
    api/          # httpClient + configMock/ (MSW: handlers, db, seed)
    adapters/     # toast.ts — isola a lib de notificação
    components/   # Atomic Design: atoms/ molecules/ organisms/ pages/ ui/
    providers/    # AppProviders (QueryClient, MSW, Toaster)
    stores/       # Zustand (estado global de UI)
```

**Por que Clean Architecture?** As regras de negócio (fluxo de status,
autorização de transporte) vivem em funções puras no `model/` das entidades —
sem React, sem HTTP. Isso as torna trivialmente testáveis e reutilizáveis: a
mesma `validarTransicaoStatus` é usada pela UI (bloqueio visual), pelo caso de
uso (bloqueio lógico) e pelo mock da API (validação "server-side"), garantindo
consistência em todas as camadas.

**Por que Feature First?** Cada pasta de `features/` agrupa a lógica completa
de uma capacidade do sistema (ex: central de agendamento), compondo hooks das
entidades com feedback de UI. Isso mantém o acoplamento local: remover ou
evoluir uma funcionalidade não espalha mudanças pelo projeto.

**Por que o domínio isolado em `entities/`?** Entidades são a camada mais
estável do sistema. Schemas Zod servem simultaneamente de contrato de tipos
(inferência TS), validação de formulários e validação de payload — uma única
fonte de verdade para o formato dos dados.

**Fluxo de dependências:** `app → pages → features → entities → shared/api`.
Os organisms (`FormularioCriacaoOV`, `TabelaOVs`, `ModalAgendamento`) são
puramente presentacionais — recebem dados e callbacks; quem orquestra são as
pages através dos hooks de features.

### Regras de negócio implementadas

- **Validação cruzada cliente × transporte:** o Zod (`superRefine`) bloqueia no
  formulário; o caso de uso `executeCriarOrdemVenda` bloqueia na aplicação; o
  mock rejeita com `422` na "API". Transportes não autorizados também aparecem
  desabilitados no select.
- **Fluxo estrito de status:** só é possível avançar para o status
  imediatamente seguinte. Saltos e retrocessos lançam
  `TransicaoStatusInvalidaError` e são rejeitados pela API mockada.
- **Agendamento como pré-condição:** a transição `PLANEJADA → AGENDADA` só
  acontece via agendamento (data + janela de atendimento). Reagendamentos
  mantêm o status e geram evento de auditoria próprio.
- **Auditoria:** criação de OV, mudanças de status, agendamentos e
  reagendamentos são registrados com estado anterior/posterior e exibidos na
  tela de detalhes da OV.

---

## ⚖️ Trade-offs assumidos

- **MSW em memória no lugar de um back-end real.** Os handlers implementam as
  validações de negócio como um back-end faria (`422` em transições inválidas
  e transporte não autorizado), e o estado persiste em `sessionStorage` para
  sobreviver a reloads durante a avaliação. O custo: os dados não são
  compartilhados entre abas/sessões e regras de concorrência (locks,
  versionamento otimista) ficam fora do escopo. Como o MSW intercepta na
  camada de rede, trocar pelo back-end real não exige mudar nenhuma linha das
  camadas de aplicação/apresentação.
- **Central de agendamento simulada.** Não há verificação real de capacidade
  logística, rotas ou janelas conflitantes — o mock aceita qualquer data/janela
  válida. A modelagem (`dadosAgendamento` + eventos de auditoria) já suporta
  essas evoluções.
- **Zustand apenas para estado global de UI** (filtros do monitoramento).
  Cache e sincronização de dados ficam no TanStack Query; estado de formulário
  no React Hook Form. Evita a duplicação de fontes de verdade que ocorreria ao
  espelhar dados do servidor em stores globais.
- **Rotas estáticas com dados no cliente.** Como a "API" só existe no browser
  (MSW), todas as buscas são client-side via TanStack Query. Com back-end
  real, as pages poderiam migrar para Server Components com prefetch +
  `HydrationBoundary` sem reestruturar o projeto.

---

## 📈 Escalabilidade e performance

- **Code splitting por rota** nativo do App Router: cada página só carrega o
  JS de que precisa; o MSW é importado dinamicamente e apenas em dev.
- **React Compiler habilitado** (`reactCompiler: true`): memoização automática
  de componentes e hooks, sem `useMemo`/`useCallback` manuais espalhados.
- **TanStack Query** com `staleTime` e invalidação por `queryKey` hierárquica
  (`ordemVendaKeys`): filtros fazem parte da chave, então mudanças disparam
  re-fetch reativo e caches por filtro são reaproveitados.
- **Crescimento do código:** novas entidades e features seguem receita fixa
  (model → application → infrastructure → presentation), o que mantém o
  onboarding e o review previsíveis conforme o time e o produto crescem.

---

## 🧪 Estratégia de testes

| Tipo       | Arquivo                                                                    | O que garante                                                                 |
| ---------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Unitário   | `src/entities/ordem-venda/model/statusOrdemVenda.test.ts`                  | Transições fora de ordem lançam erro de domínio                               |
| Unitário   | `src/entities/ordem-venda/application/ordemVendaUseCases.test.ts`          | `executeCriarOrdemVenda` falha com transporte não autorizado (deps injetadas) |
| Integração | `src/shared/components/organisms/FormularioCriacaoOV.integration.test.tsx` | Formulário preenchido → submissão interceptada pelo MSW → `invalidateQueries` |
| E2E        | `e2e/happy-path.spec.ts`                                                   | Criar cliente → criar OV → agendar → avançar status até ENTREGUE              |
