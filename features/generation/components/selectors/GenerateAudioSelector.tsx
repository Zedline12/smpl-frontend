interface GenerateAudioSelectorProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export default function GenerateAudioSelector({
  value,
  onChange,
  disabled,
  label,
}: GenerateAudioSelectorProps) {
  return (
    <div className="w-full bg-neutral-800 p-3 rounded-lg flex flex-row items-center justify-between gap-1">
      <p className="text-neutral-400 font-medium text-sm">{label || "Generate Audio"}</p>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          value ? "bg-primary" : "bg-neutral-600"
        }`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
