"""Baseline explicável, partições temporais e métricas para PaySim."""
import numpy as np
import pandas as pd

def chronological_masks(frame, train_fraction=.70, validation_fraction=.15):
    steps = np.sort(frame['step'].dropna().unique())
    if len(steps) < 3:
        raise ValueError('São necessários ao menos três steps distintos.')
    c1 = max(1, int(len(steps)*train_fraction))
    c2 = max(c1+1, int(len(steps)*(train_fraction+validation_fraction)))
    c2 = min(c2, len(steps)-1)
    a,b,c = steps[:c1],steps[c1:c2],steps[c2:]
    return (frame['step'].isin(a), frame['step'].isin(b), frame['step'].isin(c))

def fit_rule_thresholds(train):
    return train.groupby('type')['amount'].quantile(.95).to_dict()

def score_rules(frame, p95_by_type):
    type_signal = frame['type'].isin(['TRANSFER','CASH_OUT'])
    amount_signal = frame['type'].map(p95_by_type).notna() & frame['amount'].ge(frame['type'].map(p95_by_type))
    balance_signal = pd.Series(np.isclose(frame['amount'].to_numpy(), frame['oldbalanceOrg'].to_numpy(), rtol=1e-6, atol=.01), index=frame.index)
    return type_signal.astype('int8') + amount_signal.astype('int8') + balance_signal.astype('int8')

def alert_metrics(y_true, scores, threshold):
    y=np.asarray(y_true,dtype=int); pred=np.asarray(scores,dtype=int)>=threshold
    tp=int((pred&(y==1)).sum()); fp=int((pred&(y==0)).sum()); fn=int((~pred&(y==1)).sum()); n=int(pred.sum())
    return {'limiar':int(threshold),'precisao':tp/(tp+fp) if tp+fp else 0.,'recall':tp/(tp+fn) if tp+fn else 0.,
            'falsos_positivos':fp,'falsos_negativos':fn,'alertas':n,'taxa_alertas_pct':100*n/len(y) if len(y) else 0.}

def average_precision_stepwise(y_true, scores):
    y=np.asarray(y_true,dtype=int); s=np.asarray(scores,dtype=int); positives=int(y.sum())
    if not positives: return float('nan')
    ap=prev=0.
    for threshold in sorted(np.unique(s),reverse=True):
        pred=s>=threshold; tp=int((pred&(y==1)).sum()); fp=int((pred&(y==0)).sum())
        recall=tp/positives; precision=tp/(tp+fp) if tp+fp else 0.
        ap+=(recall-prev)*precision; prev=recall
    return ap
