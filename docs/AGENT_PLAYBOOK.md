# Funcionalidades — Contratos e Instrucoes

## Login

### Objetivo
Autenticar o casal e iniciar a sessao compartilhada para acesso ao app.

### Contrato
- Entradas: email e senha, ou provedor de OAuth.
- Saidas: sessao valida e redirecionamento para o dashboard.
- Estados: idle, carregando, erro, sucesso.

### Logica (instrucoes)
1. Validar campos obrigatorios antes de enviar.
2. Disparar autenticacao com o provedor escolhido.
3. Enquanto a requisicao estiver em andamento, bloquear o botao principal.
4. Em erro, exibir mensagem clara e manter o usuario na tela.
5. Em sucesso, salvar sessao e navegar para o dashboard.
6. Para OAuth, concluir o callback e seguir o mesmo fluxo de sessao.

### Regras de aceite
- Campos obrigatorios sempre validados.
- Erros exibidos de forma inline.
- Navegacao ocorre apenas apos sessao confirmada.

### Proxima tela
- Sucesso: dashboard.
- Falha: permanece no login.

## Dashboard

### Objetivo
Mostrar um resumo financeiro e servir como ponto principal de entrada para importar CSV.

### Contrato
- Entradas: transacoes, categorias, e indicadores.
- Saidas: navega para importacao ou lista de transacoes.
- Estados: carregando, vazio, sucesso.

### Logica (instrucoes)
1. Carregar dados resumidos e recentes.
2. Exibir indicadores principais do mes atual.
3. Destacar CTA principal para importar CSV.
4. Exibir lista curta de transacoes recentes.
5. Se nao houver transacoes, mostrar estado vazio com orientacao.

### Regras de aceite
- CTA de importacao sempre visivel.
- Indicadores aparecem quando dados estao carregados.
- Estado vazio orienta proximo passo.

### Proxima tela
- CTA principal: importacao de CSV.
- Link secundario: lista de transacoes.

## Importacao de CSV

### Objetivo
Receber CSV, validar colunas, mostrar preview e confirmar importacao.

### Contrato
- Entradas: arquivo CSV do usuario.
- Saidas: envio para API de importacao e resumo do processamento.
- Estados: idle, analisando, preview, importando, sucesso, erro.

### Logica (instrucoes)
1. Aceitar arquivo CSV e iniciar parsing.
2. Validar cabecalhos obrigatorios: data, descricao, valor, moeda.
3. Exibir preview com numero limitado de linhas.
4. Habilitar confirmacao apenas se preview valido.
5. Enviar dados para importacao.
6. Em sucesso, mostrar resumo com totais e duplicidades.
7. Permitir selecionar outro arquivo e reiniciar o fluxo.

### Regras de aceite
- Erros de cabecalho e formato aparecem antes do envio.
- Botao de confirmar desabilitado durante importacao.
- Resumo sempre inclui total e itens duplicados.

### Proxima tela
- Sucesso: lista de transacoes.
- Cancelamento: permanece ou retorna ao dashboard.

## Lista de Transacoes

### Objetivo
Exibir todas as transacoes importadas com busca e filtros.

### Contrato
- Entradas: transacoes e metadados.
- Saidas: navegacao para detalhes e reimportacao.
- Estados: carregando, vazio, sucesso, erro.

### Logica (instrucoes)
1. Carregar transacoes mais recentes primeiro.
2. Permitir busca por descricao, comerciante ou valor.
3. Exibir cada item com data, descricao e valor.
4. Se vazio, mostrar CTA para importar.
5. Manter filtros sem recarregar a pagina.

### Regras de aceite
- Ordenacao por data consistente.
- Busca responsiva e previsivel.
- Estado vazio com CTA claro.

### Proxima tela
- CTA principal: importacao de CSV.
