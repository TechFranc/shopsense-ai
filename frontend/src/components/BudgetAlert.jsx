import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiAlertCircle, FiX } from 'react-icons/fi';

const BudgetAlert = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'danger': return FiAlertTriangle;
      case 'warning': return FiAlertCircle;
      default: return FiAlertCircle;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'danger': return 'from-red-500/30 to-orange-500/30 border-red-400/40';
      case 'warning': return 'from-yellow-500/30 to-orange-500/30 border-yellow-400/40';
      default: return 'from-blue-500/30 to-cyan-500/30 border-blue-400/40';
    }
  };

  return (
    <div className="fixed top-24 right-6 z-50 space-y-3 max-w-md">
      <AnimatePresence>
        {alerts.map((alert, index) => {
          const Icon = getAlertIcon(alert.severity);
          const colorClass = getAlertColor(alert.severity);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`glass-card bg-gradient-to-r ${colorClass} p-4 shadow-glass-lg`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  alert.severity === 'danger' ? 'bg-red-500/30' : 'bg-yellow-500/30'
                }`}>
                  <Icon className="text-xl text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">{alert.title}</h4>
                  <p className="text-white/80 text-sm">{alert.message}</p>
                </div>
                <button
                  onClick={() => onDismiss(index)}
                  className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default BudgetAlert;