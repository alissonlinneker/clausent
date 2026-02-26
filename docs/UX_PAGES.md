# Clausent -- Mapa Completo de Páginas e Flows UX

> **Versão:** 1.0.0
> **Data:** 26 de fevereiro de 2026
> **Classificação:** Documento interno -- referência para desenvolvimento frontend

---

## Sumário

1. [Visão Geral do Mapa de Páginas](#1-visão-geral-do-mapa-de-páginas)
2. [Páginas Públicas (Marketing)](#2-páginas-públicas-marketing)
3. [Dashboard (App Autenticado)](#3-dashboard-app-autenticado)
4. [User Flows](#4-user-flows)
5. [Componentes Compartilhados](#5-componentes-compartilhados)
6. [Design System -- Referências](#6-design-system--referências)

---

## 1. Visão Geral do Mapa de Páginas

```
clausent.com
|
+-- / ................................ Landing Page (pública)
+-- /pricing ......................... Comparativo de planos (pública)
+-- /sign-in ......................... Login via Clerk (pública)
+-- /sign-up ......................... Registro via Clerk (pública)
|
+-- /dashboard ....................... Overview (autenticada)
|   +-- /contracts ................... Lista de contratos
|   |   +-- /upload .................. Upload de contrato
|   |   +-- /[id] .................... Detalhe do contrato
|   |       +-- /renegotiate ......... Pacote de renegociação
|   |
|   +-- /alerts ...................... Timeline de alertas
|   +-- /benchmarks .................. Comparativos de mercado
|   |
|   +-- /settings .................... Configurações gerais
|       +-- /billing ................. Plano e faturas
|
+-- /404 ............................. Página não encontrada
+-- /500 ............................. Erro interno
```

### Hierarquia de Navegação

```
+-------------------------------------------------------------------+
|  SIDEBAR (persistente no dashboard)                               |
|                                                                   |
|  [Logo Clausent]                                                  |
|                                                                   |
|  -- PRINCIPAL --                                                  |
|  > Overview          /dashboard                                   |
|  > Contratos         /dashboard/contracts                         |
|  > Alertas           /dashboard/alerts                            |
|  > Benchmarks        /dashboard/benchmarks                        |
|                                                                   |
|  -- CONTA --                                                      |
|  > Configurações     /dashboard/settings                          |
|  > Billing           /dashboard/settings/billing                  |
|                                                                   |
|  [Avatar] [Org Switcher] [Logout]                                 |
+-------------------------------------------------------------------+
```

---

## 2. Páginas Públicas (Marketing)

### 2.1 Landing Page

- **Rota:** `/`
- **Objetivo:** Capturar a atenção do visitante, comunicar a proposta de valor do Clausent e converter em signup. O usuário deve entender em 5 segundos o que a plataforma faz e por que importa.

#### Seções

| # | Seção | Descrição |
|---|-------|-----------|
| 1 | **Hero** | Headline principal com proposta de valor ("Pare de perder dinheiro com contratos que você esqueceu que tinha"), sub-headline explicativa, CTA primário ("Analise seu primeiro contrato grátis"), CTA secundário ("Ver como funciona"), ilustração hero animada à direita |
| 2 | **Barra de Prova Social** | Logos de empresas fictício-representativas + métrica de impacto ("$2.4M em economia identificada para nossos clientes") |
| 3 | **Problema** | Três cards com dores reais: renovações automáticas esquecidas, cláusulas desfavoráveis escondidas, falta de visibilidade sobre gastos contratuais. Cada card com ícone, título e descrição |
| 4 | **Como Funciona** | Stepper visual em 3 passos: (1) Envie seus contratos, (2) Receba análise inteligente, (3) Economize com renegociações. Cada passo com ilustração animada |
| 5 | **Features** | Grid 2x3 com as funcionalidades core: Upload Inteligente, Dashboard Completo, Alertas Proativos, Risk Scoring, Benchmarks de Mercado, Pacote de Renegociação. Cada card com ícone Lucide, título, descrição e micro-animação |
| 6 | **Demo Interativa** | Seção escura (primary-900/950) com uma simulação da análise de contrato. Mostra um PDF sendo processado e o resultado da análise aparecendo em tempo real (risk score, cláusulas, economia potencial). Toda animação sequencial |
| 7 | **Pricing Preview** | Três cards de plano (Starter $29, Professional $59, Business $99) com features principais, destaque no plano recomendado (Professional), CTA para /pricing |
| 8 | **Testimonials** | Carousel de depoimentos com foto, nome, cargo, empresa e citação. Transição suave entre depoimentos |
| 9 | **CTA Final** | Seção com gradiente indigo, headline de urgência ("Cada dia sem monitoramento é dinheiro saindo do bolso"), campo de email + botão de signup |
| 10 | **Footer** | Links institucionais, redes sociais, copyright, link para termos e privacidade |

#### Interações e Animações (Framer Motion)

| Elemento | Animação | Detalhes |
|----------|----------|----------|
| Hero headline | Fade-in + slide-up | `opacity: 0 -> 1`, `translateY: 20px -> 0`, duration 600ms, ease-out |
| Hero ilustração | Fade-in + scale | `opacity: 0 -> 1`, `scale: 0.95 -> 1`, delay 200ms, duration 500ms |
| Barra de prova social | Scroll horizontal infinito | Marquee suave com logos, pausando no hover |
| Cards de problema | Stagger reveal on scroll | Cada card aparece com 100ms de delay entre si, slide-up + fade-in |
| Stepper "Como Funciona" | Scroll-triggered sequencial | Ao scrollar, cada passo entra em sequência. Linha conectora se desenha progressivamente (stroke-dashoffset animation) |
| Grid de features | Stagger grid reveal | Cards aparecem em ordem, delay 75ms entre cada, com leve translateY |
| Demo interativa | Intersection observer + sequência | Ao entrar no viewport: (1) PDF desliza para dentro, (2) barra de progresso avança, (3) resultados surgem um a um com delay |
| Cards de pricing | Hover elevação | Card recomendado tem borda primary-500 + badge "Recomendado" com pulse sutil |
| Testimonials carousel | Auto-play + drag | Troca a cada 5s com fade-crossover, suporta swipe em mobile |
| CTA Final | Parallax leve | Background com parallax sutil (translateY -5% a 5%) no scroll |
| Navbar | Scroll-aware | Transparente no topo, ganha `bg-white/80 backdrop-blur-xl shadow-sm` após 50px de scroll |

#### Wireframe ASCII

```
+========================================================================+
|  [Logo]                    Features  Pricing  Login    [Comece Grátis] |
+========================================================================+
|                                                                        |
|                                                        +-----------+   |
|    Pare de perder dinheiro                             |           |   |
|    com contratos que você                              | Ilustra-  |   |
|    esqueceu que tinha.                                 | ção Hero  |   |
|                                                        | (escudo   |   |
|    Monitoramento inteligente de todos os               |  + docs)  |   |
|    seus contratos. Alertas, análise de                 |           |   |
|    risco e renegociação com dados reais.               +-----------+   |
|                                                                        |
|    [* Analise seu primeiro contrato grátis]  [Ver como funciona ->]    |
|                                                                        |
|    Sem cartão de crédito . 14 dias grátis . Setup em 2 minutos        |
|                                                                        |
+------------------------------------------------------------------------+
|  Logo1   Logo2   Logo3   Logo4   Logo5   Logo6   | $2.4M economizados |
+------------------------------------------------------------------------+
|                                                                        |
|    Você está perdendo dinheiro sem saber                               |
|                                                                        |
|  +---------------------+ +---------------------+ +------------------+ |
|  | [RefreshCw]         | | [AlertTriangle]     | | [EyeOff]         | |
|  | Renovações          | | Cláusulas           | | Falta de         | |
|  | Automáticas         | | Desfavoráveis       | | Visibilidade     | |
|  |                     | |                     | |                  | |
|  | 69% dos contratos   | | 82% das PMEs não    | | 50% das org não  | |
|  | SaaS auto-renovam   | | revisam cláusulas   | | rastreiam seus   | |
|  | sem que você saiba  | | antes de assinar    | | contratos        | |
|  +---------------------+ +---------------------+ +------------------+ |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|    Como funciona                                                       |
|                                                                        |
|    (1)                      (2)                     (3)                |
|  +----------+          +----------+           +----------+            |
|  | [FileUp] |---line-->| [Scan]   |---line--->| [Dollar] |            |
|  +----------+          +----------+           +----------+            |
|   Envie seus            Receba análise         Economize com          |
|   contratos             inteligente            renegociações          |
|                                                                        |
|   PDF, DOCX ou          Risk scoring,          Pacote pronto com      |
|   imagem. Nós           alertas e              argumentos e dados     |
|   extraímos tudo.       benchmarks.            de mercado.            |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|    Tudo que você precisa para proteger seus contratos                  |
|                                                                        |
|  +-------------------------+  +-------------------------+              |
|  | [Upload]                |  | [LayoutDashboard]       |              |
|  | Upload Inteligente      |  | Dashboard Completo      |              |
|  | Envie PDF, DOCX ou      |  | Visão geral de todos    |              |
|  | imagem. Extração auto-  |  | os contratos, valores,  |              |
|  | mática via OCR e IA.    |  | prazos e riscos.        |              |
|  +-------------------------+  +-------------------------+              |
|  +-------------------------+  +-------------------------+              |
|  | [Bell]                  |  | [ShieldCheck]           |              |
|  | Alertas Proativos       |  | Risk Scoring            |              |
|  | 90, 60, 30, 15 e 7     |  | Cada contrato recebe    |              |
|  | dias antes. Nunca mais  |  | uma nota de 0 a 100     |              |
|  | perca um prazo.         |  | baseada em cláusulas.   |              |
|  +-------------------------+  +-------------------------+              |
|  +-------------------------+  +-------------------------+              |
|  | [BarChart3]             |  | [TrendingDown]          |              |
|  | Benchmarks de Mercado   |  | Pacote de Renegociação  |              |
|  | Compare preços e        |  | Argumentos, dados de    |              |
|  | termos com o mercado.   |  | mercado e draft de      |              |
|  | Saiba se paga demais.   |  | email prontos para uso. |              |
|  +-------------------------+  +-------------------------+              |
|                                                                        |
+------------------------------------------------------------------------+
|  #################################################################### |
|  ##                  SEÇÃO ESCURA (primary-950)                     ## |
|  ##                                                                 ## |
|  ##  Veja uma análise real em ação                                  ## |
|  ##                                                                 ## |
|  ##  +-----------------+     +-----------------------------+        ## |
|  ##  |  contrato.pdf   |     | Resultado da Análise        |        ## |
|  ##  |  +-----------+  |     |                             |        ## |
|  ##  |  | ~~~~~~~~  |  |     | Risk Score: [====== ] 72    |        ## |
|  ##  |  | ~~~~~~~~  |  | --> | Cláusulas: 14 encontradas   |        ## |
|  ##  |  | ~~~~~~~~  |  |     | Riscos: 3 críticos          |        ## |
|  ##  |  | ~~~~~~~~  |  |     | Economia: $4.200/ano        |        ## |
|  ##  |  +-----------+  |     |                             |        ## |
|  ##  +-----------------+     +-----------------------------+        ## |
|  ##                                                                 ## |
|  ##  [* Experimente com seu contrato]                               ## |
|  ##                                                                 ## |
|  #################################################################### |
+------------------------------------------------------------------------+
|                                                                        |
|    Planos que cabem no seu bolso                                       |
|                                                                        |
|  +----------------+  +-------------------+  +----------------+         |
|  | STARTER        |  | *  PROFESSIONAL   |  | BUSINESS       |         |
|  | $29/mês        |  | *  $59/mês        |  | $99/mês        |         |
|  |                |  | *                 |  |                |         |
|  | Até 25         |  | *  Até 100        |  | Até 500        |         |
|  | contratos      |  | *  contratos      |  | contratos      |         |
|  |                |  | *                 |  |                |         |
|  | [v] Upload     |  | *  [v] Tudo do    |  | [v] Tudo do    |         |
|  | [v] Extração   |  | *      Starter    |  |     Profess.   |         |
|  | [v] Alertas    |  | *  [v] Risk Score |  | [v] Benchmarks |         |
|  | [v] Dashboard  |  | *  [v] Benchmarks |  |     avançados  |         |
|  |                |  | *      básicos    |  | [v] Pacote de  |         |
|  |                |  | *  [v] Relatórios |  |     renego.    |         |
|  |                |  | *                 |  | [v] API        |         |
|  | [Começar]      |  | *  [* Começar]    |  | [Começar]      |         |
|  +----------------+  +-------------------+  +----------------+         |
|                                                                        |
|    [Ver todos os detalhes ->]                                          |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|    O que nossos clientes dizem                                         |
|                                                                        |
|  +----------------------------------------------------------------+   |
|  |                                                                |   |
|  |  "Economizamos $18.000 no primeiro trimestre só com            |   |
|  |   renegociações sugeridas pela plataforma."                    |   |
|  |                                                                |   |
|  |  [Foto]  Maria Santos                                         |   |
|  |          COO, TechStartup Inc.                                |   |
|  |                                                                |   |
|  |                    ( o ) ( . ) ( . )                           |   |
|  +----------------------------------------------------------------+   |
|                                                                        |
+------------------------------------------------------------------------+
|  #################################################################### |
|  ##          GRADIENTE INDIGO (primary-600 -> primary-900)         ## |
|  ##                                                                 ## |
|  ##  Cada dia sem monitoramento é dinheiro                          ## |
|  ##  saindo do bolso.                                               ## |
|  ##                                                                 ## |
|  ##  Comece a proteger seus contratos agora.                        ## |
|  ##                                                                 ## |
|  ##  [email@empresa.com         ] [* Começar grátis]                ## |
|  ##                                                                 ## |
|  ##  14 dias grátis . Sem cartão . Cancele quando quiser            ## |
|  ##                                                                 ## |
|  #################################################################### |
+------------------------------------------------------------------------+
|                                                                        |
|  [Logo]  Produto  Empresa  Legal     (c) 2026 Clausent               |
|          Features About    Termos    Todos os direitos reservados     |
|          Pricing  Blog     Privac.                                    |
|          Login    Contato                                             |
|                                                                        |
+------------------------------------------------------------------------+
```

---

### 2.2 Pricing

- **Rota:** `/pricing`
- **Objetivo:** Apresentar os planos em detalhe, permitir comparação lado a lado e converter o visitante em signup com o plano ideal.

#### Seções

| # | Seção | Descrição |
|---|-------|-----------|
| 1 | **Header** | Título "Planos e Preços", subtítulo "Escolha o plano ideal para o tamanho da sua operação", toggle mensal/anual (com desconto de 20% no anual) |
| 2 | **Cards de Planos** | 4 colunas (Starter, Professional, Business, Enterprise) com todos os detalhes de cada plano, CTA por plano |
| 3 | **Tabela Comparativa** | Tabela completa com todas as features em linhas e planos em colunas. Checkmarks e valores específicos |
| 4 | **Calculadora de Economia** | Input: "Quantos contratos você gerencia?" + "Valor médio mensal dos contratos". Output: estimativa de economia anual baseada em benchmarks |
| 5 | **FAQ** | Accordion com perguntas frequentes sobre billing, trial, upgrade/downgrade, cancelamento |
| 6 | **CTA Final** | "Ainda em dúvida? Analise seu primeiro contrato grátis." |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Toggle mensal/anual | Spring animation no knob (stiffness 500, damping 30). Preços fazem uma transição de scale + crossfade ao trocar |
| Cards de plano | Stagger reveal on scroll, card recomendado com borda primary-500 pulsante (opacity pulse 0.6 -> 1, 2s) |
| Tabela comparativa | Fade-in por grupo de linhas (feature groups) |
| Calculadora | Counter animation nos valores resultantes (0 -> valor, 1000ms, ease-out). Barra de economia cresce animada |
| FAQ accordion | Height animation com spring (conteúdo revela suavemente). Ícone de seta rotaciona 180deg |

#### Wireframe ASCII

```
+========================================================================+
|  [Logo]                    Features  Pricing  Login    [Comece Grátis] |
+========================================================================+
|                                                                        |
|                  Planos e Preços                                       |
|                                                                        |
|    Escolha o plano ideal para o tamanho                                |
|    da sua operação.                                                    |
|                                                                        |
|              [ Mensal | *Anual* (-20%) ]                               |
|                                                                        |
|  +-----------+ +---------------+ +-----------+ +-----------+           |
|  | STARTER   | | * PROFESSIONAL| | BUSINESS  | | ENTERPRISE|           |
|  |           | | * Recomendado | |           | |           |           |
|  | $29/mês   | | * $59/mês     | | $99/mês   | | Custom    |           |
|  | $290/ano  | | * $590/ano    | | $990/ano  | |           |           |
|  |           | | *             | |           | |           |           |
|  | 25        | | * 100         | | 500       | | Ilimitado |           |
|  | contratos | | * contratos   | | contratos | | contratos |           |
|  |           | | *             | |           | |           |           |
|  | [v] Up-   | | * [v] Tudo    | | [v] Tudo  | | [v] Tudo  |           |
|  |     load  | | *     Starter | |     Prof. | |     Biz   |           |
|  | [v] Extra-| | * [v] Risk    | | [v] Bench | | [v] SSO   |           |
|  |     ção   | | *     Score   | |     avanç.| | [v] Audit |           |
|  | [v] Aler- | | * [v] Bench   | | [v] Renego| | [v] Supor |           |
|  |     tas   | | *     básicos | | [v] API   | |     dedic.|           |
|  | [v] Dash  | | * [v] Relat.  | |           | |           |           |
|  |           | | *             | |           | |           |           |
|  | [Começar] | | *[* Começar]  | | [Começar] | | [Contato] |           |
|  +-----------+ +---------------+ +-----------+ +-----------+           |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|    Comparação detalhada                                                |
|                                                                        |
|  +---------------------+--------+--------+--------+--------+          |
|  | Feature             | Start. | Prof.  | Biz.   | Enter. |          |
|  +---------------------+--------+--------+--------+--------+          |
|  | Upload de contratos | [v]    | [v]    | [v]    | [v]    |          |
|  | Extração por motor  | [v]    | [v]    | [v]    | [v]    |          |
|  | Alertas             | [v]    | [v]    | [v]    | [v]    |          |
|  | Dashboard           | [v]    | [v]    | [v]    | [v]    |          |
|  | Risk Scoring        | --     | [v]    | [v]    | [v]    |          |
|  | Benchmarks básicos  | --     | [v]    | [v]    | [v]    |          |
|  | Benchmarks avançados| --     | --     | [v]    | [v]    |          |
|  | Pacote renegociação | --     | --     | [v]    | [v]    |          |
|  | API                 | --     | --     | [v]    | [v]    |          |
|  | Relatórios          | --     | [v]    | [v]    | [v]    |          |
|  | SSO / SAML          | --     | --     | --     | [v]    |          |
|  | Audit log           | --     | --     | --     | [v]    |          |
|  | Suporte dedicado    | --     | --     | --     | [v]    |          |
|  +---------------------+--------+--------+--------+--------+          |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|    Descubra quanto você pode economizar                                |
|                                                                        |
|  +----------------------------------------------------------------+   |
|  |                                                                |   |
|  |  Quantos contratos você gerencia?                              |   |
|  |  [==========O==========] 45 contratos                         |   |
|  |                                                                |   |
|  |  Valor médio mensal dos contratos?                             |   |
|  |  [=======O==============] $1.200                              |   |
|  |                                                                |   |
|  |  +----------------------------------------------------------+ |   |
|  |  |  Economia estimada:                                      | |   |
|  |  |                                                          | |   |
|  |  |  $12.960/ano                                             | |   |
|  |  |  ========================================== 24%          | |   |
|  |  |                                                          | |   |
|  |  |  Baseado na economia média de 24% dos nossos clientes    | |   |
|  |  |  com portfólio semelhante.                               | |   |
|  |  +----------------------------------------------------------+ |   |
|  |                                                                |   |
|  +----------------------------------------------------------------+   |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|    Perguntas frequentes                                                |
|                                                                        |
|  +----------------------------------------------------------------+   |
|  | [v] Como funciona o trial de 14 dias?                          |   |
|  |     Você tem acesso completo ao plano Professional por...      |   |
|  +----------------------------------------------------------------+   |
|  | [>] Posso mudar de plano depois?                               |   |
|  +----------------------------------------------------------------+   |
|  | [>] O que acontece se eu exceder o limite de contratos?        |   |
|  +----------------------------------------------------------------+   |
|  | [>] Como funciona o cancelamento?                              |   |
|  +----------------------------------------------------------------+   |
|  | [>] Meus dados ficam seguros?                                  |   |
|  +----------------------------------------------------------------+   |
|  | [>] Vocês oferecem desconto para ONGs?                         |   |
|  +----------------------------------------------------------------+   |
|                                                                        |
+------------------------------------------------------------------------+
```

---

### 2.3 Sign In

- **Rota:** `/sign-in`
- **Objetivo:** Permitir login seguro via Clerk. Experiência limpa, rápida e sem fricção.

#### Seções

| # | Seção | Descrição |
|---|-------|-----------|
| 1 | **Layout Split** | Tela dividida: esquerda com formulário Clerk, direita com branding visual |
| 2 | **Formulário Clerk** | Componente `<SignIn />` do Clerk com customização visual (cores primary, tipografia Inter/Cal Sans) |
| 3 | **Branding Panel** | Painel direito com gradiente primary-900 -> primary-950, logo branco, frase de impacto e ilustração abstrata |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Formulário | Fade-in + slide-right, delay 100ms |
| Branding panel | Fade-in + slide-left |
| Ilustração no branding | Floating animation suave (translateY -5px a 5px, 4s infinite) |
| Transição pós-login | Fade-out suave (200ms) antes de redirecionar para /dashboard |

#### Wireframe ASCII

```
+========================================================================+
|                                                                        |
|  +-----------------------------+  +----------------------------------+ |
|  |                             |  | ################################ | |
|  |        [Logo Clausent]      |  | ##                            ## | |
|  |                             |  | ##    [Logo branco]           ## | |
|  |        Bem-vindo de volta   |  | ##                            ## | |
|  |                             |  | ##    Proteja seus            ## | |
|  |   +---------------------+  |  | ##    contratos com           ## | |
|  |   | Email               |  |  | ##    inteligência.           ## | |
|  |   +---------------------+  |  | ##                            ## | |
|  |   +---------------------+  |  | ##    +------------------+    ## | |
|  |   | Senha               |  |  | ##    |   Ilustração     |    ## | |
|  |   +---------------------+  |  | ##    |   abstrata de    |    ## | |
|  |                             |  | ##    |   escudo com     |    ## | |
|  |   [* Entrar]                |  | ##    |   documentos     |    ## | |
|  |                             |  | ##    +------------------+    ## | |
|  |   ------- ou --------      |  | ##                            ## | |
|  |                             |  | ##    "Empresas perdem 9.2%  ## | |
|  |   [G] Google  [M] Microsoft|  | ##     da receita anual por  ## | |
|  |                             |  | ##     má gestão contratual" ## | |
|  |   Não tem conta?            |  | ##                            ## | |
|  |   [Criar conta ->]          |  | ##                            ## | |
|  |                             |  | ################################ | |
|  +-----------------------------+  +----------------------------------+ |
|                                                                        |
+========================================================================+
```

---

### 2.4 Sign Up

- **Rota:** `/sign-up`
- **Objetivo:** Capturar novos usuários com fricção mínima. Coletar apenas o essencial e iniciar o trial de 14 dias.

#### Seções

| # | Seção | Descrição |
|---|-------|-----------|
| 1 | **Layout Split** | Mesmo layout do Sign In, com branding panel diferenciado |
| 2 | **Formulário Clerk** | Componente `<SignUp />` do Clerk com campos: nome, email, senha. Opção de signup com Google/Microsoft |
| 3 | **Branding Panel** | Painel com gradiente, 3 bullet points de benefícios ("14 dias grátis", "Sem cartão de crédito", "Setup em 2 minutos"), depoimento de cliente |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Formulário | Fade-in + slide-right, delay 100ms |
| Branding panel | Fade-in + slide-left |
| Bullet points de benefícios | Stagger reveal (delay 150ms entre cada) com slide-up |
| Após signup | Redirect para /dashboard com animação de transição (fade-out + scale 0.98) |

#### Wireframe ASCII

```
+========================================================================+
|                                                                        |
|  +-----------------------------+  +----------------------------------+ |
|  |                             |  | ################################ | |
|  |        [Logo Clausent]      |  | ##                            ## | |
|  |                             |  | ##  [Logo branco]             ## | |
|  |     Crie sua conta grátis   |  | ##                            ## | |
|  |                             |  | ##  [v] 14 dias grátis        ## | |
|  |   +---------------------+  |  | ##  [v] Sem cartão de crédito ## | |
|  |   | Nome completo       |  |  | ##  [v] Setup em 2 minutos   ## | |
|  |   +---------------------+  |  | ##                            ## | |
|  |   +---------------------+  |  | ##  +-----------------------+ ## | |
|  |   | Email corporativo   |  |  | ##  | "Encontramos $47k em  | ## | |
|  |   +---------------------+  |  | ##  |  economia escondida    | ## | |
|  |   +---------------------+  |  | ##  |  nos contratos da      | ## | |
|  |   | Senha               |  |  | ##  |  nossa empresa."       | ## | |
|  |   +---------------------+  |  | ##  |                        | ## | |
|  |                             |  | ##  |  -- Carlos M., CFO    | ## | |
|  |   [* Criar conta grátis]    |  | ##  +-----------------------+ ## | |
|  |                             |  | ##                            ## | |
|  |   ------- ou --------      |  | ##  +---+---+---+             ## | |
|  |                             |  | ##  |   |   |   | Ilustração  ## | |
|  |   [G] Google  [M] Microsoft|  | ##  | Docs sendo analisados  | ## | |
|  |                             |  | ##  +---+---+---+             ## | |
|  |   Já tem conta?             |  | ##                            ## | |
|  |   [Fazer login ->]          |  | ################################ | |
|  +-----------------------------+  +----------------------------------+ |
|                                                                        |
+========================================================================+
```

---

## 3. Dashboard (App Autenticado)

### 3.1 Overview

- **Rota:** `/dashboard`
- **Objetivo:** Fornecer uma visão geral imediata do status contratual da organização. O usuário deve entender em segundos: quantos contratos tem, quanto gasta, quais riscos existem e o que precisa de atenção.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| **Metric Cards (4x)** | Total de contratos, valor total comprometido (mensal), risk score geral do portfólio, economia identificada. Cada card com ícone, valor (JetBrains Mono), variação vs. mês anterior e sparkline |
| **Gráfico "Gastos por Categoria"** | Donut chart (Recharts) mostrando distribuição: SaaS, Fornecedores, Aluguel, Seguro, Outros. Com legenda e valores |
| **Gráfico "Vencimentos Próximos"** | Timeline horizontal mostrando contratos que vencem nos próximos 90 dias. Barras coloridas por nível de urgência |
| **Alertas Recentes (5x)** | Lista compacta dos 5 alertas mais recentes com badge de tipo, nome do contrato, descrição curta e timestamp |
| **Contratos com Maior Risco (5x)** | Tabela compacta: nome, contraparte, risk score (com barra visual colorida), valor mensal, dias para renovação |
| **Ações Rápidas** | Botões: "Enviar contrato", "Ver todos os alertas", "Gerar relatório" |

#### Estado/Dados Necessários (tRPC Queries)

| Query | Dados |
|-------|-------|
| `dashboard.getOverview` | Métricas agregadas: total contratos, valor total, risk score médio, economia total |
| `dashboard.getSpendByCategory` | Distribuição de gastos por categoria |
| `dashboard.getUpcomingExpirations` | Contratos expirando nos próximos 90 dias |
| `alerts.getRecent` | 5 alertas mais recentes |
| `contracts.getHighestRisk` | 5 contratos com maior risk score |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Metric cards | Counter animation (0 -> valor, 1000ms). Stagger entre cards (delay 100ms) |
| Sparklines | Stroke-dashoffset animation (linha se desenha da esquerda para direita, 800ms) |
| Donut chart | Segmentos crescem de 0 ao tamanho final (800ms, ease-out, stagger 100ms) |
| Timeline de vencimentos | Barras crescem da esquerda (width 0 -> final, 600ms, stagger 50ms) |
| Alertas | Stagger list reveal (fade-in + slide-right, delay 75ms) |
| Tabela de riscos | Fade-in por linha (stagger 50ms), barra de risco cresce (width animation) |

#### Wireframe ASCII

```
+---+====================================================================+
| S |                                                                    |
| I |  Boa tarde, Maria          [Org: TechStartup Inc. v]   [Bell] [?] |
| D |                                                                    |
| E |  +-------------+ +-------------+ +-------------+ +-------------+  |
| B |  | [FileText]  | | [Dollar]    | | [Shield]    | | [Trending]  |  |
| A |  | Contratos   | | Valor Total | | Risk Score  | | Economia    |  |
| R |  |             | |             | |             | |             |  |
|   |  |    47       | |  $18.4k/mês | |    64/100   | |  $4.2k      |  |
|   |  |  +12% ~~~~  | |  -3% ~~~~   | |  +8  ~~~~   | |  +$800 ~~~~ |  |
| O |  +-------------+ +-------------+ +-------------+ +-------------+  |
| v |                                                                    |
| e |  +----------------------------+ +-------------------------------+  |
| r |  | Gastos por Categoria       | | Vencimentos Próximos (90d)   |  |
| v |  |                            | |                               |  |
| i |  |        +------+            | | Acme SaaS     |====     | 12d|  |
| e |  |       /  SaaS  \           | | Aluguel SP    |=======  | 28d|  |
| w |  |      | 42% |    |          | | Cloud Host    |=========| 45d|  |
|   |  |      |     | Seg|          | | Seguro Fleet  |============67d|  |
|   |  |       \ Forn /             | | Design Tool   |=============82d|  |
| A |  |        +------+            | |                               |  |
| l |  |  Aluguel                   | |                               |  |
| e |  |                            | | [Ver todos ->]                |  |
| r |  +----------------------------+ +-------------------------------+  |
| t |                                                                    |
| a |  +----------------------------+ +-------------------------------+  |
| s |  | Alertas Recentes           | | Contratos com Maior Risco    |  |
|   |  |                            | |                               |  |
| B |  | [!] Acme SaaS renova em    | | Contrato    Score Valor  Dias|  |
| e |  |     12 dias    há 2h       | | AWS Host    [==] 89  $3.2k 12|  |
| n |  |                            | | Office 365  [==] 78  $1.8k 28|  |
| c |  | [i] Cloud Host: cláusula   | | Aluguel SP  [==] 72  $4.5k 45|  |
| h |  |     de reajuste 15%  há 5h | | Seguro Car  [= ] 65  $0.9k 67|  |
|   |  |                            | | Design Tool [= ] 58  $0.3k 82|  |
| S |  | [!] Seguro Fleet: notice   | |                               |  |
| e |  |     period em 20 dias 1d   | |                               |  |
| t |  |                            | |                               |  |
| t |  | [Ver todos ->]             | | [Ver todos ->]                |  |
|   |  +----------------------------+ +-------------------------------+  |
+---+====================================================================+
```

---

### 3.2 Contratos (Lista)

- **Rota:** `/dashboard/contracts`
- **Objetivo:** Permitir ao usuário visualizar, filtrar, buscar e gerenciar todos os contratos da organização de forma eficiente.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| **Barra de Ações** | Botão "Enviar contrato" (primary), campo de busca com ícone Search, filtros dropdown |
| **Filtros** | Dropdowns: Categoria (SaaS, Fornecedor, Aluguel, Seguro, Outro), Status (Ativo, Expirando, Expirado, Renovado, Cancelado), Risk Score (Baixo 0-33, Médio 34-66, Alto 67-100) |
| **Tabela de Contratos** | Colunas: Título, Contraparte, Categoria (badge), Status (badge), Risk Score (barra visual), Valor Mensal, Próxima Renovação, Ações (ver, editar, excluir) |
| **Paginação** | Paginação com 20 itens por página, total de resultados |
| **Estado Vazio** | Ilustração + "Nenhum contrato encontrado. Envie seu primeiro contrato para começar." + CTA |

#### Estado/Dados Necessários (tRPC Queries)

| Query | Dados |
|-------|-------|
| `contracts.list` | Lista paginada com filtros (category, status, riskRange, search, page, limit) |
| `contracts.getStats` | Contadores por status e categoria para os filtros |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Tabela | Stagger row reveal ao carregar (fade-in + slide-up, delay 30ms por linha) |
| Filtros | Dropdown com spring animation (scale 0.95 -> 1, opacity 0 -> 1) |
| Busca | Debounce 300ms, skeleton loading nas linhas durante busca |
| Hover em linha | Background transition suave (150ms) + cursor pointer |
| Remoção de contrato | Linha faz slide-left + fade-out (200ms), demais linhas colapsam com layout animation |
| Estado vazio | Ilustração com floating animation, texto com fade-in |

#### Wireframe ASCII

```
+---+====================================================================+
| S |                                                                    |
| I |  Contratos                                [* Enviar contrato]     |
| D |                                                                    |
| E |  +--------------------+ +----------+ +----------+ +-----------+   |
| B |  | [Search] Buscar... | | Categ. v | | Status v | | Risco   v |   |
| A |  +--------------------+ +----------+ +----------+ +-----------+   |
| R |                                                                    |
|   |  Mostrando 47 contratos                                           |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | Título        | Contraparte | Categ. | Status   | Risk | $/mês| |
|   |  +--------------------------------------------------------------+ |
|   |  | AWS Hosting   | Amazon      | [SaaS] | [Ativo]  | [==]  $3.2k| |
|   |  |               |             |        |          |  89        | |
|   |  +--------------------------------------------------------------+ |
|   |  | Office 365    | Microsoft   | [SaaS] | [Expir.] | [==]  $1.8k| |
|   |  |               |             |        |          |  78        | |
|   |  +--------------------------------------------------------------+ |
|   |  | Aluguel SP    | Imob. Silva | [Alug] | [Ativo]  | [==]  $4.5k| |
|   |  |               |             |        |          |  72        | |
|   |  +--------------------------------------------------------------+ |
|   |  | Seguro Frota  | Porto Seg.  | [Seg]  | [Ativo]  | [= ]  $0.9k| |
|   |  |               |             |        |          |  65        | |
|   |  +--------------------------------------------------------------+ |
|   |  | Design Tool   | Figma       | [SaaS] | [Ativo]  | [= ]  $0.3k| |
|   |  |               |             |        |          |  58        | |
|   |  +--------------------------------------------------------------+ |
|   |  | Limpeza       | CleanPro    | [Forn] | [Ativo]  | [  ]  $1.1k| |
|   |  |               |             |        |          |  22        | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  [< Anterior]   Página 1 de 3   [Próximo >]                      |
|   |                                                                    |
+---+====================================================================+
```

---

### 3.3 Upload de Contrato

- **Rota:** `/dashboard/contracts/upload`
- **Objetivo:** Permitir ao usuário enviar um ou mais contratos de forma simples e intuitiva, com feedback visual do progresso de processamento.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| **Dropzone** | Área de drag & drop grande (ocupando 60% da tela), aceita PDF, DOCX, PNG, JPG. Ícone FileUp central, texto de instrução, botão alternativo "Selecionar arquivo" |
| **Metadados (Opcional)** | Formulário lateral com campos opcionais: Título do contrato, Categoria (select), Contraparte, Notas. Preenchidos por padrão com dados extraídos após upload |
| **Lista de Uploads** | Lista dos arquivos em upload/processamento com nome, tamanho, barra de progresso e status (enviando, processando, concluído, erro) |
| **Stepper de Status** | Indicador visual das etapas: (1) Upload, (2) Extração de texto, (3) Análise inteligente, (4) Concluído |

#### Estado/Dados Necessários (tRPC Queries)

| Query/Mutation | Dados |
|----------------|-------|
| `contracts.getUploadUrl` | URL assinada para upload no storage |
| `contracts.create` | Criação do registro do contrato com metadata |
| `contracts.getProcessingStatus` | Polling do status de processamento (ou WebSocket) |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Dropzone | Borda tracejada com animação dash (stroke-dashoffset rotacionando). No drag-over: escala 1.02, borda primary-500, background primary-50 (200ms transition) |
| Ícone de upload no dropzone | Floating animation sutil (translateY -3px a 3px, 3s infinite). No drag-over: bounce único (scale 1.0 -> 1.1 -> 1.0) |
| Arquivo aceito | Slide-in da esquerda + fade-in (200ms). Ícone do tipo de arquivo com scale-in (150ms) |
| Barra de progresso | Width animation suave (ease-out). Cor muda de primary-500 (upload) para accent-500 (sucesso) com crossfade |
| Stepper | Cada step se preenche com uma animação circular (borda desenha ao redor, 500ms). Linha entre steps se desenha progressivamente |
| Conclusão | Confetti sutil (partículas em primary e accent, 1.5s) + check icon com spring bounce |
| Erro | Shake animation no item (translateX -5px, 5px, 0, 200ms) + borda danger-500 |

#### Wireframe ASCII

```
+---+====================================================================+
| S |                                                                    |
| I |  Enviar Contrato                          [< Voltar a contratos]  |
| D |                                                                    |
| E |  +------------------------------------------+ +----------------+  |
| B |  |                                          | |                |  |
| A |  |                                          | | Detalhes       |  |
| R |  |          +------------+                  | | (opcional)     |  |
|   |  |          |            |                  | |                |  |
|   |  |          |  [FileUp]  |                  | | Título         |  |
|   |  |          |            |                  | | [___________]  |  |
|   |  |          +------------+                  | |                |  |
|   |  |                                          | | Categoria      |  |
|   |  |   Arraste seus contratos aqui            | | [SaaS       v] |  |
|   |  |   ou                                     | |                |  |
|   |  |   [Selecionar arquivos]                  | | Contraparte    |  |
|   |  |                                          | | [___________]  |  |
|   |  |   PDF, DOCX, PNG ou JPG                  | |                |  |
|   |  |   Até 20MB por arquivo                   | | Notas          |  |
|   |  |                                          | | [___________]  |  |
|   |  +------------------------------------------+ | [___________]  |  |
|   |                                               |                |  |
|   |  Arquivos enviados                            +----------------+  |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | [PDF] contrato-aws.pdf           2.3 MB                      | |
|   |  |       (1) Upload  (2) Extração  (*3) Análise  (4) Concluído | |
|   |  |       [=================================>------] 78%          | |
|   |  +--------------------------------------------------------------+ |
|   |  | [DOC] aluguel-escritorio.docx    1.1 MB                      | |
|   |  |       (*1) Upload  (2) Extração  (3) Análise  (4) Concluído | |
|   |  |       [=========>--------------------------] 24%              | |
|   |  +--------------------------------------------------------------+ |
|   |  | [PDF] seguro-frota.pdf           4.7 MB          [v] Pronto! | |
|   |  |       (v1) Upload  (v2) Extração  (v3) Análise  (v4) Done   | |
|   |  |       [============================================] 100%     | |
|   |  |       [Ver análise ->]                                        | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
+---+====================================================================+
```

---

### 3.4 Detalhe do Contrato

- **Rota:** `/dashboard/contracts/[id]`
- **Objetivo:** Exibir a análise completa de um contrato individual: resumo, cláusulas extraídas, risk score detalhado, benchmarks e ações disponíveis.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| **Header do Contrato** | Título, contraparte, categoria (badge), status (badge), data de upload. Botões: "Baixar original", "Gerar pacote de renegociação", menu de ações (editar, excluir) |
| **Resumo Executivo** | Card com resumo gerado: partes envolvidas, datas-chave (início, fim, notice period), valor total/mensal, termos de renovação, auto-renovação (sim/não) |
| **Risk Score Card** | Score grande (JetBrains Mono, 72px) com barra visual circular, breakdown do score por categoria (auto-renovação, penalidades, escalation, lock-in, SLA, responsabilidade) |
| **Cláusulas Extraídas** | Lista de cláusulas com tipo (badge), texto da cláusula, nível de risco (badge danger/warning/success), posição no documento original |
| **Benchmarks** | Cards comparativos: "Você paga X. A média do mercado é Y." com barra de comparação visual. Percentil do usuário |
| **Texto Original** | Viewer do texto extraído com highlights nas cláusulas problemáticas (background danger-50 ou warning-50) |
| **Timeline de Alertas** | Cronologia de alertas configurados e enviados para este contrato |

#### Estado/Dados Necessários (tRPC Queries)

| Query | Dados |
|-------|-------|
| `contracts.getById` | Dados completos do contrato (incluindo ai_summary) |
| `contracts.getClauses` | Lista de cláusulas extraídas |
| `contracts.getBenchmarks` | Dados de benchmark para este contrato |
| `alerts.getByContract` | Alertas configurados/enviados para este contrato |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Risk score circular | Borda circular se desenha de 0 a valor final (stroke-dashoffset, 1200ms, ease-out). Número faz counter animation |
| Breakdown de risco | Barras horizontais crescem da esquerda (width 0 -> valor, stagger 100ms) |
| Cláusulas | Stagger list (fade-in + slide-right, delay 50ms). Hover: background sutil + borda esquerda colorida |
| Benchmarks | Barras "você" e "mercado" crescem sequencialmente (800ms, ease-out). Diferença pulsa suavemente se for negativa |
| Highlights no texto | Background das cláusulas problemáticas tem pulse sutil (opacity 0.5 -> 1 -> 0.5, 3s, infinite) quando em foco |
| Tab navigation | Conteúdo faz crossfade ao trocar de aba (opacity + translateY, 200ms) |

#### Wireframe ASCII

```
+---+====================================================================+
| S |                                                                    |
| I |  [< Contratos]                                                    |
| D |                                                                    |
| E |  AWS Hosting Agreement                                            |
| B |  Amazon Web Services  [SaaS]  [Ativo]                             |
| A |  Enviado em 15 jan 2026                                           |
| R |                                                                    |
|   |  [Baixar original]  [* Gerar pacote de renegociação]  [... v]     |
|   |                                                                    |
|   |  +---------------------------+ +--------------------------------+ |
|   |  | Resumo Executivo          | | Risk Score                     | |
|   |  |                           | |                                | |
|   |  | Partes:                   | |         +------+               | |
|   |  |   TechStartup Inc.       | |        /   89   \              | |
|   |  |   Amazon Web Services    | |       |  /100    |             | |
|   |  |                           | |        \        /              | |
|   |  | Período:                  | |         +------+               | |
|   |  |   01/01/2025 - 31/12/2025| |    RISCO ALTO                  | |
|   |  |   Notice: 30 dias        | |                                | |
|   |  |                           | | Auto-renovação    [========] 95| |
|   |  | Valor:                    | | Penalidades       [======  ] 78| |
|   |  |   $3.200/mês ($38.4k/ano)| | Escalation        [=====   ] 72| |
|   |  |                           | | Lock-in           [====    ] 60| |
|   |  | Auto-renovação: Sim       | | SLA               [==      ] 35| |
|   |  | Reajuste: CPI + 3%       | | Responsabilidade  [===     ] 48| |
|   |  +---------------------------+ +--------------------------------+ |
|   |                                                                    |
|   |  [Cláusulas] [Benchmarks] [Texto Original] [Alertas]              |
|   |  ================================================================= |
|   |                                                                    |
|   |  Cláusulas Extraídas (14)                                          |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | [!] Auto-Renovação                             [Risco Alto]  | |
|   |  |                                                              | |
|   |  | "Este contrato será automaticamente renovado por períodos     | |
|   |  |  sucessivos de 12 meses, salvo notificação por escrito com   | |
|   |  |  antecedência mínima de 90 dias do término do período..."    | |
|   |  |                                                              | |
|   |  | Impacto: Renovação automática sem opt-out fácil. Notice       | |
|   |  | period de 90 dias é mais longo que o padrão do mercado (30d).| |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | [!] Cláusula de Reajuste                     [Risco Médio]   | |
|   |  |                                                              | |
|   |  | "Os preços serão reajustados anualmente com base no CPI      | |
|   |  |  acrescido de 3 pontos percentuais..."                       | |
|   |  |                                                              | |
|   |  | Impacto: Reajuste acima da inflação. Média do mercado é      | |
|   |  | CPI + 1.5%. Você paga 1.5% a mais que a média.              | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | [v] SLA de Disponibilidade                    [Risco Baixo]  | |
|   |  |                                                              | |
|   |  | "O provedor garante disponibilidade mínima de 99.9%..."       | |
|   |  |                                                              | |
|   |  | Impacto: SLA padrão do mercado. Adequado.                    | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
+---+====================================================================+
```

---

### 3.5 Alertas

- **Rota:** `/dashboard/alerts`
- **Objetivo:** Centralizar todos os alertas de vencimento, renovação e riscos em uma timeline navegável, permitindo configuração e gerenciamento de notificações.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| **Filtros de Alerta** | Tabs: Todos, Não lidos, Críticos, Renovação, Vencimento, Risco. Filtro por contrato (select) |
| **Timeline** | Lista cronológica inversa (mais recente primeiro). Cada item: ícone de tipo, título, descrição, contrato vinculado (link), timestamp, badge de prioridade (crítico/alerta/info) |
| **Configurações de Alerta** | Botão que abre drawer lateral com opções: períodos de antecedência (90, 60, 30, 15, 7 dias), canais (email, in-app), horário de envio |
| **Marcadores** | Botão "Marcar como lido", "Marcar todos como lidos" |
| **Estado Vazio** | Ilustração de sino com check + "Nenhum alerta pendente. Seus contratos estão sob controle." |

#### Estado/Dados Necessários (tRPC Queries)

| Query | Dados |
|-------|-------|
| `alerts.list` | Lista paginada com filtros (type, priority, read, contractId, page) |
| `alerts.getUnreadCount` | Contador de não lidos (usado no badge do sino na navbar) |
| `alerts.getSettings` | Configurações atuais de alerta do usuário |
| `alerts.markAsRead` | Mutation para marcar alerta(s) como lido(s) |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Timeline items | Stagger reveal (fade-in + slide-left, delay 50ms). Novos alertas entram com highlight pulsante (background primary-50 -> transparent, 2s) |
| Tabs | Indicador animado (underline desliza com spring animation) |
| Badge de contagem | Bounce ao atualizar (scale 1.0 -> 1.3 -> 1.0, 300ms) |
| Marcar como lido | Item faz fade parcial (opacity 1 -> 0.6) + ícone check com scale-in |
| Drawer de configurações | Slide-in da direita (300ms, spring). Overlay fade-in |
| Toggle de períodos | Spring animation nos switches |

#### Wireframe ASCII

```
+---+====================================================================+
| S |                                                                    |
| I |  Alertas                          [Configurar alertas]  [Marcar   |
| D |                                                         todos]    |
| E |                                                                    |
| B |  [Todos (23)] [Não lidos (8)] [Críticos (3)] [Renovação] [Risco] |
| A |  =================================================================|
| R |                                                                    |
|   |  HOJE                                                              |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | [!] CRITICO                                        há 2h     | |
|   |  |                                                              | |
|   |  | AWS Hosting renova automaticamente em 12 dias                | |
|   |  | O notice period encerra em 12 dias. Após essa data,          | |
|   |  | o contrato será renovado automaticamente por mais 12 meses.  | |
|   |  |                                                              | |
|   |  | Contrato: AWS Hosting Agreement ->      [Marcar como lido]   | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | [i] INFORMATIVO                                    há 5h     | |
|   |  |                                                              | |
|   |  | Cláusula de reajuste identificada no Cloud Hosting            | |
|   |  | Reajuste de CPI + 3% está acima da média do mercado.          | |
|   |  |                                                              | |
|   |  | Contrato: Cloud Hosting ->              [Marcar como lido]   | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  ONTEM                                                             |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | [!] ALERTA                                        1 dia      | |
|   |  |                                                              | |
|   |  | Seguro Frota: notice period em 20 dias                        | |
|   |  | Você tem 20 dias para cancelar ou renegociar antes da         | |
|   |  | renovação automática.                                          | |
|   |  |                                                              | |
|   |  | Contrato: Seguro Frota ->               [Marcar como lido]   | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  SEMANA PASSADA                                                    |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | [v] INFORMATIVO (lido)                             5 dias    | |
|   |  |                                                              | |
|   |  | Novo benchmark disponível para Figma Enterprise               | |
|   |  | Você paga $15/usuário. A média do mercado é $12/usuário.      | |
|   |  |                                                              | |
|   |  | Contrato: Design Tool ->                                     | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  [Carregar mais alertas...]                                       |
|   |                                                                    |
+---+====================================================================+
```

---

### 3.6 Benchmarks

- **Rota:** `/dashboard/benchmarks`
- **Objetivo:** Apresentar comparativos de mercado para os contratos do usuário, evidenciando onde há oportunidade de economia e quais contratos estão dentro da média.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| **Resumo de Economia** | Card hero com total de economia potencial identificada (JetBrains Mono, grande, accent-500), número de contratos acima da média |
| **Filtros** | Categoria (SaaS, Fornecedor, Aluguel, Seguro), Métrica (preço, termos de renovação, SLA) |
| **Lista de Benchmarks** | Cards por contrato com: nome, contraparte, métrica comparada, valor do usuário, média do mercado, percentil, barra visual, badge (acima/abaixo da média), CTA "Renegociar" |
| **Gráfico de Distribuição** | Scatter plot ou histogram mostrando onde o usuário se posiciona em relação ao mercado para a métrica selecionada |
| **Nota de Metodologia** | Texto explicativo sobre como os benchmarks são calculados (dados agregados e anônimos) |

#### Estado/Dados Necessários (tRPC Queries)

| Query | Dados |
|-------|-------|
| `benchmarks.getSummary` | Total de economia potencial, contratos acima da média |
| `benchmarks.list` | Lista de benchmarks por contrato com filtros |
| `benchmarks.getDistribution` | Dados para gráfico de distribuição |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Card de economia total | Counter animation (0 -> valor, 1200ms). Background com shimmer sutil accent |
| Barras comparativas | "Você" e "Mercado" crescem da esquerda (width animation, 800ms, ease-out). Se "Você" > "Mercado", barra "Você" em danger-400, senão accent-400 |
| Percentil | Dot animado que desliza até a posição do percentil na barra (600ms, ease-out) |
| Cards de benchmark | Stagger grid reveal (delay 75ms, fade-in + slide-up) |
| Scatter plot | Pontos aparecem com stagger (scale 0 -> 1, delay 20ms cada, spring) |

#### Wireframe ASCII

```
+---+====================================================================+
| S |                                                                    |
| I |  Benchmarks de Mercado                                            |
| D |                                                                    |
| E |  +--------------------------------------------------------------+ |
| B |  |  ########################################################   | |
| A |  |  ##                                                      ##  | |
| R |  |  ##  Economia potencial identificada                     ##  | |
|   |  |  ##                                                      ##  | |
|   |  |  ##  $12.960/ano                                         ##  | |
|   |  |  ##                                                      ##  | |
|   |  |  ##  8 de 47 contratos estão acima da média do mercado   ##  | |
|   |  |  ##                                                      ##  | |
|   |  |  ########################################################   | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  [Todas categorias v]  [Preço v]                                  |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | AWS Hosting        Amazon Web Services            [SaaS]     | |
|   |  |                                                              | |
|   |  | Preço por unidade (compute):                                 | |
|   |  |                                                              | |
|   |  | Você:    $3.200/mês  [=============================]         | |
|   |  | Mercado: $2.400/mês  [=====================       ]          | |
|   |  |                                                              | |
|   |  | Percentil: 78 de 100 (você paga mais que 78% do mercado)     | |
|   |  | Economia potencial: $9.600/ano                               | |
|   |  |                                                              | |
|   |  | [* Gerar pacote de renegociação]                              | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | Figma Enterprise    Figma, Inc.                    [SaaS]     | |
|   |  |                                                              | |
|   |  | Preço por usuário:                                           | |
|   |  |                                                              | |
|   |  | Você:    $15/user   [========================     ]          | |
|   |  | Mercado: $12/user   [===================          ]          | |
|   |  |                                                              | |
|   |  | Percentil: 65 de 100                                        | |
|   |  | Economia potencial: $1.800/ano                               | |
|   |  |                                                              | |
|   |  | [* Gerar pacote de renegociação]                              | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | Aluguel Escritório  Imobiliária Silva             [Aluguel]  | |
|   |  |                                                              | |
|   |  | Preço por m2:                                                | |
|   |  |                                                              | |
|   |  | Você:    $45/m2     [===================          ]          | |
|   |  | Mercado: $48/m2     [=====================         ]          | |
|   |  |                                                              | |
|   |  | Percentil: 38 de 100 (você paga menos que 62% do mercado)    | |
|   |  | [v] Dentro da média                                          | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  * Benchmarks calculados com base em dados agregados e            |
|   |    anônimos de contratos similares na plataforma.                 |
|   |                                                                    |
+---+====================================================================+
```

---

### 3.7 Renegociação

- **Rota:** `/dashboard/contracts/[id]/renegotiate`
- **Objetivo:** Gerar e apresentar um pacote completo de renegociação para um contrato específico, com argumentos baseados em dados, draft de comunicação e estimativa de economia.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| **Status da Geração** | Stepper mostrando o progresso da geração: (1) Analisando contrato, (2) Coletando benchmarks, (3) Gerando argumentos, (4) Criando draft. Loading state enquanto gera |
| **Resumo do Contrato** | Card compacto com dados-chave do contrato atual (valor, contraparte, risco, período) |
| **Pontos de Renegociação** | Lista priorizada (do mais impactante ao menos) de pontos a renegociar. Cada ponto: título, argumento, dado de benchmark, economia estimada, prioridade (badge) |
| **Draft de Email** | Editor de texto com o draft de email/carta de renegociação gerado. Editável pelo usuário. Botão "Copiar" e "Enviar por email" |
| **Estimativa de Economia** | Card accent com o total de economia estimada se todos os pontos forem negociados com sucesso. Breakdown por ponto |
| **Histórico** | Se já houve renegociações anteriores, exibir histórico |

#### Estado/Dados Necessários (tRPC Queries)

| Query/Mutation | Dados |
|----------------|-------|
| `renegotiation.generate` | Mutation que dispara a geração do pacote (retorna job ID) |
| `renegotiation.getStatus` | Polling do status de geração |
| `renegotiation.getPackage` | Pacote completo após geração |
| `contracts.getById` | Dados do contrato para contexto |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Stepper de geração | Steps se preenchem sequencialmente com animação circular. Spinner em cada step ativo. Check com spring bounce ao concluir |
| Pontos de renegociação | Stagger reveal (delay 150ms, slide-up + fade-in). Cada ponto "desdobra" ao clicar para mostrar detalhes |
| Draft de email | Efeito de "digitação" (reveal caractere a caractere, 10ms/char) quando gerado. Opcional: fade-in por parágrafo |
| Card de economia | Counter animation no valor total. Background com shimmer accent sutil |
| Botão copiar | Ícone muda de Copy para Check com crossfade (200ms), volta após 2s |

#### Wireframe ASCII

```
+---+====================================================================+
| S |                                                                    |
| I |  [< AWS Hosting Agreement]                                        |
| D |                                                                    |
| E |  Pacote de Renegociação                                           |
| B |                                                                    |
| A |  (v1) Analisando  (v2) Benchmarks  (v3) Argumentos  (v4) Draft   |
| R |  =================================================================|
|   |                                                                    |
|   |  +-----------------------------+ +------------------------------+ |
|   |  | Contrato Atual              | | Economia Estimada            | |
|   |  |                             | |                              | |
|   |  | AWS Hosting Agreement       | | ########################### | |
|   |  | Amazon Web Services         | | ##                         ##| |
|   |  | $3.200/mês | Risk: 89/100  | | ##   $9.600/ano            ##| |
|   |  | Vence: 31/12/2025           | | ##   se negociado 100%     ##| |
|   |  +-----------------------------+ | ##                         ##| |
|   |                                  | ########################### | |
|   |                                  +------------------------------+ |
|   |                                                                    |
|   |  Pontos de Renegociação (priorizados)                              |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | #1 [ALTO IMPACTO]  Redução de preço por volume               | |
|   |  |                                                              | |
|   |  | Argumento: Você paga $3.200/mês por compute. A média do       | |
|   |  | mercado para volume similar é $2.400/mês (percentil 78).     | |
|   |  | Você é cliente há 3 anos com uso consistente.                | |
|   |  |                                                              | |
|   |  | Economia estimada: $800/mês ($9.600/ano)                     | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | #2 [MEDIO IMPACTO]  Redução do notice period                 | |
|   |  |                                                              | |
|   |  | Argumento: O notice period atual de 90 dias é 3x maior        | |
|   |  | que o padrão do mercado (30 dias). Solicitar redução para     | |
|   |  | 30 dias, alinhando com a prática do setor.                    | |
|   |  |                                                              | |
|   |  | Economia estimada: Redução de risco (flexibilidade)          | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | #3 [MEDIO IMPACTO]  Cap no reajuste anual                   | |
|   |  |                                                              | |
|   |  | Argumento: Reajuste atual de CPI + 3% está acima do padrão   | |
|   |  | de CPI + 1.5%. Solicitar cap de CPI + 1% ou reajuste fixo.  | |
|   |  |                                                              | |
|   |  | Economia estimada: ~$400/ano (projeção 3 anos)               | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  Draft de Email                        [Copiar] [Enviar por email]|
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | Assunto: Revisão de termos -- Contrato de Hosting             | |
|   |  |                                                              | |
|   |  | Prezado time Amazon Web Services,                              | |
|   |  |                                                              | |
|   |  | Gostaríamos de agendar uma conversa para revisar os           | |
|   |  | termos do nosso contrato de hosting, considerando que         | |
|   |  | somos clientes há 3 anos e nosso uso tem crescido             | |
|   |  | consistentemente.                                             | |
|   |  |                                                              | |
|   |  | Especificamente, gostaríamos de discutir:                     | |
|   |  | 1. Condições de preço por volume                              | |
|   |  | 2. Flexibilização do notice period                            | |
|   |  | 3. Cap no reajuste anual                                      | |
|   |  |                                                              | |
|   |  | Ficamos à disposição para uma reunião esta semana.            | |
|   |  |                                                              | |
|   |  | Atenciosamente,                                               | |
|   |  | Maria Santos -- TechStartup Inc.                               | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
+---+====================================================================+
```

---

### 3.8 Configurações

- **Rota:** `/dashboard/settings`
- **Objetivo:** Centralizar todas as configurações da conta: perfil do usuário, dados da organização, membros da equipe e preferências gerais.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| **Tabs de Navegação** | Perfil, Organização, Equipe, Preferências, API Keys (se plano Business+) |
| **Perfil** | Formulário: nome, email, avatar (upload), fuso horário, idioma de notificações |
| **Organização** | Nome da empresa, logo, setor, tamanho (número de funcionários), país |
| **Equipe** | Lista de membros com role (admin/member/viewer), convite por email, remoção |
| **Preferências** | Formato de moeda, formato de data, tema (claro/escuro/sistema), notificações |
| **API Keys** | Geração e revogação de API keys (plano Business+) |

#### Estado/Dados Necessários (tRPC Queries)

| Query/Mutation | Dados |
|----------------|-------|
| `user.getProfile` | Dados do perfil do usuário |
| `user.updateProfile` | Mutation para atualizar perfil |
| `organization.get` | Dados da organização |
| `organization.update` | Mutation para atualizar organização |
| `organization.getMembers` | Lista de membros |
| `organization.inviteMember` | Mutation para convidar membro |
| `organization.removeMember` | Mutation para remover membro |
| `apiKeys.list` | Lista de API keys |
| `apiKeys.create` | Mutation para criar API key |
| `apiKeys.revoke` | Mutation para revogar API key |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Tabs | Indicador underline desliza com spring animation |
| Conteúdo da tab | Crossfade (opacity + translateX leve, 200ms) |
| Toast de sucesso | Slide-in do topo + fade-in (300ms), auto-dismiss em 3s com fade-out |
| Convite de membro | Modal com spring entry. Campo de email com focus animation (borda primary) |
| API Key gerada | Valor aparece com efeito de "revelação" (blur 10px -> 0, 500ms) |
| Avatar upload | Preview com scale-in (0 -> 1, spring). Ring primária pulsante durante upload |

#### Wireframe ASCII

```
+---+====================================================================+
| S |                                                                    |
| I |  Configurações                                                    |
| D |                                                                    |
| E |  [Perfil] [Organização] [Equipe] [Preferências] [API Keys]       |
| B |  =================================================================|
| A |                                                                    |
| R |  Perfil                                                           |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  |                                                              | |
|   |  |  +------+  Maria Santos                                     | |
|   |  |  |Avatar|  maria@techstartup.com                            | |
|   |  |  |      |  [Alterar foto]                                   | |
|   |  |  +------+                                                    | |
|   |  |                                                              | |
|   |  |  Nome completo                                               | |
|   |  |  [Maria Santos                    ]                          | |
|   |  |                                                              | |
|   |  |  Email                                                       | |
|   |  |  [maria@techstartup.com           ]  (gerenciado pelo Clerk) | |
|   |  |                                                              | |
|   |  |  Fuso horário                                                | |
|   |  |  [America/Sao_Paulo            v]                            | |
|   |  |                                                              | |
|   |  |  Idioma das notificações                                     | |
|   |  |  [Português (Brasil)           v]                            | |
|   |  |                                                              | |
|   |  |                                         [* Salvar alterações] | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
+---+====================================================================+
```

---

### 3.9 Billing

- **Rota:** `/dashboard/settings/billing`
- **Objetivo:** Exibir informações do plano atual, permitir upgrade/downgrade, exibir histórico de faturas e gerenciar método de pagamento via Stripe Customer Portal.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| **Plano Atual** | Card destacado com nome do plano, preço, período, data de renovação, limites de uso (contratos usados/total) |
| **Barra de Uso** | Progress bar mostrando contratos usados vs. limite do plano. Warning quando > 80%, danger quando > 95% |
| **Botões de Ação** | "Fazer upgrade", "Alterar plano", "Gerenciar pagamento" (abre Stripe Portal) |
| **Histórico de Faturas** | Tabela: data, descrição, valor, status (pago/pendente/falhou), link para PDF |
| **Uso Adicional** | Se aplicável, lista de cobranças por análise adicional ($2/contrato além do limite) |

#### Estado/Dados Necessários (tRPC Queries)

| Query/Mutation | Dados |
|----------------|-------|
| `billing.getCurrentPlan` | Plano atual, limites, uso |
| `billing.getInvoices` | Histórico de faturas (via Stripe) |
| `billing.getUsage` | Uso adicional (pay-per-analysis) |
| `billing.createPortalSession` | Mutation para abrir Stripe Customer Portal |
| `billing.createCheckoutSession` | Mutation para upgrade/mudança de plano |

#### Interações e Animações (Framer Motion)

| Elemento | Animação |
|----------|----------|
| Barra de uso | Width animation (0 -> valor, 800ms). Cor muda dinamicamente (accent -> warning -> danger) conforme percentual |
| Card de plano | Hover leve (elevação sutil). Badge "Atual" com pulse accent |
| Tabela de faturas | Stagger row reveal |
| Modal de upgrade | Spring entry com cards de plano comparativos. Card selecionado tem borda animada (primary pulse) |
| Confirmação de upgrade | Confetti sutil + card com check animado |

#### Wireframe ASCII

```
+---+====================================================================+
| S |                                                                    |
| I |  Configurações > Billing                                          |
| D |                                                                    |
| E |  +--------------------------------------------------------------+ |
| B |  |  Plano Atual                                                 | |
| A |  |                                                              | |
| R |  |  PROFESSIONAL                          [Atual]               | |
|   |  |  $59/mês (cobrado mensalmente)                               | |
|   |  |  Próxima renovação: 15 mar 2026                               | |
|   |  |                                                              | |
|   |  |  Contratos utilizados:                                       | |
|   |  |  [=============================>         ] 72/100             | |
|   |  |                                                              | |
|   |  |  [Fazer upgrade]  [Alterar plano]  [Gerenciar pagamento]     | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  Uso Adicional (mês atual)                                        |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  |  Análises além do limite: 0                                  | |
|   |  |  Custo adicional: $0.00                                      | |
|   |  |                                                              | |
|   |  |  * Cada análise além do limite custa $2.00                   | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
|   |  Histórico de Faturas                                              |
|   |                                                                    |
|   |  +--------------------------------------------------------------+ |
|   |  | Data       | Descrição            | Valor  | Status   | PDF  | |
|   |  +--------------------------------------------------------------+ |
|   |  | 15/02/2026 | Professional - Fev   | $59.00 | [Pago]   | [v]  | |
|   |  | 15/01/2026 | Professional - Jan   | $59.00 | [Pago]   | [v]  | |
|   |  | 15/12/2025 | Starter - Dez        | $29.00 | [Pago]   | [v]  | |
|   |  | 15/11/2025 | Starter - Nov        | $29.00 | [Pago]   | [v]  | |
|   |  +--------------------------------------------------------------+ |
|   |                                                                    |
+---+====================================================================+
```

---

## 4. User Flows

### 4.1 Onboarding (Signup -> Primeiro Contrato -> Primeira Análise)

```
[Visitante chega na Landing Page]
          |
          v
    [Clica "Começar grátis"]
          |
          v
    [/sign-up]
    Preenche nome, email, senha
    (ou signup com Google/Microsoft)
          |
          v
    [Clerk processa signup]
    Cria conta + organização automática
          |
          v
    [/dashboard] -- primeira vez
    Modal de boas-vindas com 3 steps:
          |
          +-- Step 1: "Bem-vindo ao Clausent!"
          |   Breve explicação da plataforma
          |   [Continuar ->]
          |
          +-- Step 2: "Envie seu primeiro contrato"
          |   Drag & drop simplificado inline no modal
          |   OU [Pular por enquanto]
          |
          +-- Step 3: "Configurar alertas"
          |   Toggle rápido: ativar alertas 30, 15, 7 dias
          |   [Concluir setup]
          |
          v
    [/dashboard]
    Dashboard com dados do primeiro contrato
    (ou empty state com CTA proeminente)
          |
          v
    [Aguarda processamento]
    Toast: "Seu contrato está sendo analisado..."
    Polling de status ou push notification
          |
          v
    [Contrato processado]
    Toast + badge: "Análise concluída! Ver resultados"
          |
          v
    [/dashboard/contracts/[id]]
    Resultado completo da análise
```

### 4.2 Análise de Contrato (Upload -> Processamento -> Resultados -> Alertas)

```
[/dashboard/contracts]
    Clica [Enviar contrato]
          |
          v
    [/dashboard/contracts/upload]
    Arrasta arquivo para dropzone
    OU clica para selecionar
          |
          v
    [Arquivo aceito]
    Valida tipo (PDF/DOCX/IMG) e tamanho (<20MB)
    Exibe na lista de uploads
          |
          +-- [Opcional] Preenche metadata lateral
          |   Título, categoria, contraparte, notas
          |
          v
    [Upload para storage]
    Barra de progresso: 0% -> 100%
    Stepper: (1*) Upload em andamento
          |
          v
    [Inngest job disparado]
    Stepper: (v1) Upload (2*) Extração
    Backend extrai texto (pdf-parse / Tesseract.js)
          |
          v
    [Texto extraído]
    Stepper: (v1) Upload (v2) Extração (3*) Análise
    Backend envia para engine de análise
    Retorno: cláusulas, risk score, datas, valores
          |
          v
    [Análise concluída]
    Stepper: (v1) (v2) (v3) (v4) Concluído!
    Confetti sutil + botão [Ver análise ->]
          |
          v
    [/dashboard/contracts/[id]]
    Resultado completo
          |
          +-- [Sistema cria alertas automáticos]
              Baseado nas datas extraídas:
              - 90, 60, 30, 15, 7 dias antes de vencimento/renovação
              - Notice period alert
              - Alertas de cláusulas de risco
```

### 4.3 Renegociação (Seleção -> Geração de Pacote -> Revisão -> Envio)

```
[/dashboard/contracts/[id]]
    Clica [Gerar pacote de renegociação]
          |
          v
    [/dashboard/contracts/[id]/renegotiate]
    Stepper inicia geração:
          |
          +-- (1*) Analisando contrato...
          |   Engine processa cláusulas e termos
          |
          +-- (2*) Coletando benchmarks...
          |   Busca dados comparativos do mercado
          |
          +-- (3*) Gerando argumentos...
          |   Engine cria pontos de renegociação
          |
          +-- (4*) Criando draft...
              Engine gera email/carta de renegociação
          |
          v
    [Pacote gerado]
    Exibição completa:
          |
          +-- Pontos de renegociação priorizados
          |   #1 Redução de preço (alto impacto)
          |   #2 Notice period (médio impacto)
          |   #3 Cap de reajuste (médio impacto)
          |
          +-- Draft de email
          |   Editável pelo usuário
          |   [Copiar] [Enviar por email]
          |
          +-- Estimativa de economia
              Total: $X.XXX/ano
          |
          v
    [Usuário escolhe ação]
          |
          +-- [Copiar draft] -> Clipboard
          |   Toast: "Copiado!"
          |
          +-- [Enviar por email] -> Modal
          |   Confirma destinatário + assunto
          |   Envia via Resend
          |   Toast: "Email enviado!"
          |
          +-- [Editar draft] -> Editor inline
              Usuário customiza texto
              [Salvar alterações]
```

### 4.4 Upgrade de Plano (Pricing -> Checkout -> Confirmação)

```
[/dashboard/settings/billing]
    Clica [Fazer upgrade]
          |
          v
    [Modal de upgrade]
    Exibe planos disponíveis com comparação
    Destaque nas features adicionais do plano superior
          |
          +-- [Seleciona plano desejado]
          |
          v
    [Stripe Checkout Session]
    Redirect para Stripe Checkout
    (ou embedded checkout no modal)
          |
          +-- Preenche dados de pagamento
          |   Cartão de crédito ou outros métodos
          |
          v
    [Stripe processa pagamento]
          |
          +-- [Sucesso]
          |   Webhook atualiza plano no banco
          |   Redirect para /dashboard/settings/billing
          |   Toast de sucesso: "Upgrade concluído!"
          |   Confetti sutil
          |   Novos limites e features ativados imediatamente
          |
          +-- [Falha]
              Exibe mensagem de erro do Stripe
              [Tentar novamente] ou [Usar outro cartão]

    OU (Downgrade):

    [/dashboard/settings/billing]
    Clica [Alterar plano]
          |
          v
    [Modal de alteração]
    Aviso: "Ao fazer downgrade, você perderá acesso a:
    - Risk Scoring
    - Benchmarks
    - Etc."
          |
          +-- [Confirmar downgrade]
          |   Alteração efetiva no fim do ciclo de faturamento atual
          |   Toast: "Plano alterado. Mudança efetiva em DD/MM/YYYY"
          |
          +-- [Cancelar]
              Volta para billing
```

---

## 5. Componentes Compartilhados

### 5.1 Sidebar

```
+----------------------------------+
|                                  |
|  [Logo Clausent]                 |
|                                  |
|  --------------------------------|
|                                  |
|  PRINCIPAL                       |
|                                  |
|  [LayoutDashboard] Overview      |
|  [FileText]        Contratos     |
|  [Bell (3)]        Alertas       |
|  [BarChart3]       Benchmarks    |
|                                  |
|  --------------------------------|
|                                  |
|  CONTA                           |
|                                  |
|  [Settings]   Configurações      |
|  [CreditCard] Billing            |
|                                  |
|  --------------------------------|
|                                  |
|  +---+                           |
|  |Av |  Maria Santos             |
|  +---+  TechStartup Inc.        |
|         [ChevronDown]            |
|                                  |
+----------------------------------+
```

**Comportamento:**
- Desktop (>1024px): fixa, 260px de largura, bg-subtle
- Tablet (768-1024px): colapsável em ícone-only (64px), expande no hover
- Mobile (<768px): hidden, acessível via hamburger menu, abre como drawer da esquerda

**Animações:**
- Item ativo: background primary-50, borda esquerda 3px primary-600, texto primary-700
- Hover: background secondary-100, transição 150ms
- Badge de alerta (sino): pulse animation se > 0 não lidos
- Collapse/expand (tablet): width animation com spring (300ms)
- Drawer mobile: translateX com spring + overlay fade

### 5.2 Navbar (Top Bar)

```
+====================================================================+
|                                                                    |
|  Boa tarde, Maria               [Org: TechStartup v]  [Bell] [?]  |
|                                                                    |
+====================================================================+
```

**Comportamento:**
- Saudação contextual (Bom dia/Boa tarde/Boa noite + nome)
- Org switcher (Clerk): dropdown para trocar entre organizações
- Sino de notificações: badge com contagem, abre popover com últimos 5 alertas
- Help (?): abre drawer lateral com links para documentação, suporte, feedback

### 5.3 Risk Score Badge

```
Variantes por nível:

  Baixo (0-33):     [  ] 22   bg-accent-50, text-accent-700, barra accent-500
  Médio (34-66):    [= ] 58   bg-warning-50, text-warning-700, barra warning-500
  Alto (67-100):    [==] 89   bg-danger-50, text-danger-700, barra danger-500

Layout:

  +----------------------------------+
  |  [=======    ] 72  Risco Alto    |
  +----------------------------------+
     barra visual    número  label
```

**Variantes de tamanho:**
- `sm`: inline em tabelas (barra 40px, texto 12px)
- `md`: em cards de contrato (barra 60px, texto 14px)
- `lg`: destaque na página de detalhe (barra circular 120px, texto 48px JetBrains Mono)

### 5.4 Contract Card

```
+--------------------------------------------------------------+
|                                                              |
|  [FileText]  AWS Hosting Agreement                [SaaS]    |
|              Amazon Web Services                             |
|                                                              |
|  Valor: $3.200/mês         Risk: [=======   ] 89            |
|  Vence: 31/12/2025         Status: [Ativo]                  |
|                                                              |
|  [Ver detalhes ->]                                           |
|                                                              |
+--------------------------------------------------------------+
```

**Propriedades:**
- Card interactive (hover elevação + translateY -2px)
- Borda esquerda colorida por risco: accent-500 (baixo), warning-500 (médio), danger-500 (alto)
- Badge de categoria com cor neutra (secondary-100)
- Badge de status: success (ativo), warning (expirando), danger (expirado), secondary (cancelado)

### 5.5 Alert Card

```
+--------------------------------------------------------------+
|                                                              |
|  [AlertTriangle]  CRITICO                          há 2h    |
|                                                              |
|  AWS Hosting renova automaticamente em 12 dias               |
|  O notice period encerra em 12 dias. Após essa data,         |
|  o contrato será renovado por mais 12 meses.                 |
|                                                              |
|  Contrato: AWS Hosting Agreement ->                          |
|                                                              |
|                                    [Marcar como lido]        |
+--------------------------------------------------------------+
```

**Variantes por prioridade:**
- Crítico: borda esquerda danger-500, ícone danger-500
- Alerta: borda esquerda warning-500, ícone warning-500
- Informativo: borda esquerda info-500, ícone info-500

**Estado lido:** opacity 0.7, sem borda colorida, ícone check em secondary-400

### 5.6 Loading States

#### Skeleton da Página de Contratos

```
+--------------------------------------------------------------+
|                                                              |
|  [=================]              [============]              |
|                                                              |
|  [========] [======] [========]                              |
|                                                              |
|  +----------------------------------------------------------+|
|  | [====]  [================]  [====]  [===]  [====]  [===] ||
|  +----------------------------------------------------------+|
|  | [====]  [================]  [====]  [===]  [====]  [===] ||
|  +----------------------------------------------------------+|
|  | [====]  [================]  [====]  [===]  [====]  [===] ||
|  +----------------------------------------------------------+|
|  | [====]  [================]  [====]  [===]  [====]  [===] ||
|  +----------------------------------------------------------+|
|                                                              |
+--------------------------------------------------------------+

[====] = Bloco com shimmer animation (secondary-100 -> secondary-200)
```

#### Skeleton do Dashboard

```
+-------------+ +-------------+ +-------------+ +-------------+
|  [===]      | |  [===]      | |  [===]      | |  [===]      |
|  [========] | |  [========] | |  [========] | |  [========] |
|  [=== ~~~~] | |  [=== ~~~~] | |  [=== ~~~~] | |  [=== ~~~~] |
+-------------+ +-------------+ +-------------+ +-------------+

+----------------------------+ +-------------------------------+
|  [================]        | |  [================]            |
|                            | |                               |
|     +------+               | |  [===========        ]        |
|    /  ====  \              | |  [========           ]        |
|   | ==== |   |             | |  [=============      ]        |
|    \ === /                 | |  [================   ]        |
|     +------+               | |                               |
+----------------------------+ +-------------------------------+
```

### 5.7 Empty States

#### Nenhum Contrato

```
+--------------------------------------------------------------+
|                                                              |
|                    +----------+                               |
|                    |          |                               |
|                    |  [+]     |                               |
|                    |   Doc    |                               |
|                    +----------+                               |
|                                                              |
|    Nenhum contrato cadastrado                                |
|                                                              |
|    Envie seus contratos e descubra oportunidades              |
|    escondidas de economia e proteção.                         |
|                                                              |
|    [* Enviar primeiro contrato]                               |
|                                                              |
+--------------------------------------------------------------+
```

#### Nenhum Alerta

```
+--------------------------------------------------------------+
|                                                              |
|                    +----------+                               |
|                    |          |                               |
|                    | [Bell]   |                               |
|                    |   [v]    |                               |
|                    +----------+                               |
|                                                              |
|    Nenhum alerta pendente                                    |
|                                                              |
|    Seus contratos estão sob controle.                         |
|    Avisaremos quando algo precisar da sua atenção.            |
|                                                              |
+--------------------------------------------------------------+
```

#### Nenhum Resultado de Busca

```
+--------------------------------------------------------------+
|                                                              |
|                    +----------+                               |
|                    |          |                               |
|                    | [Search] |                               |
|                    |   ?      |                               |
|                    +----------+                               |
|                                                              |
|    Nenhum resultado encontrado                               |
|                                                              |
|    Tente ajustar os filtros ou termos de busca.               |
|                                                              |
|    [Limpar filtros]                                           |
|                                                              |
+--------------------------------------------------------------+
```

### 5.8 Error States

#### Erro Genérico (em componente)

```
+--------------------------------------------------------------+
|                                                              |
|    [AlertCircle] Algo deu errado                             |
|                                                              |
|    Não foi possível carregar os dados.                        |
|    Tente novamente em alguns instantes.                       |
|                                                              |
|    [Tentar novamente]                                         |
|                                                              |
+--------------------------------------------------------------+
```

#### Página 404

```
+========================================================================+
|  [Logo Clausent]                                                       |
|                                                                        |
|                                                                        |
|                +------------------+                                    |
|                | Ilustração:      |                                    |
|                | documento em     |                                    |
|                | labirinto        |                                    |
|                +------------------+                                    |
|                                                                        |
|                Página não encontrada                                   |
|                                                                        |
|     A página que você procura não existe ou foi movida.                |
|                                                                        |
|     [* Voltar ao Dashboard]   [Ir para a página inicial]               |
|                                                                        |
+========================================================================+
```

#### Página 500

```
+========================================================================+
|  [Logo Clausent]                                                       |
|                                                                        |
|                                                                        |
|                +------------------+                                    |
|                | Ilustração:      |                                    |
|                | engrenagem       |                                    |
|                | quebrada         |                                    |
|                +------------------+                                    |
|                                                                        |
|                Erro interno do servidor                                |
|                                                                        |
|     Algo deu errado do nosso lado. Já estamos                          |
|     trabalhando na solução.                                            |
|                                                                        |
|     [* Tentar novamente]   [Reportar problema]                         |
|                                                                        |
+========================================================================+
```

---

## 6. Design System -- Referências

Para todas as decisões de design visual -- cores, tipografia, iconografia, espaçamentos, animações e componentes -- consultar o documento oficial de branding:

**Documento:** [`docs/BRANDING.md`](./BRANDING.md)

### Resumo Rápido de Referências

| Aspecto | Referência no BRANDING.md |
|---------|--------------------------|
| Cores primárias (Indigo) | Seção 3.2 |
| Cores secundárias (Slate) | Seção 3.3 |
| Cor accent (Emerald) | Seção 3.4 |
| Cores semânticas (success, warning, danger, info) | Seção 3.5 |
| Backgrounds e superfícies | Seção 3.7 |
| Acessibilidade e contraste | Seção 3.8 |
| Fontes (Cal Sans, Inter, JetBrains Mono) | Seção 4 |
| Escala tipográfica | Seção 4.2 |
| Iconografia (Lucide) | Seção 5 |
| Ícones por domínio | Seção 5.4 |
| Ilustrações e estilo visual | Seção 6 |
| Animações e micro-interações | Seção 7 |
| Timing e easing functions | Seção 7.7 |
| Cards, botões, inputs | Seção 8 |
| Gráficos e charts (Recharts) | Seção 8.6 |
| Design tokens (Tailwind config) | Seção 9 |
| Gradientes e efeitos | Seção 10 |

### Princípios UX do Clausent

1. **Hierarquia clara:** O usuário deve saber exatamente o que é mais importante em cada tela. Usar tamanho, cor e posição para guiar o olhar.

2. **Feedback imediato:** Toda ação do usuário deve ter resposta visual em menos de 100ms. Loading states, transições e confirmações são obrigatórios.

3. **Progressividade:** Não sobrecarregar o usuário com informação. Mostrar o essencial primeiro, permitir aprofundamento sob demanda (clique para expandir, tabs, drawers).

4. **Consistência:** Mesmos padrões visuais e de interação em todas as páginas. Um botão primary sempre se comporta da mesma forma, um card de contrato sempre tem a mesma anatomia.

5. **Acessibilidade:** WCAG 2.1 AA mínimo. Focus visible, contraste adequado, navegação por teclado, leitor de tela. `prefers-reduced-motion` respeitado.

6. **Mobile-first:** Todo layout concebido para funcionar em 320px primeiro, depois expandido para desktop. Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl).

7. **Performance percebida:** Skeleton loading em vez de spinners sempre que possível. Optimistic updates quando seguro. Transições suaves entre estados para evitar "piscar" de conteúdo.

8. **Tom de voz integrado ao UX:** Textos de empty states, erros e onboarding seguem o tom da marca (consultor acessível, nunca robótico). Contextualizar sempre, nunca mensagens genéricas.
