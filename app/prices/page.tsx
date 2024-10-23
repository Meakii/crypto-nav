"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Prices() {
  return (
    <motion.div
      className="flex-1 overflow-y-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold mb-6">Prices</h1>
      {/* <p>View the latest market prices here.</p> */}

      <div className="flex flex-row gap-4">
        <Button variant="primary">Deposit AUD</Button>
        <Button variant="secondary">Withdraw</Button>
      </div>
    </motion.div>
  );
}
