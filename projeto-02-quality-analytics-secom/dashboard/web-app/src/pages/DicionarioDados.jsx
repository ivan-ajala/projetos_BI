const metricCards = [
  {
    title: 'Random Forest',
    short: 'RF',
    color: '#2563eb',
    description:
      'Mede a contribuição relativa de cada sensor para as decisões do modelo Random Forest.',
    interpretation:
      'Quanto maior o valor, maior foi a contribuição do sensor para o modelo.',
    caution:
      'Importância elevada não significa que o sensor cause diretamente a falha.',
  },
  {
    title: 'F-Score',
    short: 'F',
    color: '#7c3aed',
    description:
      'Indica a capacidade discriminativa do sensor para separar diferentes condições ou classes de falha.',
    interpretation:
      'Valores mais altos indicam maior poder de discriminação entre as classes analisadas.',
    caution:
      'A interpretação depende da forma como as classes e os dados foram preparados.',
  },
  {
    title: 'Correlação',
    short: 'r',
    color: '#16a34a',
    description:
      'Mede a associação estatística entre o comportamento do sensor e a variável de falha.',
    interpretation:
      'Correlação positiva indica associação na mesma direção; negativa indica associação em direções opostas.',
    caution:
      'Correlação não implica causalidade e pode ser influenciada por outras variáveis.',
  },
];

const files = [
  {
    name: 'feature_importance_rf.csv',
    metric: 'Importância Random Forest',
    purpose: 'Ranking de relevância dos sensores para o modelo.',
  },
  {
    name: 'feature_fscore_ranking.csv',
    metric: 'F-Score',
    purpose: 'Ranking do poder discriminativo dos sensores.',
  },
  {
    name: 'top10_pos_correlated_sensors.csv',
    metric: 'Correlação positiva',
    purpose: 'Sensores com maior associação positiva com falhas.',
  },
  {
    name: 'top10_neg_correlated_sensors.csv',
    metric: 'Correlação negativa',
    purpose: 'Sensores com maior associação negativa com falhas.',
  },
];

function SectionTitle({ children }) {
  return <h2 className="chart-title">{children}</h2>;
}

export default function DicionarioDados() {
  return (
    <main className="page">
      <div className="page-inner">
        <h1 className="page-title">Dicionário de Dados</h1>

        <p className="page-subtitle">
          Guia das métricas, arquivos e classificações utilizados no dashboard
          SECOM Quality Analytics.
        </p>

        <section className="info-banner">
          <strong>Objetivo da análise:</strong> identificar sensores relevantes
          para a previsão e investigação de falhas, combinando evidências de
          modelo, discriminação estatística e correlação.
        </section>

        <section className="dictionary-grid">
          {metricCards.map((metric) => (
            <article className="dictionary-card" key={metric.short}>
              <div
                className="dictionary-icon"
                style={{ backgroundColor: metric.color }}
              >
                {metric.short}
              </div>

              <h2>{metric.title}</h2>
              <p>{metric.description}</p>

              <div className="dictionary-detail">
                <strong>Como interpretar</strong>
                <span>{metric.interpretation}</span>
              </div>

              <div className="dictionary-warning">
                <strong>Limitação</strong>
                <span>{metric.caution}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="table-card">
          <SectionTitle>Arquivos de dados</SectionTitle>

          <p className="chart-subtitle">
            Arquivos utilizados pelas páginas Visão Geral, Análise de Sensores e
            Diagnóstico do Modelo.
          </p>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Métrica</th>
                  <th>Finalidade</th>
                </tr>
              </thead>

              <tbody>
                {files.map((file) => (
                  <tr key={file.name}>
                    <td>{file.name}</td>
                    <td>{file.metric}</td>
                    <td>{file.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="charts-grid">
          <article className="chart-card">
            <SectionTitle>Classificações do diagnóstico</SectionTitle>

            <div className="dictionary-list">
              <div>
                <strong>Alta concordância</strong>
                <p>
                  O sensor apresenta relevância elevada em pelo menos duas
                  métricas.
                </p>
              </div>

              <div>
                <strong>Relevância intermediária</strong>
                <p>
                  O sensor possui evidência parcial de importância entre as
                  métricas analisadas.
                </p>
              </div>

              <div>
                <strong>Associação estatística</strong>
                <p>
                  A correlação é relevante, mas não há evidência equivalente nas
                  métricas do modelo.
                </p>
              </div>

              <div>
                <strong>Relevância no modelo</strong>
                <p>
                  O sensor contribui para o modelo, mesmo sem correlação elevada
                  disponível.
                </p>
              </div>

              <div>
                <strong>Baixa prioridade</strong>
                <p>
                  O sensor possui baixa evidência relativa nas métricas
                  disponíveis.
                </p>
              </div>
            </div>
          </article>

          <article className="chart-card">
            <SectionTitle>Cuidados de interpretação</SectionTitle>

            <div className="dictionary-list">
              <div>
                <strong>Associação não é causalidade</strong>
                <p>
                  Uma métrica elevada não prova que o sensor provoque a falha.
                </p>
              </div>

              <div>
                <strong>Escalas diferentes</strong>
                <p>
                  RF, F-Score e correlação possuem escalas e significados
                  diferentes.
                </p>
              </div>

              <div>
                <strong>Score consolidado</strong>
                <p>
                  O score serve para priorização analítica e não substitui a
                  avaliação do modelo.
                </p>
              </div>

              <div>
                <strong>Investigação operacional</strong>
                <p>
                  Sensores prioritários devem ser validados com especialistas e
                  dados históricos de operação.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="insight-box">
          <strong>Nota metodológica:</strong> os rankings devem ser utilizados
          como apoio à investigação. A confirmação de uma falha exige análise
          temporal, contexto operacional e validação das condições reais do
          equipamento.
        </section>
      </div>
    </main>
  );
}
