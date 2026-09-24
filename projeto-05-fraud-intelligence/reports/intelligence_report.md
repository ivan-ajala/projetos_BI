# Relatório de inteligência — Baseline de risco PaySim

**Natureza:** estudo autoral de portfólio, baseado na base sintética PaySim. Não representa uma operação real nem uma avaliação de desempenho em produção.

## Sumário executivo

O projeto compara um baseline explicável de regras com uma regressão logística e demonstra uma fila de triagem simulada. **Score ≥ 2 é o limiar de referência principal** para as regras. Os limiares 1 e 3 foram executados intencionalmente como análises de sensibilidade, não como erros ou configurações concorrentes do cenário principal.

Na validação, score ≥ 2 gerou **3.718 alertas** (1,945%), com precisão de 31,7%, recall de 100% e 2.538 falsos positivos. No teste cronológico exploratório, foram 2.790 alertas (3,119%), precisão de 44,8%, recall de 99,9%, 1.539 falsos positivos e 1 falso negativo. O limiar 2 continua provisório: não existe uma capacidade ou custo de triagem real que justifique aprová-lo como política.

A comparação exploratória sob volume de referência igual na validação mostra que a regressão logística não supera automaticamente as regras: no teste exploratório, o modelo sinalizou 2.298 casos, com recall de 65,2%, enquanto as regras sinalizaram 2.790, com recall de 99,9%. Os resultados provêm da base sintética; a EDA examinou rótulos de todos os períodos, portanto o teste não é cego nem independente.

## Resultados — regras de risco

| Janela | Limiar | Alertas | Taxa de alertas | Precisão | Recall | Falsos positivos | Falsos negativos |
|---|---:|---:|---:|---:|---:|---:|---:|
| Validação | 2 (referência) | 3.718 | 1,945% | 31,7% | 100,0% | 2.538 | 0 |
| Teste cronológico exploratório | 2 (referência) | 2.790 | 3,119% | 44,8% | 99,9% | 1.539 | 1 |

A carga de alertas relativa varia entre validação e teste; não se deve presumir volume ou desempenho estável. A prevalência observada aumenta de 0,095% no treino para 0,617% na validação e 1,399% no teste, refletindo uma mudança temporal dentro da simulação PaySim, não uma previsão para fraude real.

### Sensibilidade de limiar (validação)

Os limiares 1 e 3 foram usados deliberadamente para mostrar o compromisso entre cobertura e volume. Não substituem o limiar 2 da análise principal.

| Limiar | Alertas | Taxa de alertas | Precisão | Recall | Leitura |
|---:|---:|---:|---:|---:|---|
| 1 | 83.820 | 43,851% | 1,4% | 100,0% | Volume muito alto; referência de cobertura máxima. |
| **2** | **3.718** | **1,945%** | **31,7%** | **100,0%** | **Cenário de referência do projeto.** |
| 3 | 349 | 0,183% | 100,0% | 29,6% | Menor volume observado, mas deixa de sinalizar a maioria dos positivos. |

Precisão observada de 100% e zero falsos positivos em uma amostra não garantem esse resultado em outros dados ou períodos.

## Comparação exploratória — regras e regressão logística

O modelo usa regressão logística com ponderação para classe rara e variáveis explicitamente selecionadas. Seu limiar foi escolhido apenas na validação para aproximar a carga das regras com score ≥ 2 nessa partição; o mesmo corte numérico foi mantido no teste. Isso é uma referência comparativa de volume, não uma capacidade operacional aprovada.

| Janela | Método | Alertas | Taxa de alertas | Precisão | Recall | F1 | AP | FP | FN |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Validação | Regras (score ≥ 2) | 3.718 | 1,945% | 31,7% | 100,0% | 48,2% | 0,5193 | 2.538 | 0 |
| Validação | Regressão logística | 3.718 | 1,945% | 20,6% | 64,9% | 31,3% | 0,3983 | 2.952 | 414 |
| Teste exploratório | Regras (score ≥ 2) | 2.790 | 3,119% | 44,8% | 99,9% | 61,9% | 0,6137 | 1.539 | 1 |
| Teste exploratório | Regressão logística | 2.298 | 2,569% | 35,5% | 65,2% | 46,0% | 0,5259 | 1.482 | 436 |

A comparação não prova superioridade geral das regras: ela descreve somente este backtest sintético, com as variáveis, o modelo e o corte registrados. Os escores da regressão não são probabilidades calibradas. Não se deve usar o resultado para decisões reais.

## Simulação da fila operacional

A simulação usa **somente a validação, limiar 2**, cinco analistas simulados e semente 2026. Cada `step` é mapeado para 60 minutos; como o PaySim não registra horários intrastep, as chegadas são distribuídas uniformemente dentro do intervalo. Prioridade, distribuição triangular do tempo de análise e SLA (15 minutos para P1 e 30 minutos para P2) são premissas demonstrativas, não medições.

No cenário-base, os **3.718 alertas** foram iniciados até o fim do horizonte; 3.717 foram concluídos e 1 permanecia em análise. A espera média estimada foi de **260,89 minutos**, mediana 257,69 e P90 516,21. **20,41%** dos alertas iniciados começaram dentro do SLA hipotético; utilização estimada 89,29%. Isso aponta incompatibilidade do cenário de cinco analistas com as metas de SLA assumidas — não mede desempenho de uma equipe real.

| Analistas simulados | Triados até o fim | Concluídos | Ainda na fila | Espera média (min) | Espera P90 (min) | Início dentro do SLA | Utilização estimada |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 1.608 | 1.606 | 2.110 | 1.982,36 | 4.330,51 | 22,01% | 99,90% |
| 5 | 3.718 | 3.717 | 0 | 260,89 | 516,21 | 20,41% | 89,29% |
| 10 | 3.718 | 3.717 | 0 | 33,51 | 107,58 | 67,99% | 44,65% |

A sensibilidade é condicionada às premissas e à aleatoriedade reproduzível do cenário; os percentuais de SLA não devem ser interpretados como medições, garantias ou recomendação de dimensionamento. **Zero alertas ainda na fila não significa que todos começaram dentro do SLA**: os que iniciaram tarde continuam contando como atraso, mesmo quando a fila se esvazia. Precisão e recall são calculados à parte, retrospectivamente contra os rótulos PaySim; não são KPIs da operação simulada.

## Método e salvaguardas

A divisão mantém cada `step` inteiro em uma única partição: treino 1–520, validação 521–631 e teste 632–743. O baseline soma até três sinais: tipo `TRANSFER`/`CASH_OUT`, valor acima do P95 do tipo calculado no treino e valor aproximadamente igual ao saldo anterior da origem. Exclui `isFraud` (rótulo), `isFlaggedFraud` (sinal preexistente) e saldos posteriores (`newbalanceOrig`, `newbalanceDest`).

No classificador, foram usados tipo, valor, índice temporal sintético, saldos anteriores e razões derivadas desses campos. A escolha reduz vazamentos óbvios, mas não prova disponibilidade ou estabilidade em uma operação real. `step` é um índice temporal sintético, sem interpretação como dia ou mês.

A EDA examinou rótulos dos períodos, então todos os resultados são **backtests exploratórios**, não um teste cego nem uma validação independente. Para uma avaliação confirmatória, seria necessário obter uma janela futura não examinada e congelar antecipadamente variáveis, método, corte e métricas.

## KPIs: o que os dados permitem afirmar

- **Calculados retrospectivamente:** precisão, recall, falsos positivos/negativos, taxa/volume de alertas e AP no backtest, com as ressalvas acima.
- **Estimados apenas no cenário simulado:** espera, volume triado/concluído, fila pendente, aderência ao SLA hipotético e capacidade.
- **Não calculáveis como realidade operacional:** tempo real de triagem, pendências reais, encaminhamentos, perdas financeiras ou perdas evitadas. A base PaySim não contém logs operacionais nem dados de prejuízo real.

## Próximos passos metodológicos

1. Preservar score ≥ 2 como referência principal; manter limiares 1 e 3 identificados apenas como sensibilidade, se incluídos.
2. Documentar como hipóteses, e não fatos, capacidade, prioridade, SLA e distribuição de tempos da fila.
3. Para novos testes preditivos, reservar período futuro ainda não examinado e evitar selecionar regras ou cortes com base nos resultados finais.
4. Só substituir KPIs simulados por reais quando houver logs de criação, início, decisão, encerramento, prioridade e estado da fila.

## Fonte e limitações

PaySim, conjunto disponibilizado no [Kaggle](https://www.kaggle.com/datasets/ealaxi/paysim1). A base original não foi incluída no pacote; antes de redistribuir dados ou resultados derivados, verifique os termos atualmente publicados na fonte. As conclusões aplicam-se exclusivamente a esta base sintética e não permitem inferências sobre instituições, clientes, fraude real ou impacto financeiro.
