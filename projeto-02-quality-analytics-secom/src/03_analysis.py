"""
03_analysis.py
Análise exploratória (EDA) da base limpa SECOM.
Versão script do notebook 03_analysis.ipynb – versão final revisada.
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

sns.set(style="whitegrid")

# -------------------------------------------------------------------
# 0. Caminhos
# -------------------------------------------------------------------
BASE_DIR      = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
OUTPUT_DIR    = os.path.join(PROCESSED_DIR, "eda_outputs")
CLEAN_FILE    = os.path.join(PROCESSED_DIR, "secom_clean.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("BASE_DIR      :", BASE_DIR)
print("CLEAN_FILE    :", CLEAN_FILE)
print("Arquivo existe?", os.path.exists(CLEAN_FILE))

# -------------------------------------------------------------------
# 1. Carregar a base limpa
# -------------------------------------------------------------------
df = pd.read_csv(CLEAN_FILE)

print(f"\nShape da base limpa: {df.shape[0]} linhas × {df.shape[1]} colunas")
print("Existem NaNs na base?", df.isnull().any().any())

# -------------------------------------------------------------------
# 2. Distribuição PASS vs FAIL
# -------------------------------------------------------------------
counts = df["Result"].value_counts()
pct    = df["Result"].value_counts(normalize=True) * 100

print("\n=== Distribuição PASS / FAIL ===")
for label in counts.index:
    print(f"{label}: {counts[label]} unidades ({pct[label]:.1f}%)")

fig, ax = plt.subplots(figsize=(6, 4))
counts.plot(kind="bar", color=["steelblue", "tomato"], ax=ax)
ax.set_title("Distribuição PASS vs FAIL", fontsize=13)
ax.set_xlabel("")
ax.set_ylabel("Número de unidades")
ax.set_xticklabels(counts.index, rotation=0)
for i, v in enumerate(counts):
    ax.text(i, v + 5, f"{pct.iloc[i]:.1f}%", ha="center", fontsize=11)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "pass_fail_distribution.png"), dpi=150)
plt.show()
print("Gráfico salvo: pass_fail_distribution.png")

dist_df = pd.DataFrame({"count": counts, "pct": pct})
dist_df.to_csv(os.path.join(OUTPUT_DIR, "pass_fail_distribution.csv"))

# -------------------------------------------------------------------
# 3. Estrutura dos sensores
# -------------------------------------------------------------------
control_cols = ["Unit_ID", "Label", "Timestamp", "Result"]
sensor_cols  = [c for c in df.columns if c.startswith("Sensor_")]

print(f"\nColunas de controle: {control_cols}")
print(f"Número de sensores : {len(sensor_cols)}")
print(f"Exemplos de sensores: {sensor_cols[:5]}")

sensor_desc        = df[sensor_cols].describe().T
sensor_desc_sorted = sensor_desc.sort_values("std", ascending=False)

print("\nTop 10 sensores com MAIOR desvio-padrão:")
print(sensor_desc_sorted.head(10)[["mean", "std", "min", "max"]])

print("\nTop 10 sensores com MENOR desvio-padrão:")
print(sensor_desc_sorted.tail(10)[["mean", "std", "min", "max"]])

sensor_desc_sorted.to_csv(os.path.join(OUTPUT_DIR, "sensor_desc_sorted_by_std.csv"))

# -------------------------------------------------------------------
# 4. Relação entre sensores e FAIL
# -------------------------------------------------------------------
df["Target_FAIL"] = (df["Result"] == "FAIL").astype(int)

# Médias por grupo (10 primeiros sensores como exemplo)
sample_sensors = sensor_cols[:10]
group_means = df.groupby("Result")[sample_sensors].mean().T
group_means.rename(columns={"FAIL": "mean_FAIL", "PASS": "mean_PASS"}, inplace=True)
group_means["diff_FAIL_minus_PASS"] = group_means["mean_FAIL"] - group_means["mean_PASS"]
group_means.to_csv(os.path.join(OUTPUT_DIR, "group_means_sample_sensors.csv"))

print("\nMédias por grupo (10 primeiros sensores):")
print(group_means.sort_values("diff_FAIL_minus_PASS", ascending=False))

# Correlação de Pearson com Target_FAIL
corrs   = df[sensor_cols + ["Target_FAIL"]].corr()["Target_FAIL"].drop("Target_FAIL")
top_pos = corrs.sort_values(ascending=False).head(10)
top_neg = corrs.sort_values(ascending=True).head(10)

print("\nTop 10 sensores mais POSITIVAMENTE correlacionados com FAIL:")
print(top_pos)

print("\nTop 10 sensores mais NEGATIVAMENTE correlacionados com FAIL:")
print(top_neg)

corrs.to_csv(os.path.join(OUTPUT_DIR, "sensor_correlations_with_target_fail.csv"))
top_pos.to_csv(os.path.join(OUTPUT_DIR, "top10_pos_correlated_sensors.csv"))
top_neg.to_csv(os.path.join(OUTPUT_DIR, "top10_neg_correlated_sensors.csv"))

# -------------------------------------------------------------------
# 5. Boxplots – grupo negativo (029, 317, 126)
# Correlação negativa: valores BAIXOS estão associados a maior risco de FAIL
# -------------------------------------------------------------------
sensores_negativos = list(top_neg.index[:3])
print("\nSensores com correlação negativa (queda = risco):", sensores_negativos)

fig, axes = plt.subplots(1, 3, figsize=(15, 4), sharey=False)
for ax, sensor in zip(axes, sensores_negativos):
    sns.boxplot(
        data=df, x="Result", y=sensor, ax=ax,
        palette={"PASS": "steelblue", "FAIL": "tomato"}
    )
    ax.set_title(f"{sensor}\n(correlação negativa com FAIL)")

plt.suptitle("Sensores negativamente correlacionados – PASS vs FAIL",
             fontsize=12, y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "boxplots_top3_negative_sensors.png"), dpi=150)
plt.show()
print("Gráfico salvo: boxplots_top3_negative_sensors.png")

# -------------------------------------------------------------------
# 6. Boxplots – grupo positivo (060, 104, 511)
# Correlação positiva: valores ALTOS estão associados a maior risco de FAIL
# -------------------------------------------------------------------
sensores_positivos = list(top_pos.index[:3])
print("\nSensores com correlação positiva (alta = risco):", sensores_positivos)

fig, axes = plt.subplots(1, 3, figsize=(15, 4), sharey=False)
for ax, sensor in zip(axes, sensores_positivos):
    sns.boxplot(
        data=df, x="Result", y=sensor, ax=ax,
        palette={"PASS": "steelblue", "FAIL": "tomato"}
    )
    ax.set_title(f"{sensor}\n(correlação positiva com FAIL)")

plt.suptitle("Sensores positivamente correlacionados – PASS vs FAIL",
             fontsize=12, y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "boxplots_top3_positive_sensors.png"), dpi=150)
plt.show()
print("Gráfico salvo: boxplots_top3_positive_sensors.png")

# -------------------------------------------------------------------
# 7. Heatmap – sensores positivos e negativos + Target_FAIL
# -------------------------------------------------------------------
top_combined = list(top_pos.index[:6]) + list(top_neg.index[:4]) + ["Target_FAIL"]
corr_matrix  = df[top_combined].corr()

corr_matrix.to_csv(os.path.join(OUTPUT_DIR, "corr_matrix_combined_sensors.csv"))

plt.figure(figsize=(10, 8))
sns.heatmap(corr_matrix, annot=False, cmap="coolwarm", center=0)
plt.title("Correlação – Sensores positivos e negativos com Target_FAIL")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "heatmap_top_sensors.png"), dpi=150)
plt.show()
print("Gráfico salvo: heatmap_top_sensors.png")

# -------------------------------------------------------------------
# 8. Salva lista dos sensores prioritários para o modelo
# -------------------------------------------------------------------
with open(os.path.join(OUTPUT_DIR, "top_sensors_for_model.txt"), "w") as f:
    f.write("# Sensores positivamente correlacionados com FAIL (valores altos = risco)\n")
    for s in top_pos.index:
        f.write(s + "\n")
    f.write("\n# Sensores negativamente correlacionados com FAIL (valores baixos = risco)\n")
    for s in top_neg.index:
        f.write(s + "\n")

print("\n✓ EDA concluída.")
print(f"  Resultados salvos em: {OUTPUT_DIR}")
