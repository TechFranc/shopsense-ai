import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiCalendar, FiTrendingUp, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { getRecurringExpenses } from '../services/api';

// Confidence badge color
const confidenceColor = {
  high: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Frequency badge color
const frequencyColor = {
  weekly: 'bg-blue-500/20 text-blue-400',
  biweekly: 'bg-purple-500/20 text-purple-400',
  monthly: 'bg-pink-500/20 text-pink-400',
  irregular: 'bg-gray-500/20 text-gray-400',
};

const RecurringExpenses = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecurring = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecurringExpenses();
      setData(result);
    } catch (err) {
      setError('Failed to load recurring analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  return (
    <div className="mb-12">

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Recurring Expenses</h2>
          <p className="text-white/50 text-sm mt-1">AI-detected patterns from your receipt history</p>
        </div>
        <motion.button
          onClick={fetchRecurring}
          className="glass-button flex items-center gap-2 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh Analysis
        </motion.button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-12 text-center">
          <FiLoader className="text-4xl mx-auto mb-4 animate-spin text-purple-400" />
          <p className="text-white/70">Gemini AI is analyzing your spending patterns...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="glass-card p-6 flex items-center gap-4 border border-red-500/30">
          <FiAlertCircle className="text-red-400 text-2xl flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-6">

          {/* Summary + Monthly Total */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 glass-card p-6">
              <h3 className="font-semibold text-white/80 mb-2 flex items-center gap-2">
                <FiTrendingUp className="text-purple-400" />
                AI Summary
              </h3>
              <p className="text-white/70 leading-relaxed">{data.summary}</p>
            </div>
            <div className="glass-card p-6 text-center flex flex-col justify-center">
              <p className="text-white/50 text-sm mb-1">Est. Monthly Recurring</p>
              <p className="text-4xl font-bold text-gradient">
                ${data.total_monthly_recurring?.toFixed(2) || '0.00'}
              </p>
              <p className="text-white/40 text-xs mt-2">Based on detected patterns</p>
            </div>
          </div>

          {/* No Patterns Found */}
          {data.patterns?.length === 0 && (
            <div className="glass-card p-10 text-center">
              <FiCalendar className="text-5xl mx-auto mb-4 text-white/30" />
              <p className="text-white/60 text-lg">No recurring patterns detected yet.</p>
              <p className="text-white/40 text-sm mt-2">Upload more receipts over time to see patterns emerge.</p>
            </div>
          )}

          {/* Pattern Cards */}
          {data.patterns?.length > 0 && (
            <div>
              <h3 className="font-semibold text-white/70 mb-4">Detected Patterns ({data.patterns.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.patterns.map((pattern, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-5 hover:scale-105 transition-transform"
                  >
                    {/* Pattern Name & Type */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-lg leading-tight">{pattern.name}</p>
                        <span className="text-xs text-white/40 capitalize">{pattern.type}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${confidenceColor[pattern.confidence]}`}>
                        {pattern.confidence} confidence
                      </span>
                    </div>

                    {/* Amount & Frequency */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-2xl font-bold text-purple-400">
                        ${pattern.average_amount?.toFixed(2)}
                      </p>
                      <span className={`text-xs px-3 py-1 rounded-full ${frequencyColor[pattern.frequency]}`}>
                        {pattern.frequency}
                      </span>
                    </div>

                    {/* Occurrences */}
                    <p className="text-white/50 text-xs mb-3">
                      Seen {pattern.occurrences} time{pattern.occurrences !== 1 ? 's' : ''}
                    </p>

                    {/* Next Predicted */}
                    {pattern.next_predicted && (
                      <div className="flex items-center gap-2 text-xs text-white/60 mb-3 bg-white/5 rounded-lg p-2">
                        <FiCalendar className="text-purple-400 flex-shrink-0" />
                        <span>Next expected: <span className="text-white">{pattern.next_predicted}</span></span>
                      </div>
                    )}

                    {/* AI Insight */}
                    <p className="text-white/50 text-xs italic border-t border-white/10 pt-3">
                      "{pattern.insight}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Forecast */}
          {data.forecast?.length > 0 && (
            <div>
              <h3 className="font-semibold text-white/70 mb-4">Upcoming Forecast</h3>
              <div className="glass-card p-6">
                <div className="space-y-3">
                  {data.forecast.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        <p className="font-medium">{item.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-400">${item.predicted_amount?.toFixed(2)}</p>
                        <p className="text-white/40 text-xs">{item.predicted_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default RecurringExpenses;