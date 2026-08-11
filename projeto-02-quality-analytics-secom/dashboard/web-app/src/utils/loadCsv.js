import Papa from 'papaparse';

export async function loadCsv(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Não foi possível carregar o arquivo: ${path}`);
  }

  const text = await response.text();

  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (result.errors.length > 0) {
    console.warn(`Avisos ao ler ${path}:`, result.errors);
  }

  return result.data.map((row) => {
    const normalizedRow = { ...row };

    if (normalizedRow[''] !== undefined) {
      normalizedRow.sensor = normalizedRow[''];
      delete normalizedRow[''];
    }

    return normalizedRow;
  });
}
