import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSensorData } from '../utils/useSensorData';

const TOP_N_OPTIONS = [5, 10, 15, 0];

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

function RankingChart({ data, color, valueLabel }) {
  return (
    <div style={{ width: '100%', height: 420 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => value.toFixed(3)} />
          <YAxis type="category" dataKey="sensor" width={90} />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(6), valueLabel]}
          />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function VisaoGeral() {
  const { rfData, fscoreData, positiveData, negativeData, loading, error } =
    useSensorData();

  const [topN, setTopN] = useState(10);
  const [search, setSearch] = useState('');

  const applyFilters = (rows) => {
    let result = [...rows].sort((a, b) => b.value - a.value);

    if (search.trim() !== '') {
      const term = search.trim().toLowerCase();
      result = result.filter((row) => row.sensor.toLowerCase().includes(term));
    }

    if (topN > 0) {
      result = result.slice(0, topN);
    }

    return result.reverse();
  };

  const rfChartData = useMemo(
    () => applyFilters(rfData),
    [rfData, search, topN]
  );

  const fscoreChartData = useMemo(
    () => applyFilters(fscoreData),
    [fscoreData, search, topN]
  );

  const positiveChartData = useMemo(() => {
    let rows = [...positiveData].sort((a, b) => b.value - a.value);
    if (search.trim() !== '') {
      const term = search.trim().toLowerCase();
      rows = rows.filter((row) => row.sensor.toLowerCase().includes(term));
    }
    return rows.slice(0, 10).reverse();
  }, [positiveData, search]);

  const negativeChartData = useMemo(() => {
    let rows = [...negativeData].sort((a, b) => a.value - b.value);
    if (search.trim() !== '') {
      const term = search.trim().toLowerCase();
      rows = rows.filter((row) => row.sensor.toLowerCase().includes(term));
    }
    return rows.slice(0, 10).reverse();
  }, [negativeData, search]);

  const kpis = useMemo(() => {
    const totalSensors = rfData.length;

    const topRf = rfData.reduce(
      (best, row) => (row.value > (best?.value ?? -Infinity) ? row : best),
      null
    );

    const topFscore = fscoreData.reduce(
      (best, row) => (row.value > (best?.value ?? -Infinity) ? row : best),
      null
    );

    const topPositive = positiveData.reduce(
      (best, row) => (row.value > (best?.value ?? -Infinity) ? row : best),
      null
    );

    const topNegative = negativeData.reduce(
      (best, row) => (row.value < (best?.value ?? Infinity) ? row : best),
      null
    );

    return { totalSensors, topRf, topFscore, topPositive, topNegative };
  }, [rfData, fscoreData, positiveData, negativeData]);

  const tableRows = useMemo(() => {
    const rfMap = new Map(rfData.map((row) => [row.sensor, row.value]));
    const fscoreMap = new Map(fscoreData.map((row) => [row.sensor, row.value]));
    const posMap = new Map(positiveData.map((row) => [row.sensor, row.value]));
    const negMap = new Map(negativeData.map((row) => [row.sensor, row.value]));

    let rows = rfData.map((row) => ({
      sensor: row.sensor,
      rf: rfMap.get(row.sensor),
      fscore: fscoreMap.get(row.sensor),
      positive: posMap.get(row.sensor),
      negative: negMap.get(row.sensor),
    }));

    if (search.trim() !== '') {
      const term = search.trim().toLowerCase();
      rows = rows.filter((row) => row.sensor.toLowerCase().includes(term));
    }

    rows = rows.sort((a, b) => (b.rf ?? 0) - (a.rf ?? 0));

    return topN > 0 ? rows.slice(0, topN) : rows;
  }, [rfData, fscoreData, positiveData, negativeData, search, topN]);

  const handleClearFilters = () => {
    setTopN(10);
    setSearch('');
  };

  return (
    <main className="page">
      <div className="page-inner">
        <h1 className="page-title">Visão Geral</h1>
        <p className="page-subtitle">Ranking dos sensores mais relevantes para a previsão de falhas, com base em importância de modelo, F-Score e correlação.</p>
        <section className="filters-bar">
          <div className="filter-group">
            <label className="filter-label">Top N</label>
            <select
              className="filter-select"
              value={topN}
              onChange={(event) => setTopN(Number(event.target.value))}
            >
              {TOP_N_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 0 ? 'Todos' : `Top ${option}`}
                </option>
              ))}
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
                icon="🧪"
                label="Sensores Analisados"
                value={kpis.totalSensors}
              />
              <KpiCard
                icon="🥇"
                label="Top Random Forest"
                value={kpis.topRf?.sensor ?? '-'}
                sublabel={
                  kpis.topRf
                    ? `${(kpis.topRf.value * 100).toFixed(2)}%`
                    : undefined
                }
              />
              <KpiCard
                icon="📈"
                label="Maior F-Score"
                value={kpis.topFscore?.sensor ?? '-'}
                sublabel={kpis.topFscore?.value.toFixed(2)}
              />
              <KpiCard
                icon="🟢"
                label="Maior Correlação Positiva"
                value={kpis.topPositive?.sensor ?? '-'}
                sublabel={kpis.topPositive?.value.toFixed(3)}
              />
              <KpiCard
                icon="🔴"
                label="Maior Correlação Negativa"
                value={kpis.topNegative?.sensor ?? '-'}
                sublabel={kpis.topNegative?.value.toFixed(3)}
              />
            </section>

            <section className="charts-grid">
              <div className="chart-card">
                <h2 className="chart-title">Ranking — Random Forest</h2>
                <p className="chart-subtitle">
                  {topN === 0 ? 'Todos os sensores' : `Top ${topN} sensores`}
                  {search.trim() !== '' && ` · filtrado por "${search}"`}
                </p>
                {rfChartData.length > 0 ? (
                  <RankingChart
                    data={rfChartData}
                    color="#2563eb"
                    valueLabel="Importância"
                  />
                ) : (
                  <p className="state-text">Nenhum sensor encontrado.</p>
                )}
              </div>

              <div className="chart-card">
                <h2 className="chart-title">Ranking — F-Score</h2>
                <p className="chart-subtitle">
                  {topN === 0 ? 'Todos os sensores' : `Top ${topN} sensores`}
                  {search.trim() !== '' && ` · filtrado por "${search}"`}
                </p>
                {fscoreChartData.length > 0 ? (
                  <RankingChart
                    data={fscoreChartData}
                    color="#7c3aed"
                    valueLabel="F-Score"
                  />
                ) : (
                  <p className="state-text">Nenhum sensor encontrado.</p>
                )}
              </div>
            </section>

            <section className="charts-grid">
              <div className="chart-card">
                <h2 className="chart-title" style={{ color: '#166534' }}>
                  Top 10 Correlações Positivas
                </h2>
                <p className="chart-subtitle">
                  Sensores associados a maior probabilidade de falha.
                </p>
                {positiveChartData.length > 0 ? (
                  <RankingChart
                    data={positiveChartData}
                    color="#16a34a"
                    valueLabel="Correlação"
                  />
                ) : (
                  <p className="state-text">Nenhum sensor encontrado.</p>
                )}
              </div>

              <div className="chart-card">
                <h2 className="chart-title" style={{ color: '#991b1b' }}>
                  Top 10 Correlações Negativas
                </h2>
                <p className="chart-subtitle">
                  Sensores associados a menor probabilidade de falha.
                </p>
                {negativeChartData.length > 0 ? (
                  <RankingChart
                    data={negativeChartData}
                    color="#dc2626"
                    valueLabel="Correlação"
                  />
                ) : (
                  <p className="state-text">Nenhum sensor encontrado.</p>
                )}
              </div>
            </section>

            {kpis.topRf && kpis.topFscore && (
              <section className="insight-box">
                💡 <strong>Insight:</strong> o sensor{' '}
                <strong>{kpis.topRf.sensor}</strong> é o mais relevante segundo
                o Random Forest ({(kpis.topRf.value * 100).toFixed(2)}% de
                importância), enquanto <strong>{kpis.topFscore.sensor}</strong>{' '}
                lidera no F-Score ({kpis.topFscore.value.toFixed(2)}). Ambos
                são fortes candidatos a variáveis explicativas no modelo de
                previsão de falhas.
              </section>
            )}

            <section className="table-card">
              <h2 className="chart-title">Tabela Resumida de Sensores</h2>
              <p className="chart-subtitle">
                Sensor · Importância RF · F-Score · Correlação Positiva ·
                Correlação Negativa
              </p>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sensor</th>
                      <th>Importância RF</th>
                      <th>F-Score</th>
                      <th>Corr. Positiva</th>
                      <th>Corr. Negativa</th>
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
                        <td>
                          {row.positive !== undefined
                            ? row.positive.toFixed(3)
                            : '-'}
                        </td>
                        <td>
                          {row.negative !== undefined
                            ? row.negative.toFixed(3)
                            : '-'}
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
