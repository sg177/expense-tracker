"use client";

import { useState } from "react";

export default function AIInsights() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getInsights = async () => {
    setLoading(true);
    setError("");
    setInsights("");

    try {
      const res = await fetch("/api/ai/insights");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setInsights(data.insights);
    } catch (err) {
      setError("Failed to get insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow mt-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">🤖 AI Spending Insights</h2>
          <p className="text-sm text-gray-400">
            Get personalized financial advice based on your spending
          </p>
        </div>
        <button
          onClick={getInsights}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Get AI Insights"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {insights && (
        <div className="bg-purple-50 rounded-lg p-4 mt-2">
          <p className="text-gray-700 whitespace-pre-wrap">{insights}</p>
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">
            Click "Get AI Insights" to analyze your spending and get personalized saving tips
          </p>
        </div>
      )}
    </div>
  );
}