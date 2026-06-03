# Manufacturing Quality Analytics – SPC & Failure Prediction

Dashboard analítico e pipeline de dados desenvolvido em **Python + Tableau**,
aplicado ao dataset público **UCI SECOM** (indústria de semicondutores).

O projeto simula um ambiente real de **Quality Management & Data Analytics**:
monitoramento estatístico de processo (SPC), análise de causa raiz orientada
a dados e predição de falhas de linha de produção.

---

## 🎯 Objetivo do Projeto

- Estruturar e tratar dados reais de sensores industriais (591 variáveis, 1.567 amostras).
- Identificar **quais variáveis de processo estão mais associadas a falhas (FAIL)**.
- Construir um **painel de qualidade** com KPIs de processo, SPC e diagnóstico de causa raiz.
- Aplicar **modelo preditivo simples** para ranquear sensores críticos e suportar ações preventivas.
- Demonstrar, de forma prática, a abordagem **Data-Driven Quality Management**.

---

## 🏭 Contexto de Negócio

O dataset SECOM foi gerado em uma linha de produção de semicondutores.
Cada linha representa uma unidade produzida, com leituras de 591 sensores
e um resultado de inspeção final: **PASS (1) ou FAIL (-1)**.

O desafio real de qualidade é:
- O processo produz **muito mais PASS do que FAIL** (dado desbalanceado),
  exigindo atenção especial na análise.
- Existem **dados faltantes** (NaN) em vários sensores, como ocorre em ambientes
  industriais reais.
- Identificar **quais os 10–20 sensores mais críticos** (entre 591) permite
  focar esforços de manutenção, calibração e controle de processo.

---

## 🧱 Estrutura do Projeto

### 1. ETL – Extração e Transformação dos Dados (`/src`)

Pipeline desenvolvido em Python:

| Script | Descrição |
|--------|-----------|
| `01_extract.py` | Carrega `secom.data` e `secom_labels.data`, une em um único DataFrame |
| `02_transform.py` | Trata missing values, remove features com >50% NaN, normaliza variáveis |
| `03_analysis.py` | Estatísticas descritivas, correlações, análise PASS vs FAIL por sensor |
| `04_model.py` | Feature selection (ANOVA/correlação) + modelo preditivo (Random Forest) |

**Output:** `data/processed/secom_clean.csv` – base tratada, pronta para o dashboard.

---

### 2. Análise Estatística de Processo

- **Estatísticas descritivas** por sensor (média, desvio padrão, min, max).
- **Comparação de distribuição PASS vs FAIL** para os sensores mais relevantes.
- **Correlação** entre sensores e o label de qualidade.
- **Identificação de outliers** e leituras fora de especificação.
- **Pseudo-control charts (SPC):** para os top 5 sensores críticos,
  visualização de leituras com linhas de controle (UCL/LCL = média ± 3σ).

---

### 3. Feature Selection & Modelo Preditivo

O foco **não** é construir um modelo de produção, mas usar o modelo como
ferramenta analítica para:

- Ranquear os sensores mais associados a FAIL (feature importance).
- Validar os achados da análise estatística.
- Simular: "se controlarmos os top 10 sensores críticos, qual seria o impacto esperado no yield?"

**Técnicas utilizadas:**
- ANOVA F-score para seleção de features
- Random Forest Classifier (com cross-validation)
- Métricas: Precision, Recall, F1-Score, ROC-AUC (com foco em recall de FAIL)

---

### 4. Dashboard de Qualidade (`/dashboard`)

Painel construído em **Tableau**, organizado em 4 abas:

#### Aba 1 – Overview de Qualidade
- **KPIs principais:**
  - Total de unidades produzidas
  - % PASS vs % FAIL (Yield)
  - Total de falhas no período
  - Média de sensores críticos fora de especificação
- Tendência de FAIL ao longo do tempo (série temporal)
- Distribuição PASS/FAIL por período

#### Aba 2 – Sensores Críticos
- Ranking dos **Top 10 Sensores mais associados a FAIL**
- Boxplot / distribuição comparando leitura: PASS vs FAIL
- Tabela: Sensor | Média PASS | Média FAIL | Diferença | Risk Score

#### Aba 3 – SPC (Controle Estatístico de Processo)
- Pseudo-control chart para top 5 sensores:
  - Linha de média do processo
  - UCL (Upper Control Limit = média + 3σ)
  - LCL (Lower Control Limit = média - 3σ)
  - Pontos destacados fora de controle
- Classificação de estabilidade por sensor: Estável / Atenção / Crítico

#### Aba 4 – Root Cause & Diagnóstico
- Matriz de correlação simplificada (top sensores vs FAIL)
- Análise de co-ocorrência: quando sensor A falha, sensor B também falha?
- Recomendações de ação (texto estruturado como relatório executivo)

---

## 🔢 Principais Técnicas e Cálculos

```python
# Tratamento de Missing Values
threshold = 0.50  # Remove features com mais de 50% de NaN
df = df.dropna(thresh=int((1 - threshold) * len(df)), axis=1)

# Imputação pelo valor mediano (para features restantes)
df = df.fillna(df.median())

# Limites de Controle (SPC)
UCL = mean + 3 * std
LCL = mean - 3 * std

# Feature Importance via ANOVA F-score
from sklearn.feature_selection import f_classif
f_scores, p_values = f_classif(X, y)

# Modelo preditivo
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold
model = RandomForestClassifier(n_estimators=100, class_weight='balanced')
```

---

## 📌 Principais Insights de Negócio

1. **Yield e concentração de falhas no tempo**
   O dataset apresenta taxa de FAIL em torno de **6–7%**, típica de processos
   industriais de alta complexidade. A análise temporal revela **clusters de falha**,
   indicando que problemas de processo tendem a se manifestar em rajadas,
   e não de forma aleatória – o que reforça a necessidade de monitoramento contínuo (SPC).

2. **591 sensores, mas poucos realmente importam**
   Após feature selection, os **top 20 sensores** respondem pela maior parte
   do poder de discriminação entre PASS e FAIL. Isso é consistente com o
   princípio de Pareto em qualidade: uma minoria de variáveis de processo
   concentra a maior parte das causas de falha.

3. **Dados faltantes como sinal de alerta**
   Sensores com alta taxa de NaN muitas vezes coincidem com leituras de
   equipamentos problemáticos ou mal calibrados. O próprio padrão de ausência
   de dados pode ser um indicador precoce de anomalia no processo.

4. **SPC revela instabilidade antes do FAIL**
   A visualização dos control charts para os sensores críticos mostra que,
   em vários casos, as leituras começam a sair dos limites UCL/LCL **antes**
   da unidade ser reprovada no teste final – o que valida a lógica de SPC
   como ferramenta de **ação preventiva**, e não apenas reativa.

5. **Dados desbalanceados refletem o mundo real**
   A proporção ~93% PASS / ~7% FAIL exige atenção na modelagem (uso de
   `class_weight='balanced'`, métricas de Recall e F1) e também na
   interpretação dos dashboards: um processo com 93% de yield pode
   esconder padrões críticos se analisado apenas pela média.

---

## 🧠 Perspectiva Comportamental / Organizacional

Além dos dados técnicos, o projeto ilustra padrões organizacionais comuns
em ambientes de qualidade industrial:

- **Excesso de dados, déficit de informação:** 591 sensores geram volume massivo
  de dados, mas sem priorização (feature selection, SPC), a equipe de qualidade
  não sabe onde focar. O dashboard resolve exatamente esse gap.

- **Reatividade vs. proatividade:** A maioria das ações de qualidade ocorre
  após o FAIL (reativa). O SPC com alertas de UCL/LCL permite intervenção
  antes da falha – mudança de postura que impacta diretamente o yield.

- **Viés de confirmação em Root Cause:** Equipes tendem a investigar
  as causas que já conhecem. A análise de feature importance desafia esse
  viés ao revelar sensores relevantes que muitas vezes não estão no radar
  da inspeção tradicional.

---

## 🛠️ Ferramentas Utilizadas

| Ferramenta | Uso |
|-----------|-----|
| Python (Pandas, NumPy) | ETL, tratamento de dados, análise estatística |
| Scikit-learn | Feature selection, modelo preditivo |
| Matplotlib / Seaborn | Gráficos exploratórios e SPC |
| Tableau | Dashboard de qualidade |
| SQL | Consultas analíticas sobre a base tratada |
| Git / GitHub | Versionamento e portfólio |

---

## 📷 Preview

![Overview de Qualidade](./images/screen_01_overview.png)
![Sensores Críticos](./images/screen_02_sensors.png)
![SPC – Controle Estatístico](./images/screen_03_spc.png)
![Root Cause & Diagnóstico](./images/screen_04_rootcause.png)

---

## 📂 Como Reproduzir

1. Clone o repositório:
```bash
git clone https://github.com/ivan-ajala/projetos_BI.git
cd projetos_BI/projeto-02-quality-analytics-secom
```

2. Instale as dependências:
```bash
pip install pandas numpy scikit-learn matplotlib seaborn
```

3. Baixe o dataset:
   - Acesse: https://archive.ics.uci.edu/ml/datasets/SECOM
   - Salve `secom.data` e `secom_labels.data` em `/data/raw/`

4. Execute o pipeline:
```bash
python src/01_extract.py
python src/02_transform.py
python src/03_analysis.py
python src/04_model.py
```

5. Abra o dashboard no Tableau:
   - Arquivo: `/dashboard/quality_dashboard.twbx`
   - Certifique-se de que a fonte de dados aponta para `data/processed/secom_clean.csv`

---

## 🔗 Dashboard Interativo

*(Link será adicionado após publicação no Tableau Public)*

---

## 🧾 Material para Portfólio

Este projeto pode ser apresentado tanto como **projeto de BI/Analytics** quanto como **projeto de Data Science**.  
Preparei dois resumos específicos:

- Portfólio de BI / Analytics: `./docs/portfolio_bi.md`
- Portfólio de Data Science: `./docs/portfolio_ds.md`

Cada arquivo traz um resumo pronto para CV/LinkedIn e pontos-chave para entrevistas.

---

## 💬 Sobre o Autor

Projeto desenvolvido por **Ivan Ajala** como parte de portfólio em
**Business Intelligence & Data Analytics**, com base em experiência real
em **Quality Management & Process Analytics**.

- Modelagem de métricas de qualidade (SPC, Yield, KPIs de processo)
- ETL e tratamento de dados industriais
- Análise estatística aplicada à melhoria de processos
- Storytelling com dados para audiências executivas e técnicas