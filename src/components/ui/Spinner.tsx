interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div className={`${sizes[size]} ${className} relative`}>
      <div className="absolute inset-0 rounded-full border-2 border-brand-500/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
    </div>
  );
}
