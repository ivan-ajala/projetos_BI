import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useSensorData } from '../utils/useSensorData';

function CorrelationChart({ data, color, label }) {
  return (
    <div style={{ width: '100%', height: 420 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <ReferenceLine x={0} stroke="#374151" />
          <XAxis
            type="number"
            domain={['auto', 'auto']}
            tickFormatter={(value) => value.toFixed(3)}
          />
          <YAxis type="category" dataKey="sensor" width={90} />
          <Tooltip formatter={(value) => [Number(value).toFixed(6), label]} />
          <Bar dataKey="value" name={label} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
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

export default function AnaliseSensores() {
  const { rfData, fscoreData, positiveData, negativeData, loading, error } =
    useSensorData();

  const [search, setSearch] = useState('');
  const [view, setView] = useState('all');

  const filterBySearch = (rows) => {
    if (search.trim() === '') return rows;
    const term = search.trim().toLowerCase();
    return rows.filter((row) => row.sensor.toLowerCase().includes(term));
  };

  const filteredPositive = useMemo(
    () => filterBySearch([...positiveData].sort((a, b) => a.value - b.value)),
    [positiveData, search]
  );

  const filteredNegative = useMemo(
    () =>
      filterBySearch(
        [...negativeData].sort((a, b) => a.value - b.value).reverse()
      ),
    [negativeData, search]
  );

  const rfMap = useMemo(() => {
    const map = new Map();
    rfData.forEach((row) => map.set(row.sensor, row.value));
    return map;
  }, [rfData]);

  const fscoreMap = useMemo(() => {
    const map = new Map();
    fscoreData.forEach((row) => map.set(row.sensor, row.value));
    return map;
  }, [fscoreData]);

  const tableRows = useMemo(() => {
    const bySensor = new Map();

    positiveData.forEach((row) => {
      bySensor.set(row.sensor, {
        sensor: row.sensor,
        correlation: row.value,
        classification: 'Correlação positiva',
      });
    });

    negativeData.forEach((row) => {
      bySensor.set(row.sensor, {
        sensor: row.sensor,
        correlation: row.value,
        classification: 'Correlação negativa',
      });
    });

    let rows = Array.from(bySensor.values()).map((row) => ({
      ...row,
      rf: rfMap.get(row.sensor),
      fscore: fscoreMap.get(row.sensor),
    }));

    if (view === 'positive') {
      rows = rows.filter((row) => row.classification === 'Correlação positiva');
    } else if (view === 'negative') {
      rows = rows.filter((row) => row.classification === 'Correlação negativa');
    }

    rows = filterBySearch(rows);

    return rows.sort((a, b) => b.correlation - a.correlation);
  }, [positiveData, negativeData, rfMap, fscoreMap, view, search]);

  const kpis = useMemo(() => {
    const topPositive = positiveData.reduce(
      (best, row) => (row.value > (best?.value ?? -Infinity) ? row : best),
      null
    );

    const topNegative = negativeData.reduce(
      (best, row) => (row.value < (best?.value ?? Infinity) ? row : best),
      null
    );

    return {
      totalPositive: positiveData.length,
      totalNegative: negativeData.length,
      topPositive,
      topNegative,
    };
  }, [positiveData, negativeData]);

  const handleClearFilters = () => {
    setSearch('');
    setView('all');
  };

  const showPositive = view === 'all' || view === 'positive';
  const showNegative = view === 'all' || view === 'negative';

  return (
    <main className="page">
      <div className="page-inner">
        <h1 className="page-title">Análise de Sensores</h1>
        <p className="page-subtitle">
          Sensores mais correlacionados com a ocorrência de falhas, com
          detalhamento por importância de modelo e F-Score.
        </p>

        <section className="filters-bar">
          <div className="filter-group">
            <label className="filter-label">Tipo de correlação</label>
            <select
              className="filter-select"
              value={view}
              onChange={(event) => setView(event.target.value)}
            >
              <option value="all">Todas</option>
              <option value="positive">Positiva</option>
              <option value="negative">Negativa</option>
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

          <button className="filter-clear" onClick={handleClearFilters}>
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
                icon="🟢"
                label="Correlações Positivas"
                value={kpis.totalPositive}
              />
              <KpiCard
                icon="🔴"
                label="Correlações Negativas"
                value={kpis.totalNegative}
              />
              <KpiCard
                icon="⬆️"
                label="Maior Correlação Positiva"
                value={kpis.topPositive?.sensor ?? '-'}
                sublabel={kpis.topPositive?.value.toFixed(3)}
              />
              <KpiCard
                icon="⬇️"
                label="Maior Correlação Negativa"
                value={kpis.topNegative?.sensor ?? '-'}
                sublabel={kpis.topNegative?.value.toFixed(3)}
              />
            </section>

            <section className="charts-grid">
              {showPositive && (
                <div className="chart-card">
                  <h2 className="chart-title" style={{ color: '#166534' }}>
                    Correlações Positivas
                  </h2>
                  <p className="chart-subtitle">
                    Sensores associados a maior probabilidade de falha.
                  </p>
                  {filteredPositive.length > 0 ? (
                    <CorrelationChart
                      data={filteredPositive}
                      color="#16a34a"
                      label="Correlação positiva"
                    />
                  ) : (
                    <p className="state-text">Nenhum sensor encontrado.</p>
                  )}
                </div>
              )}

              {showNegative && (
                <div className="chart-card">
                  <h2 className="chart-title" style={{ color: '#991b1b' }}>
                    Correlações Negativas
                  </h2>
                  <p className="chart-subtitle">
                    Sensores associados a menor probabilidade de falha.
                  </p>
                  {filteredNegative.length > 0 ? (
                    <CorrelationChart
                      data={filteredNegative}
                      color="#dc2626"
                      label="Correlação negativa"
                    />
                  ) : (
                    <p className="state-text">Nenhum sensor encontrado.</p>
                  )}
                </div>
              )}
            </section>

            {kpis.topPositive && kpis.topNegative && (
              <section className="insight-box">
                💡 <strong>Insight:</strong> o sensor{' '}
                <strong>{kpis.topPositive.sensor}</strong> apresenta a maior
                correlação positiva com falhas (
                {kpis.topPositive.value.toFixed(3)}), enquanto{' '}
                <strong>{kpis.topNegative.sensor}</strong> apresenta a maior
                correlação negativa ({kpis.topNegative.value.toFixed(3)}).
                Ambos são candidatos prioritários para monitoramento contínuo.
              </section>
            )}

            <section className="table-card">
              <h2 className="chart-title">Tabela Comparativa de Sensores</h2>
              <p className="chart-subtitle">
                Sensor · Importância RF · F-Score · Correlação · Classificação
              </p>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sensor</th>
                      <th>Importância RF</th>
                      <th>F-Score</th>
                      <th>Correlação</th>
                      <th>Classificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.sensor}>
                        <td>{row.sensor}</td>
                        <td>
                          {row.rf !== undefined
                            ? `${(row.rf * 100).toFixed(2)}%`
                            : '-'}
                        </td>
                        <td>
                          {row.fscore !== undefined
                            ? row.fscore.toFixed(2)
                            : '-'}
                        </td>
                        <td>{row.correlation.toFixed(3)}</td>
                        <td>
                          <span
                            className={
                              row.classification === 'Correlação positiva'
                                ? 'badge badge-positive'
                                : 'badge badge-negative'
                            }
                          >
                            {row.classification}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {tableRows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="state-text">
                          Nenhum sensor encontrado para os filtros
                          selecionados.
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
