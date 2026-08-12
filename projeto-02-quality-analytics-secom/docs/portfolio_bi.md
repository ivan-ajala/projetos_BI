# Projeto – Manufacturing Quality Analytics (BI & Analytics)

## Visão Geral

Projeto de **Business Intelligence e Data Analytics** aplicado ao dataset industrial
SECOM, com foco na análise de qualidade e na identificação de sensores associados
à ocorrência de falhas em um processo de manufatura de semicondutores.

O projeto combina:

- **Python** para extração, tratamento e análise dos dados;
- **Scikit-learn** para seleção de variáveis e modelagem preditiva;
- **React + Vite** para construção do dashboard interativo;
- **Tableau** como artefato complementar de visualização (`dashboard/Book1.twb`);
- **Git** para versionamento e organização do projeto.

O dashboard principal foi estruturado em quatro páginas:

1. Visão Geral;
2. Análise de Sensores;
3. Diagnóstico do Modelo;
4. Dicionário de Dados.

A proposta é transformar dados técnicos de sensores em informações compreensíveis
para análise de qualidade, priorização de investigação e apoio à tomada de decisão.

---

## Contexto de Negócio

O dataset SECOM representa um processo de manufatura de semicondutores no qual
cada linha corresponde a uma unidade produzida e contém medições de diversos
sensores de processo, além do resultado final de qualidade.

A base apresenta um cenário típico de processos industriais estáveis:

- aproximadamente **93% de unidades PASS**;
- aproximadamente **7% de unidades FAIL**.

A classe FAIL é minoritária, mas possui relevância operacional. Uma análise baseada
somente na proporção de acertos poderia ocultar falhas reais, pois um modelo que
sempre classificasse as unidades como PASS teria uma acurácia aparentemente alta,
mas não detectaria nenhuma unidade reprovada.

Por esse motivo, o projeto prioriza:

- identificação da proporção de PASS e FAIL;
- análise dos sensores associados ao resultado;
- priorização de variáveis críticas;
- avaliação de métricas adequadas para dados desbalanceados;
- comunicação dos resultados por meio de um dashboard interativo.

---

## Objetivos do Projeto

Os principais objetivos da perspectiva de BI e Analytics são:

- Estruturar e tratar dados de sensores industriais;
- Construir um pipeline de dados reprodutível em Python;
- Consolidar informações de qualidade em uma base processada;
- Identificar sensores com maior associação estatística com FAIL;
- Criar rankings de sensores para apoiar a investigação de processo;
- Traduzir resultados estatísticos e preditivos em visualizações acessíveis;
- Demonstrar a conexão entre análise de dados, qualidade e tomada de decisão;
- Organizar uma documentação clara para usuários técnicos e não técnicos.

---

## Dataset

O projeto utiliza o dataset **SECOM**, disponibilizado pelo
**UCI Machine Learning Repository**.

Cada registro representa uma unidade produzida e contém:

- medições de sensores de processo;
- identificador da unidade;
- rótulo original de qualidade;
- timestamp associado à observação;
- resultado categórico derivado.

O rótulo original foi interpretado da seguinte forma:

- `Label = -1` → `PASS`;
- `Label = 1` → `FAIL`.

A partir desse mapeamento, foi criada a variável analítica:

- `Result`: classificação categórica (`PASS` ou `FAIL`);
- `Target_FAIL`: variável binária, em que `1` representa FAIL e `0` representa PASS.

---

## Pipeline de Dados

### 1. Extração e Consolidação

Os dados foram organizados a partir dos arquivos brutos do dataset:

- `secom.data`;
- `secom_labels.data`.

As principais etapas foram:

- leitura dos dados de sensores;
- leitura dos rótulos e timestamps;
- criação de um identificador único `Unit_ID`;
- associação das medições aos respectivos resultados;
- correção do mapeamento entre `Label`, `PASS` e `FAIL`;
- geração da base combinada.

Arquivo gerado:

```text
data/processed/secom_raw_combined.csv
```

---

### 2. Limpeza e Transformação

A etapa de transformação incluiu:

- avaliação da quantidade de valores ausentes por sensor;
- remoção de sensores com mais de 50% de valores ausentes;
- imputação dos valores ausentes remanescentes pela mediana;
- preservação das colunas de controle e identificação;
- geração da base limpa para as análises posteriores.

A base processada contém aproximadamente:

- **1.567 unidades**;
- **566 colunas**;
- **562 sensores**;
- **4 colunas de controle**;
- ausência de valores faltantes nos sensores após a imputação.

Arquivo principal gerado:

```text
data/processed/secom_clean.csv
```

---

### 3. Análise Exploratória

A análise exploratória foi conduzida para compreender:

- a distribuição de PASS e FAIL;
- as estatísticas descritivas dos sensores;
- a variabilidade das medições;
- as associações entre sensores e `Target_FAIL`;
- as diferenças de distribuição entre unidades PASS e FAIL.

Foram gerados outputs como:

- distribuição de PASS/FAIL;
- estatísticas descritivas;
- matriz de correlação;
- correlações dos sensores com `Target_FAIL`;
- médias por grupo;
- boxplots de sensores selecionados;
- rankings de sensores associados ao resultado.

Os outputs da análise exploratória estão em:

```text
data/processed/eda_outputs/
```

---

## Sensores Associados à Ocorrência de FAIL

A análise identificou sensores com associações positivas e negativas em relação à
variável `Target_FAIL`.

Entre os sensores com associação positiva aparecem, por exemplo:

```text
Sensor_060
Sensor_104
Sensor_511
Sensor_349
Sensor_432
Sensor_435
Sensor_431
Sensor_022
Sensor_436
Sensor_437
```

Entre os sensores com associação negativa aparecem, por exemplo:

```text
Sensor_029
Sensor_317
Sensor_126
Sensor_027
Sensor_181
Sensor_123
Sensor_453
Sensor_128
Sensor_023
Sensor_015
```

A direção da associação é importante para a interpretação operacional:

- em alguns sensores, valores mais altos estão associados a maior ocorrência de
  FAIL;
- em outros sensores, valores mais baixos estão associados a maior ocorrência de
  FAIL.

Essas associações são utilizadas para priorizar investigação e monitoramento.
Elas não comprovam, isoladamente, que um sensor seja a causa direta da falha.

---

## Dashboard Interativo

O dashboard principal foi desenvolvido em **React + Vite** e consome os arquivos
gerados pelo pipeline analítico, localizados principalmente nas pastas:

```text
data/processed/eda_outputs/
data/processed/model_outputs/
```

A aplicação foi construída para traduzir os resultados técnicos em uma interface
navegável e compreensível para diferentes públicos.

### Página 1 — Visão Geral

A página apresenta uma visão executiva do projeto, incluindo:

- indicadores gerais da base;
- proporção de unidades PASS e FAIL;
- ranking de importância dos sensores;
- ranking por F-score;
- sensores com associações positivas;
- sensores com associações negativas;
- principais interpretações analíticas.

O objetivo é permitir uma leitura rápida do cenário de qualidade e dos sensores
que merecem maior atenção.

---

### Página 2 — Análise de Sensores

A página permite explorar os sensores selecionados pela análise, incluindo:

- busca por nome do sensor;
- filtros de visualização;
- identificação da direção da associação;
- ranking das variáveis;
- comparação de métricas;
- consulta detalhada dos sensores priorizados.

Essa visão aproxima a análise estatística do contexto operacional, permitindo
investigar quais variáveis apresentam maior relevância relativa para o resultado
de qualidade.

---

### Página 3 — Diagnóstico do Modelo

A página apresenta informações relacionadas ao modelo preditivo e à priorização
de sensores.

São combinadas diferentes evidências analíticas, como:

- importância do Random Forest;
- F-score da ANOVA;
- correlação com `Target_FAIL`;
- ranking combinado;
- classificação de prioridade;
- métricas do modelo;
- análise do comportamento do threshold.

O score de consenso apresentado no dashboard é uma ferramenta de priorização
analítica. Ele não representa uma métrica oficial de desempenho do modelo e não
deve ser interpretado como prova de causalidade.

---

### Página 4 — Dicionário de Dados

O Dicionário de Dados documenta:

- as principais variáveis utilizadas;
- o significado das métricas;
- a interpretação de PASS e FAIL;
- os rankings apresentados;
- as classificações de prioridade;
- as limitações da análise;
- a finalidade de cada seção do dashboard.

Essa página foi incluída para aumentar a transparência metodológica e facilitar
a utilização do dashboard por pessoas que não participaram da construção do
pipeline.

---

## Como Executar o Dashboard

A aplicação está localizada em:

```text
dashboard/web-app/
```

Para instalar as dependências:

```bash
cd dashboard/web-app
npm install
```

Para executar em modo de desenvolvimento:

```bash
npm run dev
```

Para criar a versão de produção:

```bash
npm run build
```

Para testar a versão compilada:

```bash
npm run preview
```

O dashboard foi validado com sucesso na versão de produção, com as quatro páginas
carregando corretamente seus KPIs, gráficos, tabelas e dados.

---

## Versão Complementar em Tableau

O repositório também contém o arquivo:

```text
dashboard/Book1.twb
```

Esse arquivo representa uma alternativa ou artefato complementar de visualização
do projeto.

O dashboard React + Vite é a implementação principal validada nesta versão do
projeto, enquanto o arquivo Tableau mantém o trabalho de visualização produzido
em uma ferramenta tradicional de BI.

---

## Principais Insights de BI

### 1. A classe FAIL é minoritária, mas relevante

A distribuição aproximada de **93% PASS e 7% FAIL** indica um processo no qual a
maioria das unidades é aprovada.

Mesmo representando uma parcela menor, FAIL é uma classe importante para:

- redução de perdas;
- investigação de não conformidades;
- melhoria do yield;
- priorização de inspeções;
- prevenção de recorrências.

---

### 2. Um subconjunto de sensores concentra maior sinal analítico

Embora a base contenha centenas de sensores, apenas uma parte apresenta maior
relevância relativa nas métricas avaliadas.

A combinação de:

- correlação;
- ANOVA F-score;
- feature importance;
- comparação entre os grupos PASS e FAIL;

permite construir uma priorização mais informada dos sensores.

---

### 3. A direção da associação deve ser considerada

Sensores com associação positiva e sensores com associação negativa não devem ser
interpretados da mesma maneira.

Para alguns sensores, valores mais altos podem estar associados a FAIL. Para outros,
valores mais baixos podem apresentar essa associação.

Por isso, o monitoramento deve considerar tanto a intensidade quanto a direção
da associação observada.

---

### 4. O dashboard transforma análise técnica em comunicação executiva

O dashboard organiza os resultados em diferentes níveis de leitura:

- visão geral para acompanhamento;
- análise detalhada dos sensores;
- diagnóstico do modelo;
- dicionário para interpretação das métricas.

Essa estrutura facilita a comunicação entre profissionais de dados, qualidade,
processos e gestão.

---

## Limitações da Análise

As principais limitações são:

- correlação não implica causalidade;
- feature importance não representa necessariamente efeito causal;
- o dataset é histórico e não representa, por si só, um sistema operacional em
  tempo real;
- a análise não substitui investigação técnica do processo;
- o dashboard não deve ser utilizado como único critério para liberar ou reprovar
  uma unidade;
- a implementação de gráficos de controle estatístico de processo com limites
  operacionais formais ainda não faz parte da versão principal validada.

---

## Próximas Extensões

Como possíveis evoluções do projeto:

- validação dos sensores junto a especialistas de processo;
- criação de limites operacionais específicos por sensor;
- implementação de gráficos de controle estatístico;
- calibração formal do threshold;
- monitoramento temporal em ambiente produtivo;
- comparação com outros algoritmos;
- ajuste de hiperparâmetros;
- avaliação de técnicas de balanceamento;
- inclusão de novos indicadores de qualidade;
- integração com uma solução de BI corporativa.

---

## Ferramentas Utilizadas

- **Python**;
- **Pandas**;
- **NumPy**;
- **Matplotlib**;
- **Seaborn**;
- **Scikit-learn**;
- **Jupyter Notebook**;
- **React**;
- **Vite**;
- **Tableau**;
- **Git**.

---

## Como Apresentar Este Projeto em Entrevistas

A apresentação pode seguir esta sequência:

1. Explicar o contexto industrial e o dataset SECOM;
2. Destacar o desbalanceamento de aproximadamente 93% PASS e 7% FAIL;
3. Mostrar como os dados foram extraídos, tratados e organizados;
4. Explicar a priorização dos sensores;
5. Apresentar o dashboard React;
6. Demonstrar as páginas de Visão Geral, Análise de Sensores e Diagnóstico do
   Modelo;
7. Explicar a importância do recall de FAIL e da análise de threshold;
8. Reforçar que os sensores são candidatos à investigação, e não causas
   comprovadas;
9. Apresentar as possíveis extensões para monitoramento operacional.

Mensagem principal:

> Este projeto demonstra como transformar dados de sensores industriais em
> indicadores de qualidade, rankings analíticos e informações visuais para apoiar
> a investigação de falhas e a tomada de decisão baseada em dados.