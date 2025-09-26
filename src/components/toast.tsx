type ToastProps = {
  message: string;
  onClose?: () => void;
};

export default function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="fixed top-5 right-5 z-50 animate-slideIn">
      <div className="bg-emerald-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg border border-emerald-500 flex items-center gap-3">
        <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0
             01-1.414 0l-4-4a1 1 0 011.414-1.414L8
             12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 text-white/80 hover:text-white" aria-label="Close">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
