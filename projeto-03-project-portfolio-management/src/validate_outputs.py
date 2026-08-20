from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]
PROCESSED_DIR = BASE_DIR / "data" / "processed"


def validate_file(
    path: Path,
    expected_rows: int,
    expected_columns: int | None = None,
) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(
            f"Arquivo não encontrado: {path}"
        )

    data = pd.read_csv(path)

    if len(data) != expected_rows:
        raise AssertionError(
            f"{path.name}: esperado {expected_rows} registros; "
            f"encontrado {len(data)}."
        )

    if expected_columns is not None:
        if data.shape[1] != expected_columns:
            raise AssertionError(
                f"{path.name}: esperado {expected_columns} colunas; "
                f"encontrado {data.shape[1]}."
            )

    return data


analytics = validate_file(
    PROCESSED_DIR / "project_analytics.csv",
    expected_rows=530,
    expected_columns=41,
)

monthly_snapshot = validate_file(
    PROCESSED_DIR / "monthly_portfolio_snapshot.csv",
    expected_rows=80,
)

risk_scores = validate_file(
    PROCESSED_DIR / "project_risk_scores.csv",
    expected_rows=530,
    expected_columns=49,
)

assert analytics["project_id"].nunique() == 530
assert risk_scores["project_id"].nunique() == 530

assert (
    analytics["schedule_risk_flag"]
    .isna()
    .sum()
    == 170
)

assert (
    analytics["cost_risk_flag"]
    .isna()
    .sum()
    == 170
)

assert (
    risk_scores["risk_cluster"]
    .notna()
    .sum()
    == 360
)

assert (
    risk_scores["risk_cluster"]
    .isna()
    .sum()
    == 170
)

assert (
    risk_scores["cluster_profile"]
    .notna()
    .sum()
    == 360
)

for column in [
    "predicted_schedule_risk_proba",
    "predicted_cost_risk_proba",
]:
    assert risk_scores[column].between(0, 1).all(), (
        f"Valores inválidos na coluna {column}."
    )


print("Todos os arquivos foram validados com sucesso.")
print(f"Analytics: {analytics.shape}")
print(f"Snapshot mensal: {monthly_snapshot.shape}")
print(f"Scores de risco: {risk_scores.shape}")