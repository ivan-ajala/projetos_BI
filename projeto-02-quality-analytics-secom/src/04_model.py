"""
04_model.py
Feature Selection e Modelo Preditivo – SECOM Dataset.
Versão script do notebook 04_model.ipynb – versão final revisada.

Dois grupos de sensores identificados na EDA:
- Grupo positivo (060, 104, 511, 349, 432, 435, 431, 022, 436, 437):
  correlação positiva com FAIL → valores altos são o sinal de alerta
- Grupo negativo (029, 317, 126, 027, 181, 123, 453, 128, 023, 015):
  correlação negativa com FAIL → valores baixos são o sinal de alerta
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.metrics import (
    classification_report,
    ConfusionMatrixDisplay,
    RocCurveDisplay,
    PrecisionRecallDisplay,
    recall_score,
    precision_score
)

sns.set(style="whitegrid")

# -------------------------------------------------------------------
# 0. Caminhos
# -------------------------------------------------------------------
BASE_DIR      = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
OUTPUT_DIR    = os.path.join(PROCESSED_DIR, "model_outputs")
CLEAN_FILE    = os.path.join(PROCESSED_DIR, "secom_clean.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("BASE_DIR      :", BASE_DIR)
print("CLEAN_FILE    :", CLEAN_FILE)
print("Arquivo existe?", os.path.exists(CLEAN_FILE))

# -------------------------------------------------------------------
# 1. Carregar base e preparar X e y
# -------------------------------------------------------------------
df = pd.read_csv(CLEAN_FILE)

print(f"\nShape: {df.shape[0]} linhas × {df.shape[1]} colunas")
print("\nDistribuição PASS / FAIL:")
print(df["Result"].value_counts())
print(df["Result"].value_counts(normalize=True) * 100)

df["Target_FAIL"] = (df["Result"] == "FAIL").astype(int)

sensor_cols = [c for c in df.columns if c.startswith("Sensor_")]

X = df[sensor_cols]
y = df["Target_FAIL"]

print(f"\nX shape: {X.shape}")
print(f"y distribuição:\n{y.value_counts()}")
print(f"\nClasse minoritária (FAIL): {y.mean()*100:.1f}%")

# -------------------------------------------------------------------
# 2. Seleção de Features – ANOVA F-score
# -------------------------------------------------------------------
# O F-score mede a força da separação independentemente da direção.
# Por isso, sensores do grupo positivo E do grupo negativo
# identificados na EDA aparecem juntos no ranking.

selector   = SelectKBest(score_func=f_classif, k=40)
X_selected = selector.fit_transform(X, y)

selected_mask    = selector.get_support()
selected_sensors = [sensor_cols[i] for i, v in enumerate(selected_mask) if v]

print(f"\nSensores selecionados ({len(selected_sensors)}):")
print(selected_sensors)

f_scores = pd.Series(selector.scores_, index=sensor_cols).sort_values(ascending=False)

print("\nTop 20 sensores por F-score (ANOVA):")
print(f_scores.head(20))

f_scores.to_csv(os.path.join(OUTPUT_DIR, "feature_fscore_ranking.csv"), header=["f_score"])

fig, ax = plt.subplots(figsize=(10, 5))
f_scores.head(20).sort_values().plot(kind="barh", color="steelblue", ax=ax)
ax.set_title("Top 20 Sensores – ANOVA F-score (relação com FAIL)", fontsize=13)
ax.set_xlabel("F-score")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "feature_fscore_top20.png"), dpi=150)
plt.show()
print("Gráfico salvo: feature_fscore_top20.png")

# -------------------------------------------------------------------
# 3. Modelo Preditivo – Random Forest com validação cruzada
# -------------------------------------------------------------------
# class_weight={0:1, 1:5}: penaliza erros em FAIL 5x mais que em PASS
# n_estimators=200: mais árvores para maior estabilidade
# StratifiedKFold: mantém proporção PASS/FAIL em cada fold

model = RandomForestClassifier(
    n_estimators=200,
    class_weight={0: 1, 1: 5},
    random_state=42,
    n_jobs=-1
)

cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)

scores = cross_validate(
    model, X_selected, y,
    cv=cv,
    scoring=["recall", "f1", "roc_auc"],
    return_train_score=False
)

print("\n=== Resultados – Validação Cruzada (10 folds) ===\n")
print(f"Recall  FAIL : {np.mean(scores['test_recall']):.3f}  ±  {np.std(scores['test_recall']):.3f}")
print(f"F1-score     : {np.mean(scores['test_f1']):.3f}  ±  {np.std(scores['test_f1']):.3f}")
print(f"ROC-AUC      : {np.mean(scores['test_roc_auc']):.3f}  ±  {np.std(scores['test_roc_auc']):.3f}")

print("\nRecall por fold:")
for i, r in enumerate(scores["test_recall"]):
    print(f"  Fold {i+1:02d}: {r:.3f}")

# -------------------------------------------------------------------
# 4. Avaliação detalhada – split treino/teste fixo
# -------------------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X_selected, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

model.fit(X_train, y_train)
y_pred      = model.predict(X_test)
y_pred_prob = model.predict_proba(X_test)[:, 1]

print("\n=== Classification Report (threshold padrão = 0.5) ===\n")
print(classification_report(y_test, y_pred, target_names=["PASS", "FAIL"]))

# Trade-off por threshold
print("\n=== Trade-off Precision × Recall por Threshold ===\n")
print(f"{'Threshold':<12} {'Recall_FAIL':<15} {'Precision_FAIL':<16} {'Interpretação'}")
print("-" * 65)

for thr in [0.5, 0.4, 0.3, 0.2, 0.15]:
    y_pred_thr = (y_pred_prob >= thr).astype(int)
    rec  = recall_score(y_test, y_pred_thr)
    prec = precision_score(y_test, y_pred_thr, zero_division=0)

    if thr >= 0.5:
        interp = "conservador (padrão)"
    elif thr >= 0.3:
        interp = "equilibrado"
    else:
        interp = "agressivo (mais alertas)"

    print(f"  {thr:<10.2f} {rec:<15.3f} {prec:<16.3f} {interp}")

# Gráfico trade-off Recall x Precision
thresholds = [0.5, 0.4, 0.3, 0.25, 0.2, 0.15]
recalls, precisions = [], []

for thr in thresholds:
    y_pred_thr = (y_pred_prob >= thr).astype(int)
    recalls.append(recall_score(y_test, y_pred_thr))
    precisions.append(precision_score(y_test, y_pred_thr, zero_division=0))

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(thresholds, recalls,    marker="o", label="Recall FAIL",    color="tomato")
ax.plot(thresholds, precisions, marker="s", label="Precision FAIL", color="steelblue")
ax.set_xlabel("Threshold de decisão")
ax.set_ylabel("Score")
ax.set_title("Trade-off Recall × Precision por Threshold – Classe FAIL", fontsize=12)
ax.legend()
ax.invert_xaxis()
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "threshold_tradeoff.png"), dpi=150)
plt.show()
print("Gráfico salvo: threshold_tradeoff.png")

# Matriz de confusão
fig, ax = plt.subplots(figsize=(5, 4))
ConfusionMatrixDisplay.from_predictions(
    y_test, y_pred,
    display_labels=["PASS", "FAIL"],
    colorbar=False,
    ax=ax
)
ax.set_title("Matriz de Confusão (threshold = 0.5)", fontsize=12)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "confusion_matrix.png"), dpi=150)
plt.show()
print("Gráfico salvo: confusion_matrix.png")

# Curva ROC
fig, ax = plt.subplots(figsize=(6, 5))
RocCurveDisplay.from_predictions(y_test, y_pred_prob, ax=ax, name="Random Forest")
ax.plot([0, 1], [0, 1], "k--", label="Random (AUC = 0.50)")
ax.set_title("Curva ROC – Detecção de FAIL", fontsize=13)
ax.legend()
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "roc_curve.png"), dpi=150)
plt.show()
print("Gráfico salvo: roc_curve.png")

# Curva Precision-Recall
fig, ax = plt.subplots(figsize=(6, 5))
PrecisionRecallDisplay.from_predictions(y_test, y_pred_prob, ax=ax, name="Random Forest")
ax.set_title("Curva Precision-Recall – Classe FAIL", fontsize=13)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "precision_recall_curve.png"), dpi=150)
plt.show()
print("Gráfico salvo: precision_recall_curve.png")

# -------------------------------------------------------------------
# 5. Feature Importance
# -------------------------------------------------------------------
# O Random Forest captura relevância independentemente da direção.
# Grupo positivo (060, 104, 511, 349): valores altos = risco de FAIL
# Grupo negativo (029, 317, 126, 027): valores baixos = risco de FAIL

importance = pd.Series(
    model.feature_importances_,
    index=selected_sensors
).sort_values(ascending=False)

print("\nTop 20 sensores por Feature Importance (Random Forest):")
print(importance.head(20))

importance.to_csv(os.path.join(OUTPUT_DIR, "feature_importance_rf.csv"), header=["importance"])

fig, ax = plt.subplots(figsize=(10, 5))
importance.head(20).sort_values().plot(kind="barh", color="tomato", ax=ax)
ax.set_title("Top 20 Sensores – Feature Importance (Random Forest)", fontsize=13)
ax.set_xlabel("Importância média (Gini)")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "feature_importance_top20.png"), dpi=150)
plt.show()
print("Gráfico salvo: feature_importance_top20.png")

# -------------------------------------------------------------------
# 6. Resumo final
# -------------------------------------------------------------------
resumo = pd.DataFrame({
    "metrica": ["Recall_FAIL", "F1_score", "ROC_AUC"],
    "media": [
        np.mean(scores["test_recall"]),
        np.mean(scores["test_f1"]),
        np.mean(scores["test_roc_auc"])
    ],
    "std": [
        np.std(scores["test_recall"]),
        np.std(scores["test_f1"]),
        np.std(scores["test_roc_auc"])
    ]
})

resumo.to_csv(os.path.join(OUTPUT_DIR, "model_metrics_summary.csv"), index=False)

print("\n=== Resumo final ===")
print(resumo.to_string(index=False))
print(f"\nTodos os outputs salvos em: {OUTPUT_DIR}")

# -------------------------------------------------------------------
# 7. Gerar threshold_tradeoff.csv para o dashboard Tableau
# -------------------------------------------------------------------
rows = []
for thr in [0.50, 0.40, 0.30, 0.25, 0.20, 0.15]:
    y_pred_thr = (y_pred_prob >= thr).astype(int)
    rows.append({
        "threshold":      thr,
        "recall_fail":    recall_score(y_test, y_pred_thr),
        "precision_fail": precision_score(y_test, y_pred_thr, zero_division=0)
    })

thr_df = pd.DataFrame(rows)
thr_df.to_csv(os.path.join(OUTPUT_DIR, "threshold_tradeoff.csv"), index=False)

print("\n=== threshold_tradeoff.csv salvo ===")
print(thr_df.to_string(index=False))
