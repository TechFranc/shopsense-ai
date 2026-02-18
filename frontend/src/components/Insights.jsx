import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { getInsights, getRecommendations, generateInsights } from '../services/api';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [insightsData, recsData] = await Promise.all([
        getInsights(),
        getRecommendations()
      ]);
      setInsights(insightsData);
      setRecommendations(recsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateInsights();
      await loadData();
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'impulse': return FiZap;
      case 'trend': return FiTrendingUp;
      default: return FiZap;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gradient">AI Insights</h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="glass-button-primary flex items-center gap-2"
        >
          <FiRefreshCw className={generating ? 'animate-spin' : ''} />
          {generating ? 'Analyzing...' : 'Generate New Insights'}
        </button>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold">💡 Recommendations</h3>
          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-102"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <FiZap className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">{rec.title}</h4>
                      {rec.potential_savings && (
                        <span className="category-badge bg-green-500/20 border-green-400/30">
                          Save ${rec.potential_savings.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-white/70">{rec.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights */}
      {insights.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold">🔍 Spending Insights</h3>
          <div className="grid gap-4">
            {insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.insight_type);
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg">{insight.title}</h4>
                        <span className="category-badge text-xs">
                          {insight.insight_type}
                        </span>
                      </div>
                      <p className="text-white/70">{insight.description}</p>
                      {insight.amount && (
                        <p className="text-sm text-white/50 mt-2">Amount: ${insight.amount.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <FiZap className="text-6xl mx-auto mb-4 text-white/50" />
          <h3 className="text-2xl font-bold mb-2">No Insights Yet</h3>
          <p className="text-white/70 mb-6">Generate AI insights from your spending data</p>
          <button onClick={handleGenerate} className="glass-button-primary">
            Generate Insights
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Insights;
