import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { uploadReceipt } from '../services/api';
import { motion } from 'framer-motion';

const Upload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadStatus(null);

    try {
      const result = await uploadReceipt(file);
      setUploadStatus({ type: 'success', message: 'Receipt uploaded successfully!' });
      if (onUploadSuccess) onUploadSuccess(result);
      
      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to upload receipt' 
      });
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false
  });

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          {...getRootProps()}
          className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive ? 'border-purple-400 bg-white/20 scale-105' : 'border-white/20'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            className="mx-auto w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center"
          >
            <FiUpload className="text-5xl text-white" />
          </motion.div>

          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 mx-auto border-4 border-white/20 border-t-white"></div>
              <p className="text-xl font-semibold">Processing receipt...</p>
              <p className="text-white/70">AI is extracting your shopping data</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                {isDragActive ? 'Drop your receipt here!' : 'Upload Receipt'}
              </h3>
              <p className="text-white/70 text-lg">
                Drag & drop a receipt image, or click to browse
              </p>
              <p className="text-white/50 text-sm">
                Supports: PNG, JPG, JPEG, GIF, WEBP
              </p>
            </div>
          )}
        </div>

        {uploadStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
              uploadStatus.type === 'success' 
                ? 'bg-green-500/20 border border-green-400/30' 
                : 'bg-red-500/20 border border-red-400/30'
            }`}
          >
            {uploadStatus.type === 'success' ? (
              <FiCheckCircle className="text-2xl text-green-400" />
            ) : (
              <FiAlertCircle className="text-2xl text-red-400" />
            )}
            <p className="font-medium">{uploadStatus.message}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Upload;
