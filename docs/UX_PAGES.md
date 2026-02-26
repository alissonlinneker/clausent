# Clausent — Mapa de Páginas e UX

> Documento de referência para desenvolvimento. Atualizado em 26/02/2026.
> Para identidade visual detalhada, consulte `docs/BRANDING.md`.

---

## 1. Mapa de Rotas

```
/                                   — Landing Page
/pricing                            — Preços e planos
/sign-in                            — Login (Clerk)
/sign-up                            — Cadastro (Clerk)

/dashboard                          — Overview (home do app)
/dashboard/contracts                — Lista de contratos
/dashboard/contracts/upload         — Upload de novo contrato
/dashboard/contracts/[id]           — Detalhe do contrato
/dashboard/contracts/[id]/renegotiate — Pacote de renegociação
/dashboard/alerts                   — Central de alertas
/dashboard/benchmarks               — Benchmarks de mercado
/dashboard/settings                 — Configurações gerais
/dashboard/settings/billing         — Assinatura e faturamento
```

---

## 2. Páginas Públicas

### 2.1 Landing Page — `/`

**Objetivo:** Converter visitantes em trials. CTA principal: "Analise seu primeiro contrato grátis".

**Seções:**
1. **Navbar** — Logo + links (Product, Pricing, Sign In) + botão "Começar grátis"
2. **Hero** — Headline + subheadline + CTA primário + CTA secundário ("Ver demo") + screenshot do dashboard
3. **Problema** — Estatísticas de mercado (69% dos contratos SaaS auto-renovam, empresas perdem 9.2% da receita)
4. **Demo interativa** — Upload de contrato de exemplo; análise instantânea simulada; resultado exibido inline
5. **Features** — 4 cards: Upload e análise, Risk scoring, Alertas, Benchmarks de mercado
6. **Benchmarks** — Exemplo visual: "Você paga $X. A média é $Y."
7. **Pricing resumido** — Tabela simplificada com link para `/pricing`
8. **Social proof** — Depoimentos e número de contratos analisados (quando disponível)
9. **CTA final** — Banner de conversão + botão "Começar grátis — sem cartão de crédito"
10. **Footer** — Links institucionais, politica de privacidade, termos

**Animações-chave:**
- Hero: fade-in + slide-up suave nos primeiros 300ms
- Contadores numéricos animados na seção de problema (IntersectionObserver)
- Demo interativa: barra de progresso simulada durante "análise"; resultado aparece com fade
- Features: entrada em stagger (cada card com 100ms de delay)

---

### 2.2 Pricing — `/pricing`

**Objetivo:** Comunicar valor por plano e reduzir atrito na decisão de compra.

**Seções:**
1. **Toggle mensal/anual** — Desconto de 20% no anual; troca animada de preços
2. **Tabela de planos** — 4 colunas: Starter ($29), Professional ($59), Business ($99), Enterprise (Custom); plano Professional destacado com badge "Mais popular"
3. **Tabela comparativa detalhada** — Todos os recursos, linha a linha
4. **FAQ** — 6-8 perguntas frequentes sobre cobrança, cancelamento, dados
5. **CTA** — "Começar trial de 14 dias" em cada plano; Enterprise: "Falar com vendas"

**Animações-chave:**
- Troca mensal/anual: preços atualizam com transição numérica suave
- Hover em plano: elevação leve (shadow) e borda com cor primária

---

### 2.3 Sign In — `/sign-in`

**Objetivo:** Autenticar usuário existente via Clerk.

**Layout:** Centralizado verticalmente; logo acima do formulário Clerk; link para `/sign-up`; fundo com gradiente sutil.

---

### 2.4 Sign Up — `/sign-up`

**Objetivo:** Criar conta e iniciar trial de 14 dias.

**Layout:** Igual ao Sign In; após cadastro, redireciona para `/dashboard` com onboarding ativo.

---

## 3. Dashboard (App)

> Todas as rotas do dashboard requerem autenticação (middleware Clerk).
> Layout compartilhado: sidebar fixa + topbar + área de conteúdo.

### 3.1 Overview — `/dashboard`

**Objetivo:** Visão executiva do portfólio de contratos da organização.

**Componentes principais:**
- **Cards de KPI** (4): Total de contratos ativos, Valor mensal comprometido, Contratos expirando em 30 dias, Risk score médio do portfólio
- **Timeline de eventos** — Próximas renovações e vencimentos (30 dias à frente); ordenada por urgência
- **Gráfico de gastos por categoria** — Pizza ou donut: SaaS, fornecedores, aluguel, seguro, outros
- **Lista de alertas recentes** — Últimos 5 alertas não lidos com link para `/dashboard/alerts`
- **Quick action** — Botão "Adicionar contrato" em destaque

**Dados tRPC:**
- `contract.getStats` — KPIs agregados da organização
- `contract.getUpcomingEvents` — Eventos dos próximos 30 dias
- `alert.getRecent` — Alertas não lidos

---

### 3.2 Contratos — `/dashboard/contracts`

**Objetivo:** Listar, filtrar e buscar todos os contratos da organização.

**Componentes principais:**
- **Barra de ações** — Busca textual (semântica via Pinecone), filtros (categoria, status, risk score), botão "Novo contrato"
- **Tabela de contratos** — Colunas: Nome, Contraparte, Categoria, Valor/mês, Vencimento, Risk score (badge colorido), Status; ordenação por coluna; paginação
- **Estado vazio** — Ilustração + texto convidativo + botão de upload quando não há contratos
- **Badge de risk score** — Verde (0-30), Amarelo (31-60), Vermelho (61-100)

**Dados tRPC:**
- `contract.list` — Lista paginada com filtros; suporta busca semântica via Pinecone

---

### 3.3 Upload — `/dashboard/contracts/upload`

**Objetivo:** Enviar e iniciar processamento de um novo contrato.

**Componentes principais:**
- **Dropzone** — Drag-and-drop para PDF, DOCX, imagens; tamanho máximo 20MB
- **Preview do arquivo** — Nome, tamanho, ícone de tipo
- **Formulário de metadados** — Campos: título (pré-preenchido com nome do arquivo), categoria (select), contraparte (input); campos opcionais podem ser corrigidos após análise
- **Botão "Analisar contrato"** — Dispara upload + Inngest job
- **Estado de progresso** — Após envio: barra de progresso por etapa (Upload, Extração de texto, Análise, Finalizando); redireciona para `/dashboard/contracts/[id]` ao concluir

**Dados tRPC:**
- `contract.create` — Cria registro e retorna URL assinada de upload
- `contract.getProcessingStatus` — Polling do status do Inngest job

---

### 3.4 Detalhe do Contrato — `/dashboard/contracts/[id]`

**Objetivo:** Visualizar análise completa de um contrato específico.

**Componentes principais:**
- **Header** — Título, contraparte, categoria, status, data de criação; botões: "Editar metadados", "Baixar original", "Renegociar"
- **Cards de informação** — Data de início/fim, aviso prévio (notice period), valor mensal/total, auto-renovação (sim/não)
- **Risk score visual** — Número grande + indicador de cor + texto explicativo
- **Cláusulas identificadas** — Lista de cláusulas extraídas pela análise; cada uma com tipo, texto resumido e indicador de risco; clique expande o trecho original
- **Benchmarks** — Comparação do valor e termos com a média de mercado (disponível no plano Professional+)
- **Texto completo** — Aba com o texto extraído do contrato; cláusulas problemáticas destacadas inline
- **Histórico de alertas** — Lista de alertas enviados para este contrato

**Dados tRPC:**
- `contract.getById` — Dados completos do contrato incluindo cláusulas e benchmarks
- `contract.getClauses` — Cláusulas extraídas com risco
- `benchmark.getForContract` — Benchmarks comparativos

---

### 3.5 Alertas — `/dashboard/alerts`

**Objetivo:** Central de todas as notificações e alertas da organização.

**Componentes principais:**
- **Filtros** — Por tipo (renovação, vencimento, notice period, risco), status (lido/não lido), período
- **Lista de alertas** — Cada item: ícone de tipo, título, contrato relacionado (link), data de disparo, status; ação de marcar como lido
- **Configurações de alertas** — Painel lateral: configurar antecedência dos avisos (90/60/30/15/7 dias); ativar/desativar canais; requer plano adequado

**Dados tRPC:**
- `alert.list` — Alertas paginados com filtros
- `alert.markAsRead` — Marcar um ou todos como lidos
- `alert.updateSettings` — Salvar preferências de notificação

---

### 3.6 Benchmarks — `/dashboard/benchmarks`

**Objetivo:** Visão geral comparativa de todos os contratos da organização vs. média do mercado.

**Componentes principais:**
- **Resumo executivo** — Quantos contratos estão acima da média de mercado; economia potencial estimada total
- **Tabela de benchmarks** — Por contrato: métrica, valor atual, média do mercado, percentil, variação; ordenável
- **Filtro por categoria** — SaaS, fornecedores, aluguel, seguro
- **Paywall** — Para planos Starter, exibe prévia bloqueada com CTA de upgrade

**Dados tRPC:**
- `benchmark.getOrganizationSummary` — Resumo comparativo de todos os contratos

---

### 3.7 Renegociação — `/dashboard/contracts/[id]/renegotiate`

**Objetivo:** Gerar e apresentar o pacote completo de renegociação de um contrato.

**Componentes principais:**
- **Resumo do contrato atual** — Principais termos em formato de cards
- **Pontos de renegociação** — Lista priorizada: cada ponto com título, argumento sugerido, impacto financeiro estimado
- **Benchmarks de suporte** — Dados de mercado relevantes para cada ponto
- **Draft de comunicação** — Email ou carta de renegociação gerado; editor simples para personalizar antes de copiar/exportar
- **Estimativa de economia** — Valor anual potencialmente economizado; nota de disclaimer
- **Ações** — Copiar draft, exportar PDF, marcar como "Em renegociação"

**Dados tRPC:**
- `renegotiation.getPackage` — Busca ou gera o pacote para o contrato; pode demorar (mostra skeleton loading)
- `renegotiation.updateStatus` — Atualiza status do processo

---

### 3.8 Configurações — `/dashboard/settings`

**Objetivo:** Gerenciar dados da organização, membros e preferências.

**Tabs/seções:**
- **Organização** — Nome, logo, fuso horário
- **Membros** — Lista de usuários; convidar novo membro; alterar papel (admin/member/viewer)
- **Notificações** — Configurar canais e frequência de alertas
- **Integrações** — Futuro: Slack, Google Drive, webhooks

**Dados tRPC:**
- `org.update` — Atualizar dados da organização
- `member.list` / `member.invite` / `member.updateRole`

---

### 3.9 Billing — `/dashboard/settings/billing`

**Objetivo:** Gerenciar assinatura, método de pagamento e histórico de faturas.

**Componentes principais:**
- **Plano atual** — Nome do plano, preço, data de renovação; botão "Mudar plano"
- **Uso do ciclo atual** — Contratos analisados vs. limite do plano; barra de progresso
- **Método de pagamento** — Card salvo; botão para atualizar (abre portal Stripe)
- **Histórico de faturas** — Lista com data, valor, status, link para download do PDF
- **CTA de upgrade** — Banner contextual quando uso está próximo do limite

**Dados tRPC:**
- `billing.getSubscription` — Dados do plano atual via Stripe
- `billing.getUsage` — Contratos analisados no ciclo atual
- `billing.getInvoices` — Histórico de faturas
- `billing.createPortalSession` — Redireciona para Stripe Customer Portal

---

## 4. User Flows

### 4.1 Onboarding

1. Usuário acessa `/sign-up` e cria conta via Clerk.
2. Clerk cria organização; webhook dispara criação no banco com plano Starter (trial 14 dias).
3. Redirecionamento para `/dashboard` com modal de boas-vindas: "Envie seu primeiro contrato."
4. Modal tem atalho direto para `/dashboard/contracts/upload`.
5. Após o primeiro upload, modal é dispensado e o dashboard exibe o contrato em processamento.
6. Email de boas-vindas enviado via Resend com dicas de uso.

---

### 4.2 Análise de Contrato

1. Usuário acessa `/dashboard/contracts/upload`.
2. Faz drag-and-drop ou clica para selecionar o arquivo (PDF, DOCX ou imagem).
3. Preenche título, categoria e contraparte; clica em "Analisar".
4. Frontend faz upload para Vercel Blob via URL assinada; dispara evento no Inngest.
5. Tela exibe progresso em etapas: Upload > Extração de texto > Análise > Concluído.
6. Ao concluir, redireciona para `/dashboard/contracts/[id]` com a análise completa.
7. Alertas são agendados automaticamente com base nas datas extraídas.

---

### 4.3 Renegociação

1. Usuário abre um contrato em `/dashboard/contracts/[id]`.
2. Verifica risk score e cláusulas problemáticas identificadas.
3. Clica em "Gerar pacote de renegociação" — disponível apenas para planos Professional+.
4. Redireciona para `/dashboard/contracts/[id]/renegotiate`.
5. Sistema verifica se pacote já existe; se não, dispara geração (exibe skeleton loading enquanto processa).
6. Usuário revisa os pontos de renegociação e o draft do email.
7. Pode editar o draft inline e copiar para área de transferência ou exportar como PDF.
8. Marca o contrato como "Em renegociação" para acompanhamento.

---

### 4.4 Upgrade de Plano

1. Usuário tenta acessar recurso bloqueado (ex: benchmarks no Starter, renegociação no Starter).
2. Exibe modal ou banner de paywall com explicação do benefício e botão "Fazer upgrade".
3. Botão redireciona para `/dashboard/settings/billing`.
4. Usuário seleciona novo plano; clica em "Mudar para Professional".
5. `billing.createPortalSession` abre o Stripe Customer Portal em nova aba para confirmar.
6. Stripe confirma; webhook atualiza plano no banco.
7. Usuário retorna ao app com acesso imediato ao recurso desbloqueado.

---

## 5. Componentes Compartilhados

**Layout do app:**
- `AppSidebar` — Navegação principal (links, logo, avatar do usuário)
- `AppTopbar` — Breadcrumb, botão de notificações, menu do usuário
- `AppShell` — Wrapper que combina sidebar + topbar + área de conteúdo

**Feedback e estado:**
- `LoadingSkeleton` — Placeholder animado para carregamento de dados
- `EmptyState` — Ilustração + título + descrição + CTA opcional
- `ErrorBoundary` — Fallback de erro com botão de retry
- `Toast` — Notificações de sucesso/erro/info (shadcn/ui)

**Contratos:**
- `ContractCard` — Card resumido para listagens
- `RiskBadge` — Badge colorido com score numérico (verde/amarelo/vermelho)
- `ClauseHighlight` — Destaque inline de cláusula no texto do contrato
- `ProcessingProgress` — Barra de progresso por etapa do Inngest job

**Pagamentos:**
- `PlanBadge` — Identificador do plano atual (Starter, Professional, etc.)
- `UpgradeGate` — Wrapper que bloqueia conteúdo e exibe CTA de upgrade
- `UsageBar` — Barra de progresso de uso do plano (contratos analisados/limite)

**Formulários e inputs:**
- `FileDropzone` — Drag-and-drop com validação de tipo e tamanho
- `ContractForm` — Formulário de metadados do contrato (título, categoria, contraparte)

**Tabelas:**
- `DataTable` — Tabela genérica com ordenação, paginação e filtros (shadcn/ui + TanStack Table)

---

## 6. Design System

Para tokens de cor, tipografia, espaçamento, gradientes, animações e componentes UI, consulte:

**`docs/BRANDING.md`**

Resumo das cores principais:
- **Primária:** Indigo 600 (`#4F46E5`) — CTAs, links, destaques
- **Sucesso/economia:** Emerald — resultados positivos, economias
- **Alerta baixo:** Amber — avisos moderados
- **Alerta crítico:** Red — riscos altos, cláusulas problemáticas
- **Neutros:** Slate — textos, fundos, bordas

Fonte principal: Inter (corpo e UI). Cal Sans (logotipo, headings de destaque).
