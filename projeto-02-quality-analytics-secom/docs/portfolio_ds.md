# Projeto – Manufacturing Quality Analytics (Data Science)

## Visão Geral

Projeto de **Data Science aplicado à manufatura**, com foco na análise de dados de
sensores industriais e na detecção de unidades associadas à ocorrência de falhas.

O projeto utiliza o dataset **SECOM**, disponibilizado pelo UCI Machine Learning
Repository, contendo medições de sensores de um processo de fabricação de
semicondutores e um rótulo final de qualidade.

As principais etapas foram:

- extração e consolidação dos dados;
- tratamento de valores ausentes;
- correção do mapeamento dos rótulos;
- análise exploratória;
- seleção de variáveis;
- treinamento de um modelo Random Forest;
- avaliação com métricas adequadas ao desbalanceamento;
- análise do trade-off entre recall e falsos positivos;
- interpretação das variáveis mais relevantes;
- comunicação dos resultados em um dashboard interativo.

---

## Contexto do Dataset

Cada linha do dataset representa uma unidade produzida e contém:

- medições de sensores de processo;
- rótulo original de qualidade;
- timestamp;
- identificador da unidade;
- resultado final derivado.

O rótulo original foi interpretado da seguinte maneira:

- `Label = -1` → `PASS`;
- `Label = 1` → `FAIL`.

A partir desse mapeamento, foram criadas as variáveis:

- `Result`: classificação categórica com os valores `PASS` e `FAIL`;
- `Target_FAIL`: variável binária, em que `1` representa FAIL e `0` representa
  PASS.

A distribuição observada foi aproximadamente:

- **93% PASS**;
- **7% FAIL**.

Esse desbalanceamento torna inadequada uma avaliação baseada somente em acurácia.
O foco da modelagem foi a capacidade de identificar a classe minoritária FAIL.

---

## Objetivos da Análise

Os objetivos principais foram:

- compreender a estrutura dos dados de sensores;
- identificar problemas de qualidade e valores ausentes;
- avaliar diferenças entre unidades PASS e FAIL;
- selecionar sensores com maior sinal estatístico;
- treinar um modelo inicial de classificação;
- analisar o desempenho na identificação de FAIL;
- avaliar diferentes thresholds de classificação;
- priorizar sensores para investigação posterior;
- comunicar os resultados de maneira interpretável.

O objetivo não foi construir um modelo pronto para produção, mas desenvolver uma
análise reprodutível e interpretável para apoiar decisões de qualidade.

---

## Pipeline de Data Science

### 1. Extração e Consolidação

Os dados foram lidos a partir dos arquivos brutos:

- `secom.data`;
- `secom_labels.data`.

As etapas incluíram:

- leitura das medições dos sensores;
- leitura dos rótulos e timestamps;
- criação de `Unit_ID`;
- associação das observações aos respectivos rótulos;
- correção do mapeamento entre `Label`, `PASS` e `FAIL`;
- criação de `Target_FAIL`;
- exportação da base combinada.

Arquivo intermediário:

```text
data/processed/secom_raw_combined.csv
```

---

### 2. Tratamento de Valores Ausentes

A base original contém valores ausentes em diversos sensores.

A estratégia adotada foi:

- remover sensores com mais de **50% de valores ausentes**;
- imputar os valores ausentes remanescentes pela **mediana** da respectiva
  coluna;
- manter as colunas de controle e identificação;
- gerar uma base limpa para as análises.

A base final contém aproximadamente:

- **1.567 linhas**;
- **566 colunas**;
- **562 sensores**;
- **4 colunas de controle**;
- ausência de valores faltantes nos sensores após o tratamento.

Arquivo principal:

```text
data/processed/secom_clean.csv
```

O tratamento foi escolhido como uma estratégia inicial de preparação dos dados.
Em uma aplicação operacional, seria necessário avaliar também o mecanismo dos
valores ausentes e seu possível significado no processo.

---

## Análise Exploratória

### Distribuição da Variável-Alvo

A variável `Result` apresenta:

- aproximadamente 93% de unidades PASS;
- aproximadamente 7% de unidades FAIL.

A variável `Target_FAIL` transforma o problema em uma classificação binária:

- `0` = PASS;
- `1` = FAIL.

O desbalanceamento foi considerado durante a modelagem e na escolha das métricas.

---

### Estatísticas dos Sensores

Foram calculadas estatísticas descritivas dos sensores, incluindo:

- média;
- desvio-padrão;
- valores mínimo e máximo;
- amplitude;
- distribuição por grupo de resultado.

A análise exploratória também avaliou sensores com diferentes níveis de
variabilidade para identificar variáveis potencialmente informativas ou pouco
discriminativas.

---

### Correlação com `Target_FAIL`

Foi calculada a correlação de Pearson entre os sensores e `Target_FAIL`.

Essa análise permitiu identificar:

- sensores com associação positiva com FAIL;
- sensores com associação negativa com FAIL;
- diferenças de direção entre as variáveis;
- candidatos para investigação posterior.

Entre os sensores com associação negativa aparecem, por exemplo:

```text
Sensor_029
Sensor_317
Sensor_126
```

Outros sensores apresentam associação positiva com `Target_FAIL`.

A direção da correlação deve ser preservada na interpretação. Uma correlação
negativa não significa necessariamente que o sensor seja benéfico, assim como uma
correlação positiva não prova que o sensor cause a falha.

---

### Visualizações Exploratórias

Foram produzidos outputs como:

- distribuição de PASS e FAIL;
- matriz de correlação;
- boxplots comparando PASS e FAIL;
- estatísticas descritivas;
- médias por grupo;
- rankings de correlação;
- rankings de variabilidade.

Os resultados da análise exploratória estão em:

```text
data/processed/eda_outputs/
```

---

## Seleção de Features

A seleção inicial de variáveis utilizou o teste estatístico ANOVA por meio de:

```python
SelectKBest
f_classif
```

O objetivo foi ranquear os sensores segundo sua capacidade estatística de
diferenciar as classes PASS e FAIL.

Foram selecionados os **40 principais sensores** para a etapa de modelagem.

Essa seleção reduz a dimensionalidade e permite:

- concentrar o modelo nas variáveis com maior sinal estatístico;
- reduzir ruído;
- facilitar a interpretação;
- comparar o ranking estatístico com a importância gerada pelo modelo.

A seleção por ANOVA não significa que as variáveis escolhidas sejam causas das
falhas. Ela representa uma forma de priorização estatística.

---

## Modelo Preditivo

Foi utilizado um:

```python
RandomForestClassifier
```

A configuração metodológica incluiu:

- seleção dos 40 principais sensores pelo ANOVA F-score;
- `class_weight={0: 1, 1: 5}`;
- maior peso relativo para a classe FAIL;
- validação cruzada estratificada;
- `StratifiedKFold` com 10 folds;
- avaliação complementar em uma divisão estratificada de treino e teste.

O Random Forest foi escolhido como modelo inicial porque:

- lida bem com muitas variáveis;
- captura relações não lineares;
- é relativamente robusto a diferentes escalas;
- permite calcular feature importance;
- oferece uma referência interpretável para o problema.

O modelo deve ser entendido como uma baseline analítica, e não como uma solução
definitiva para implantação em produção.

---

## Métricas Avaliadas

Devido ao desbalanceamento entre PASS e FAIL, foram analisadas métricas além da
acurácia global:

- **Recall de FAIL**;
- **Precision de FAIL**;
- **F1-score**;
- **ROC-AUC**;
- matriz de confusão;
- curva Precision-Recall;
- relação entre threshold e falsos positivos.

O recall de FAIL é especialmente importante porque mede a capacidade de detectar
unidades que realmente pertencem à classe minoritária.

---

## Resultados do Modelo

O modelo apresentou ROC-AUC médio próximo de:

```text
0,75
```

Esse resultado indica capacidade discriminativa moderada entre unidades PASS e
FAIL. Existe sinal estatístico nos dados, mas o desempenho ainda não deve ser
interpretado como suficiente para uso operacional sem validações adicionais.

No threshold padrão de `0,50`, o recall da classe FAIL permaneceu baixo. Isso
indica que o ponto de corte padrão é conservador para a identificação da classe
minoritária.

A análise de thresholds demonstrou que:

- a redução do threshold pode aumentar o recall de FAIL;
- o aumento do recall tende a produzir mais falsos positivos;
- a escolha do threshold deve considerar o custo de uma falha não detectada;
- uma inspeção adicional pode ser aceitável quando o custo de perder uma falha é
  elevado.

Esse trade-off é uma decisão de negócio e de processo, não apenas uma decisão
estatística.

---

## Interpretação das Variáveis

Foram comparadas diferentes fontes de evidência:

- correlação com `Target_FAIL`;
- ANOVA F-score;
- feature importance do Random Forest.

Quando um sensor aparece com relevância em mais de uma abordagem, ele pode ser
priorizado para investigação. Essa convergência aumenta a utilidade analítica
do ranking, mas não transforma a associação em causalidade.

As variáveis selecionadas devem ser interpretadas como:

- sensores com maior sinal estatístico;
- candidatos a monitoramento;
- variáveis para investigação de processo;
- possíveis indicadores de risco.

A confirmação de causa raiz exige conhecimento especializado, experimentos,
análise do processo e validação em ambiente real.

---

## Análise de Threshold

A análise de threshold foi incluída porque o ponto de corte de 0,50 nem sempre é o
mais adequado para problemas desbalanceados.

Ao alterar o threshold, modifica-se a relação entre:

- verdadeiros positivos;
- falsos positivos;
- falsos negativos;
- recall;
- precision.

Em um contexto de qualidade industrial, o threshold deve ser definido de acordo
com:

- custo de uma unidade FAIL não detectada;
- custo de uma inspeção adicional;
- capacidade operacional de investigação;
- impacto no yield;
- criticidade do processo;
- validação com especialistas.

O threshold analisado neste projeto serve como evidência para essa discussão,
mas não representa uma política operacional definitiva.

---

## Principais Lições Técnicas

### 1. O mapeamento dos rótulos precisa ser validado

Uma inversão entre PASS e FAIL alteraria completamente a interpretação dos
resultados e das métricas.

A confirmação do mapeamento foi uma etapa essencial da análise:

```text
Label = -1 → PASS
Label = 1  → FAIL
```

---

### 2. Acurácia pode ser enganosa em dados desbalanceados

Com aproximadamente 93% de unidades PASS, uma acurácia alta pode esconder um
desempenho ruim na identificação de FAIL.

Por isso, recall, precision, F1-score, ROC-AUC e Precision-Recall são mais
informativos para este problema.

---

### 3. A EDA deve preceder a modelagem

A análise exploratória permitiu compreender:

- a distribuição do alvo;
- os valores ausentes;
- a variabilidade dos sensores;
- a direção das associações;
- as diferenças entre PASS e FAIL.

Essa etapa reduziu o risco de interpretar o modelo sem compreender a estrutura
dos dados.

---

### 4. Feature importance apoia a interpretação

O ranking de importância do Random Forest ajuda a comunicar quais sensores foram
mais utilizados pelo modelo na separação das classes.

Entretanto, feature importance não mede causalidade. O ranking deve ser utilizado
como apoio à priorização e não como prova de que uma variável provoca a falha.

---

### 5. O threshold é parte da decisão analítica

Em problemas de detecção de falhas, o threshold deve ser tratado como uma
decisão relacionada ao risco e ao custo dos erros de classificação.

O modelo fornece probabilidades e sinais analíticos; a política de decisão
depende do contexto operacional.

---

## Dashboard como Camada de Comunicação

Os resultados da análise foram organizados em um dashboard desenvolvido em
**React + Vite**.

O dashboard contém quatro páginas:

1. **Visão Geral**;
2. **Análise de Sensores**;
3. **Diagnóstico do Modelo**;
4. **Dicionário de Dados**.

A aplicação consome os outputs produzidos pelo pipeline analítico e apresenta:

- rankings de sensores;
- métricas estatísticas;
- correlações;
- importâncias do modelo;
- informações de threshold;
- explicações metodológicas.

O dashboard funciona como uma camada de comunicação entre a análise técnica e
os usuários interessados em qualidade, processo e tomada de decisão.

---

## Estrutura Técnica

Os principais scripts estão em:

```text
src/
├── 01_extract.py
├── 02_transform.py
├── 03_analysis.py
└── 04_model.py
```

Também estão disponíveis notebooks exploratórios:

```text
src/
├── 01_extract_explore.ipynb
├── 02_transform_explore.ipynb
├── 03_analysis.ipynb
└── 04_model.ipynb
```

Os outputs da análise ficam em:

```text
data/processed/eda_outputs/
data/processed/model_outputs/
```

---

## Ferramentas e Tecnologias

- **Python**;
- **Pandas**;
- **NumPy**;
- **Scikit-learn**;
- **Matplotlib**;
- **Seaborn**;
- **Jupyter Notebook**;
- **React**;
- **Vite**;
- **Tableau**;
- **Git**.

---

## Limitações

As principais limitações do projeto são:

- o dataset é histórico;
- o modelo não foi validado em um ambiente produtivo;
- a ROC-AUC próxima de 0,75 representa desempenho moderado;
- o recall da classe FAIL no threshold padrão foi baixo;
- os sensores foram analisados como variáveis associadas, não como causas
  comprovadas;
- a seleção de features pode variar conforme a amostra e a metodologia;
- o threshold ainda precisa ser calibrado para uma finalidade operacional;
- não foi realizada uma validação formal de estabilidade temporal;
- o dashboard não deve ser utilizado como único critério de aprovação ou
  reprovação de unidades.

---

## Próximos Passos

Possíveis extensões da análise:

- calibrar formalmente o threshold;
- avaliar curvas Precision-Recall em maior profundidade;
- testar outros modelos de classificação;
- realizar ajuste de hiperparâmetros;
- avaliar técnicas de balanceamento;
- comparar diferentes estratégias de imputação;
- avaliar estabilidade temporal do modelo;
- investigar drift dos sensores;
- validar os sensores com especialistas de processo;
- implementar monitoramento operacional;
- desenvolver gráficos de controle estatístico;
- avaliar modelos explicáveis e técnicas de interpretabilidade;
- integrar os resultados a uma plataforma corporativa de BI.

---

## Como Apresentar Este Projeto em Entrevistas

A apresentação pode seguir esta estrutura:

1. Apresentar o contexto industrial e o dataset SECOM;
2. Explicar a distribuição de aproximadamente 93% PASS e 7% FAIL;
3. Destacar a validação do mapeamento dos rótulos;
4. Explicar o tratamento de valores ausentes;
5. Mostrar como a EDA orientou a seleção de sensores;
6. Apresentar a seleção dos 40 principais sensores;
7. Explicar o Random Forest e o tratamento do desbalanceamento;
8. Apresentar o ROC-AUC próximo de 0,75;
9. Demonstrar o impacto da escolha do threshold;
10. Reforçar a diferença entre associação estatística e causalidade;
11. Mostrar como o dashboard comunica os resultados.

Mensagem principal:

> Este projeto demonstra como aplicar técnicas de Data Science a dados de
> sensores industriais, considerando desbalanceamento de classes, seleção de
> variáveis, avaliação de thresholds e interpretação dos resultados para apoiar
> decisões de qualidade.