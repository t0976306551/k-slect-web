const PROGRESS_STEPS = [
  { key: "placed", label: "下單" },
  { key: "confirmed", label: "付款" },
  { key: "shipped", label: "出貨" },
  { key: "received", label: "收貨" },
] as const;

const STATUS_PROGRESS: Record<string, number> = {
  pending_ship: 1,
  shipped: 2,
  completed: 3,
  cancelled: -1,
};

const SAGE = "#7C9070";
const GRAY = "#E8E8E8";
const MUTED = "#BBBBBB";

interface ProgressTrackerProps {
  readonly status: string;
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M2 5.2 L4 7 L8 3"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProgressTracker({ status }: ProgressTrackerProps) {
  const progressIdx = STATUS_PROGRESS[status] ?? 0;

  return (
    <div className="flex items-start">
      {PROGRESS_STEPS.map((step, idx) => {
        const done = idx <= progressIdx;
        const active = idx === progressIdx;
        const isFirst = idx === 0;
        const isLast = idx === PROGRESS_STEPS.length - 1;

        const leftColor = isFirst ? "transparent" : done ? SAGE : GRAY;
        const rightColor = isLast ? "transparent" : idx < progressIdx ? SAGE : GRAY;

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <div className="flex-1 h-[2px]" style={{ background: leftColor }} />
              <div className="relative flex items-center justify-center shrink-0">
                {active && (
                  <span className="absolute w-7 h-7 rounded-full bg-[#7C9070]/20 animate-ping" />
                )}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: done ? SAGE : GRAY }}
                >
                  {done && <CheckIcon />}
                </div>
              </div>
              <div className="flex-1 h-[2px]" style={{ background: rightColor }} />
            </div>
            <span
              className="text-[11px] mt-2 font-medium"
              style={{ color: done ? SAGE : MUTED }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
