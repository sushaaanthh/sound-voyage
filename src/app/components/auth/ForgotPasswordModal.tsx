import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email address is required.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'http://localhost:5173/update-password',
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('If an account exists, a reset link has been sent.');
        setEmail('');
        onClose();
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error('An unexpected error occurred during password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in">
      <div className="bg-card border border-border rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300 relative text-foreground">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 text-muted-foreground hover:text-foreground"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h2>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label htmlFor="reset-email" className="block mb-2 text-sm font-medium text-foreground">
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-8 py-4 rounded-[2rem] bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 font-bold"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
