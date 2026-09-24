# 🛡️ Relatório de Inteligência — Baseline de Risco PaySim

**Projeto 05 · Inteligência e Prevenção a Fraudes**

> **Natureza do trabalho:** estudo autoral de portfólio com dados sintéticos PaySim. Os resultados são retrospectivos e exploratórios. Não representam fraude real, uma operação financeira, desempenho em produção ou perdas evitadas.

---

## 📌 Sumário Executivo

Este estudo simula a priorização de transações para análise em uma empresa fictícia de pagamentos digitais. O trabalho compara um **baseline de regras explicáveis** com uma **regressão logística** e apresenta uma simulação hipotética de triagem.

O **score de risco** soma sinais definidos por regras. O **limiar** é o score mínimo necessário para que uma transação gere um alerta. O limiar 2 foi adotado como **referência principal para apresentar e comparar os resultados**, não como política aprovada nem como limiar comprovadamente ideal.

Na validação, o baseline com score ≥ 2 gerou **3.718 alertas**, com **31,7% de precisão** e **100,0% de recall**. No teste cronológico exploratório, gerou **2.790 alertas**, com **44,8% de precisão** e **99,9% de recall**.

A comparação exploratória com regressão logística não demonstrou superioridade geral do modelo. No teste exploratório, a regressão sinalizou 2.298 casos e obteve recall de 65,2%; as regras sinalizaram 2.790 casos e obtiveram recall de 99,9%. Esses resultados se aplicam somente à base sintética, às variáveis e aos procedimentos deste estudo.

A simulação de fila estimou que, no cenário-base de cinco analistas e limiar 2, a espera média seria de aproximadamente **261 minutos** e **20,41%** dos alertas iniciados começariam dentro do SLA hipotético. Isso sugere que a capacidade simulada não atenderia bem à meta definida no cenário. **Não é uma medição de uma operação real nem uma recomendação de dimensionamento de equipe.**

---

## 🎯 Objetivo e Cenário

O cenário fictício considera uma empresa de pagamentos digitais que precisa:

- Identificar transações que merecem revisão;
- Organizar alertas por prioridade e motivo;
- Comparar a cobertura de fraudes rotuladas com o volume de alertas;
- Explorar possíveis efeitos de uma capacidade de triagem hipotética;
- Comunicar resultados, premissas e limitações às equipes de Fraude, Operações e Segurança.

A conexão com minha experiência profissional está nas competências transferíveis de **operações, estratégia, priorização, gestão de indicadores e comunicação analítica**. O projeto não representa experiência profissional anterior em prevenção a fraudes.

---

## 🗃️ Fonte e Natureza dos Dados

O estudo utiliza o conjunto **PaySim — Synthetic Financial Datasets for Fraud Detection**, disponibilizado no Kaggle:

- [PaySim no Kaggle](https://www.kaggle.com/datasets/ealaxi/paysim1)

PaySim é uma base sintética. Os registros não correspondem a transações de clientes reais nem a uma instituição financeira específica.

### Limitações relevantes da base

- `step` é um índice temporal sintético, não uma data de calendário;
- A base não registra decisões de analistas, encaminhamentos ou resultados de investigações;
- Não há horários operacionais reais de criação, início ou encerramento de alertas;
- Não há SLAs observados, custos de triagem ou perdas financeiras reais;
- Os rótulos permitem avaliações retrospectivas dentro da base, mas não comprovam desempenho em produção.

---

## 🔢 Como Interpretar o Score e o Limiar

### O que é o score?

O baseline atribui **um ponto para cada regra de risco atendida**, gerando uma pontuação de **0 a 3**. Quanto maior o score, maior o número de sinais identificados pelas regras. O score **não é uma probabilidade de fraude**.

As três regras consideradas são:

1. A transação é do tipo `TRANSFER` ou `CASH_OUT`;
2. O valor é igual ou superior ao percentil 95 do tipo de transação, calculado no treino;
3. O valor da transação é aproximadamente igual ao saldo anterior da conta de origem.

As regras não utilizam `isFraud`, `isFlaggedFraud` nem os saldos posteriores à transação.

### O que é o limiar?

O **limiar** é o score mínimo necessário para que a transação seja sinalizada como alerta:

| Limiar | Critério para gerar alerta |
|---:|---|
| 1 | Score igual ou superior a 1 |
| 2 | Score igual ou superior a 2 |
| 3 | Score igual ou superior a 3 |

Como os limiares são cortes aplicados ao mesmo score, aumentar o limiar torna a seleção mais restrita. Assim, com as mesmas regras e dados:

- Os alertas do limiar 3 são um subconjunto dos alertas do limiar 2;
- Os alertas do limiar 2 são um subconjunto dos alertas do limiar 1.

Isso **não significa** que o limiar mais alto necessariamente terá melhor precisão em outros dados ou períodos. O efeito deve ser verificado nas métricas observadas.

### Vantagens e trade-offs

| Limiar | Vantagem potencial | Trade-off potencial |
|---|---|---|
| **1 — mais abrangente** | Pode capturar mais casos suspeitos e reduzir o risco de deixar passar positivos rotulados. | Gera mais alertas e pode aumentar falsos positivos e esforço de análise. |
| **2 — intermediário** | Serve como referência para comparar cobertura e volume. | Pode gerar falsos positivos e ainda deixar passar casos positivos, conforme os dados. |
| **3 — mais restritivo** | Reduz o volume e seleciona apenas transações com score mais alto. | Pode deixar passar mais positivos que não acumularam pontos suficientes. |

Essas são tendências conceituais. Precisão, recall e volume de alertas de cada limiar precisam ser calculados nos dados; não devem ser presumidos.

### Por que o limiar 2 é a referência principal?

O limiar 2 foi mantido como **referência principal para organizar a análise e comparar cenários**. Na validação, produziu 3.718 alertas, com recall de 100,0% e precisão de 31,7%. No teste exploratório, produziu 2.790 alertas, com recall de 99,9% e precisão de 44,8%.

Esses resultados mostram que, **nessas partições da base sintética**, o baseline capturou quase todas as fraudes rotuladas — mas parte dos alertas não correspondia a um caso rotulado como fraude. Eles não demonstram que o limiar 2 seja o ideal para uma operação real.

Além disso, a simulação de fila indicou que, com cinco analistas e esse limiar, apenas **20,41%** dos alertas iniciados começariam dentro do SLA hipotético. Portanto, a capacidade do cenário-base não atenderia adequadamente à meta assumida. Uma decisão operacional exigiria avaliar capacidade, prioridade, custo de falsos positivos e risco de deixar fraudes passar, utilizando dados operacionais apropriados.

### Como explicar o limiar em uma entrevista

> “O limiar define o score mínimo para uma transação virar alerta. No limiar 1, a abordagem é mais abrangente e tende a gerar mais alertas; no 3, é mais restritiva e pode reduzir o volume, mas também deixar passar mais casos positivos. Usei o limiar 2 como referência comparativa. Na validação, ele gerou 3.718 alertas, com recall de 100% e precisão de 31,7%. Isso não significa que seja universalmente o melhor: a simulação também indicou que a capacidade hipotética seria insuficiente para o SLA assumido. Em uma operação real, a decisão dependeria da capacidade disponível e do custo de cada tipo de erro.”

> **Precisão** é a proporção dos alertas que correspondiam a fraude rotulada. **Recall** é a proporção das fraudes rotuladas que foram capturadas pelos alertas.

---

## 🧪 Desenho da Avaliação

### Partições cronológicas

A divisão mantém cada `step` inteiro em uma única partição:

| Partição | Intervalo de `step` |
|---|---:|
| Treino | 1–520 |
| Validação | 521–631 |
| Teste exploratório | 632–743 |

A divisão temporal ajuda a observar o comportamento em períodos diferentes. No entanto, a EDA já examinou rótulos de todos os períodos. Portanto, a partição final é um **backtest exploratório**, não um teste cego ou uma avaliação independente.

### Avaliação das regras

O percentil 95 do valor por tipo de transação é calculado somente no treino. Esse valor é usado na regra de risco para pontuar as demais partições.

O limiar 2 é mantido como referência principal. Os limiares 1 e 3 são apresentados como **análise de sensibilidade**, para mostrar como o volume de alertas e as métricas se alteram conforme o corte.

### Comparação com regressão logística

O modelo é uma regressão logística com ponderação para a classe minoritária. As variáveis são selecionadas explicitamente; o modelo exclui o rótulo, a sinalização preexistente, identificadores e saldos posteriores à transação.

O corte do modelo é escolhido na validação para aproximar o volume de alertas do baseline com score ≥ 2 nessa partição. O mesmo corte numérico é mantido no teste exploratório. Essa comparação sob um volume de referência **não define uma capacidade operacional aceitável**.

Os scores da regressão logística não são tratados como probabilidades calibradas.

### Métricas

A análise apresenta:

- Volume e taxa de alertas;
- Precisão e recall;
- F1;
- Falsos positivos e falsos negativos;
- Average Precision (AP).

A acurácia não é a métrica principal, pois a classe fraudulenta é minoritária.

---

## 📊 Resultados do Baseline de Regras

### Limiar 2 — referência principal

| Período | Transações | Alertas | Taxa de alertas | Precisão | Recall | Falsos positivos | Falsos negativos |
|---|---:|---:|---:|---:|---:|---:|---:|
| Validação | 191.147 | 3.718 | 1,945% | 31,7% | 100,0% | 2.538 | 0 |
| Teste cronológico exploratório | 89.466 | 2.790 | 3,119% | 44,8% | 99,9% | 1.539 | 1 |

A carga relativa de alertas e a precisão variam entre as partições. Não se deve presumir que o volume ou o desempenho permaneceriam estáveis em outros períodos ou em uma operação real.

A prevalência observada aumenta de **0,095% no treino** para **0,617% na validação** e **1,399% no teste exploratório**. Essa mudança descreve a base PaySim; não é uma previsão de tendência de fraude real.

### Sensibilidade de limiar — validação

| Limiar | Alertas | Taxa de alertas | Precisão | Recall | Leitura |
|---:|---:|---:|---:|---:|---|
| 1 | 83.820 | 43,851% | 1,4% | 100,0% | Cobertura observada máxima, com volume muito elevado. |
| **2** | **3.718** | **1,945%** | **31,7%** | **100,0%** | **Referência principal do estudo.** |
| 3 | 349 | 0,183% | 100,0% | 29,6% | Menor volume observado, mas deixa de capturar a maioria dos positivos. |

A precisão de 100% e a ausência de falsos positivos no limiar 3 são resultados dessa amostra específica. Não garantem o mesmo comportamento em outros dados ou períodos.

---

## 🤖 Comparação Exploratória — Regras e Regressão Logística

O corte da regressão logística foi escolhido na validação para aproximar o volume de alertas do baseline com score ≥ 2. Na validação, ambos geraram 3.718 alertas; no teste exploratório, o volume do modelo mudou, pois o mesmo corte numérico foi aplicado a outra partição.

| Período | Método | Alertas | Taxa de alertas | Precisão | Recall | F1 | AP | Falsos positivos | Falsos negativos |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Validação | Regras (score ≥ 2) | 3.718 | 1,945% | 31,7% | 100,0% | 48,2% | 0,5193 | 2.538 | 0 |
| Validação | Regressão logística | 3.718 | 1,945% | 20,6% | 64,9% | 31,3% | 0,3983 | 2.952 | 414 |
| Teste exploratório | Regras (score ≥ 2) | 2.790 | 3,119% | 44,8% | 99,9% | 61,9% | 0,6137 | 1.539 | 1 |
| Teste exploratório | Regressão logística | 2.298 | 2,569% | 35,5% | 65,2% | 46,0% | 0,5259 | 1.482 | 436 |

Neste backtest, as regras tiveram recall maior que a regressão logística. Isso não demonstra superioridade geral das regras: o resultado depende da base sintética, das variáveis, do modelo, das partições e do corte utilizado.

**AP** corresponde a *Average Precision*, calculada com `average_precision_score`. Não deve ser interpretada como uma garantia de desempenho futuro.

---

## 🧮 Simulação da Fila de Triagem

A simulação usa a partição de validação e o limiar 2. A fila é uma hipótese de cenário, não um registro de alertas operacionais.

### Premissas do cenário-base

| Elemento | Premissa |
|---|---|
| Equipe | 5 analistas simulados |
| Unidade temporal | 1 `step` mapeado para 60 minutos |
| Chegadas | Distribuídas uniformemente dentro de cada `step` |
| Prioridade | Score 3 = P1; score 2 = P2 |
| Tempo de análise | Distribuição triangular hipotética por prioridade |
| SLA hipotético | 15 minutos para P1 e 30 minutos para P2 |
| Reprodutibilidade | Semente fixa 2026 |

A base não contém horários intrastep, analistas, decisões ou tempos de atendimento. A distribuição de chegadas e os parâmetros de triagem são, portanto, hipóteses editáveis.

### Resultados do cenário-base

- **3.718 alertas** foram iniciados até o fim do horizonte;
- **3.717 alertas** foram concluídos; um permanecia em análise;
- Espera média estimada: **260,89 minutos**;
- Espera mediana estimada: **257,69 minutos**;
- Espera P90 estimada: **516,21 minutos**;
- Alertas iniciados dentro do SLA hipotético: **20,41%**;
- Utilização estimada: **89,29%**.

### Sensibilidade à quantidade de analistas

| Analistas simulados | Triados até o fim | Concluídos | Ainda na fila | Espera média | Espera P90 | Início dentro do SLA | Utilização estimada |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 1.608 | 1.606 | 2.110 | 1.982,36 min | 4.330,51 min | 22,01% | 99,90% |
| 5 | 3.718 | 3.717 | 0 | 260,89 min | 516,21 min | 20,41% | 89,29% |
| 10 | 3.718 | 3.717 | 0 | 33,51 min | 107,58 min | 67,99% | 44,65% |

### Como interpretar a simulação

No cenário-base, a espera estimada é elevada e apenas 20,41% dos alertas iniciados começariam dentro do SLA hipotético. Isso indica que **as premissas de capacidade do cenário não atendem bem à meta escolhida**.

Zero alertas ainda na fila ao fim do horizonte **não significa que todos começaram dentro do SLA**. Casos iniciados depois do prazo podem ter sido concluídos antes do fim da simulação e ainda assim contar como atrasados.

Os resultados não representam tempos, níveis de serviço ou capacidade observados em uma empresa. Também não constituem recomendação de contratação ou dimensionamento de equipe.

Precisão e recall da fila são calculados separadamente, em comparação retrospectiva com os rótulos sintéticos PaySim. Não são KPIs de uma operação simulada.

---

## 📈 KPIs e Disponibilidade de Dados

| Indicador | O que representa | Disponibilidade neste estudo |
|---|---|---|
| Precisão | Proporção dos alertas que correspondem a fraude rotulada | Calculada retrospectivamente no PaySim |
| Recall | Proporção das fraudes rotuladas capturadas pelos alertas | Calculado retrospectivamente no PaySim |
| Falsos positivos e negativos | Divergências entre alerta e rótulo | Calculadas retrospectivamente no PaySim |
| Volume e taxa de alertas | Quantidade e proporção de transações sinalizadas | Calculados no backtest |
| AP | Métrica de ordenação/recuperação baseada nos scores | Calculada no backtest |
| Espera e fila pendente | Estimativas condicionadas às premissas da simulação | Simuladas, não observadas |
| Aderência ao SLA | Percentual que começa dentro da meta assumida | Simulada, não observada |
| Tempo real até triagem | Tempo entre criação e início da análise | Não disponível na base |
| Perdas financeiras ou evitadas | Impacto financeiro de uma fraude ou alerta | Não calculável com os dados disponíveis |

Para calcular KPIs operacionais reais, seriam necessários logs autorizados com horário de criação, início da análise, decisão, encaminhamento, encerramento, prioridade, equipe ou turno e estado do alerta em cada momento de acompanhamento.

---

## 🧭 Método e Salvaguardas

- O baseline soma até três sinais, gerando score de 0 a 3.
- O percentil 95 do valor por tipo é calculado somente no treino.
- `isFraud` é o rótulo e não entra nas regras de risco.
- `isFlaggedFraud` é excluída por ser uma sinalização preexistente.
- `newbalanceOrig` e `newbalanceDest` são excluídas por serem saldos posteriores à transação.
- A regressão logística usa variáveis explicitamente selecionadas e exclui identificadores.
- `step` é um índice temporal sintético, sem interpretação como dia ou mês.
- A EDA examinou os rótulos de todos os períodos; por isso, o teste é exploratório, não cego nem independente.
- Nenhum resultado deve ser apresentado como desempenho em produção ou impacto financeiro real.

Para uma avaliação confirmatória, seria necessário reservar uma janela futura ainda não examinada e congelar previamente as variáveis, o método, o limiar e as métricas.

---

## 🗣️ Conclusão

O baseline de regras oferece uma forma simples e explicável de priorizar transações dentro deste estudo sintético. O limiar 2 foi usado como referência para organizar a análise; seus resultados mostram alta cobertura das fraudes rotuladas nas partições observadas, mas também um volume relevante de alertas que não correspondem a fraude rotulada.

A comparação com a regressão logística e a simulação de fila acrescentam contexto sobre os trade-offs entre cobertura, volume de alertas e capacidade hipotética de atendimento. Ainda assim, os achados são exploratórios e dependem da base PaySim e das premissas definidas.

**Conclusão permitida:** comparar regras, métricas retrospectivas e cenários hipotéticos de capacidade nesta base sintética.

**Conclusão não permitida:** afirmar eficácia em operações reais, perdas evitadas, tempos de atendimento reais, cumprimento de SLA ou superioridade universal de um limiar ou modelo.

---

## 🚀 Próximos Passos Metodológicos

1. Manter o limiar 2 como referência documentada, sem apresentá-lo como política aprovada.
2. Preservar os limiares 1 e 3 como análises de sensibilidade.
3. Ampliar a análise de sensibilidade das premissas de equipe, chegadas e tempos de serviço.
4. Para uma avaliação preditiva confirmatória, reservar um período futuro não examinado.
5. Só substituir indicadores simulados por KPIs reais quando houver logs operacionais autorizados e documentados.

---

## 📚 Fonte

PaySim — *Synthetic Financial Datasets for Fraud Detection*, disponibilizado no [Kaggle](https://www.kaggle.com/datasets/ealaxi/paysim1).

A base original não está incluída no projeto. Antes de redistribuir dados ou resultados derivados, consulte os termos de uso vigentes na fonte.

---

**Projeto autoral de portfólio · estudo de caso simulado · dados sintéticos PaySim**