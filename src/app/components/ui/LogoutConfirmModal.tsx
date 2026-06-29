import { LogOut, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
      {/* Modal Card */}
      <div 
        className="bg-card border border-border rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-5">
            <LogOut className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Log Out</h2>
          <p className="text-base text-muted-foreground mt-3 leading-relaxed">
            Do you want to log out surely?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-[1.5rem] bg-secondary hover:bg-muted text-foreground border border-border font-bold hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-4 rounded-[1.5rem] bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg hover:shadow-destructive/20 font-bold hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
