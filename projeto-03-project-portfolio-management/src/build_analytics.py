"""
build_analytics.py

Cria as tabelas analíticas do portfólio de projetos:

1. data/processed/project_analytics.csv
2. data/processed/monthly_portfolio_snapshot.csv
"""

from pathlib import Path

import numpy as np
import pandas as pd


# ==============================================================
# CONFIGURAÇÕES
# ==============================================================

REFERENCE_DATE = pd.Timestamp("2026-08-18")

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = BASE_DIR / "data" / "raw" / "projects.csv"
OUTPUT_DIR = BASE_DIR / "data" / "processed"

PROJECT_ANALYTICS_FILE = OUTPUT_DIR / "project_analytics.csv"
MONTHLY_SNAPSHOT_FILE = OUTPUT_DIR / "monthly_portfolio_snapshot.csv"


# ==============================================================
# LEITURA E PREPARAÇÃO
# ==============================================================

def load_projects():
    """Lê e prepara a base principal de projetos."""

    df = pd.read_csv(INPUT_FILE)

    date_columns = [
        "planned_start_date",
        "planned_end_date",
        "actual_start_date",
        "actual_end_date",
    ]

    for column in date_columns:
        df[column] = pd.to_datetime(
            df[column],
            errors="coerce",
        )

    numeric_columns = [
        "planned_budget",
        "actual_cost",
        "planned_hours",
        "actual_hours",
        "team_size",
        "final_quality_score",
        "client_satisfaction_score",
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

    return df


# ==============================================================
# MÉTRICAS POR PROJETO
# ==============================================================

def build_project_analytics(df):
    """Cria métricas analíticas em nível de projeto."""

    analytics = df.copy()

    analytics["planned_duration_days"] = (
        analytics["planned_end_date"]
        - analytics["planned_start_date"]
    ).dt.days

    analytics["actual_duration_days"] = (
        analytics["actual_end_date"]
        - analytics["actual_start_date"]
    ).dt.days

    analytics["schedule_variance_days"] = np.where(
        analytics["actual_duration_days"].notna(),
        analytics["actual_duration_days"]
        - analytics["planned_duration_days"],
        np.nan,
    )

    analytics["cost_variance"] = (
        analytics["actual_cost"]
        - analytics["planned_budget"]
    )

    analytics["cost_variance_pct"] = np.where(
        analytics["planned_budget"] > 0,
        analytics["cost_variance"]
        / analytics["planned_budget"]
        * 100,
        np.nan,
    )

    analytics["hours_variance"] = (
        analytics["actual_hours"]
        - analytics["planned_hours"]
    )

    analytics["hours_variance_pct"] = np.where(
        analytics["planned_hours"] > 0,
        analytics["hours_variance"]
        / analytics["planned_hours"]
        * 100,
        np.nan,
    )

    analytics["is_completed"] = (
        analytics["project_status"] == "Completed"
    )

    analytics["is_cancelled"] = (
        analytics["project_status"] == "Cancelled"
    )

    analytics["is_active_current"] = analytics[
        "project_status"
    ].isin(
        [
            "In Progress",
            "On Hold",
        ]
    )

    analytics["is_pipeline"] = (
        analytics["project_status"] == "Planned"
    )

    analytics["completed_on_time"] = np.where(
        analytics["is_completed"],
        analytics["actual_end_date"]
        <= analytics["planned_end_date"],
        np.nan,
    )

    analytics["completed_within_budget"] = np.where(
        analytics["is_completed"],
        analytics["actual_cost"]
        <= analytics["planned_budget"],
        np.nan,
    )

    analytics["schedule_risk_flag"] = np.where(
        analytics["schedule_variance_days"] > 0,
        1,
        0,
    )

    analytics["cost_risk_flag"] = np.where(
        analytics["cost_variance"] > 0,
        1,
        0,
    )

    analytics["quality_band"] = pd.cut(
        analytics["final_quality_score"],
        bins=[
            0,
            5,
            7,
            8.5,
            10,
        ],
        labels=[
            "Critical",
            "Needs Improvement",
            "Good",
            "Excellent",
        ],
        include_lowest=True,
    )

    analytics["start_year"] = (
        analytics["planned_start_date"].dt.year
    )

    analytics["start_month"] = (
        analytics["planned_start_date"].dt.month
    )

    analytics["start_month_name"] = (
        analytics["planned_start_date"].dt.month_name()
    )

    return analytics


# ==============================================================
# SNAPSHOT MENSAL
# ==============================================================

def build_monthly_snapshot(df):
    """
    Cria uma linha por mês entre janeiro de 2020
    e agosto de 2026.

    A simultaneidade é calculada com base na interseção
    entre o período planejado de cada projeto e o mês analisado.
    """

    months = pd.date_range(
        start="2020-01-01",
        end=REFERENCE_DATE,
        freq="MS",
    )

    records = []

    for month_start in months:
        month_end = (
            month_start
            + pd.offsets.MonthEnd(0)
        )

        month_end = min(
            month_end,
            REFERENCE_DATE,
        )

        starts_mask = (
            (df["planned_start_date"] >= month_start)
            & (df["planned_start_date"] <= month_end)
        )

        planned_endings_mask = (
            (df["planned_end_date"] >= month_start)
            & (df["planned_end_date"] <= month_end)
        )

        completed_mask = (
            df["actual_end_date"].notna()
            & (df["actual_end_date"] >= month_start)
            & (df["actual_end_date"] <= month_end)
            & (df["project_status"] == "Completed")
        )

        cancelled_mask = (
            df["actual_end_date"].notna()
            & (df["actual_end_date"] >= month_start)
            & (df["actual_end_date"] <= month_end)
            & (df["project_status"] == "Cancelled")
        )

        active_planned_mask = (
            (df["planned_start_date"] <= month_end)
            & (df["planned_end_date"] >= month_start)
        )

        active_current_mask = (
            active_planned_mask
            & df["project_status"].isin(
                [
                    "In Progress",
                    "On Hold",
                ]
            )
        )

        pipeline_mask = (
            active_planned_mask
            & (df["project_status"] == "Planned")
        )

        active_projects = df.loc[
            active_planned_mask
        ]

        completed_projects = df.loc[
            completed_mask
        ]

        records.append(
            {
                "month_start": month_start.date(),
                "month_end": month_end.date(),
                "year": month_start.year,
                "month": month_start.month,
                "month_name": month_start.month_name(),
                "projects_starting": int(starts_mask.sum()),
                "projects_planned_ending": int(
                    planned_endings_mask.sum()
                ),
                "projects_completed": int(
                    completed_mask.sum()
                ),
                "projects_cancelled": int(
                    cancelled_mask.sum()
                ),
                "active_planned_projects": int(
                    active_planned_mask.sum()
                ),
                "active_current_projects": int(
                    active_current_mask.sum()
                ),
                "pipeline_projects": int(
                    pipeline_mask.sum()
                ),
                "active_planned_budget": round(
                    active_projects["planned_budget"].sum(),
                    2,
                ),
                "active_actual_cost": round(
                    active_projects["actual_cost"].sum(),
                    2,
                ),
                "completed_budget": round(
                    completed_projects["planned_budget"].sum(),
                    2,
                ),
                "completed_actual_cost": round(
                    completed_projects["actual_cost"].sum(),
                    2,
                ),
                "average_team_size_active": round(
                    active_projects["team_size"].mean(),
                    2,
                )
                if not active_projects.empty
                else 0,
            }
        )

    return pd.DataFrame(records)


# ==============================================================
# EXECUÇÃO
# ==============================================================

def main():
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    df = load_projects()

    project_analytics = build_project_analytics(df)

    monthly_snapshot = build_monthly_snapshot(df)

    project_analytics.to_csv(
        PROJECT_ANALYTICS_FILE,
        index=False,
    )

    monthly_snapshot.to_csv(
        MONTHLY_SNAPSHOT_FILE,
        index=False,
    )

    print("Tabelas analíticas criadas com sucesso.")
    print()
    print(f"Projetos analisados: {len(project_analytics)}")
    print(
        "Meses analisados: "
        f"{len(monthly_snapshot)}"
    )
    print()
    print(
        f"Arquivo: {PROJECT_ANALYTICS_FILE}"
    )
    print(
        f"Arquivo: {MONTHLY_SNAPSHOT_FILE}"
    )
    print()
    print("Pico de projetos planejados simultaneamente:")
    print(
        monthly_snapshot[
            "active_planned_projects"
        ].max()
    )
    print()
    print("Média mensal de projetos planejados ativos:")
    print(
        round(
            monthly_snapshot[
                "active_planned_projects"
            ].mean(),
            2,
        )
    )


if __name__ == "__main__":
    main()
