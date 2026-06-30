import { useNavigate } from 'react-router';
import { HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/30 flex flex-col items-center justify-center p-6 relative overflow-hidden font-poppins">
      {/* Mesh gradient background effect matching LandingPage */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,99,71,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,99,71,0.18),transparent_50%)] pointer-events-none" />

      {/* Floating abstract decorative shapes (sound waves theme) */}
      <div className="absolute top-1/4 left-1/10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      {/* Theme toggle in top right */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      {/* Glassmorphic Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg mx-auto bg-card/45 dark:bg-card/30 backdrop-blur-xl border border-border/40 dark:border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center flex flex-col items-center justify-center"
      >
        {/* Animated Icon Area */}
        <div className="relative mb-8">
          {/* Pulsing background rings for the icon */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-125 animate-pulse" />
          
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              y: [0, -4, 4, -4, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 6, 
              ease: "easeInOut" 
            }}
            className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 shadow-md"
          >
            <img src="/sv_vector.png" alt="Sound Voyage Logo" className="w-12 h-12 object-contain" />
          </motion.div>

          {/* Little question mark helper badge */}
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white shadow-md">
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Branded Title - Zilla Slab Serif Font */}
        <h1 className="font-zilla text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
          Looks like you've drifted off course!
        </h1>

        {/* Subtext message - Poppins Sans Font */}
        <p className="font-poppins text-base text-foreground/75 dark:text-foreground/80 leading-relaxed mb-10 max-w-sm">
          You may have reloaded the page or your session expired. Let's get you back to your voyage.
        </p>

        {/* Custom micro-animated primary action button */}
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="px-10 py-4 rounded-[2rem] bg-primary text-primary-foreground font-semibold font-poppins shadow-[0_8px_20px_rgba(255,99,71,0.3)] hover:shadow-[0_12px_24px_rgba(255,99,71,0.4)] transition-all duration-300 text-base cursor-pointer border-0 w-full sm:w-auto"
        >
          Return to Login
        </motion.button>
      </motion.div>

      {/* Branded watermark style footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-0">
        <span className="font-zilla text-xs uppercase tracking-[0.2em] text-foreground/30 font-bold">
          Sound Voyage
        </span>
      </div>
    </div>
  );
}
