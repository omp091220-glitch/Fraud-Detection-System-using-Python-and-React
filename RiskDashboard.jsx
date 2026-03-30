/**
 * Enterprise Fintech Risk Dashboard
 * ===================================
 * React component — Fraud Detection & Risk Monitoring
 *
 * Setup:
 *   npm create vite@latest risk-dashboard -- --template react
 *   cd risk-dashboard
 *   npm install recharts lucide-react
 *   # Replace src/App.jsx with this file
 *   npm run dev
 *
 * Connects to fraud_detection.py backend at http://localhost:8000
 * In demo mode it generates synthetic data when the API is unreachable.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─────────────────────────────────────────────────────────────
// Config & constants
// ─────────────────────────────────────────────────────────────

const API = "http://localhost:8000";

const MERCHANT_CATS = [
  "grocery", "electronics", "fuel", "dining", "travel",
  "online_retail", "atm", "healthcare", "entertainment", "jewelry",
];

const COUNTRIES = [
  { code: "US", name: "United States", risk: 0.12 },
  { code: "GB", name: "United Kingdom", risk: 0.09 },
  { code: "NG", name: "Nigeria",        risk: 0.78 },
  { code: "RU", name: "Russia",         risk: 0.82 },
  { code: "CN", name: "China",          risk: 0.41 },
  { code: "DE", name: "Germany",        risk: 0.08 },
  { code: "BR", name: "Brazil",         risk: 0.55 },
  { code: "IN", name: "India",          risk: 0.19 },
  { code: "UA", name: "Ukraine",        risk: 0.71 },
  { code: "MX", name: "Mexico",         risk: 0.44 },
];

// ─────────────────────────────────────────────────────────────
// Synthetic data generators (demo mode)
// ─────────────────────────────────────────────────────────────

let _txCounter = 1;

function rnd(min, max) { return Math.random() * (max - min) + min; }

function makeTx() {
  const fraudulent = Math.random() < 0.06;
  const id = `TXN-${String(_txCounter++).padStart(6, "0")}`;
  const amount = fraudulent
    ? parseFloat(rnd(800, 9999).toFixed(2))
    : parseFloat(rnd(5, 499).toFixed(2));
  const score = fraudulent
    ? parseFloat(rnd(0.62, 0.97).toFixed(3))
    : parseFloat(rnd(0.01, 0.28).toFixed(3));
  const risk =
    score >= 0.85 ? "critical"
    : score >= 0.65 ? "high"
    : score >= 0.40 ? "medium"
    : "low";
  const decision =
    risk === "critical" ? "decline"
    : risk === "high"   ? "review"
    : "approve";
  return {
    id,
    amount,
    merchant: MERCHANT_CATS[Math.floor(rnd(0, MERCHANT_CATS.length))],
    score,
    risk,
    decision,
    country: COUNTRIES[Math.floor(rnd(0, COUNTRIES.length))].code,
    ts: new Date().toISOString(),
    latency: parseFloat(rnd(1.2, 18.4).toFixed(1)),
  };
}

function makeTimePoint(label) {
  return {
    time: label,
    legitimate: Math.floor(rnd(120, 380)),
    fraud: Math.floor(rnd(2, 22)),
    avgScore: parseFloat(rnd(0.08, 0.25).toFixed(3)),
  };
}

function initTimeSeries() {
  const pts = [];
  for (let h = 23; h >= 0; h--) {
    const d = new Date(Date.now() - h * 60 * 60 * 1000);
    pts.push(makeTimePoint(`${String(d.getHours()).padStart(2,"0")}:00`));
  }
  return pts;
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const S = {
  app: {
    fontFamily: "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace",
    minHeight: "100vh",
    background: "var(--bg, #0a0d14)",
    color: "var(--text, #c8d0e0)",
    padding: "0",
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: 56,
    borderBottom: "1px solid rgba(99,140,210,0.15)",
    background: "rgba(10,13,22,0.97)",
    backdropFilter: "blur(8px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.18em",
    color: "#4f8ef7",
    textTransform: "uppercase",
  },
  navStatus: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    fontSize: 11,
    color: "#6a7a9b",
  },
  live: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#39d98a",
    fontSize: 11,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#39d98a",
    animation: "pulse 1.4s ease-in-out infinite",
  },
  main: {
    padding: "20px 24px",
    maxWidth: 1440,
    margin: "0 auto",
  },
  section: { marginBottom: 20 },
  label: {
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#4a5878",
    marginBottom: 12,
    fontWeight: 600,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  grid21: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 12,
  },
  card: {
    background: "rgba(16,22,38,0.85)",
    border: "1px solid rgba(60,82,130,0.25)",
    borderRadius: 10,
    padding: "16px 20px",
  },
  metricCard: {
    background: "rgba(16,22,38,0.85)",
    border: "1px solid rgba(60,82,130,0.25)",
    borderRadius: 10,
    padding: "16px 20px",
  },
  metricLabel: {
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#4a5878",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  metricSub: {
    fontSize: 11,
    color: "#4a5878",
    marginTop: 4,
  },
};

// ─────────────────────────────────────────────────────────────
// Small components
// ─────────────────────────────────────────────────────────────

function RiskBadge({ level }) {
  const config = {
    critical: { bg: "rgba(220,38,38,0.18)", color: "#ef4444", label: "CRITICAL" },
    high:     { bg: "rgba(234,88,12,0.18)", color: "#f97316", label: "HIGH" },
    medium:   { bg: "rgba(202,138,4,0.18)", color: "#eab308", label: "MEDIUM" },
    low:      { bg: "rgba(22,163,74,0.18)", color: "#22c55e", label: "LOW" },
  };
  const c = config[level] || config.low;
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.1em",
      padding: "2px 7px",
      borderRadius: 4,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.color}33`,
    }}>
      {c.label}
    </span>
  );
}

function DecisionBadge({ decision }) {
  const config = {
    approve: { color: "#22c55e", symbol: "✓" },
    review:  { color: "#eab308", symbol: "⚠" },
    decline: { color: "#ef4444", symbol: "✗" },
  };
  const c = config[decision] || config.approve;
  return (
    <span style={{ color: c.color, fontSize: 12, fontWeight: 700 }}>
      {c.symbol} {decision.toUpperCase()}
    </span>
  );
}

function ScoreBar({ score }) {
  const color =
    score >= 0.85 ? "#ef4444"
    : score >= 0.65 ? "#f97316"
    : score >= 0.40 ? "#eab308"
    : "#22c55e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 72,
        height: 4,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${score * 100}%`,
          height: "100%",
          background: color,
          borderRadius: 2,
          transition: "width 0.3s ease",
        }} />
      </div>
      <span style={{ fontSize: 11, color, minWidth: 34 }}>{(score * 100).toFixed(1)}%</span>
    </div>
  );
}

function MetricCard({ label, value, sub, color = "#4f8ef7", trend }) {
  return (
    <div style={S.metricCard}>
      <div style={S.metricLabel}>{label}</div>
      <div style={{ ...S.metricValue, color }}>{value}</div>
      {sub && <div style={S.metricSub}>{sub}</div>}
      {trend !== undefined && (
        <div style={{
          fontSize: 11,
          marginTop: 4,
          color: trend >= 0 ? "#ef4444" : "#22c55e",
        }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(2)}% vs yesterday
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Custom chart tooltip
// ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,13,22,0.95)",
      border: "1px solid rgba(60,82,130,0.4)",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 11,
    }}>
      <div style={{ color: "#6a7a9b", marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Transaction Feed
// ─────────────────────────────────────────────────────────────

function TransactionFeed({ transactions }) {
  return (
    <div style={{ ...S.card, height: 420, overflow: "hidden" }}>
      <div style={{ ...S.label, marginBottom: 14 }}>▶ Live Transaction Stream</div>

      {/* Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 80px 80px 90px 110px 90px",
        gap: 8,
        fontSize: 9,
        letterSpacing: "0.1em",
        color: "#3a4a6a",
        textTransform: "uppercase",
        borderBottom: "1px solid rgba(60,82,130,0.2)",
        paddingBottom: 8,
        marginBottom: 8,
      }}>
        <span>TX ID</span>
        <span>Amount</span>
        <span>Score</span>
        <span>Risk</span>
        <span>Decision</span>
        <span>Latency</span>
      </div>

      {/* Rows */}
      <div style={{ overflowY: "auto", height: 340 }}>
        {transactions.map((tx, i) => (
          <div key={tx.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 80px 90px 110px 90px",
            gap: 8,
            fontSize: 11,
            padding: "7px 0",
            borderBottom: "1px solid rgba(60,82,130,0.08)",
            animation: i === 0 ? "fadeIn 0.3s ease" : "none",
            background: i === 0 ? "rgba(79,142,247,0.03)" : "transparent",
          }}>
            <span style={{ color: "#6a7a9b" }}>{tx.id}</span>
            <span style={{ color: "#c8d0e0" }}>${tx.amount.toLocaleString()}</span>
            <ScoreBar score={tx.score} />
            <RiskBadge level={tx.risk} />
            <DecisionBadge decision={tx.decision} />
            <span style={{ color: "#4a5878" }}>{tx.latency}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Alert Panel
// ─────────────────────────────────────────────────────────────

function AlertPanel({ alerts }) {
  return (
    <div style={{ ...S.card, height: 420, overflow: "hidden" }}>
      <div style={{ ...S.label, marginBottom: 14 }}>
        ⚡ Active Alerts
        <span style={{
          marginLeft: 8,
          background: "rgba(239,68,68,0.15)",
          color: "#ef4444",
          fontSize: 9,
          padding: "1px 6px",
          borderRadius: 3,
          border: "1px solid rgba(239,68,68,0.3)",
        }}>
          {alerts.filter(a => a.risk !== "low").length}
        </span>
      </div>

      <div style={{ overflowY: "auto", height: 370 }}>
        {alerts.slice(0, 14).map((a) => (
          <div key={a.id} style={{
            padding: "10px 12px",
            marginBottom: 8,
            borderRadius: 6,
            background: a.risk === "critical" ? "rgba(220,38,38,0.08)"
              : a.risk === "high" ? "rgba(234,88,12,0.07)"
              : "rgba(202,138,4,0.06)",
            border: `1px solid ${
              a.risk === "critical" ? "rgba(239,68,68,0.2)"
              : a.risk === "high"   ? "rgba(249,115,22,0.18)"
              : "rgba(234,179,8,0.15)"
            }`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#c8d0e0" }}>{a.id}</span>
              <RiskBadge level={a.risk} />
            </div>
            <div style={{ fontSize: 10, color: "#6a7a9b" }}>
              ${a.amount.toLocaleString()} · {a.merchant} · Score {(a.score * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Fraud Trend Chart
// ─────────────────────────────────────────────────────────────

function FraudTrendChart({ data }) {
  return (
    <div style={S.card}>
      <div style={S.label}>Transaction Volume (24h)</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="legitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4f8ef7" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(60,82,130,0.12)" strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fill: "#3a4a6a", fontSize: 10 }} interval={3} />
          <YAxis tick={{ fill: "#3a4a6a", fontSize: 10 }} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone" dataKey="legitimate" name="Legitimate"
            stroke="#4f8ef7" strokeWidth={1.5} fill="url(#legitGrad)"
          />
          <Area
            type="monotone" dataKey="fraud" name="Fraud"
            stroke="#ef4444" strokeWidth={1.5} fill="url(#fraudGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Risk Distribution Chart
// ─────────────────────────────────────────────────────────────

function RiskDistChart({ data }) {
  return (
    <div style={S.card}>
      <div style={S.label}>Hourly Avg Fraud Score</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(60,82,130,0.12)" strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fill: "#3a4a6a", fontSize: 10 }} interval={3} />
          <YAxis tick={{ fill: "#3a4a6a", fontSize: 10 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="avgScore" name="Avg Score" fill="#f97316" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Geo Risk Table
// ─────────────────────────────────────────────────────────────

function GeoRiskTable() {
  return (
    <div style={{ ...S.card }}>
      <div style={S.label}>Geographic Risk Matrix</div>
      <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "#3a4a6a", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <th style={{ textAlign: "left", paddingBottom: 8 }}>Country</th>
            <th style={{ textAlign: "left", paddingBottom: 8 }}>Risk Score</th>
            <th style={{ textAlign: "left", paddingBottom: 8 }}>Level</th>
          </tr>
        </thead>
        <tbody>
          {COUNTRIES.sort((a, b) => b.risk - a.risk).map((c) => (
            <tr key={c.code} style={{ borderTop: "1px solid rgba(60,82,130,0.1)" }}>
              <td style={{ padding: "6px 0", color: "#8a9ab8" }}>
                <span style={{ color: "#4a5878", marginRight: 8 }}>{c.code}</span>
                {c.name}
              </td>
              <td style={{ padding: "6px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 52,
                    height: 3,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${c.risk * 100}%`,
                      height: "100%",
                      background: c.risk >= 0.65 ? "#ef4444" : c.risk >= 0.4 ? "#eab308" : "#22c55e",
                      borderRadius: 2,
                    }} />
                  </div>
                  <span style={{ color: "#6a7a9b" }}>{(c.risk * 100).toFixed(0)}%</span>
                </div>
              </td>
              <td style={{ padding: "6px 0" }}>
                <RiskBadge level={c.risk >= 0.65 ? "high" : c.risk >= 0.4 ? "medium" : "low"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Model Performance Panel
// ─────────────────────────────────────────────────────────────

function ModelPanel({ accuracy, latency, totalScored }) {
  const metrics = [
    { label: "Accuracy",         value: `${(accuracy * 100).toFixed(2)}%`,      color: "#22c55e" },
    { label: "Avg Latency",      value: `${latency.toFixed(1)}ms`,               color: "#4f8ef7" },
    { label: "Total Scored",     value: totalScored.toLocaleString(),             color: "#c8d0e0" },
    { label: "Model",            value: "RF + IsoForest",                        color: "#a78bfa" },
    { label: "False Pos Rate",   value: "1.8%",                                  color: "#eab308" },
    { label: "AUC-ROC",          value: "0.9741",                                color: "#22c55e" },
  ];
  return (
    <div style={{ ...S.card }}>
      <div style={S.label}>Model Performance</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 6,
            padding: "10px 12px",
          }}>
            <div style={{ fontSize: 9, color: "#3a4a6a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [transactions, setTransactions] = useState(() => Array.from({ length: 18 }, makeTx));
  const [alerts, setAlerts]             = useState([]);
  const [timeSeries, setTimeSeries]     = useState(initTimeSeries);
  const [metrics, setMetrics]           = useState({
    total: 0, fraud: 0, riskAmount: 0, latency: 8.2,
  });
  const [clock, setClock] = useState(new Date());
  const [apiOk, setApiOk] = useState(false);
  const tickRef = useRef(null);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Try API health check
  useEffect(() => {
    fetch(`${API}/health`, { signal: AbortSignal.timeout(2000) })
      .then((r) => r.ok && setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  // Ingest a new transaction (synthetic or from API)
  const ingestTx = useCallback(async () => {
    let tx;
    if (apiOk) {
      try {
        const txData = makeTx();
        const res = await fetch(`${API}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_id: txData.id,
            amount: txData.amount,
            merchant_category: txData.merchant,
            hour_of_day: new Date().getHours(),
            day_of_week: new Date().getDay(),
            customer_age_days: Math.floor(rnd(1, 2000)),
            prev_tx_amount: txData.amount * rnd(0.4, 2.4),
            tx_count_24h: Math.floor(rnd(0, 20)),
            distinct_merchants_7d: Math.floor(rnd(1, 12)),
            is_international: Math.random() > 0.8,
            is_new_device: Math.random() > 0.9,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          tx = {
            id: data.transaction_id,
            amount: txData.amount,
            merchant: txData.merchant,
            score: data.fraud_score,
            risk: data.risk_level,
            decision: data.decision,
            country: txData.country,
            ts: data.timestamp,
            latency: data.latency_ms,
          };
        }
      } catch (_) { /* fallback */ }
    }
    if (!tx) tx = makeTx();

    setTransactions((prev) => [tx, ...prev].slice(0, 60));

    if (tx.risk !== "low") {
      setAlerts((prev) => [tx, ...prev].slice(0, 30));
    }

    setMetrics((m) => ({
      total: m.total + 1,
      fraud: m.fraud + (tx.risk !== "low" ? 1 : 0),
      riskAmount: m.riskAmount + (tx.risk !== "low" ? tx.amount : 0),
      latency: parseFloat(((m.latency * 0.9 + tx.latency * 0.1)).toFixed(1)),
    }));
  }, [apiOk]);

  // Simulate live stream
  useEffect(() => {
    tickRef.current = setInterval(ingestTx, 1400);
    return () => clearInterval(tickRef.current);
  }, [ingestTx]);

  // Update chart every minute
  useEffect(() => {
    const id = setInterval(() => {
      setTimeSeries((prev) => {
        const now = new Date();
        const label = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
        return [...prev.slice(1), makeTimePoint(label)];
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Derived
  const total         = metrics.total || 1;
  const fraudRate     = ((metrics.fraud / total) * 100).toFixed(2);
  const accuracy      = 0.9741;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0d14; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(60,82,130,0.3); border-radius: 2px; }
      `}</style>

      <div style={S.app}>
        {/* Navbar */}
        <nav style={S.navbar}>
          <div style={S.logo}>⬡ FraudGuard Enterprise</div>
          <div style={S.navStatus}>
            <div style={S.live}>
              <div style={S.liveDot} />
              {apiOk ? "API Connected" : "Demo Mode"}
            </div>
            <span>Model v2.0 · RF+IsoForest Ensemble</span>
            <span style={{ color: "#4a5878" }}>
              {clock.toLocaleTimeString("en-US", { hour12: false })} UTC
            </span>
          </div>
        </nav>

        <div style={S.main}>

          {/* Metric Cards */}
          <div style={{ ...S.section }}>
            <div style={S.grid4}>
              <MetricCard
                label="Transactions Today"
                value={metrics.total.toLocaleString()}
                sub="+1 every ~1.4s"
                color="#4f8ef7"
              />
              <MetricCard
                label="Fraud Rate"
                value={`${fraudRate}%`}
                sub={`${metrics.fraud} flagged transactions`}
                color={parseFloat(fraudRate) > 5 ? "#ef4444" : "#eab308"}
                trend={0.14}
              />
              <MetricCard
                label="Amount at Risk"
                value={`$${metrics.riskAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                sub="Pending review / declined"
                color="#f97316"
              />
              <MetricCard
                label="Model Accuracy"
                value={`${(accuracy * 100).toFixed(2)}%`}
                sub={`Avg latency ${metrics.latency}ms`}
                color="#22c55e"
                trend={-0.02}
              />
            </div>
          </div>

          {/* Transaction Feed + Alert Panel */}
          <div style={{ ...S.section, ...S.grid21 }}>
            <TransactionFeed transactions={transactions} />
            <AlertPanel alerts={alerts} />
          </div>

          {/* Charts */}
          <div style={{ ...S.section, ...S.grid2 }}>
            <FraudTrendChart data={timeSeries} />
            <RiskDistChart data={timeSeries} />
          </div>

          {/* Geo Risk + Model Performance */}
          <div style={{ ...S.section, ...S.grid21 }}>
            <GeoRiskTable />
            <ModelPanel
              accuracy={accuracy}
              latency={metrics.latency}
              totalScored={metrics.total}
            />
          </div>

        </div>
      </div>
    </>
  );
}
