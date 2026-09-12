// src/utils/csvParser.js

export function parseCsv(csvText) {
  const lines = csvText
    .trim()
    .split('\n')
    .filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const headers = splitCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);

    const row = headers.reduce((result, header, index) => {
      result[header] = values[index] ?? '';
      return result;
    }, {});

    // Converte valores numéricos para Number onde aplicável
    // Baseado nos cabeçalhos que você forneceu
    return {
      ...row,
      orders: Number(row.orders),
      delivered_orders: Number(row.delivered_orders),
      product_revenue: Number(row.product_revenue),
      freight_revenue: Number(row.freight_revenue),
      gross_revenue: Number(row.gross_revenue),
      delivered_gross_value: Number(row.delivered_gross_value),
      payment_total: Number(row.payment_total),
      late_orders: Number(row.late_orders),
      customers: Number(row.customers),
      average_ticket: Number(row.average_ticket),
      delivered_average_ticket: Number(row.delivered_average_ticket),
      revenue_per_customer: Number(row.revenue_per_customer),
      delivery_rate: Number(row.delivery_rate),
      late_order_rate: Number(row.late_order_rate),
      revenue_growth_mom: Number(row.revenue_growth_mom),
      orders_growth_mom: Number(row.orders_growth_mom),
      orders_ratio_to_median: Number(row.orders_ratio_to_median),
      // Para o forecast
      forecast_gross_revenue: Number(row.forecast_gross_revenue),
      lower_bound: Number(row.lower_bound),
      upper_bound: Number(row.upper_bound),
      approximate_error_rmse: Number(row.approximate_error_rmse),
    };
  });
}

function splitCsvLine(line) {
  // Assume que o separador é vírgula e trata aspas duplas se houver
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  return line.split(regex).map((value) => value.trim().replace(/^"|"$/g, ''));
}