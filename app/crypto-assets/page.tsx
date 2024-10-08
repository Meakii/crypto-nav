"use client"

import { motion } from 'framer-motion';

export default function CryptoAssets() {
  return (
    <motion.div
      className="flex-1 overflow-y-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold mb-6">Crypto Assets</h1>
      <p>Manage your cryptocurrency portfolio here.</p>
    </motion.div>
  );
}