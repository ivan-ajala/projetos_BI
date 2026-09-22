import { useEffect, useState } from 'react';

import {
  formatCurrency,
  formatMonthYear,
} from '../utils/formatters';

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

import { parseCsv } from '../utils/csvParser';

function RevenueEvolution() {
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableFilter, setTableFilter] = useState('all');

  useEffect(() => {
    async function loadEvolutionData() {
      try {
        const [monthlyResponse, forecastResponse] = await Promise.all([
          fetch('/data/monthly_revenue.csv'),
          fetch('/data/revenue_forecast.csv'),
        ]);

        if (!monthlyResponse.ok) {
          throw new Error(
            `Erro ao carregar o histórico mensal: HTTP ${monthlyResponse.status}`,
          );
        }

        if (!forecastResponse.ok) {
          throw new Error(
            `Erro ao carregar o forecast: HTTP ${forecastResponse.status}`,
          );
        }

        const monthlyCsv = await monthlyResponse.text();
        const forecastCsv = await forecastResponse.text();

        setMonthlyRevenue(parseCsv(monthlyCsv));
        setForecastData(parseCsv(forecastCsv));
      } catch (loadError) {
        setError(loadError);
      } finally {
        setLoading(false);
      }
    }

    loadEvolutionData();
  }, []);

  if (loading) {
    return (
      <div className="status-message">
        Carregando evolução da receita...
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-message error-message">
        Erro ao carregar dados de evolução: {error.message}
      </div>
    );
  }

  /*
   * Ordena os dados por mês.
   * Como o formato é YYYY-MM, a ordenação textual funciona corretamente.
   */
  const sortedMonthlyRevenue = [...monthlyRevenue].sort((a, b) =>
    String(a.purchase_month).localeCompare(
      String(b.purchase_month),
    ),
  );

  const sortedForecastData = [...forecastData].sort((a, b) =>
    String(a.forecast_month).localeCompare(
      String(b.forecast_month),
    ),
  );

  /*
   * O primeiro mês do forecast é o mês seguinte ao fim do histórico.
   * O histórico exibido deve conter somente meses anteriores.
   */
  const firstForecastMonth =
    sortedForecastData.length > 0
      ? String(sortedForecastData[0].forecast_month).slice(0, 7)
      : '';

  const forecastMonthSet = new Set(
    sortedForecastData.map((item) =>
      String(item.forecast_month).slice(0, 7),
    ),
  );

  const historicalData = sortedMonthlyRevenue.filter((item) => {
    const purchaseMonth = String(item.purchase_month).slice(0, 7);
    const purchaseYear = Number(item.purchase_year);

    return (
      !forecastMonthSet.has(purchaseMonth) &&
      (!firstForecastMonth || purchaseMonth < firstForecastMonth) &&
      purchaseYear >= 2017
    );
  });

  /*
   * Receita histórica válida, excluindo valores zero,
   * nulos ou inválidos.
   */
  const historicalPositiveRevenues = historicalData
    .map((item) => Number(item.gross_revenue))
    .filter((value) => Number.isFinite(value) && value > 0);

  /*
   * KPI: maior receita mensal histórica
   */
  const maxHistoricalRevenue =
    historicalPositiveRevenues.length > 0
      ? Math.max(...historicalPositiveRevenues)
      : 0;

  /*
   * KPI: menor receita mensal histórica
   */
  const minHistoricalRevenue =
    historicalPositiveRevenues.length > 0
      ? Math.min(...historicalPositiveRevenues)
      : 0;

  /*
   * Crescimento médio mensal histórico
   */
  const monthlyGrowthRates = [];

  for (
    let index = 1;
    index < historicalPositiveRevenues.length;
    index += 1
  ) {
    const previousRevenue = historicalPositiveRevenues[index - 1];
    const currentRevenue = historicalPositiveRevenues[index];

    if (previousRevenue > 0) {
      const growthRate =
        (currentRevenue - previousRevenue) / previousRevenue;

      if (Number.isFinite(growthRate)) {
        monthlyGrowthRates.push(growthRate);
      }
    }
  }

  const averageMonthlyGrowth =
    monthlyGrowthRates.length > 0
      ? monthlyGrowthRates.reduce(
          (sum, rate) => sum + rate,
          0,
        ) / monthlyGrowthRates.length
      : null;

  /*
   * Receita projetada para o primeiro mês do forecast
   */
  const nextMonthForecast =
    sortedForecastData.length > 0
      ? Number(sortedForecastData[0].forecast_gross_revenue)
      : 0;

  /*
   * Período exibido no cabeçalho
   */
  const firstMonth =
    historicalData.length > 0
      ? historicalData[0].purchase_month
      : '';

  const lastMonth =
    sortedForecastData.length > 0
      ? sortedForecastData[sortedForecastData.length - 1]
          .forecast_month
      : '';

  /*
   * Dados históricos para o gráfico
   */
  const historicalChartData = historicalData.map((item) => {
    const revenue = Number(item.gross_revenue);

    return {
      month: item.purchase_month,
      historicalRevenue: Number.isFinite(revenue)
        ? revenue
        : undefined,
      forecastRevenue: undefined,
      lowerBound: undefined,
      upperBound: undefined,
      confidenceRange: undefined,
      type: 'Histórico',
    };
  });

  /*
   * Dados projetados para o gráfico
   */
  const projectedChartData = sortedForecastData.map((item) => {
    const forecastRevenue = Number(
      item.forecast_gross_revenue,
    );

    const lowerBound = Number(item.lower_bound);
    const upperBound = Number(item.upper_bound);

    return {
      month: item.forecast_month,
      historicalRevenue: undefined,
      forecastRevenue: Number.isFinite(forecastRevenue)
        ? forecastRevenue
        : undefined,
      lowerBound: Number.isFinite(lowerBound)
        ? lowerBound
        : undefined,
      upperBound: Number.isFinite(upperBound)
        ? upperBound
        : undefined,
      confidenceRange:
        Number.isFinite(lowerBound) && Number.isFinite(upperBound)
          ? upperBound - lowerBound
          : undefined,
      type: 'Projeção',
    };
  });

  /*
   * Dados unificados para o gráfico e tabela
   */
  const chartData = [
    ...historicalChartData,
    ...projectedChartData,
  ].sort((a, b) => String(a.month).localeCompare(String(b.month)));

  const filteredTableData = (() => {
    if (tableFilter === 'historical') {
      return chartData.filter((item) => item.type === 'Histórico');
    }

    if (tableFilter === 'projection') {
      return chartData.filter((item) => item.type === 'Projeção');
    }

    if (tableFilter === 'last12months') {
      return chartData.slice(-12);
    }

    return chartData;
  })();

  return (
    <>
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">ANÁLISE HISTÓRICA</p>
            <h2>KPIs de Evolução</h2>
          </div>

          <span className="section-meta">
            {formatMonthYear(firstMonth)} — {formatMonthYear(lastMonth)}
          </span>
        </div>

        <div className="kpi-grid">
          <KpiCard
            label="Maior Receita Mensal"
            value={formatCurrency(maxHistoricalRevenue)}
            accent="blue"
          />

          <KpiCard
            label="Menor Receita Mensal"
            value={formatCurrency(minHistoricalRevenue)}
            accent="orange"
          />

          <KpiCard
            label="Crescimento Médio Mensal"
            value={
              averageMonthlyGrowth !== null
                ? `${(
                    averageMonthlyGrowth * 100
                  ).toLocaleString('pt-BR', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}%`
                : '—'
            }
            accent="green"
          />

          <KpiCard
            label="Receita Próximo Mês"
            value={formatCurrency(nextMonthForecast)}
            accent="purple"
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">VISUALIZAÇÃO</p>
            <h2>Gráfico de Evolução</h2>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 85,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ccc"
              />

              <XAxis
                dataKey="month"
                tickFormatter={(tick) =>
                  formatMonthYear(tick)
                }
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />

              <YAxis
                width={85}
                tickFormatter={(tick) =>
                  formatCurrency(tick)
                }
                domain={['auto', 'auto']}
              />

              <Tooltip
                labelFormatter={(label) =>
                  formatMonthYear(label)
                }
                formatter={(value, name, item) => {
                  if (
                    name === 'Receita Histórica' ||
                    name === 'Receita Projetada'
                  ) {
                    return [
                      formatCurrency(value),
                      name,
                    ];
                  }

                  if (name === 'Faixa de Confiança') {
                    const dataPoint = item?.payload;

                    if (
                      dataPoint &&
                      Number.isFinite(dataPoint.lowerBound) &&
                      Number.isFinite(dataPoint.upperBound)
                    ) {
                      return [
                        `${formatCurrency(
                          dataPoint.lowerBound,
                        )} - ${formatCurrency(
                          dataPoint.upperBound,
                        )}`,
                        'Faixa de Confiança',
                      ];
                    }
                  }

                  return [
                    formatCurrency(value),
                    name,
                  ];
                }}
              />

              <Legend />

              {/* Base inferior invisível da faixa */}
              <Area
                type="monotone"
                dataKey="lowerBound"
                stackId="confidence"
                stroke="none"
                fill="transparent"
                fillOpacity={0}
                legendType="none"
                isAnimationActive={false}
                connectNulls={false}
              />

              {/* Área entre os limites inferior e superior */}
              <Area
                type="monotone"
                dataKey="confidenceRange"
                stackId="confidence"
                stroke="none"
                fill="#b8bec7"
                fillOpacity={0.35}
                name="Faixa de Confiança"
                isAnimationActive={false}
                connectNulls={false}
              />

              {/* Receita histórica */}
              <Line
                type="monotone"
                dataKey="historicalRevenue"
                stroke="#8884d8"
                strokeWidth={2}
                name="Receita Histórica"
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />

              {/* Receita projetada */}
              <Line
                type="monotone"
                dataKey="forecastRevenue"
                stroke="#82ca9d"
                strokeWidth={2}
                strokeDasharray="6 4"
                name="Receita Projetada"
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading table-section-heading">
          <div>
            <p className="section-kicker">DETALHAMENTO</p>
            <h2>Dados Detalhados</h2>
            <p className="section-description">
              Histórico e projeção mensal da receita bruta.
            </p>
          </div>

          <div className="table-filters">
            <button
              type="button"
              className={`filter-button ${
                tableFilter === 'all' ? 'active' : ''
              }`}
              onClick={() => setTableFilter('all')}
            >
              Todos
            </button>

            <button
              type="button"
              className={`filter-button ${
                tableFilter === 'historical' ? 'active' : ''
              }`}
              onClick={() => setTableFilter('historical')}
            >
              Histórico
            </button>

            <button
              type="button"
              className={`filter-button ${
                tableFilter === 'projection' ? 'active' : ''
              }`}
              onClick={() => setTableFilter('projection')}
            >
              Projeção
            </button>

            <button
              type="button"
              className={`filter-button ${
                tableFilter === 'last12months' ? 'active' : ''
              }`}
              onClick={() => setTableFilter('last12months')}
            >
              Últimos 12 meses
            </button>
          </div>
        </div>

        <div className="revenue-table-container">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Tipo</th>
                <th>Receita</th>
                <th>Limite Inferior</th>
                <th>Limite Superior</th>
                <th>Variação</th>
              </tr>
            </thead>

            <tbody>
              {filteredTableData.map((row) => {
                const currentRevenue =
                  row.historicalRevenue ?? row.forecastRevenue;

                const originalIndex = chartData.findIndex(
                  (item) =>
                    item.month === row.month &&
                    item.type === row.type,
                );

                const previousRow =
                  originalIndex > 0
                    ? chartData[originalIndex - 1]
                    : null;

                const previousRevenue = previousRow
                  ? previousRow.historicalRevenue ??
                    previousRow.forecastRevenue
                  : undefined;

                const variation =
                  Number.isFinite(currentRevenue) &&
                  Number.isFinite(previousRevenue) &&
                  previousRevenue !== 0
                    ? (currentRevenue - previousRevenue) /
                      previousRevenue
                    : undefined;

                const isProjection = row.type === 'Projeção';

                return (
                  <tr key={`${row.month}-${row.type}`}>
                    <td className="month-cell">
                      {formatMonthYear(row.month)}
                    </td>

                    <td>
                      <span
                        className={`data-type-badge ${
                          isProjection
                            ? 'projection-badge'
                            : 'historical-badge'
                        }`}
                      >
                        {isProjection ? 'Projeção' : 'Histórico'}
                      </span>
                    </td>

                    <td className="currency-cell">
                      {Number.isFinite(currentRevenue)
                        ? formatCurrency(currentRevenue)
                        : '—'}
                    </td>

                    <td className="currency-cell">
                      {isProjection &&
                      Number.isFinite(row.lowerBound)
                        ? formatCurrency(row.lowerBound)
                        : '—'}
                    </td>

                    <td className="currency-cell">
                      {isProjection &&
                      Number.isFinite(row.upperBound)
                        ? formatCurrency(row.upperBound)
                        : '—'}
                    </td>

                    <td
                      className={
                        Number.isFinite(variation)
                          ? variation >= 0
                            ? 'positive-variation'
                            : 'negative-variation'
                          : ''
                      }
                    >
                      {Number.isFinite(variation)
                        ? `${(variation * 100).toLocaleString(
                            'pt-BR',
                            {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            },
                          )}%`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function KpiCard({ label, value, accent }) {
  return (
    <article className={`kpi-card kpi-${accent}`}>
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
    </article>
  );
}

export default RevenueEvolution;