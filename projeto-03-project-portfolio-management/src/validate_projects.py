from pathlib import Path
import pandas as pd

DATA_PATH = Path("data/raw/projects.csv")

EXPECTED_STATUSES = {"Completed", "Cancelled", "On Hold", "In Progress", "Planned"}

df = pd.read_csv(DATA_PATH)

print("=== VALIDAÇÃO DE PROJECTS.CSV ===")
print(f"Registros: {len(df)}")
print(f"Colunas: {len(df.columns)}")
print()

# 1. IDs
duplicate_ids = df["project_id"].duplicated().sum()
missing_ids = df["project_id"].isna().sum()

print("=== IDENTIFICADORES ===")
print(f"IDs duplicados: {duplicate_ids}")
print(f"IDs ausentes: {missing_ids}")
print()

# 2. Status
unexpected_statuses = set(df["project_status"].dropna().unique()) - EXPECTED_STATUSES

print("=== STATUS ===")
print(f"Status encontrados: {sorted(df['project_status'].dropna().unique())}")
print(f"Status inesperados: {sorted(unexpected_statuses)}")
print()

# 3. Datas
date_columns = [
    "planned_start_date",
    "planned_end_date",
    "actual_start_date",
    "actual_end_date",
]

for column in date_columns:
    df[column] = pd.to_datetime(df[column], errors="coerce")

invalid_planned_dates = (
    df["planned_end_date"] < df["planned_start_date"]
).sum()

invalid_actual_dates = (
    df["actual_end_date"].notna()
    & df["actual_start_date"].notna()
    & (df["actual_end_date"] < df["actual_start_date"])
).sum()

print("=== DATAS ===")
print(f"Datas planejadas inconsistentes: {invalid_planned_dates}")
print(f"Datas reais inconsistentes: {invalid_actual_dates}")
print()

# 4. Valores numéricos
numeric_columns = [
    "planned_budget",
    "actual_cost",
    "planned_hours",
    "actual_hours",
    "team_size",
]

negative_values = {}

for column in numeric_columns:
    negative_values[column] = int((df[column] < 0).sum())

print("=== VALORES NEGATIVOS ===")
for column, count in negative_values.items():
    print(f"{column}: {count}")
print()

# 5. Avaliações
completed_without_quality = (
    (df["project_status"] == "Completed")
    & df["final_quality_score"].isna()
).sum()

completed_without_satisfaction = (
    (df["project_status"] == "Completed")
    & df["client_satisfaction_score"].isna()
).sum()

non_completed_with_quality = (
    (df["project_status"] != "Completed")
    & df["final_quality_score"].notna()
).sum()

non_completed_with_satisfaction = (
    (df["project_status"] != "Completed")
    & df["client_satisfaction_score"].notna()
).sum()

print("=== AVALIAÇÕES ===")
print(f"Concluídos sem nota de qualidade: {completed_without_quality}")
print(f"Concluídos sem satisfação: {completed_without_satisfaction}")
print(f"Não concluídos com nota de qualidade: {non_completed_with_quality}")
print(f"Não concluídos com satisfação: {non_completed_with_satisfaction}")
print()

# 6. Período
print("=== PERÍODO ===")
print(f"Menor início planejado: {df['planned_start_date'].min().date()}")
print(f"Maior início planejado: {df['planned_start_date'].max().date()}")
print()

# 7. Resultado geral
checks = {
    "IDs duplicados": duplicate_ids == 0,
    "IDs ausentes": missing_ids == 0,
    "Status válidos": len(unexpected_statuses) == 0,
    "Datas planejadas válidas": invalid_planned_dates == 0,
    "Datas reais válidas": invalid_actual_dates == 0,
    "Sem valores negativos": all(value == 0 for value in negative_values.values()),
}

print("=== RESULTADO DOS CHECKS ===")

all_passed = True

for check_name, passed in checks.items():
    status = "OK" if passed else "ATENÇÃO"
    print(f"{status}: {check_name}")
    all_passed = all_passed and passed

print()

if all_passed:
    print("VALIDAÇÃO CONCLUÍDA: todos os checks principais passaram.")
else:
    print("VALIDAÇÃO CONCLUÍDA COM ATENÇÕES: revisar os itens acima.")
