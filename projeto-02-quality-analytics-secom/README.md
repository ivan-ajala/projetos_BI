# UCI SECOM Manufacturing Quality Analytics

Projeto de análise e modelagem preditiva aplicado ao dataset SECOM da UCI, com foco em detecção de falhas de qualidade em processo industrial.

O objetivo é identificar padrões em sensores de processo que ajudem a prever a classe **FAIL** e, ao mesmo tempo, gerar uma leitura interpretável para apoiar monitoramento operacional e decisões de qualidade.

---

## Visão geral

O projeto segue um pipeline em etapas:

1. **01_explore**  
   Inspeção inicial da base bruta, entendimento da estrutura, tipos de variáveis e distribuição de classes.

2. **02_transform**  
   Tratamento da base: remoção de colunas/sensores com excesso de missing, imputação de valores ausentes e geração da base limpa.

3. **03_analysis**  
   Análise exploratória da base limpa, com foco em:
   - distribuição PASS vs FAIL;
   - estatísticas descritivas dos sensores;
   - correlação entre sensores e classe alvo;
   - identificação de sensores críticos.

4. **04_model**  
   Seleção de variáveis e treinamento de modelo preditivo para detectar FAIL, com avaliação por métricas adequadas ao desbalanceamento.

---

## Problema de negócio

Em processos industriais estáveis, a maioria das unidades é aprovada e uma pequena parcela falha. Esse comportamento aparece claramente no SECOM:

- cerca de **93% PASS**
- cerca de **7% FAIL**

Isso cria um cenário clássico de desbalanceamento de classes. Nesse contexto:

- **acurácia sozinha engana**;
- o modelo precisa ser avaliado principalmente por:
  - **Recall de FAIL**
  - **Precision de FAIL**
  - **F1-score**
  - **ROC-AUC**
  - **Precision-Recall**

O foco do projeto é detectar falhas reais com o maior aproveitamento possível, mesmo que isso gere alguns falsos positivos.

---

## Base de dados

A base utilizada é uma versão tratada do dataset SECOM, com:

- variáveis de controle:
  - `Unit_ID`
  - `Label`
  - `Timestamp`
  - `Result`
- variáveis de processo:
  - centenas de sensores `Sensor_*`

No pipeline final:

- sensores com excesso de missing são removidos;
- valores ausentes remanescentes são imputados;
- a base limpa é salva em `data/processed/secom_clean.csv`.

---

## Estrutura analítica

### 03_analysis

A análise exploratória confirmou dois grupos importantes de sensores em relação à classe FAIL:

#### Grupo com correlação positiva com FAIL
Valores altos nesses sensores estão associados a maior risco de falha.

Principais exemplos:
- `Sensor_060`
- `Sensor_104`
- `Sensor_511`
- `Sensor_349`
- `Sensor_432`
- `Sensor_435`
- `Sensor_431`
- `Sensor_022`
- `Sensor_436`
- `Sensor_437`

#### Grupo com correlação negativa com FAIL
Valores baixos nesses sensores estão associados a maior risco de falha.

Principais exemplos:
- `Sensor_029`
- `Sensor_317`
- `Sensor_126`
- `Sensor_027`
- `Sensor_181`
- `Sensor_123`
- `Sensor_453`
- `Sensor_128`
- `Sensor_023`
- `Sensor_015`

Essa leitura é importante porque muda a forma de interpretar o processo:

- em alguns sensores, o alerta está na **alta leitura**;
- em outros, o alerta está na **queda da leitura**.

---

## Modelagem

### 04_model

A etapa de modelagem segue três ideias centrais:

1. **seleção de variáveis** com ANOVA F-score (`SelectKBest + f_classif`);
2. **treinamento de Random Forest** como baseline forte e interpretável;
3. **análise do trade-off** entre recall e precision por threshold.

### Estratégia de modelagem

Foi utilizado:

- `RandomForestClassifier`
- `class_weight={0: 1, 1: 5}`
- `n_estimators=200`
- `StratifiedKFold` com 10 folds
- split estratificado 80/20 para avaliação detalhada

### Por que Random Forest?

A escolha foi feita porque o método:

- lida bem com muitas variáveis;
- captura relações não lineares;
- tolera colinearidade entre sensores;
- produz feature importance;
- funciona bem como baseline robusto.

---

## Seleção de features

Como há muitos sensores, a seleção de variáveis é necessária para reduzir ruído e custo computacional.

Foi usado:

- **ANOVA F-score**
- seleção dos **top 40 sensores**

O F-score mede a capacidade estatística de um sensor separar PASS de FAIL, sem depender da direção do efeito. Por isso, sensores positivos e negativos podem aparecer entre os mais relevantes.

---

## Resultados principais

### Validação cruzada

O modelo apresentou, em média:

- **ROC-AUC ~ 0,75**
- **Recall de FAIL baixo no threshold padrão**
- sinal de aprendizado real, mas com corte padrão conservador demais para a classe minoritária

### Threshold de decisão

A análise de thresholds mostrou que:

- `0,50` tende a resultar em recall muito baixo ou zero para FAIL;
- ao reduzir o threshold, o modelo passa a capturar mais falhas;
- o custo é o aumento de falsos positivos, o que é aceitável em contexto industrial quando a falha real é mais cara do que a inspeção adicional.

Isso reforça que:

> o problema não é ausência de sinal, mas o ponto de corte usado para classificar FAIL.

---

## Feature importance

O ranking de feature importance do Random Forest complementou a EDA:

- sensores do grupo positivo aparecem como sinais de risco quando sobem;
- sensores do grupo negativo aparecem como sinais de risco quando caem;
- a consistência entre correlação, F-score e feature importance reforça a robustez dos sensores críticos identificados.

Isso é útil para:

- priorizar sensores no dashboard;
- orientar monitoramento de processo;
- apoiar ações preventivas de qualidade.

---

## Outputs gerados

Os principais artefatos gerados pelo projeto são salvos em:

- `data/processed/eda_outputs/`
- `data/processed/model_outputs/`

### Exemplos de arquivos produzidos

#### EDA
- `pass_fail_distribution.png`
- `sensor_desc_sorted_by_std.csv`
- `feature_fscore_top20.png`
- `boxplots_top3_negative_sensors.png`
- `boxplots_top3_positive_sensors.png`
- `heatmap_top_sensors.png`

#### Modelagem
- `feature_fscore_ranking.csv`
- `feature_importance_rf.csv`
- `feature_fscore_top20.png`
- `feature_importance_top20.png`
- `confusion_matrix.png`
- `roc_curve.png`
- `precision_recall_curve.png`
- `threshold_tradeoff.png`
- `model_metrics_summary.csv`

---

## Como executar

### Pré-requisitos

- Python 3.10+
- bibliotecas principais:
  - `pandas`
  - `numpy`
  - `matplotlib`
  - `seaborn`
  - `scikit-learn`

### Execução dos notebooks

1. Rode `01_explore.ipynb`
2. Rode `02_transform.ipynb`
3. Rode `03_analysis.ipynb`
4. Rode `04_model.ipynb`

### Execução dos scripts

Se estiver usando os arquivos `.py` equivalentes:

```bash
python src/01_explore.py
python src/02_transform.py
python src/03_analysis.py
python src/04_model.py
```

---

## Principais conclusões

- O SECOM é um problema de classificação fortemente desbalanceado.
- Há sinais reais de falha nos sensores de processo.
- A EDA identificou dois grupos de sensores críticos:
  - um com efeito positivo sobre FAIL;
  - outro com efeito negativo.
- O modelo Random Forest conseguiu capturar sinal útil, com ROC-AUC em torno de 0,75.
- O threshold padrão não é o mais adequado; thresholds menores melhoram o recall de FAIL.
- A combinação de correlação, F-score e feature importance ajuda a explicar o processo de forma mais confiável.

---

## Próximos passos

Possíveis extensões do projeto:

- tuning de hiperparâmetros;
- teste de outros algoritmos;
- SMOTE ou undersampling;
- busca formal do threshold ótimo;
- análise detalhada de erros;
- construção do dashboard final para monitoramento dos sensores críticos.

---

## Observação final

Este projeto foi estruturado para combinar:

- análise exploratória;
- interpretação de processo;
- modelagem preditiva;
- entregáveis reutilizáveis para um dashboard operacional.

A ideia não é apenas prever falhas, mas apoiar a compreensão do processo industrial e a tomada de decisão.