# V-Lab Full Stack Challenge — Solicitações de Atendimento

### Desenvolvido por Gabriel Braz

Aplicação full stack para registrar, consultar, filtrar e acompanhar solicitações de atendimento encaminhadas a unidades públicas de saúde. O projeto é dividido em uma API REST em Laravel, uma SPA em React/TypeScript e um banco PostgreSQL, todos orquestrados via Docker Compose.

> Todos os dados utilizados (nomes, descrições, protocolos) são fictícios, gerados por seeders/factories. Nenhuma informação médica ou pessoal real é utilizada.

## Sumário

- [Tecnologias e versões](#tecnologias-e-versões)
- [Organização do projeto](#organização-do-projeto)
- [Regras de negócio](#regras-de-negócio)
- [Como executar](#como-executar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Testes automatizados](#testes-automatizados)
- [Funcionalidades implementadas e limitações conhecidas](#funcionalidades-implementadas-e-limitações-conhecidas)
- [Uso de Inteligência Artificial](#uso-de-inteligência-artificial)

## Tecnologias e versões

**Backend**

- PHP 8.4 (imagem Docker) / requer `^8.3`
- Laravel Framework 13
- PostgreSQL 18.2 (produção/dev via Docker) e SQLite em memória (testes)
- Pest 5 (+ `pest-plugin-laravel`) para testes automatizados
- Laravel Pint para formatação de código

**Frontend**

- React 19 + TypeScript
- Vite 8
- TanStack Router (roteamento com file-based routing) e TanStack Query (cache/estado assíncrono)
- Tailwind CSS 4 + shadcn/ui (componentes com aparência padrão, apenas organizados via utilitários de layout)
- Axios para o cliente HTTP
- Cypress 16 para testes end-to-end

**Infraestrutura**

- Docker e Docker Compose para subir frontend, backend e banco de forma integrada
- Nginx servindo os arquivos estáticos do frontend em produção

## Organização do projeto

```
.
├── backend/    # API REST em Laravel
├── frontend/   # SPA em React + TypeScript
└── docker-compose.yml
```

### Backend

O backend segue uma separação simples de responsabilidades, evitando abstrações sem benefício claro:

- `app/Http/Controllers` — controllers finos, sem regra de negócio; apenas orquestram request → service → response.
- `app/Http/Requests` — Form Requests concentram toda a validação de entrada.
- `app/Http/Resources` — moldam o formato de saída da API (`SolicitationResource`, `SolicitationCollection`).
- `app/Http/Services` — `SolicitationService` concentra as regras de negócio: geração de protocolo único, criação, transição de status e o resumo agregado do dashboard. É a camada testável e reutilizável entre controllers.
- `app/Enums` — `Category`, `Priority` e `Status` modelam os valores de domínio como enums do PHP. O `Status` também encapsula a própria máquina de transição (`validTransition`), centralizando a regra num único lugar em vez de espalhá-la por controllers/services.
- `app/Models` — Eloquent model com casts para os enums.

### Frontend

Organizado por rotas/funcionalidade, com componentes de UI reutilizáveis separados dos componentes de página:

- `src/routes` — páginas/rotas geradas via file-based routing do TanStack Router:
  - `/` — dashboard com o resumo das solicitações;
  - `/solicitacoes` — listagem paginada com filtros;
  - `/solicitacoes/registrar` — formulário de criação;
  - `/solicitacoes/:id` — detalhes de uma solicitação e ação de transição de status.
- `src/components/ui` — primitivos do shadcn/ui, usados com a aparência padrão (sem customização visual própria).
- `src/components` — componentes compostos específicos da aplicação (`Content`, `Filter`, `Navbar`, `Paginator`, `Field`, `StateMessage`, etc.), construídos em cima dos primitivos acima para simplificar as páginas.
- `src/hooks/useAxios.ts` — único ponto de configuração do cliente HTTP, lendo a URL da API de uma variável de ambiente.
- `src/types` — tipos TypeScript que espelham o contrato da API (nenhum `any` usado nos dados de domínio).

## Regras de negócio

- Toda solicitação é criada com status inicial `RECEBIDA`.
- O `protocolo` é gerado automaticamente pela aplicação (prefixo da categoria + data + sufixo aleatório) e sua unicidade é garantida com nova tentativa em caso de colisão.
- `justificativa_prioridade` é obrigatória apenas quando `prioridade = URGENTE`.
- `data_criacao`/`data_atualizacao` são geridas automaticamente pelo Eloquent.
- A transição de status segue um fluxo fixo, validado centralmente no enum `Status`:

  | Status atual | Próximos status permitidos |
  | --- | --- |
  | `RECEBIDA` | `EM_ANALISE`, `CANCELADA` |
  | `EM_ANALISE` | `AGENDADA`, `CANCELADA` |
  | `AGENDADA` | `CONCLUIDA`, `CANCELADA` |
  | `CONCLUIDA` | — (status final) |
  | `CANCELADA` | — (status final) |

  Uma transição fora dessa tabela retorna `400` com uma mensagem clara; um valor de status inexistente retorna `422` de validação.

## Como executar

### Opção recomendada: Docker Compose

Pré-requisitos: Docker e Docker Compose instalados.

1. Clone o repositório:

   ```bash
   git clone https://github.com/GB2101/VLAB-Fullstack.git
   cd VLAB-Fullstack
   ```

2. Crie o segredo usado pelo PostgreSQL (o Docker Compose lê essa senha tanto para o banco quanto para o backend; qualquer valor serve, pois é gerado localmente e nunca é versionado):

   ```bash
   mkdir -p .secrets
   echo "senha-local-para-o-banco" > .secrets/database.key
   ```

3. Suba os três serviços (banco, backend e frontend):

   ```bash
   docker compose up -d --build
   ```

   Isso automaticamente:
   - inicializa o PostgreSQL;
   - aguarda o banco ficar saudável e executa as *migrations* do backend (`php artisan migrate --force`);
   - popula o banco com 300 solicitações fictícias (`SolicitationSeeder`), apenas se a tabela ainda estiver vazia — reinicializações do container não duplicam os dados;
   - builda o frontend (Vite) e serve os arquivos estáticos via Nginx.

4. Acesse a aplicação:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - API: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)

5. Para derrubar os containers:

   ```bash
   docker compose down
   ```

   (adicione `-v` para também remover o volume do PostgreSQL e começar do zero na próxima subida)

### Alternativa: rodar localmente sem Docker

**Backend**

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Por padrão o `.env.example` já aponta para SQLite, então nenhum banco externo é necessário para essa via.

**Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

A aplicação sobe em [http://localhost:5173](http://localhost:5173) e espera a API em `http://localhost:8000/api/v1` (configurável, veja a seção seguinte).

## Variáveis de ambiente

Nenhuma credencial real é versionada; os arquivos `.env.example` documentam todas as variáveis necessárias.

- `backend/.env.example` — configuração para desenvolvimento local (SQLite).
- `backend/.env.docker` — configuração usada pelo container do backend. A senha do banco **não** fica nesse arquivo: o script `docker-entrypoint.sh` a lê em tempo de execução a partir do segredo Docker (`.secrets/database.key`), garantindo que backend e PostgreSQL sempre usem a mesma senha sem precisar versioná-la.
- `frontend/.env.example` — define `VITE_API_URL`, a URL base usada pelo cliente Axios (`src/hooks/useAxios.ts`). Copie para `frontend/.env` ao rodar localmente.

## Endpoints da API

Prefixo: `/api/v1`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/solicitacoes` | Cria uma nova solicitação (status inicial sempre `RECEBIDA`) |
| `GET` | `/solicitacoes` | Lista paginada, com filtros `status[]`, `categoria[]`, `prioridade[]` e `pageSize` |
| `GET` | `/solicitacoes/{id}` | Detalhes de uma solicitação |
| `PATCH` | `/solicitacoes/{id}/status` | Atualiza o status, respeitando as transições válidas |
| `GET` | `/solicitacoes/summary` | Totais agregados por status e prioridade, usados no dashboard |

> Uma especificação OpenAPI formal ainda não foi escrita — veja a seção de limitações conhecidas.

## Testes automatizados

**Backend (Pest)** — cobre a máquina de transição de status (matriz completa de casos válidos/inválidos), a geração e a colisão de protocolo, a agregação do resumo e o contrato HTTP completo de cada endpoint (validação, erros 400/404/422, persistência).

```bash
cd backend
vendor/bin/pest
# ou
php artisan test
```

**Frontend (Cypress)** — testes end-to-end que cobrem os quatro fluxos principais (dashboard, listagem com filtros/estados vazio e de erro, detalhe com transição de status, formulário de criação). As chamadas à API são interceptadas (`cy.intercept`) para que os testes sejam determinísticos e não dependam de um backend real rodando.

```bash
cd frontend
npm run dev            # em um terminal, mantenha a aplicação no ar
npm run cypress:run    # em outro terminal
# ou, para orquestrar os dois passos automaticamente:
npm run test:e2e
```

## Funcionalidades implementadas e limitações conhecidas

**Implementado:** CRUD de criação/consulta/listagem/atualização de status; filtros por categoria, prioridade e status; paginação; dashboard com resumo; validação de formulário no cliente e no servidor; estados de carregamento, sucesso, vazio e erro em todas as telas assíncronas; geração e checagem de unicidade de protocolo; execução automática de migrations e seeders ao subir o container do backend; suíte de testes de backend e end-to-end de frontend.

**Não implementado / limitações conhecidas:**

- Não há autenticação/autorização — não era exigida pelo desafio, mas seria o próximo passo para diferenciar perfis de uso.
- A especificação OpenAPI ainda não foi escrita; o contrato está documentado apenas neste README.
- O CORS da API usa a configuração padrão do Laravel (permissiva, liberando `/api/*` para qualquer origem), o que é adequado para este ambiente de desenvolvimento/avaliação mas precisaria ser restringido em um ambiente de produção real.
- Alguns commits anteriores a esta entrega versionaram, por engano, a senha de desenvolvimento do PostgreSQL em `backend/.env.docker`. O problema foi corrigido (a senha agora é lida do segredo Docker em tempo de execução e nunca é versionada), mas o valor antigo permanece no histórico do Git. Como se trata apenas de uma senha local de um banco de desenvolvimento fictício, o risco real é nulo, mas o fato é registrado aqui por transparência.

## Uso de Inteligência Artificial

Ferramentas de IA (Claude / Claude Code) foram utilizadas ao longo de todo o desenvolvimento deste projeto, principalmente como:

- **Apoio na análise de erros**: interpretação de stack traces, mensagens de exceção do Laravel/Postgres e falhas de teste, ajudando a localizar a causa raiz mais rapidamente.
- **Busca de documentação**: consulta a documentação do Laravel, Pest, TanStack Router/Query e Cypress para confirmar a API correta antes de usá-la, em vez de depender apenas de memória/suposição.
- **Copiloto de código**: geração de trechos de código (componentes React, endpoints, testes, configuração de Docker) a partir de instruções em linguagem natural, sempre revisados e ajustados manualmente antes de serem aceitos.

Todo o código entregue foi revisado e é de entendimento do autor, que pode explicá-lo ou alterá-lo em uma entrevista técnica.
