# Project Portfolio Management Analytics

Projeto de análise e ciência de dados aplicado à gestão de portfólio
de projetos.

## Objetivos

- Analisar prazo, custo, qualidade e capacidade;
- Medir simultaneidade e sazonalidade;
- Estimar riscos de atraso e custo;
- Segmentar projetos por perfil histórico;
- Disponibilizar os resultados em um dashboard executivo.

## Pipeline

Dados brutos → Analytics → Machine Learning → Scoring → Dashboard

## Principais resultados

- 530 projetos analisados;
- 360 projetos concluídos;
- 41 colunas analíticas;
- 49 colunas no arquivo final de scoring;
- 360 projetos com cluster histórico;
- 170 projetos sem cluster histórico.

## Modelos

- Regressão Logística;
- Random Forest Classifier;
- Random Forest Regressor;
- K-Means.

## Limitações

Os modelos possuem caráter exploratório. O modelo de atraso apresentou
desempenho próximo ao acaso, o modelo de custo teve desempenho limitado
e a regressão apresentou R² negativo.