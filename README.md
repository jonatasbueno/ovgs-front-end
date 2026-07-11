# OVGS — Sistema de Gestão de Ordens de Venda (Front-end)

Front-end do sistema de gestão de Ordens de Venda (OVs), com rastreabilidade,
visibilidade e governança sobre todo o ciclo de vida operacional:
`CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE`.

**Não há back-end real neste repositório.** A API é simulada por um **mock
inteligente (MSW)** que intercepta as requisições no navegador. Para testar
manualmente ou rodar os testes E2E, o servidor de desenvolvimento precisa estar
ativo — é ele que carrega o MSW e disponibiliza a “API” mockada.

---

## 📋 Pré-requisitos

| Ferramenta     | Versão mínima | Obrigatório para |
| -------------- | ------------- | ---------------- |
| Node.js        | 20+           | setup local      |
| npm            | (incluso)     | setup local      |
| Docker         | 24+           | opção via Docker |
| Docker Compose | v2+           | opção via Docker |

---

## 🚀 Configuração local (npm)

```bash
# 1. Instalar dependências
npm install

# 2. Instalar o navegador do Playwright (obrigatório para testes E2E e git push)
npm run test:e2e:install

# 3. Subir o ambiente de desenvolvimento (MSW inicia automaticamente)
npm run dev
# → http://localhost:3000
```

> O `npm install` também tenta baixar o Chromium via `postinstall`. Se os testes E2E ou o hook de pre-push falharem com _Executable doesn't exist_, rode novamente o passo 2.

### MSW e ausência de back-end real

Em `npm run dev`, o `MockProvider` inicializa o MSW antes da primeira query.
Todas as telas (cadastros, criação de OV, agendamento, monitoramento) dependem
desse mock — **não existe servidor de API externo para apontar**. Testes
manuais no browser e os fluxos E2E só funcionam com o dev server rodando.

Em build de produção local (`npm run build && npm run start`), defina
`NEXT_PUBLIC_API_MOCKING=enabled` para manter o mock ativo.

### Scripts disponíveis

| Script                     | Descrição                                 |
| -------------------------- | ----------------------------------------- |
| `npm run dev`              | Ambiente de desenvolvimento com MSW ativo |
| `npm run build`            | Build de produção                         |
| `npm run start`            | Servir o build de produção                |
| `npm run test`             | Testes unitários e de integração (Vitest) |
| `npm run test:coverage`    | Testes com relatório de cobertura         |
| `npm run test:watch`       | Testes em modo watch                      |
| `npm run test:e2e`         | Testes E2E (Playwright)                   |
| `npm run test:e2e:install` | Instala o Chromium usado pelo Playwright  |
| `npm run lint`             | ESLint (flat config)                      |
| `npm run typecheck`        | Verificação de tipos (`tsc --noEmit`)     |
| `npm run format`           | Formatação com Prettier                   |

---

## 🐳 Docker (opcional)

Alternativa ao setup local. O `docker-compose.yml` expõe serviços por perfil:

| Serviço / perfil | Comando                                                     | Uso                                   |
| ---------------- | ----------------------------------------------------------- | ------------------------------------- |
| `dev` (padrão)   | `docker compose up`                                         | Desenvolvimento com hot reload e MSW  |
| `prod`           | `docker compose --profile prod up app`                      | Build de produção com mock habilitado |
| `test`           | `docker compose --profile test run --rm test`               | Testes unitários/integração           |
| `test-coverage`  | `docker compose --profile test run --rm test-coverage`      | Cobertura                             |
| `e2e`            | `docker compose --profile e2e up --abort-on-container-exit` | E2E (sobe `dev` + Playwright)         |

```bash
# Desenvolvimento (equivalente a npm run dev)
docker compose up

# Build e execução em modo produção
docker compose --profile prod up --build app

# Testes unitários dentro do container
docker compose --profile test run --rm test

# Cobertura
docker compose --profile test run --rm test-coverage

# E2E: sobe o dev server e executa Playwright no container e2e
docker compose --profile e2e up --abort-on-container-exit
```

O serviço `dev` monta o código com volume para hot reload. O serviço `app`
usa build multi-stage (`standalone`) com `NEXT_PUBLIC_API_MOCKING=enabled`, já que
não há back-end real. Para E2E via Docker, o Playwright aponta para
`http://dev:3000` — o dev server precisa estar no ar (o perfil `e2e` faz isso
automaticamente).

---

## 🧪 Executando testes

### Unitários e integração (Vitest)

Roda no Node com `jsdom` e MSW em memória — **não precisa** do dev server:

```bash
npm run test
npm run test:coverage   # relatório em coverage/
npm run test:watch      # modo interativo
```

Via Docker: `docker compose --profile test run --rm test`

### E2E (Playwright)

Os testes E2E abrem um browser real contra `http://localhost:3000` e exercitam
fluxos completos (criar cliente, OV, agendar, avançar status). Como a API só
existe via MSW no navegador, **o dev server precisa estar rodando**:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e
```

Se o dev server já estiver ativo, o Playwright reutiliza (`reuseExistingServer`).
Caso contrário, o `playwright.config.ts` tenta subir `npm run dev` automaticamente.

Via Docker (dev server + Playwright em containers separados):

```bash
docker compose --profile e2e up --abort-on-container-exit
```

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
