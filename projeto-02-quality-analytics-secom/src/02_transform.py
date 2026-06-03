"""
================================================================================
Projeto 02 – Manufacturing Quality Analytics (UCI SECOM Dataset)
================================================================================
Script  : 02_transform.py
Objetivo: Limpar e preparar o dataset combinado (secom_raw_combined.csv)
          para análise e uso no Tableau:
          - Remover sensores com >50% de missing values
          - Imputar missing values remanescentes pela mediana
          - Salvar base final tratada (secom_clean.csv)

Input   : data/processed/secom_raw_combined.csv
Output  : data/processed/secom_clean.csv

Autor   : Ivan Ajala
================================================================================
"""

import pandas as pd
import os
import logging
from datetime import datetime

# ── Configuração de logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


# ── Caminhos ──────────────────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR  = os.path.join(BASE_DIR, "data", "processed")

INPUT_FILE     = os.path.join(PROCESSED_DIR, "secom_raw_combined.csv")
OUTPUT_FILE    = os.path.join(PROCESSED_DIR, "secom_clean.csv")


# ── Funções ───────────────────────────────────────────────────────────────────

def load_raw_data() -> pd.DataFrame:
    """
    Carrega o dataset combinado gerado em 01_extract.py.
    """
    if not os.path.exists(INPUT_FILE):
        logger.error(f"Arquivo de entrada não encontrado: {INPUT_FILE}")
        raise FileNotFoundError(f"Arquivo ausente: {INPUT_FILE}")

    df = pd.read_csv(INPUT_FILE)
    logger.info(
        f"Dados brutos carregados: {df.shape[0]} linhas | {df.shape[1]} colunas"
    )
    return df


def remove_high_missing_columns(df: pd.DataFrame,
                                threshold: float = 0.50) -> pd.DataFrame:
    """
    Remove colunas de sensores com percentual de missing acima do threshold.

    Args:
        df        : DataFrame original.
        threshold : Limite máximo permitido de missing (ex.: 0.50 = 50%).

    Returns:
        DataFrame com colunas de sensores filtradas.
    """
    sensor_cols = [c for c in df.columns if c.startswith("Sensor_")]

    # Percentual de missing por sensor
    missing_pct = df[sensor_cols].isnull().mean()

    # Colunas a manter (<= threshold de missing)
    keep_cols = missing_pct[missing_pct <= threshold].index.tolist()
    drop_cols = missing_pct[missing_pct > threshold].index.tolist()

    logger.info(
        f"Sensores totais             : {len(sensor_cols)}\n"
        f"Sensores removidos (> {threshold*100:.0f}% missing): {len(drop_cols)}\n"
        f"Sensores mantidos           : {len(keep_cols)}"
    )

    # Monta lista final de colunas: não-sensores + sensores mantidos
    non_sensor_cols = [c for c in df.columns if not c.startswith("Sensor_")]
    final_cols      = non_sensor_cols + keep_cols

    df_filtered = df[final_cols].copy()
    return df_filtered


def impute_missing_with_median(df: pd.DataFrame) -> pd.DataFrame:
    """
    Imputa valores faltantes dos sensores pela mediana de cada coluna.
    Não altera colunas de identificação ou categóricas (Unit_ID, Label, Result, Timestamp).

    Returns:
        DataFrame com NaNs imputados.
    """
    df_imputed = df.copy()

    sensor_cols = [c for c in df.columns if c.startswith("Sensor_")]

    missing_before = df_imputed[sensor_cols].isnull().sum().sum()
    logger.info(f"Missing values (sensores) antes da imputação: {missing_before}")

    # Medianas por sensor
    medians = df_imputed[sensor_cols].median()

    # Imputação
    df_imputed[sensor_cols] = df_imputed[sensor_cols].fillna(medians)

    missing_after = df_imputed[sensor_cols].isnull().sum().sum()
    logger.info(f"Missing values (sensores) após imputação: {missing_after}")

    return df_imputed


def summarize(df_before: pd.DataFrame, df_after: pd.DataFrame) -> None:
    """
    Exibe resumo da transformação:
    - Shape antes/depois
    - Quantidade de sensores antes/depois
    - Estatísticas básicas das colunas de sensores
    """
    sensor_cols_before = [c for c in df_before.columns if c.startswith("Sensor_")]
    sensor_cols_after  = [c for c in df_after.columns if c.startswith("Sensor_")]

    logger.info("=" * 60)
    logger.info("RESUMO DA TRANSFORMAÇÃO")
    logger.info("=" * 60)
    logger.info(f"Shape antes : {df_before.shape[0]} linhas | {df_before.shape[1]} colunas")
    logger.info(f"Shape depois: {df_after.shape[0]} linhas | {df_after.shape[1]} colunas")
    logger.info(f"Sensores antes : {len(sensor_cols_before)}")
    logger.info(f"Sensores depois: {len(sensor_cols_after)}")
    logger.info("=" * 60)


def save_output(df: pd.DataFrame) -> None:
    """
    Salva o DataFrame tratado como CSV em secom_clean.csv.
    """
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    logger.info(f"Arquivo final salvo em: {OUTPUT_FILE}")


# ── Pipeline principal ────────────────────────────────────────────────────────

def main():
    logger.info("Iniciando pipeline de transformação – UCI SECOM Dataset")
    logger.info(f"Timestamp de execução: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Carrega base bruta combinada
    df_raw = load_raw_data()

    # Remove sensores com >50% de missing
    df_filtered = remove_high_missing_columns(df_raw, threshold=0.50)

    # Imputa missing remanescente pela mediana
    df_clean = impute_missing_with_median(df_filtered)

    # Resumo
    summarize(df_raw, df_clean)

    # Salva output
    save_output(df_clean)

    logger.info("Transformação concluída com sucesso. Próximo passo: 03_analysis.py")


if __name__ == "__main__":
    main()