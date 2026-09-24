# Projeto 05 — Painel antifraude (React + Vite)

Implementação React do painel demonstrativo, mantendo o layout da primeira versão HTML e o padrão de publicação estática adotado no Projeto 04. Os indicadores são incorporados ao código como resultados do backtest PaySim já revisados; o painel não se conecta a uma API ou operação em tempo real.

## Requisitos

- Node.js 20.19+ ou 22.12+.
- npm.

## Executar localmente

No Terminal, entre na pasta do projeto e rode:

```bash
npm install
npm run dev
```

Abra o endereço local informado pelo Vite no Terminal. Para encerrar, pressione `Ctrl+C`.

## Gerar a versão de publicação

```bash
npm run build
```

Os arquivos estáticos serão gerados em `dist/`. O `vite.config.js` usa a base `/projeto-05/` na compilação para publicação no GitHub Pages, seguindo o padrão do Projeto 04; no servidor local de desenvolvimento, a base é `/`.

## Conteúdo e ressalvas

- Períodos alternáveis: validação e teste cronológico exploratório.
- Limiares selecionáveis nos dois períodos: 1, 2 e 3; cartões, gráfico e composição da fila acompanham a seleção.
- Limiar 2 é a referência principal da análise; 1 e 3 aparecem como sensibilidade.
- PaySim é uma base sintética; o teste já foi explorado e não deve ser descrito como avaliação independente.
- Métricas de fila, triagem humana, SLA e decisão operacional não são observadas neste conjunto.
