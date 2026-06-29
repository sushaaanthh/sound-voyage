import { AlertTriangle, X } from 'lucide-react';

interface QuitGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function QuitGameModal({ isOpen, onClose, onConfirm }: QuitGameModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Glassmorphism Card */}
      <div 
        className="bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 relative text-foreground flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-2 hover:bg-secondary/50 rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-4 mb-8">
          {/* Warning Icon with Standard Primary Glow */}
          <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6 ring-8 ring-primary/5 animate-pulse">
            <AlertTriangle className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Voyage Interrupted!
          </h2>
          
          <p className="text-base text-muted-foreground mt-4 leading-relaxed max-w-sm">
            Are you sure you want to quit? Quitting now will reset your score and reset progress for this level.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-[1.5rem] bg-secondary/80 hover:bg-muted text-foreground border border-border/40 font-bold hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Keep Playing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-4 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 font-bold hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Yes, Quit
          </button>
        </div>
      </div>
    </div>
  );
}
