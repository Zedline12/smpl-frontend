interface DurationSelectorProps<T extends number = number> {
  options: readonly T[];
  value: T | undefined;
  onChange: (value: T) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * A slider from the model's shortest to longest duration. It moves through the allowed
 * values only, so models with gaps (e.g. 4 / 6 / 8 s) still snap to valid lengths.
 */
export default function DurationSelector<T extends number = number>({
  options,
  value,
  onChange,
  disabled,
  label = "Duration",
}: DurationSelectorProps<T>) {
  if (!options.length) return null;
  const index = Math.max(0, options.indexOf(value ?? options[0]));
  const current = options[index];
  const min = options[0];
  const max = options[options.length - 1];

  return (
    <div className="flex w-full min-w-[220px] flex-col gap-2 rounded-lg bg-background-light p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground tabular-nums">{current}s</span>
      </div>
      <input
        type="range"
        min={0}
        max={options.length - 1}
        step={1}
        value={index}
        disabled={disabled || options.length < 2}
        onChange={(e) => onChange(options[Number(e.target.value)])}
        // Keep a tap on the slider from closing the menu it sits in.
        onClick={(e) => e.stopPropagation()}
        aria-label={`${label} in seconds`}
        aria-valuetext={`${current} seconds`}
        className="w-full cursor-pointer accent-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{min}s</span>
        <span>{max}s</span>
      </div>
    </div>
  );
}
