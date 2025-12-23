# Jornada do Cliente e Funcionalidades (MVP)

## Objetivo
Entregar uma experiencia clara e premium para o casal acompanhar gastos, definir metas e manter um ritual financeiro semanal/mensal.

## Jornadas principais

### Jornada A (Primeiro uso)
1. Onboarding: Categorias
2. Onboarding: Orcamentos (fixo/variavel)
3. Onboarding: Cartoes (detectar automaticamente + revisao opcional)
4. Onboarding: Ritual + convite
5. Onboarding: Primeiro import + preview
6. Uploads (CSV/OCR) + revisar OCR
7. Painel mensal
8. Confirmar pendencias

### Jornada B (Semanal)
1. Painel mensal
2. Confirmar pendencias
3. Ritual semanal
4. Calendario (semana/dia)
5. Painel mensal

### Jornada C (Criar regra)
1. Confirmar pendencias
2. Modal criar regra (merchant/keyword + impacto)
3. Regras (lista + impacto)
4. Voltar para confirmar

### Jornada D (Metas)
1. Metas (sugestao IA ou base mes anterior)
2. Ritual mensal (revisar/confirmar metas + copiar)
3. Painel mensal

## Funcionalidades por area

### Painel mensal
- Mes central com setas (sem dropdown).
- Cards principais com gradiente premium: Projecao do mes, Compromissos restantes.
- Ciclo de cartoes (2+), preview de insights e atividade recente.

### Uploads
- Tabs: CSV e OCR.
- Lista de uploads com status.
- Detalhe do upload com transacoes extraidas.
- Modal de revisao OCR com edicao e confidence.

### Confirmar pendencias
- Filtros com icones (duplicatas, baixa confianca etc.).
- Acoes em lote (confirmar/categorizar/excluir) + Undo.
- Visualizacao de duplicatas side-by-side (comparar diffs).

### Transacoes
- Detalhe com evidencias, resumo CSV e acao de criar regra.
- Opcao de aplicar regra em lote.

### Regras
- Lista com prioridade, impacto e acoes (editar/desativar).
- Modal criar regra mostra quantas transacoes serao afetadas.

### Calendario
- Semana (default) com toggle para Dia.
- Filtros e botao para criar evento.
- Detalhe do evento com historico, tendencia e insight.

### Contas
- Saldo inicial manual.
- Projecoes diaria/semanal.
- Fatura estimada por cartao.

### Metas
- Sugestoes (IA) quando possivel, fallback com media 3 meses.
- Acoes claras para atualizar/comparar com o mes anterior.

### Insights
- 3 a 5 insights acionaveis com CTA.

### Ritual semanal
- Revisar acordo anterior, 3 passos, novo acordo.

### Ritual mensal
- Revisar/confirmar metas do mes, acao de copiar resumo.

### Logs
- Auditoria por pessoa, filtros por periodo/tipo.

### Configuracoes
- Barras de ajuste mais “gordinhas”.
- Selecao de idioma (PT-BR default).
- Privacidade.

## Estados obrigatorios
- Empty state em cada area.
- OCR baixa confianca.
- Duplicatas.
- Unknown impactando total.
- Undo apos confirmacoes em lote.

## Diretrizes visuais
- Base branca e layout limpo.
- Gradiente premium apenas em blocos principais.
- Sidebar fixa no desktop; bottom nav no mobile.
- Animacoes discretas (120–320ms) com prefers-reduced-motion.
