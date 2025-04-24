import { cn } from "@/lib/utils";

type LabelColor = 
  | "red" 
  | "green" 
  | "blue" 
  | "yellow" 
  | "purple" 
  | "orange" 
  | "gray";

interface LabelBadgeProps {
  color: LabelColor;
  text: string;
  className?: string;
}

const colorStyles: Record<LabelColor, string> = {
  red: "bg-red-900 text-red-100",
  green: "bg-green-900 text-green-100",
  blue: "bg-blue-900 text-blue-100",
  yellow: "bg-yellow-900 text-yellow-100",
  purple: "bg-purple-900 text-purple-100",
  orange: "bg-orange-900 text-orange-100",
  gray: "bg-gray-700 text-gray-100"
};

export default function LabelBadge({ color, text, className }: LabelBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-block px-2 py-0.5 text-xs rounded-full", 
        colorStyles[color],
        className
      )}
    >
      {text}
    </span>
  );
}

// Helper function to get a consistent color based on label text
export function getLabelColor(label: string): LabelColor {
  const colors: LabelColor[] = ["red", "green", "blue", "yellow", "purple", "orange", "gray"];
  
  // Simple hash function to get deterministic color based on label
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash + label.charCodeAt(i)) % colors.length;
  }
  
  return colors[hash];
}
