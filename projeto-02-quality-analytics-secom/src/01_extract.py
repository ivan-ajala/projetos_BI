"""
================================================================================
Projeto 02 – Manufacturing Quality Analytics (UCI SECOM Dataset)
================================================================================
Script  : 01_extract.py
Objetivo: Carregar os arquivos brutos do dataset UCI SECOM (secom.data e
          secom_labels.data), unir em um único DataFrame estruturado e
          salvar como CSV intermediário para a etapa de transformação.

Dataset : UCI SECOM Dataset
          https://archive.ics.uci.edu/ml/datasets/SECOM

Autor   : Ivan Ajala
GitHub  : https://github.com/ivan-ajala/projetos_BI
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


# ── Caminhos dos arquivos ─────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR        = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DIR  = os.path.join(BASE_DIR, "data", "processed")

SECOM_DATA     = os.path.join(RAW_DIR, "secom.data")
SECOM_LABELS   = os.path.join(RAW_DIR, "secom_labels.data")
OUTPUT_FILE    = os.path.join(PROCESSED_DIR, "secom_raw_combined.csv")


# ── Funções ───────────────────────────────────────────────────────────────────

def check_files_exist() -> None:
    """
    Verifica se os arquivos brutos existem antes de prosseguir.
    Interrompe a execução com mensagem clara caso algum esteja ausente.
    """
    for filepath in [SECOM_DATA, SECOM_LABELS]:
        if not os.path.exists(filepath):
            logger.error(f"Arquivo não encontrado: {filepath}")
            logger.error(
                "Baixe o dataset em: "
                "https://archive.ics.uci.edu/ml/datasets/SECOM"
            )
            raise FileNotFoundError(f"Arquivo ausente: {filepath}")
    logger.info("Arquivos brutos localizados com sucesso.")


def load_sensor_data() -> pd.DataFrame:
    """
    Carrega secom.data – leituras dos sensores.
    591 colunas de features (sem header no arquivo original).
    Valores faltantes representados como 'NaN' no arquivo.

    Returns:
        pd.DataFrame com 1567 linhas e 591 colunas de sensores.
    """
    logger.info("Carregando secom.data (leituras dos sensores)...")

    df = pd.read_csv(
        SECOM_DATA,
        sep=" ",
        header=None,
        na_values="NaN"
    )

    # Nomeia colunas como Sensor_001, Sensor_002, ..., Sensor_591
    df.columns = [f"Sensor_{str(i+1).zfill(3)}" for i in range(df.shape[1])]

    logger.info(f"secom.data carregado: {df.shape[0]} linhas | {df.shape[1]} colunas")
    return df


def load_labels() -> pd.DataFrame:
    """
    Carrega secom_labels.data – resultado da inspeção e timestamp.
    Colunas originais: Label (-1 = FAIL, 1 = PASS) e Timestamp.

    Returns:
        pd.DataFrame com colunas: Label, Timestamp, Result.
    """
    logger.info("Carregando secom_labels.data (labels PASS/FAIL + timestamp)...")

    df_labels = pd.read_csv(
        SECOM_LABELS,
        sep=" ",
        header=None,
        names=["Label", "Timestamp"]
    )

    # Converte timestamp para datetime
    df_labels["Timestamp"] = pd.to_datetime(
        df_labels["Timestamp"],
        format="%d/%m/%Y %H:%M:%S",
        errors="coerce"
    )

    # Cria coluna legível: PASS / FAIL
    df_labels["Result"] = df_labels["Label"].map({1: "PASS", -1: "FAIL"})

    logger.info(
        f"secom_labels.data carregado: {df_labels.shape[0]} linhas | "
        f"PASS: {(df_labels['Result'] == 'PASS').sum()} | "
        f"FAIL: {(df_labels['Result'] == 'FAIL').sum()}"
    )
    return df_labels


def combine_data(df_sensors: pd.DataFrame, df_labels: pd.DataFrame) -> pd.DataFrame:
    """
    Une DataFrame de sensores com labels e timestamp em um único DataFrame.
    Adiciona coluna de índice de unidade produzida (Unit_ID).

    Args:
        df_sensors : DataFrame com leituras dos sensores.
        df_labels  : DataFrame com Label, Timestamp e Result.

    Returns:
        pd.DataFrame combinado e ordenado cronologicamente.
    """
    logger.info("Combinando sensores e labels...")

    df = pd.concat([df_labels.reset_index(drop=True),
                    df_sensors.reset_index(drop=True)], axis=1)

    # Adiciona identificador sequencial de unidade produzida
    df.insert(0, "Unit_ID", range(1, len(df) + 1))

    # Ordena por timestamp
    df = df.sort_values("Timestamp").reset_index(drop=True)

    logger.info(f"DataFrame combinado: {df.shape[0]} linhas | {df.shape[1]} colunas")
    return df


def summarize(df: pd.DataFrame) -> None:
    """
    Exibe um resumo do DataFrame extraído:
    shape, distribuição de classes, missing values e intervalo de datas.
    """
    total       = len(df)
    pass_count  = (df["Result"] == "PASS").sum()
    fail_count  = (df["Result"] == "FAIL").sum()
    missing     = df.isnull().sum().sum()
    missing_pct = (missing / (df.shape[0] * df.shape[1])) * 100

    logger.info("=" * 60)
    logger.info("RESUMO DA EXTRAÇÃO")
    logger.info("=" * 60)
    logger.info(f"Total de unidades  : {total}")
    logger.info(f"PASS               : {pass_count} ({pass_count/total*100:.1f}%)")
    logger.info(f"FAIL               : {fail_count} ({fail_count/total*100:.1f}%)")
    logger.info(f"Colunas (features) : {df.shape[1]}")
    logger.info(f"Missing values     : {missing} ({missing_pct:.1f}% do total)")
    logger.info(f"Período            : {df['Timestamp'].min()} → {df['Timestamp'].max()}")
    logger.info("=" * 60)


def save_output(df: pd.DataFrame) -> None:
    """
    Salva o DataFrame combinado como CSV na pasta /data/processed.
    Cria a pasta se não existir.
    """
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    logger.info(f"Arquivo salvo em: {OUTPUT_FILE}")


# ── Pipeline principal ────────────────────────────────────────────────────────

def main():
    logger.info("Iniciando pipeline de extração – UCI SECOM Dataset")
    logger.info(f"Timestamp de execução: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    check_files_exist()

    df_sensors = load_sensor_data()
    df_labels  = load_labels()
    df         = combine_data(df_sensors, df_labels)

    summarize(df)
    save_output(df)

    logger.info("Extração concluída com sucesso. Próximo passo: 02_transform.py")


if __name__ == "__main__":
    main()