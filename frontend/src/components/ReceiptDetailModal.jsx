import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingCart, FiCalendar, FiDollarSign, FiPackage, FiLoader } from 'react-icons/fi';
import { getReceiptDetail } from '../services/api';

const CATEGORY_COLORS = {
  groceries: 'bg-green-500/20 text-green-400',
  electronics: 'bg-blue-500/20 text-blue-400',
  restaurant: 'bg-orange-500/20 text-orange-400',
  clothing: 'bg-pink-500/20 text-pink-400',
  other: 'bg-gray-500/20 text-gray-400',
};

const ReceiptDetailModal = ({ receiptId, onClose }) => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getReceiptDetail(receiptId);
        setReceipt(data);
      } catch (err) {
        setError("Failed to load receipt details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [receiptId]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FiShoppingCart className="text-purple-400" />
              Receipt Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <FiLoader className="text-4xl mx-auto mb-4 animate-spin text-purple-400" />
              <p className="text-white/60">Loading receipt...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Content */}
          {receipt && !loading && (
            <div className="space-y-6">

              {/* Receipt Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                  <FiShoppingCart className="text-purple-400 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">Store</p>
                    <p className="font-bold">{receipt.store_name || "Unknown Store"}</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                  <FiCalendar className="text-pink-400 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">Purchase Date</p>
                    <p className="font-bold">
                      {receipt.purchase_date
                        ? new Date(receipt.purchase_date).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                  <FiDollarSign className="text-green-400 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">Total Amount</p>
                    <p className="font-bold text-green-400">
                      ${receipt.total_amount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <FiPackage className="text-purple-400" />
                  Items ({receipt.items?.length || 0})
                </h3>

                {receipt.items?.length === 0 ? (
                  <div className="text-center py-8 text-white/50">
                    No items extracted for this receipt.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-2 text-white/50 text-sm font-medium">Item</th>
                          <th className="text-left py-3 px-2 text-white/50 text-sm font-medium">Category</th>
                          <th className="text-center py-3 px-2 text-white/50 text-sm font-medium">Qty</th>
                          <th className="text-right py-3 px-2 text-white/50 text-sm font-medium">Price</th>
                          <th className="text-right py-3 px-2 text-white/50 text-sm font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receipt.items.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 px-2 font-medium">{item.name}</td>
                            <td className="py-3 px-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                CATEGORY_COLORS[item.category?.toLowerCase()] || CATEGORY_COLORS.other
                              }`}>
                                {item.category || "other"}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center text-white/70">{item.quantity}</td>
                            <td className="py-3 px-2 text-right text-white/70">${item.price?.toFixed(2)}</td>
                            <td className="py-3 px-2 text-right font-semibold text-purple-400">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                      {/* Total Row */}
                      <tfoot>
                        <tr className="border-t-2 border-white/20">
                          <td colSpan={4} className="py-3 px-2 text-right font-bold">Total</td>
                          <td className="py-3 px-2 text-right font-bold text-green-400 text-lg">
                            ${receipt.total_amount?.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs text-white/40">
                <span>File: {receipt.filename}</span>
                <span>Uploaded: {new Date(receipt.upload_date).toLocaleDateString()}</span>
              </div>

            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReceiptDetailModal;