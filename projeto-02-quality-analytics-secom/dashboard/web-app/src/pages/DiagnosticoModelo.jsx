import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { useSensorData } from '../utils/useSensorData';

function normalizeMap(rows) {
  const values = rows
    .map((row) => Number(row.value))
    .filter((value) => Number.isFinite(value));

  const min = Math.min(...values);
  const max = Math.max(...values);

  return new Map(
    rows.map((row) => {
      const value = Number(row.value);
      const normalized =
        values.length === 0 || max === min ? 1 : (value - min) / (max - min);

      return [row.sensor, normalized];
    })
  );
}

function formatValue(value, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : '-';
}

function KpiCard({ icon, label, value, sublabel }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sublabel && <div className="kpi-sublabel">{sublabel}</div>}
    </div>
  );
}

function ConsensusChart({ data }) {
  return (
    <div style={{ width: '100%', height: 430 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="rf"
            name="Random Forest"
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            label={{
              value: 'Importância Random Forest',
              position: 'insideBottom',
              offset: -18,
            }}
          />
          <YAxis
            type="number"
            dataKey="fscore"
            name="F-Score"
            tickFormatter={(value) => value.toFixed(2)}
            label={{
              value: 'F-Score',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <ZAxis type="number" dataKey="consensus" range={[70, 500]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name) => {
              if (name === 'Random Forest') {
                return [`${(Number(value) * 100).toFixed(2)}%`, name];
              }

              if (name === 'F-Score') {
                return [Number(value).toFixed(2), name];
              }

              return [Number(value).toFixed(3), name];
            }}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.sensor ?? ''
            }
          />
          <Scatter
            name="Sensores"
            data={data}
            fill="#2563eb"
            fillOpacity={0.72}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DiagnosticoModelo() {
  const { rfData, fscoreData, positiveData, negativeData, loading, error } =
    useSensorData();

  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState('all');

  const analysisRows = useMemo(() => {
    const rfMap = new Map(rfData.map((row) => [row.sensor, Number(row.value)]));
    const fscoreMap = new Map(
      fscoreData.map((row) => [row.sensor, Number(row.value)])
    );

    const positiveMap = new Map(
      positiveData.map((row) => [row.sensor, Number(row.value)])
    );

    const negativeMap = new Map(
      negativeData.map((row) => [row.sensor, Number(row.value)])
    );

    const rfNormalized = normalizeMap(rfData);
    const fscoreNormalized = normalizeMap(fscoreData);

    const sensors = new Set([
      ...rfMap.keys(),
      ...fscoreMap.keys(),
      ...positiveMap.keys(),
      ...negativeMap.keys(),
    ]);

    return Array.from(sensors)
      .map((sensor) => {
        const rf = rfMap.get(sensor);
        const fscore = fscoreMap.get(sensor);
        const positive = positiveMap.get(sensor);
        const negative = negativeMap.get(sensor);

        const correlation =
          positive !== undefined
            ? positive
            : negative !== undefined
              ? negative
              : undefined;

        const correlationStrength =
          correlation !== undefined
            ? Math.min(Math.abs(correlation), 1)
            : undefined;

        const components = [
          rfNormalized.get(sensor),
          fscoreNormalized.get(sensor),
          correlationStrength,
        ].filter((value) => Number.isFinite(value));

        const consensus =
          components.length > 0
            ? components.reduce((sum, value) => sum + value, 0) /
              components.length
            : 0;

        const availableMetrics = [
          rf !== undefined,
          fscore !== undefined,
          correlation !== undefined,
        ].filter(Boolean).length;

        let group = 'Baixa prioridade';

        if (consensus >= 0.67 && availableMetrics >= 2) {
          group = 'Alta concordância';
        } else if (consensus >= 0.4 && availableMetrics >= 2) {
          group = 'Relevância intermediária';
        } else if (
          correlation !== undefined &&
          (rf === undefined || rfNormalized.get(sensor) < 0.4)
        ) {
          group = 'Associação estatística';
        } else if (rf !== undefined || fscore !== undefined) {
          group = 'Relevância no modelo';
        }

        return {
          sensor,
          rf,
          fscore,
          positive,
          negative,
          correlation,
          consensus,
          availableMetrics,
          group,
        };
      })
      .sort((a, b) => b.consensus - a.consensus);
  }, [rfData, fscoreData, positiveData, negativeData]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return analysisRows.filter((row) => {
      const matchesSearch =
        term === '' || row.sensor.toLowerCase().includes(term);

      const matchesClassification =
        classification === 'all' || row.group === classification;

      return matchesSearch && matchesClassification;
    });
  }, [analysisRows, search, classification]);

  const chartData = useMemo(
    () =>
      filteredRows.filter(
        (row) => Number.isFinite(row.rf) && Number.isFinite(row.fscore)
      ),
    [filteredRows]
  );

  const kpis = useMemo(() => {
    const best = analysisRows[0];

    const highAgreement = analysisRows.filter(
      (row) => row.group === 'Alta concordância'
    ).length;

    const positiveCount = analysisRows.filter(
      (row) => row.positive !== undefined
    ).length;

    const negativeCount = analysisRows.filter(
      (row) => row.negative !== undefined
    ).length;

    return {
      best,
      highAgreement,
      positiveCount,
      negativeCount,
    };
  }, [analysisRows]);

  const clearFilters = () => {
    setSearch('');
    setClassification('all');
  };

  return (
    <main className="page">
      <div className="page-inner">
        <h1 className="page-title">Diagnóstico do Modelo</h1>
        <p className="page-subtitle">
          Consenso entre importância Random Forest, F-Score e correlação dos
          sensores com a ocorrência de falhas.
        </p>

        <section className="filters-bar">
          <div className="filter-group">
            <label className="filter-label">Classificação</label>
            <select
              className="filter-select"
              value={classification}
              onChange={(event) => setClassification(event.target.value)}
            >
              <option value="all">Todas</option>
              <option value="Alta concordância">Alta concordância</option>
              <option value="Relevância intermediária">
                Relevância intermediária
              </option>
              <option value="Associação estatística">
                Associação estatística
              </option>
              <option value="Relevância no modelo">
                Relevância no modelo
              </option>
              <option value="Baixa prioridade">Baixa prioridade</option>
            </select>
          </div>

          <div className="filter-group filter-grow">
            <label className="filter-label">Buscar sensor</label>
            <input
              className="filter-input"
              type="text"
              placeholder="Ex: Sensor_060"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button className="filter-clear" onClick={clearFilters}>
            ✕ Limpar
          </button>
        </section>

        {loading && <p className="state-text">Carregando dados...</p>}

        {error && (
          <p className="state-text state-error">
            Erro ao carregar os dados: {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <section className="kpi-grid">
              <KpiCard
                icon="🧪"
                label="Sensores Avaliados"
                value={analysisRows.length}
              />
              <KpiCard
                icon="🎯"
                label="Alta Concordância"
                value={kpis.highAgreement}
              />
              <KpiCard
                icon="🟢"
                label="Com Correlação Positiva"
                value={kpis.positiveCount}
              />
              <KpiCard
                icon="🔴"
                label="Com Correlação Negativa"
                value={kpis.negativeCount}
              />
              <KpiCard
                icon="🏆"
                label="Sensor Mais Consistente"
                value={kpis.best?.sensor ?? '-'}
                sublabel={
                  kpis.best
                    ? `Score ${(kpis.best.consensus * 100).toFixed(1)}%`
                    : undefined
                }
              />
            </section>

            <section className="charts-grid">
              <div className="chart-card">
                <h2 className="chart-title">
                  Concordância entre RF e F-Score
                </h2>
                <p className="chart-subtitle">
                  Quanto maior e mais próximo do canto superior direito, maior
                  a relevância conjunta das métricas.
                </p>

                {chartData.length > 0 ? (
                  <ConsensusChart data={chartData} />
                ) : (
                  <p className="state-text">
                    Não há dados suficientes para o gráfico.
                  </p>
                )}
              </div>

              <div className="chart-card">
                <h2 className="chart-title">Como interpretar o diagnóstico</h2>
                <div className="diagnostic-guide">
                  <div>
                    <strong>Alta concordância</strong>
                    <p>
                      O sensor aparece com relevância elevada em pelo menos
                      duas métricas.
                    </p>
                  </div>
                  <div>
                    <strong>Associação estatística</strong>
                    <p>
                      A correlação é relevante, mas não há evidência equivalente
                      nas métricas do modelo.
                    </p>
                  </div>
                  <div>
                    <strong>Relevância no modelo</strong>
                    <p>
                      O sensor contribui para o modelo, mesmo sem correlação
                      elevada disponível.
                    </p>
                  </div>
                  <div>
                    <strong>Importante</strong>
                    <p>
                      As métricas indicam associação e relevância, não
                      causalidade.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {kpis.best && (
              <section className="insight-box">
                <strong>Insight:</strong> o sensor{' '}
                <strong>{kpis.best.sensor}</strong> apresenta o maior score
                consolidado entre as métricas disponíveis (
                {(kpis.best.consensus * 100).toFixed(1)}%). Ele deve ser
                priorizado para investigação e monitoramento, sem interpretar
                esse resultado como prova de causalidade.
              </section>
            )}

            <section className="table-card">
              <h2 className="chart-title">Ranking Consolidado</h2>
              <p className="chart-subtitle">
                Score calculado a partir das métricas normalizadas disponíveis
                para cada sensor.
              </p>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sensor</th>
                      <th>Score Consenso</th>
                      <th>RF</th>
                      <th>F-Score</th>
                      <th>Correlação</th>
                      <th>Métricas</th>
                      <th>Classificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, index) => (
                      <tr key={row.sensor}>
                        <td>{index + 1}</td>
                        <td>{row.sensor}</td>
                        <td>{(row.consensus * 100).toFixed(1)}%</td>
                        <td>
                          {row.rf !== undefined
                            ? `${(row.rf * 100).toFixed(2)}%`
                            : '-'}
                        </td>
                        <td>{formatValue(row.fscore, 2)}</td>
                        <td>
                          {row.correlation !== undefined
                            ? formatValue(row.correlation)
                            : '-'}
                        </td>
                        <td>{row.availableMetrics}/3</td>
                        <td>
                          <span className="diagnostic-badge">
                            {row.group}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={8} className="state-text">
                          Nenhum sensor encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
