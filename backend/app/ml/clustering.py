from typing import List, Dict, Any
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN

class DensityRootCauseClusterer:
    """
    Innovation 3: Density-Based Root Cause Clustering Engine (DBSCAN)
    Instead of rigid SQL GROUP BY, applies unsupervised Density-Based Spatial Clustering
    over categorical one-hot features and normalized continuous leak variables.
    Distinguishes systemic clusters from isolated noise (-1).
    """

    @classmethod
    def cluster_cases(cls, cases_list: List[Dict[str, Any]], eps: float = 0.65, min_samples: int = 2) -> Dict[str, Any]:
        """
        Takes raw case dictionaries and clusters them using DBSCAN.
        """
        if not cases_list or len(cases_list) < 2:
            return {"clusters": [], "noise_count": len(cases_list)}

        df = pd.DataFrame(cases_list)

        # Extract features for clustering
        feature_cols = []
        
        # Categorical features
        cat_features = ['entity_ref', 'owner', 'category']
        for col in ['employee_id', 'workflow_step', 'reason_code']:
            if col in df.columns:
                cat_features.append(col)

        # One-hot encode categorical attributes
        df_cat = pd.get_dummies(df[[c for c in cat_features if c in df.columns]], drop_first=False)
        
        # Numeric features (normalized)
        numeric_cols = []
        for num_col in ['exposure_amt', 'recovery_probability']:
            if num_col in df.columns:
                # Min-max scale
                vals = df[num_col].fillna(0).values
                max_v = np.max(vals) if np.max(vals) > 0 else 1.0
                df_cat[f"norm_{num_col}"] = vals / max_v

        # Run DBSCAN
        dbscan = DBSCAN(eps=eps, min_samples=min_samples, metric='euclidean')
        cluster_labels = dbscan.fit_predict(df_cat)

        df['cluster_label'] = cluster_labels

        clusters_result = []
        unique_labels = set(cluster_labels)

        for label in unique_labels:
            if label == -1:
                continue # Noise / isolated cases
            
            cluster_cases = df[df['cluster_label'] == label]
            total_exp = cluster_cases['exposure_amt'].sum() if 'exposure_amt' in cluster_cases.columns else 0.0
            
            clusters_result.append({
                "cluster_id": f"DBSCAN-RC-{label + 1}",
                "case_count": int(len(cluster_cases)),
                "total_exposure": round(float(total_exp), 2),
                "case_ids": cluster_cases['id'].tolist() if 'id' in cluster_cases.columns else [],
                "density_score": round(float(len(cluster_cases) / len(df)), 3)
            })

        noise_count = int(np.sum(cluster_labels == -1))

        return {
            "total_cases_analyzed": len(df),
            "clusters_discovered": clusters_result,
            "isolated_noise_count": noise_count
        }

density_clusterer = DensityRootCauseClusterer()
