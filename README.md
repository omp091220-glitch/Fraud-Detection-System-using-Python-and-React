# 💳 Enterprise Fintech Fraud Detection System

An **ML-powered real-time fraud detection API** built using:

* Isolation Forest (Anomaly Detection)
* Random Forest (Supervised Learning)
* FastAPI (Production-grade REST API)

---

## 🚀 Features

* ⚡ Real-time fraud scoring
* 🧠 Ensemble ML model (Isolation Forest + Random Forest)
* 📊 Risk classification (Low / Medium / High / Critical)
* 📦 Batch prediction support
* 📈 Live dashboard metrics
* 🌍 Geo risk analysis
* ⏱️ Ultra-fast API response

---

## 🏗️ Tech Stack

* Python
* FastAPI
* Scikit-learn
* NumPy & Pandas
* Uvicorn

---

## 📥 Installation

```bash
git clone https://github.com/your-username/fraud-detection-system.git
cd fraud-detection-system
pip install -r requirements.txt
```

---

## ▶️ Run the Server

```bash
uvicorn fraud_detection:app --reload --port 8000
```

---

## 📡 API Endpoints

### ✅ Health Check

```
GET /health
```

---

### 🔍 Predict Fraud (Single Transaction)

```
POST /predict
```

Example request:

```json
{
  "transaction_id": "tx1001",
  "amount": 1200,
  "merchant_category": "electronics",
  "hour_of_day": 2,
  "day_of_week": 5,
  "customer_age_days": 10,
  "prev_tx_amount": 100,
  "tx_count_24h": 12,
  "distinct_merchants_7d": 10,
  "is_international": true,
  "is_new_device": true,
  "lat": 28.6,
  "lon": 77.2
}
```

---

### 📦 Batch Prediction

```
POST /predict/batch
```

---

### 📊 Dashboard Metrics

```
GET /dashboard/metrics
```

---

### 📈 Time Series Data

```
GET /dashboard/timeseries
```

---

### 🌍 Geo Risk Data

```
GET /dashboard/geo_risk
```

---

## 🧠 How It Works

### 1. Isolation Forest

Detects anomalies in transaction patterns.

### 2. Random Forest

Predicts fraud probability using labeled data.

### 3. Ensemble Model

Final score:

```
0.4 * anomaly_score + 0.6 * supervised_score
```

---

## 📊 Output Example

```json
{
  "transaction_id": "tx1001",
  "fraud_score": 0.87,
  "risk_level": "critical",
  "decision": "decline",
  "top_risk_factors": [
    "International transaction flag",
    "Unrecognized device detected"
  ]
}
```

---

## 📈 Model Performance

* Accuracy: ~80% (synthetic data)
* Real-time latency: < 50ms

---

## ⚠️ Disclaimer

This project uses **synthetic data** and is intended for:

* Learning
* Demonstration
* Portfolio projects

---

## 👨‍💻 Author

Your Name
GitHub: https://github.com/your-username

---

## ⭐ Star This Repo

If you like this project, give it a ⭐ — it helps a lot!
