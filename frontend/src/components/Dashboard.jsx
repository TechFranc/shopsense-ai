import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiPackage, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSpendingAnalytics, getCategoryBreakdown, getBudgets } from '../services/api';
import BudgetAlert from './BudgetAlert';
import RecurringExpenses from './RecurringExpenses';

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, categoriesData, budgetsData] = await Promise.all([
        getSpendingAnalytics(),
        getCategoryBreakdown(),
        getBudgets()
      ]);
      setAnalytics(analyticsData);
      setCategories(categoriesData);
      setBudgets(budgetsData);
      
      // Check for budget alerts
      checkBudgetAlerts(budgetsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBudgetAlerts = (budgetData) => {
    const newAlerts = [];
    
    budgetData.forEach(budget => {
      const percentage = budget.percentage_used;
      
      if (percentage >= 100) {
        newAlerts.push({
          severity: 'danger',
          title: `${budget.category} Budget Exceeded!`,
          message: `You've spent $${budget.current_spent.toFixed(2)} of $${budget.monthly_limit.toFixed(2)} (${percentage.toFixed(0)}%)`
        });
      } else if (percentage >= 90) {
        newAlerts.push({
          severity: 'danger',
          title: `${budget.category} Budget Alert`,
          message: `You've used ${percentage.toFixed(0)}% of your budget. Only $${budget.remaining.toFixed(2)} left!`
        });
      } else if (percentage >= 75) {
        newAlerts.push({
          severity: 'warning',
          title: `${budget.category} Budget Warning`,
          message: `You've used ${percentage.toFixed(0)}% of your budget. $${budget.remaining.toFixed(2)} remaining.`
        });
      }
    });
    
    setAlerts(newAlerts);
  };

  const dismissAlert = (index) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-md mx-auto"
        >
          <FiShoppingCart className="text-6xl mx-auto mb-4 text-white/50" />
          <h3 className="text-2xl font-bold mb-2">No Data Yet</h3>
          <p className="text-white/70">Upload some receipts to see your spending analytics!</p>
        </motion.div>
      </div>
    );
  }

  const categoryData = Object.entries(categories || {}).map(([name, data]) => ({
    name,
    value: data.total,
    percentage: data.percentage
  }));

  const statCards = [
    {
      title: 'Total Spent',
      value: `$${analytics.total_spent.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Transactions',
      value: analytics.transaction_count,
      icon: FiShoppingCart,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Avg Transaction',
      value: `$${analytics.average_transaction.toFixed(2)}`,
      icon: FiTrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Top Category',
      value: analytics.top_category || 'N/A',
      icon: FiPackage,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Budget Alerts */}
      <BudgetAlert alerts={alerts} onDismiss={dismissAlert} />

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card group hover:scale-105"
          >
            <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:shadow-lg transition-all`}>
              <stat.icon className="text-2xl text-white" />
            </div>
            <p className="text-white/70 text-sm mb-1">{stat.title}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

{/* Export Buttons */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="flex gap-4 justify-center mb-8"
>
  <button
    onClick={() => window.open('http://localhost:8000/api/exports/monthly-report-pdf', '_blank')}
    className="glass-button-primary flex items-center gap-2"
  >
    <FiDownload className="text-lg" />
    Download PDF Report
  </button>
  <button
    onClick={() => window.open('http://localhost:8000/api/exports/receipts-csv', '_blank')}
    className="glass-button flex items-center gap-2"
  >
    <FiDownload className="text-lg" />
    Export to Excel (CSV)
  </button>
</motion.div>
      {/* Budget Overview Section */}
      {budgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Budget Tracking</h3>
            <Link to="/budgets">
              <button className="glass-button text-sm">Manage Budgets</button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const percentage = budget.percentage_used;
              const status = percentage >= 100 ? 'over' : percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'ok';
              
              const statusColors = {
                over: 'from-red-600 to-red-500',
                danger: 'from-orange-600 to-red-500',
                warning: 'from-yellow-600 to-orange-500',
                ok: 'from-green-600 to-emerald-500'
              };

              return (
                <motion.div
                  key={budget.id}
                  className="glass-card p-5"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg capitalize">{budget.category}</h4>
                    {status !== 'ok' && (
                      <FiAlertTriangle className={`text-xl ${
                        status === 'over' || status === 'danger' ? 'text-red-400' : 'text-yellow-400'
                      } animate-pulse`} />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Spent</span>
                      <span className="font-semibold">${budget.current_spent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Budget</span>
                      <span className="font-semibold">${budget.monthly_limit.toFixed(2)}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="progress-bar mt-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full bg-gradient-to-r ${statusColors[status]}`}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm font-semibold ${
                        status === 'over' || status === 'danger' ? 'text-red-400' :
                        status === 'warning' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {percentage.toFixed(0)}% used
                      </span>
                      <span className="text-sm text-white/70">
                        {budget.remaining >= 0 ? `$${budget.remaining.toFixed(2)} left` : `$${Math.abs(budget.remaining).toFixed(2)} over`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold mb-4">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-bold mb-6">Category Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(categories || {}).map(([category, data], index) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-semibold">{category}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">${data.total.toFixed(2)}</span>
                  <span className="text-white/50 ml-2">({data.percentage}%)</span>
                </div>
              </div>
              <div className="progress-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  className="progress-fill"
                  style={{ 
                    background: `linear-gradient(to right, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <RecurringExpenses />
    </div>
  );
};

export default Dashboard;