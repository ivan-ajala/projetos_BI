import { useEffect, useState } from 'react';
import { loadCsv } from './loadCsv';

export function useSensorData() {
  const [rfData, setRfData] = useState([]);
  const [fscoreData, setFscoreData] = useState([]);
  const [positiveData, setPositiveData] = useState([]);
  const [negativeData, setNegativeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAll() {
      try {
        const [rf, fscore, positive, negative] = await Promise.all([
          loadCsv('/data/model_outputs/feature_importance_rf.csv'),
          loadCsv('/data/model_outputs/feature_fscore_ranking.csv'),
          loadCsv('/data/eda_outputs/top10_pos_correlated_sensors.csv'),
          loadCsv('/data/eda_outputs/top10_neg_correlated_sensors.csv'),
        ]);

        const clean = (rows, valueKey) =>
          rows
            .filter((row) => row.sensor && Number.isFinite(row[valueKey]))
            .map((row) => ({
              sensor: String(row.sensor),
              value: Number(row[valueKey]),
            }));

        setRfData(clean(rf, 'importance'));
        setFscoreData(clean(fscore, 'f_score'));
        setPositiveData(clean(positive, 'Target_FAIL'));
        setNegativeData(clean(negative, 'Target_FAIL'));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return {
    rfData,
    fscoreData,
    positiveData,
    negativeData,
    loading,
    error,
  };
}
