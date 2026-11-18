import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error('Password is required.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Your password has been updated successfully. Please log in.');
        navigate('/');
      }
    } catch (err) {
      console.error('Password update error:', err);
      toast.error('An unexpected error occurred during password update.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/30 flex flex-col items-center justify-center p-6 relative overflow-y-auto overflow-x-hidden">
      {/* Mesh gradient background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,99,71,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,99,71,0.15),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300 text-foreground">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-center">Update Password</h2>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Enter and confirm your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label htmlFor="newPassword" className="block mb-1.5 text-sm font-medium text-foreground">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-5 py-3 pr-12 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-left">
            <label htmlFor="confirmPassword" className="block mb-1.5 text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-5 py-3 pr-12 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-8 py-4 rounded-[2rem] bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 font-semibold text-sm cursor-pointer"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
