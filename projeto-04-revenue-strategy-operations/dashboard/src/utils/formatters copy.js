export function formatCurrency(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR").format(numericValue);
}

export function formatPercent(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue / 100); // Divide por 100 porque o valor já vem em percentual (ex: 50 para 50%)
}

export function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }
  const [year, month] = dateString.split("-");
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1));
}

export function formatMonthYear(dateString) {
  if (!dateString) {
    return "—";
  }
  const [year, month] = dateString.split("-");
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  }).format(new Date(year, month - 1));
}