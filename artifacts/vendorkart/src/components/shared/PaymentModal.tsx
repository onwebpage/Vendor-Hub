import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldCheck, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId?: number;
  onSuccess: (transactionId: string) => void;
}

export function PaymentModal({ isOpen, onClose, amount, onSuccess }: PaymentModalProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) setStatus('idle');
  }, [isOpen]);

  const handlePay = () => {
    setStatus('processing');
    // Simulate payment gateway delay
    setTimeout(() => {
      setStatus('success');
      // Simulate success callback delay
      setTimeout(() => {
        onSuccess(`TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => status === 'idle' && onClose()}
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden"
      >
        {status === 'idle' && (
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-8">
          {status === 'idle' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-2xl">Secure Checkout</h3>
                <p className="text-muted-foreground text-sm mt-2">Vendorkart B2B Payment Gateway</p>
              </div>

              <div className="bg-secondary/50 p-4 rounded-2xl border border-border text-center">
                <div className="text-sm text-muted-foreground mb-1">Amount to Pay</div>
                <div className="font-display font-bold text-4xl text-foreground">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40"
                  onClick={handlePay}
                >
                  Pay Now
                </Button>
                <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 256-bit SSL Encrypted
                </div>
              </div>
            </div>
          )}

          {status === 'processing' && (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h3 className="font-display font-bold text-xl">Processing Payment...</h3>
              <p className="text-muted-foreground">Please do not close this window or press back.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h3 className="font-display font-bold text-2xl text-green-600">Payment Successful!</h3>
              <p className="text-muted-foreground">Redirecting to order confirmation...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
