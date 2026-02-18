import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFile, FiTrash2, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { getReceipts, deleteReceipt } from '../services/api';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;
    
    try {
      await deleteReceipt(id);
      setReceipts(receipts.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting receipt:', error);
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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gradient">Your Receipts</h2>

      {receipts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <FiFile className="text-6xl mx-auto mb-4 text-white/50" />
          <h3 className="text-2xl font-bold mb-2">No Receipts Yet</h3>
          <p className="text-white/70">Upload your first receipt to get started!</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {receipts.map((receipt, index) => (
            <motion.div
              key={receipt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 hover:scale-102"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                      <FiFile className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{receipt.store_name || 'Unknown Store'}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <FiCalendar />
                          {new Date(receipt.purchase_date || receipt.upload_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiDollarSign />
                          ${(receipt.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  {receipt.items && receipt.items.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-white/70">Items:</p>
                      <div className="grid gap-2">
                        {receipt.items.slice(0, 3).map(item => (
                          <div key={item.id} className="flex justify-between text-sm backdrop-blur-sm bg-white/5 rounded-lg px-3 py-2">
                            <span>{item.name}</span>
                            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {receipt.items.length > 3 && (
                          <p className="text-xs text-white/50 px-3">
                            +{receipt.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="ml-4 p-2 rounded-lg backdrop-blur-sm bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-all"
                  title="Delete receipt"
                >
                  <FiTrash2 className="text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Receipts;
