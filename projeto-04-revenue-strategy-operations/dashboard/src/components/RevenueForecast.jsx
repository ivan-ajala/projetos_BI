import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import Papa from "papaparse"; // Certifique-se de ter o papaparse instalado: npm install papaparse

// Funções de formatação (podem ser importadas de src/utils/formatters.js se já existirem lá)
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatMonth = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Valida se a data é válida antes de formatar
  if (isNaN(date.getTime())) {
    return "Data Inválida";
  }
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
};

const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  return new Intl.NumberFormat("pt-BR").format(value);
};

// Função auxiliar para parsear CSV (se já tiver em src/utils/csvParser.js, pode importar)
const parseCsv = (csvString) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Função para converter valores para número, tratando null/undefined/vazio como null
const toOptionalNumber = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
};

const RevenueForecast = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [historicalResponse, forecastResponse] = await Promise.all([
        fetch("/data/monthly_revenue.csv"),
        fetch("/data/revenue_forecast.csv"),
      ]);

      if (!historicalResponse.ok)
        throw new Error(
          `Erro ao carregar histórico: ${historicalResponse.statusText}`
        );
      if (!forecastResponse.ok)
        throw new Error(
          `Erro ao carregar forecast: ${forecastResponse.statusText}`
        );

      const historicalCsv = await historicalResponse.text();
      const forecastCsv = await forecastResponse.text();

      const parsedHistorical = await parseCsv(historicalCsv);
      const parsedForecast = await parseCsv(forecastCsv);

      // Processar dados históricos
      const processedHistorical = parsedHistorical
        .map((row) => ({
          purchase_month: row.purchase_month,
          gross_revenue: toOptionalNumber(row.gross_revenue),
        }))
        .filter((row) => row.gross_revenue !== null) // Remove linhas com receita nula/inválida
        .sort((a, b) => new Date(a.purchase_month) - new Date(b.purchase_month));

      // Processar dados do forecast
      const processedForecast = parsedForecast
        .map((row) => ({
          forecast_month: row.forecast_month,
          forecast_gross_revenue: toOptionalNumber(row.forecast_gross_revenue),
          lower_bound: toOptionalNumber(row.lower_bound),
          upper_bound: toOptionalNumber(row.upper_bound),
          model_used: row.model_used,
          training_window_start: row.training_window_start,
          training_window_end: row.training_window_end,
          approximate_error_rmse: toOptionalNumber(row.approximate_error_rmse),
        }))
        .filter((row) => row.forecast_gross_revenue !== null) // Remove linhas com forecast nulo/inválido
        .sort((a, b) => new Date(a.forecast_month) - new Date(b.forecast_month));

      if (processedForecast.length > 0) {
        setModelInfo({
          model_used: processedForecast[0].model_used,
          training_window_start: processedForecast[0].training_window_start,
          training_window_end: processedForecast[0].training_window_end,
          approximate_error_rmse: processedForecast[0].approximate_error_rmse,
        });
      }

      // Filtrar dados históricos para ir até o final da janela de treinamento do modelo
      // Isso evita a inclusão dos meses anômalos de set/out 2018 no histórico do gráfico
      const trainingEndDate = modelInfo?.training_window_end
        ? new Date(modelInfo.training_window_end)
        : null;

      const filteredHistorical = trainingEndDate
        ? processedHistorical.filter(
            (row) => new Date(row.purchase_month) <= trainingEndDate
          )
        : processedHistorical; // Se não tiver info do modelo, usa todo o histórico

      setHistoricalData(filteredHistorical);
      setForecastData(processedForecast);
    } catch (err) {
      console.error("Erro ao carregar dados do forecast:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [modelInfo]); // Adiciona modelInfo como dependência para re-executar se mudar

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="revenue-forecast-container">Carregando projeção...</div>;
  }

  if (error) {
    return (
      <div className="revenue-forecast-container error">
        Erro ao carregar projeção: {error.message}
      </div>
    );
  }

  if (!modelInfo || forecastData.length === 0) {
    return (
      <div className="revenue-forecast-container">
        Nenhum dado de projeção disponível.
      </div>
    );
  }

  // Combinar dados para o gráfico
  const chartData = historicalData.map((d) => ({
    month: d.purchase_month,
    "Receita Histórica": d.gross_revenue,
    "Projeção": null, // Inicialmente nulo para não conectar
    "lower_bound": null,
    "upper_bound": null,
  }));

  forecastData.forEach((d) => {
    chartData.push({
      month: d.forecast_month,
      "Receita Histórica": null, // Nulo para não conectar com o histórico
      "Projeção": d.forecast_gross_revenue,
      "lower_bound": d.lower_bound,
      "upper_bound": d.upper_bound,
    });
  });

  // Ordenar os dados combinados por mês
  chartData.sort((a, b) => new Date(a.month) - new Date(b.month));

  // Identificar o último mês do histórico para desenhar a linha tracejada a partir dele
  const lastHistoricalMonth = historicalData.length > 0
    ? historicalData[historicalData.length - 1].purchase_month
    : null;

  return (
    <div className="revenue-forecast-container">
      <div className="revenue-forecast-info">
        <p>
          <strong>Modelo utilizado:</strong> {modelInfo.model_used}
        </p>
        <p>
          <strong>Período de treinamento:</strong>{" "}
          {formatMonth(modelInfo.training_window_start)} a{" "}
          {formatMonth(modelInfo.training_window_end)}
        </p>
        <p>
          <strong>Erro aproximado (RMSE):</strong>{" "}
          {formatCurrency(modelInfo.approximate_error_rmse)}
        </p>
        {modelInfo.model_used === "Média móvel - 3 meses" && (
          <p className="revenue-forecast-note">
            * A projeção utiliza a média móvel dos três últimos meses disponíveis. Como o modelo selecionado é um baseline sem tendência ou sazonalidade, o mesmo valor estimado é repetido ao longo do horizonte projetado.
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            minTickGap={30}
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#666"
          />
          <YAxis
            tickFormatter={formatCurrency}
            width={100}
            stroke="#666"
          />
          <Tooltip
            formatter={(value, name) => [formatCurrency(value), name]}
            labelFormatter={formatMonth}
          />
          <Legend />

          {/* Faixa de confiança (Area) - só aparece se houver dados válidos */}
          {forecastData.some(d => d.lower_bound !== null && d.upper_bound !== null) && (
            <Area
              type="monotone"
              dataKey="upper_bound"
              stroke="none"
              fill="#d3e0f0"
              fillOpacity={0.5}
              isAnimationActive={false}
            />
          )}
          {forecastData.some(d => d.lower_bound !== null && d.upper_bound !== null) && (
            <Area
              type="monotone"
              dataKey="lower_bound"
              stroke="none"
              fill="#ffffff" // Preenche a área entre lower e upper
              fillOpacity={1}
              isAnimationActive={false}
            />
          )}

          {/* Linha da Receita Histórica */}
          <Line
            type="monotone"
            dataKey="Receita Histórica"
            stroke="#6867d9"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />

          {/* Linha da Projeção - tracejada e verde */}
          <Line
            type="monotone"
            dataKey="Projeção"
            stroke="#319b67"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="revenue-forecast-table-container">
        <h3>Detalhes da Projeção</h3>
        <table className="revenue-forecast-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Receita Projetada</th>
              <th>Limite Inferior</th>
              <th>Limite Superior</th>
            </tr>
          </thead>
          <tbody>
            {forecastData.map((row, index) => (
              <tr key={index}>
                <td>{formatMonth(row.forecast_month)}</td>
                <td>{formatCurrency(row.forecast_gross_revenue)}</td>
                <td>{row.lower_bound !== null ? formatCurrency(row.lower_bound) : "N/A"}</td>
                <td>{row.upper_bound !== null ? formatCurrency(row.upper_bound) : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueForecast;