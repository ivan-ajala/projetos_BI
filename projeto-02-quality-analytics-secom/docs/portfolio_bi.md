# Projeto – Manufacturing Quality Analytics (BI & Analytics)

## Visão Geral

Projeto de **Business Intelligence & Data Analytics** aplicado a um processo realista
de manufatura de semicondutores, usando o **SECOM dataset (UCI)**.

Combinei **Python** (para ETL, limpeza e análise) com **Tableau** (para visualização),
construindo um pipeline de dados e um dashboard de qualidade voltados para:

- Monitoramento estatístico de processo (SPC)
- Acompanhamento de KPIs de qualidade (PASS / FAIL)
- Identificação de sensores críticos e possíveis causas de falha

---

## Contexto de Negócio

- Cada linha do dataset representa uma unidade produzida, com:
  - Medições de **591 sensores** de processo
  - Um rótulo de qualidade final (`Label`), indicando **PASS ou FAIL**
- Pelos rótulos originais:
  - `Label = -1` → PASS (unidade aprovada)
  - `Label =  1` → FAIL (unidade reprovada)

Após o mapeamento correto:

- A variável categórica `Result` assume os valores `PASS` / `FAIL`
- A variável `Target_FAIL` (binária) assume:
  - `1` = FAIL
  - `0` = PASS

Distribuição:

- Aproximadamente **93% PASS / 7% FAIL**
- FAIL é a **classe minoritária**, típico de processos industriais estáveis:
  - a maior parte da produção é aprovada
  - o foco analítico está em entender e prevenir as poucas falhas

---

## Objetivos do Projeto (Perspectiva BI/Analytics)

- Estruturar e tratar dados de sensores industriais (mais de 590 variáveis)
- Construir um **pipeline de dados reprodutível** (Python) para alimentar o dashboard
- Criar um **painel de qualidade em Tableau** com:
  - KPIs de yield (PASS vs FAIL)
  - SPC (pseudo control charts)
  - Ranking de sensores críticos
  - Visão de causa raiz (correlações e co-ocorrências)
- Entregar uma storytelling clara, conectando dados técnicos com decisões de negócio

---

## Pipeline de Dados

### 1. Extração e Consolidação

- Leitura dos arquivos brutos:
  - `secom.data` (sensores)
  - `secom_labels.data` (rótulos e timestamps)
- Criação de um identificador único `Unit_ID`
- Mapeamento do rótulo original:
  - `Label = -1` → `Result = PASS`
  - `Label =  1` → `Result = FAIL`
- Geração do dataset combinado:
  - `data/processed/secom_raw_combined.csv`

### 2. Limpeza e Transformação

- Análise de missing values por sensor
- Regra de negócio:
  - Sensores com **>50% de NaN** → removidos
  - Sensores com missing parcial → imputação pela **mediana**
- Resultado:
  - 1.567 unidades
  - 566 colunas:
    - 562 sensores
    - 4 colunas de controle (`Unit_ID`, `Label`, `Timestamp`, `Result`)
  - Nenhum valor faltante nos sensores
- Geração da base final:
  - `data/processed/secom_clean.csv`

### 3. Análise Exploratória (EDA) para BI

- Distribuição de `Result`:
  - ~93% PASS
  - ~7% FAIL
- Estatísticas descritivas dos sensores:
  - média, desvio-padrão, min, max
- Correlação dos sensores com `Target_FAIL`:
  - identificação dos sensores mais associados a falhas
- Gráficos de apoio ao dashboard:
  - boxplots PASS vs FAIL
  - heatmaps de correlação
  - séries temporais por sensor e por resultado

---

## Dashboard em Tableau

O dashboard foi organizado em quatro abas principais:

### 1. Overview de Qualidade

- KPIs principais:
  - Total de unidades produzidas
  - % PASS vs % FAIL (Yield)
  - Número total de FAIL em determinado período
- Série temporal de FAIL ao longo do tempo
- Visão agregada por período (ex.: dia, semana, mês)

### 2. Sensores Críticos

- **Ranking dos Top Sensores mais relacionados a FAIL**,
  com base em análises de correlação e feature importance.
- Visualizações:
  - Boxplots comparando leitura PASS vs FAIL
  - Tabelas com:
    - Média PASS
    - Média FAIL
    - Diferença
    - “Risk Score” simplificado

Destaque para sensores como **Sensor_029, Sensor_317 e Sensor_126**, que apresentam:
- distribuições deslocadas para valores mais altos nos poucos casos de FAIL
- correlação positiva com `Target_FAIL`
- potencial para uso como indicadores de risco no processo

### 3. SPC (Controle Estatístico de Processo)

- Pseudo control charts para os top sensores:
  - Linha de média do processo
  - Limites de controle:
    - UCL = média + 3σ
    - LCL = média - 3σ
  - Pontos fora de controle destacados
- Narrativa:
  - uso de SPC como ferramenta de **detecção precoce** de instabilidade
  - foco em agir antes que a unidade seja reprovada

### 4. Root Cause & Diagnóstico

- Matriz de correlação simplificada (sensores selecionados vs FAIL)
- Análise de co-ocorrência de sensores críticos
- Seção de “insights executivos”:
  - principais sensores de risco
  - recomendações de foco para manutenção e calibração
  - implicações no yield e na estabilidade do processo

---

## Principais Insights (Perspectiva BI)

1. **Processo com alta taxa de aprovação, mas falhas críticas**  
   - ~93% PASS, ~7% FAIL
   - FAIL é minoria, mas com impacto direto em custo e produtividade

2. **Poucos sensores realmente importam**  
   - Entre 500+ sensores ativos, um subconjunto reduzido concentra boa parte
     da capacidade de separar FAIL de PASS
   - Ex.: Sensor_029, Sensor_317, Sensor_126

3. **Sensores críticos como “leading indicators”**  
   - Leituras fora do padrão nesses sensores aparecem **antes** da reprovação final
   - Podem ser usados como indicadores de risco para alertas antecipados

4. **SPC como ferramenta de proatividade**  
   - Control charts mostram que desvios além de média ± 3σ frequentemente precedem FAIL
   - Proposta de uso: monitorar esses sensores críticos online para agir antes da falha

---

## Ferramentas Utilizadas

- **Python (Pandas, NumPy)** – ETL, limpeza, análise descritiva
- **Matplotlib / Seaborn** – Gráficos de apoio ao dashboard
- **Scikit-learn** – Seleção de features e apoio na definição de sensores críticos
- **Tableau** – Dashboard de qualidade (visualizações interativas)
- **Git / GitHub** – Versionamento e portfólio

---

## Como Apresento Este Projeto em Entrevistas (BI)

- Explico o contexto (manufatura, SECOM, PASS ~93%, FAIL ~7%)
- Mostro o pipeline de dados (Python) que alimenta o dashboard
- Destaco como usei EDA e correlação para priorizar sensores
- Demonstro o dashboard no Tableau, focando em:
  - KPIs de yield
  - ranking de sensores críticos
  - exemplo de control chart
- Fecho com a mensagem:
  - “Este projeto mostra como usar dados de sensores para transformar uma visão reativa
    (olhar apenas o FAIL final) em uma visão proativa (monitorar indicadores de risco
    ao longo do processo).”