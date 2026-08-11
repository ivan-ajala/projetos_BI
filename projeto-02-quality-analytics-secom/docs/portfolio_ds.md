# Projeto – Manufacturing Quality Analytics (Data Science)

## Visão Geral

Projeto de **Data Science aplicado à manufatura**, com foco em:

- Tratamento de dados de sensores industriais
- Análise exploratória e seleção de features
- Modelo preditivo simples para detecção de falhas (classe minoritária)
- Interpretação de resultados para apoio à decisão em qualidade

Dataset utilizado: **SECOM (UCI Machine Learning Repository)** – medições de sensores
em uma linha de fabricação de semicondutores, com rótulo de qualidade final
(PASS ou FAIL).

---

## Contexto do Dataset e Correção de Labels

- Cada linha representa uma unidade produzida:
  - 591 atributos (sensores de processo)
  - 1 rótulo de qualidade (coluna `Label`)
- A documentação oficial define:
  - `Label = -1` → PASS
  - `Label =  1` → FAIL

No projeto:

- Corrigi explicitamente o mapeamento para:
  - `Result`: `PASS` / `FAIL`
  - `Target_FAIL`: binário (`1` = FAIL, `0` = PASS)

Distribuição:

- Aproximadamente **93% PASS / 7% FAIL**
- FAIL é a **classe minoritária**, o que:
  - reflete um processo industrial estável
  - exige cuidado com métricas e com a interpretação dos modelos

---

## Pipeline de Data Science

### 1. Extração e Pré-processamento

Etapas principais:

1. Leitura dos dados brutos:
   - `secom.data` (sensores)
   - `secom_labels.data` (labels e timestamps)
2. Criação de `Unit_ID`
3. Conversão do rótulo original:
   - `Label = -1` → `Result = PASS`
   - `Label =  1` → `Result = FAIL`
4. Criação de `Target_FAIL` (1 = FAIL, 0 = PASS)

Resultado intermediário:

- `data/processed/secom_raw_combined.csv`

### 2. Tratamento de Missing Values e Seleção Inicial de Features

- Análise de missing por sensor:
  - muitos sensores com algum grau de NaN
  - alguns com >50% de valores faltantes
- Estratégia adotada:
  - Remover sensores com **>50% de NaN**
  - Imputar NaNs remanescentes pela **mediana** de cada coluna
- Justificativa:
  - Remove variáveis pouco confiáveis (muitos NaNs)
  - Mantém o máximo possível de sinal nos sensores restantes

Resultado:

- Base final (`secom_clean.csv`):
  - 1.567 linhas
  - 566 colunas (562 sensores + 4 colunas de controle)
  - Sem valores faltantes nos sensores

---

## Análise Exploratório (EDA)

### Distribuição da Variável Alvo

- `Result`:
  - ~93% PASS
  - ~7% FAIL
- `Target_FAIL`:
  - ~7% com valor 1
- Problema configurado como:
  - classificação binária com classe minoritária (FAIL)
  - foco em **detecção de falhas** e não apenas em acurácia global

### Estatísticas dos Sensores

- `describe()` aplicado aos sensores:
  - análise de média, desvio-padrão, amplitude
- Seleção de sensores com:
  - baixa variabilidade (potencialmente pouco informativos)
  - alta variabilidade (candidatos a variáveis relevantes)

### Correlação com FAIL

- Cálculo de correlação de Pearson entre sensores e `Target_FAIL`
- Identificação dos sensores mais correlacionados com falha:
  - ex.: **Sensor_029, Sensor_317, Sensor_126**, entre outros

Observações:

- Sensores com correlação positiva com `Target_FAIL` tendem a ter
  valores mais altos em unidades FAIL
- Boxplots PASS vs FAIL mostraram:
  - distribuições deslocadas em FAIL
  - maior concentração de outliers em casos FAIL

Insight central:

> Esses sensores funcionam como **indicadores de risco**:  
> quando suas leituras fogem do padrão típico das unidades PASS,
> a probabilidade de FAIL aumenta.

---

## Seleção de Features e Modelo Preditivo

O foco principal do modelo não foi bater recordes de benchmark, mas:

- Ranqueamento de sensores importantes
- Apoio à interpretação de quais variáveis do processo mais influenciam o risco de falha

### Seleção de Features

- **ANOVA F-score (f_classif)**:
  - usada para ranquear sensores em termos de capacidade de separar PASS e FAIL
  - seleção dos top N sensores para entrada no modelo
- Avaliação da consistência:
  - comparação entre ranking por F-score e ranking por correlação com `Target_FAIL`
  - alinhamento com insights da EDA

### Modelo Preditivo

- **Random Forest Classifier**, com:
  - `class_weight='balanced'` para tratar desbalanceamento
  - validação cruzada estratificada (ex.: StratifiedKFold)
- Métricas monitoradas:
  - Recall de FAIL (classe minoritária)
  - F1-score
  - ROC-AUC
  - Matriz de confusão estratificada por classe

Interpretação:

- Mesmo um modelo simples já permite:
  - identificar sensores com alta importância (feature importance)
  - avaliar trade-off entre detectar FAIL e gerar falsos positivos
- Resultados conectados com o negócio:
  - melhor entender quais sensores priorizar no monitoramento contínuo
  - apoiar decisões de manutenção, calibração e ajustes de processo

---

## Principais Lições Técnicas

1. **Importância de validar o mapeamento de labels**  
   - Label invertido (1 = PASS, -1 = FAIL) muda drasticamente a leitura de negócio
   - Correção revelou o cenário real: PASS majoritário, FAIL minoritário

2. **Desbalanceamento não é só um detalhe**  
   - Em ~93% PASS / 7% FAIL, acurácia sozinha é enganosa
   - Métricas como recall de FAIL, ROC-AUC e F1 são mais adequadas

3. **EDA guiando seleção de features**  
   - Correlação, boxplots e distribuição por classe ajudam a entender
     antes de plugar o dataset “bruto” em qualquer modelo

4. **Feature importance como alavanca de storytelling**  
   - Ranking de sensores mais importantes no modelo ajuda a explicar
     quais partes do processo são mais críticas em linguagem de negócio

---

## Ferramentas e Tecnologias

- **Python (Pandas, NumPy)** – ETL, limpeza, EDA
- **Scikit-learn** – seleção de features, Random Forest, validação cruzada
- **Matplotlib / Seaborn** – visualização exploratória
- **Tableau** – visualização de resultados e storytelling

---

## Como Apresento Este Projeto em Entrevistas (DS)

- Começo explicando o contexto:
  - dataset SECOM, linha de semicondutores, PASS (~93%) e FAIL (~7%)
- Destaco a importância da correção de labels e da leitura de desbalanceamento
- Mostro a pipeline:
  - tratamento de missing
  - análise de correlação
  - seleção de features
  - modelo simples com foco em recall de FAIL
- Enfatizo:
  - sensores críticos como indicadores de risco
  - conexão entre métricas técnicas e decisões de qualidade
  - potencial de evolução para modelos mais robustos (ex.: calibrar threshold de decisão,
    testar outros algoritmos, aplicar técnicas de oversampling, etc.)