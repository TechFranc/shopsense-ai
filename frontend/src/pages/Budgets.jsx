import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiDollarSign } from 'react-icons/fi';
import { getBudgets, createBudget, deleteBudget, getCategoryBreakdown } from '../services/api';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', monthly_limit: '' });
  const [availableCategories, setAvailableCategories] = useState([]);

  // Default categories if no receipts exist yet
  const defaultCategories = [
    'groceries', 'electronics', 'clothing', 'dining', 'health', 
    'entertainment', 'home', 'transportation', 'other'
  ];

  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, []);

  const loadBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryData = await getCategoryBreakdown();
      // Get categories from actual receipt data
      const existingCategories = Object.keys(categoryData || {});
      
      // Combine with defaults and remove duplicates
      const allCategories = [...new Set([...existingCategories, ...defaultCategories])];
      setAvailableCategories(allCategories.sort());
    } catch (error) {
      console.error('Error loading categories:', error);
      setAvailableCategories(defaultCategories);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBudget({
        category: formData.category,
        monthly_limit: parseFloat(formData.monthly_limit)
      });
      setFormData({ category: '', monthly_limit: '' });
      setShowForm(false);
      loadBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Error creating budget. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await deleteBudget(id);
      loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gradient">Budget Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="glass-button-primary flex items-center gap-2"
        >
          <FiPlus /> {showForm ? 'Cancel' : 'Add Budget'}
        </button>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold mb-4">Create New Budget</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="glass-input w-full"
                required
              >
                <option value="">Select category</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-white/50 text-xs mt-1">
                {availableCategories.length === defaultCategories.length 
                  ? "Upload receipts to see your actual spending categories"
                  : `${availableCategories.length} categories available from your receipts`
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Limit ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthly_limit}
                onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                className="glass-input w-full"
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="glass-button-primary flex-1">
                Create Budget
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="glass-button flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Budget List */}
      {budgets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <FiDollarSign className="text-6xl mx-auto mb-4 text-white/50" />
          <h3 className="text-2xl font-bold mb-2">No Budgets Yet</h3>
          <p className="text-white/70 mb-4">Create your first budget to start tracking your spending!</p>
          <button
            onClick={() => setShowForm(true)}
            className="glass-button-primary"
          >
            <FiPlus className="inline mr-2" />
            Create Budget
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {budgets.map((budget, index) => {
            const percentage = budget.percentage_used;
            const status = percentage >= 100 ? 'over' : percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'ok';

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold capitalize">{budget.category}</h3>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-2 rounded-lg backdrop-blur-sm bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-all"
                  >
                    <FiTrash2 className="text-red-400" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Spent</p>
                    <p className="text-2xl font-bold">${budget.current_spent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-1">Budget</p>
                    <p className="text-2xl font-bold">${budget.monthly_limit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-1">Remaining</p>
                    <p className={`text-2xl font-bold ${budget.remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${Math.abs(budget.remaining).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      status === 'over' || status === 'danger' ? 'bg-gradient-to-r from-red-600 to-red-500' :
                      status === 'warning' ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                      'bg-gradient-to-r from-green-600 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <p className={`mt-2 text-sm font-semibold ${
                  status === 'over' || status === 'danger' ? 'text-red-400' :
                  status === 'warning' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {percentage.toFixed(1)}% used
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Budgets;