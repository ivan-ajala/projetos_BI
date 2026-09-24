"""Valida a estrutura do CSV PaySim sem alterar o arquivo bruto."""
from pathlib import Path
import argparse
import pandas as pd

REQUIRED_COLUMNS = {
    'step','type','amount','nameOrig','oldbalanceOrg','newbalanceOrig',
    'nameDest','oldbalanceDest','newbalanceDest','isFraud','isFlaggedFraud'
}
DEFAULT_INPUT = Path(__file__).resolve().parents[2] / 'data' / 'raw'

def find_csv(location: Path) -> Path:
    if location.is_file():
        return location
    matches = sorted(location.glob('PS_20174392719_*.csv')) + sorted(location.glob('paysim*.csv'))
    if not matches:
        matches = sorted(location.glob('*.csv'))
    if len(matches) != 1:
        raise FileNotFoundError(f'Esperava exatamente um CSV em {location}; encontrados: {len(matches)}')
    return matches[0]

def validate_csv(path: Path) -> dict:
    # Lê só o cabeçalho antes da leitura integral, para falhar cedo se a entrada estiver errada.
    columns = pd.read_csv(path, nrows=0).columns
    missing = REQUIRED_COLUMNS.difference(columns)
    if missing:
        raise ValueError(f'Colunas ausentes: {sorted(missing)}')
    df = pd.read_csv(path)
    return {
        'arquivo': str(path), 'linhas': len(df), 'colunas': len(df.columns),
        'ausentes': int(df.isna().sum().sum()), 'duplicatas': int(df.duplicated().sum()),
        'fraudes': int(df['isFraud'].sum()), 'taxa_fraude_pct': float(df['isFraud'].mean()*100),
        'tipos': sorted(df['type'].dropna().astype(str).unique().tolist()),
    }

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, default=DEFAULT_INPUT, help='CSV ou pasta data/raw')
    args = parser.parse_args()
    path = find_csv(args.input)
    result = validate_csv(path)
    for key, value in result.items():
        print(f'{key}: {value}')
    print('Validação concluída. Nenhum dado foi alterado ou copiado.')

if __name__ == '__main__':
    main()
