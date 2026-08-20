"""
generate_projects.py

Gera a tabela principal de projetos (projects.csv) para o
Projeto 03 - Project Portfolio Management Analytics.

Base sintética criada para fins de portfólio profissional.

Escopo:
- Histórico de projetos de 2020 até 2026;
- Aproximadamente 530 projetos;
- 2026 limitado à data de referência definida;
- Sazonalidade mensal;
- Variação anual de volume;
- Status históricos e atuais;
- Dados preparados para análises de BI, Analytics e Ciência de Dados.
"""

from datetime import timedelta

import numpy as np
import pandas as pd
from faker import Faker


# ==============================================================
# CONFIGURAÇÕES GERAIS
# ==============================================================

SEED = 42
N_PROJECTS = 530

START_YEAR = 2020
END_YEAR = 2026
REFERENCE_DATE = pd.Timestamp("2026-08-18")

np.random.seed(SEED)

fake = Faker("pt_BR")
Faker.seed(SEED)


# ==============================================================
# DIMENSÕES DO NEGÓCIO
# ==============================================================

BUSINESS_UNITS = [
    "Retail",
    "Finance",
    "Healthcare",
    "Manufacturing",
    "Technology",
    "Energy",
]

PROJECT_TYPES = [
    "Implementation",
    "Migration",
    "Upgrade",
    "Integration",
    "New Development",
    "Consulting",
]

PRIORITIES = [
    "Low",
    "Medium",
    "High",
    "Critical",
]

COMPLEXITIES = [
    "Low",
    "Medium",
    "High",
]

PROJECT_MANAGERS = [
    fake.name()
    for _ in range(12)
]

CLIENTS = [
    fake.company()
    for _ in range(40)
]


# ==============================================================
# FUNÇÕES AUXILIARES
# ==============================================================

def get_year_weights():
    """
    Define a distribuição anual dos projetos.

    Os anos não possuem necessariamente o mesmo volume,
    simulando variações naturais de demanda.
    """

    years = np.arange(START_YEAR, END_YEAR + 1)

    weights = np.array([
        0.12,  # 2020
        0.13,  # 2021
        0.15,  # 2022
        0.16,  # 2023
        0.17,  # 2024
        0.18,  # 2025
        0.09,  # 2026 - período parcial
    ])

    weights = weights / weights.sum()

    return years, weights


def get_month_weights():
    """
    Define a sazonalidade mensal.

    Janeiro, fevereiro, julho e dezembro possuem menor volume
    de novos projetos.
    """

    months = np.arange(1, 13)

    weights = np.array([
        0.45,  # Janeiro
        0.55,  # Fevereiro
        1.00,  # Março
        1.00,  # Abril
        1.00,  # Maio
        1.00,  # Junho
        0.55,  # Julho
        0.75,  # Agosto
        1.00,  # Setembro
        1.00,  # Outubro
        1.00,  # Novembro
        0.45,  # Dezembro
    ])

    weights = weights / weights.sum()

    return months, weights


def random_project_start_date():
    """
    Gera uma data de início planejada respeitando:

    - Variação anual;
    - Sazonalidade mensal;
    - Limite de 18/08/2026.
    """

    years, year_weights = get_year_weights()
    months, month_weights = get_month_weights()

    while True:
        year = int(np.random.choice(years, p=year_weights))
        month = int(np.random.choice(months, p=month_weights))

        first_day = pd.Timestamp(year=year, month=month, day=1)
        last_day = first_day + pd.offsets.MonthEnd(0)

        if year == END_YEAR:
            last_day = min(last_day, REFERENCE_DATE)

        if first_day <= last_day:
            random_day = np.random.randint(
                0,
                (last_day - first_day).days + 1,
            )

            return first_day + pd.Timedelta(days=int(random_day))


def choose_status(planned_end):
    """
    Define o status de acordo com o período do projeto.

    Projetos cujo término planejado já ocorreu podem ser:
    - Completed;
    - Cancelled;
    - On Hold;
    - In Progress.

    Projetos ainda não encerrados na data de referência podem ser:
    - In Progress;
    - Planned;
    - On Hold.
    """

    if planned_end <= REFERENCE_DATE:
        statuses = [
            "Completed",
            "Cancelled",
            "On Hold",
            "In Progress",
        ]

        probabilities = [
            0.68,
            0.16,
            0.10,
            0.06,
        ]
    else:
        statuses = [
            "In Progress",
            "Planned",
            "On Hold",
        ]

        probabilities = [
            0.60,
            0.25,
            0.15,
        ]

    return np.random.choice(statuses, p=probabilities)


def generate_project(project_id):
    """
    Gera um registro de projeto.
    """

    business_unit = np.random.choice(BUSINESS_UNITS)

    project_type = np.random.choice(PROJECT_TYPES)

    priority = np.random.choice(
        PRIORITIES,
        p=[0.35, 0.35, 0.20, 0.10],
    )

    complexity = np.random.choice(
        COMPLEXITIES,
        p=[0.40, 0.40, 0.20],
    )

    project_manager = np.random.choice(PROJECT_MANAGERS)
    client = np.random.choice(CLIENTS)

    planned_start = random_project_start_date()

    # Duração planejada conforme complexidade
    base_duration = {
        "Low": 60,
        "Medium": 120,
        "High": 220,
    }[complexity]

    planned_duration = int(
        np.random.normal(
            base_duration,
            base_duration * 0.20,
        )
    )

    planned_duration = max(planned_duration, 20)

    planned_end = planned_start + timedelta(
        days=planned_duration
    )

    # Orçamento conforme complexidade
    base_budget = {
        "Low": 50_000,
        "Medium": 150_000,
        "High": 400_000,
    }[complexity]

    planned_budget = np.random.normal(
        base_budget,
        base_budget * 0.25,
    )

    planned_budget = max(planned_budget, 10_000)

    # Horas planejadas relacionadas à duração
    planned_hours = planned_duration * np.random.uniform(6, 10)

    status = choose_status(planned_end)

    # ==========================================================
    # COMPORTAMENTO REAL DO PROJETO
    # ==========================================================

    actual_start = None
    actual_end = None
    actual_cost = 0.0
    actual_hours = 0.0

    if status == "Completed":
        start_offset = int(np.random.uniform(-3, 10))

        actual_start_timestamp = planned_start + timedelta(
            days=start_offset
        )

        schedule_noise = np.random.normal(0, 0.15)

        actual_end_timestamp = planned_end + timedelta(
            days=int(planned_duration * schedule_noise)
        )

        actual_start_timestamp = min(
            actual_start_timestamp,
            actual_end_timestamp,
        )

        actual_end_timestamp = min(
            actual_end_timestamp,
            REFERENCE_DATE,
        )

        actual_start = actual_start_timestamp.date()
        actual_end = actual_end_timestamp.date()

        cost_noise = np.random.normal(0.05, 0.20)

        actual_cost = planned_budget * (1 + cost_noise)
        actual_cost = max(
            actual_cost,
            planned_budget * 0.50,
        )

        hours_noise = np.random.normal(0.05, 0.20)

        actual_hours = planned_hours * (1 + hours_noise)
        actual_hours = max(
            actual_hours,
            planned_hours * 0.50,
        )

    elif status == "Cancelled":
        actual_start = planned_start.date()

        cancellation_duration = int(
            planned_duration * np.random.uniform(0.20, 0.60)
        )

        actual_end_timestamp = planned_start + timedelta(
            days=cancellation_duration
        )

        actual_end_timestamp = min(
            actual_end_timestamp,
            REFERENCE_DATE,
        )

        actual_end = actual_end_timestamp.date()

        actual_cost = planned_budget * np.random.uniform(
            0.10,
            0.50,
        )

        actual_hours = planned_hours * np.random.uniform(
            0.10,
            0.50,
        )

    elif status == "On Hold":
        actual_start_timestamp = planned_start + timedelta(
            days=int(np.random.uniform(0, 15))
        )

        actual_start_timestamp = min(
            actual_start_timestamp,
            REFERENCE_DATE,
        )

        actual_start = actual_start_timestamp.date()

        actual_cost = planned_budget * np.random.uniform(
            0.30,
            0.70,
        )

        actual_hours = planned_hours * np.random.uniform(
            0.30,
            0.70,
        )

    elif status == "In Progress":
        actual_start_timestamp = planned_start + timedelta(
            days=int(np.random.uniform(0, 15))
        )

        actual_start_timestamp = min(
            actual_start_timestamp,
            REFERENCE_DATE,
        )

        actual_start = actual_start_timestamp.date()

        elapsed_days = max(
            (REFERENCE_DATE - planned_start).days,
            1,
        )

        progress_ratio = min(
            elapsed_days / planned_duration,
            1.0,
        )

        progress_ratio = np.clip(
            progress_ratio + np.random.normal(0, 0.10),
            0.05,
            0.95,
        )

        actual_cost = planned_budget * progress_ratio
        actual_hours = planned_hours * progress_ratio

    elif status == "Planned":
        actual_start = None
        actual_end = None
        actual_cost = 0.0
        actual_hours = 0.0

    # ==========================================================
    # EQUIPE
    # ==========================================================

    team_size = {
        "Low": np.random.randint(2, 5),
        "Medium": np.random.randint(4, 9),
        "High": np.random.randint(8, 15),
    }[complexity]

    # ==========================================================
    # QUALIDADE E SATISFAÇÃO
    # ==========================================================

    final_quality_score = np.nan
    client_satisfaction_score = np.nan

    if status == "Completed":
        delay_days = max(
            (pd.Timestamp(actual_end) - planned_end).days,
            0,
        )

        cost_variance_pct = (
            (actual_cost - planned_budget)
            / planned_budget
            * 100
        )

        quality_base = 8.5

        quality_penalty = (
            (delay_days / 30) * 0.4
            + (max(cost_variance_pct, 0) / 20) * 0.4
        )

        final_quality_score = np.clip(
            quality_base
            - quality_penalty
            + np.random.normal(0, 0.3),
            1,
            10,
        )

        satisfaction_base = 8.0

        satisfaction_penalty = (
            (delay_days / 30) * 0.5
            + (max(cost_variance_pct, 0) / 20) * 0.5
        )

        client_satisfaction_score = np.clip(
            satisfaction_base
            - satisfaction_penalty
            + np.random.normal(0, 0.4),
            1,
            10,
        )

    return {
        "project_id": f"P{project_id:04d}",
        "project_name": f"{project_type} - {client}",
        "client_id": f"C{CLIENTS.index(client) + 1:03d}",
        "project_manager": project_manager,
        "business_unit": business_unit,
        "project_type": project_type,
        "priority": priority,
        "complexity": complexity,
        "planned_start_date": planned_start.date(),
        "planned_end_date": planned_end.date(),
        "actual_start_date": actual_start,
        "actual_end_date": actual_end,
        "planned_budget": round(planned_budget, 2),
        "actual_cost": round(actual_cost, 2),
        "planned_hours": round(planned_hours, 1),
        "actual_hours": round(actual_hours, 1),
        "team_size": team_size,
        "project_status": status,
        "final_quality_score": (
            round(float(final_quality_score), 2)
            if pd.notna(final_quality_score)
            else None
        ),
        "client_satisfaction_score": (
            round(float(client_satisfaction_score), 2)
            if pd.notna(client_satisfaction_score)
            else None
        ),
    }


def main():
    records = [
        generate_project(project_id)
        for project_id in range(1, N_PROJECTS + 1)
    ]

    df = pd.DataFrame(records)

    output_path = "data/raw/projects.csv"

    df.to_csv(
        output_path,
        index=False,
    )

    print(f"Arquivo gerado: {output_path}")
    print(f"Total de projetos: {len(df)}")
    print(
        "Período de início planejado: "
        f"{df['planned_start_date'].min()} "
        f"até {df['planned_start_date'].max()}"
    )

    print("\nProjetos por ano:")
    print(
        pd.to_datetime(
            df["planned_start_date"]
        ).dt.year.value_counts().sort_index()
    )

    print("\nProjetos por mês:")
    print(
        pd.to_datetime(
            df["planned_start_date"]
        ).dt.month.value_counts().sort_index()
    )

    print("\nDistribuição de status:")
    print(df["project_status"].value_counts())


if __name__ == "__main__":
    main()
