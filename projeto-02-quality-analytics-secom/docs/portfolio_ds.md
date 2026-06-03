# Projeto para Portfólio de Data Science

## Título sugerido

Failure Prediction & Feature Importance in Semiconductor Manufacturing (UCI SECOM)

## Resumo (para CV / LinkedIn)

Modelei o problema de qualidade em manufatura como uma tarefa de classificação binária (PASS vs FAIL) utilizando o dataset SECOM (591 features de sensores). Conduzi o pipeline completo de Data Science: tratamento de dados com alto volume de missing values, análise exploratória, seleção de variáveis (ANOVA F-score, correlação) e treinamento de modelos supervisionados (Random Forest com `class_weight='balanced'`). A partir das feature importances, identifiquei os sensores mais relevantes para falhas e traduzi esses resultados em insights de processo, conectando o modelo preditivo à explicabilidade e à priorização de ações de engenharia.

## Pontos para destacar em entrevistas (Data Science)

- Tratamento de dataset industrial com 591 features e dados faltantes.
- Estratégia de feature selection (ANOVA, correlação, feature importance).
- Modelo supervisionado com dado desbalanceado (class_weight, métricas focadas em FAIL).
- Uso do modelo mais como ferramenta de explicação/priorização do que só previsão.

## Notas:

O dataset é fortemente enviesado para casos de FAIL (~93%), o que sugere um recorte
orientado a falhas em vez de um espelho completo da produção. Esse viés foi levado
em conta na interpretação dos resultados e na construção dos insights de processo.