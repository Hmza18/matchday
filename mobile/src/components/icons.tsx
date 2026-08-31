import Svg, { Path } from "react-native-svg";

type IconProps = {
  d: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function IconPath({ d, size = 21, color = "#1F2937", strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronLeft({ color = "#F8F8F8" }: { color?: string }) {
  return <IconPath d="M15 18l-6-6 6-6" size={17} color={color} strokeWidth={2.2} />;
}

export function ChevronRight({ color = "#F8F8F8" }: { color?: string }) {
  return <IconPath d="M9 6l6 6-6 6" size={17} color={color} strokeWidth={2.2} />;
}

export function RefreshIcon({ color = "#F8F8F8" }: { color?: string }) {
  return <IconPath d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" size={16} color={color} strokeWidth={2.1} />;
}

export function FlameIcon({ color = "#B45309" }: { color?: string }) {
  return <IconPath d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5" size={11} color={color} strokeWidth={2} />;
}

export function CheckIcon({ color = "#146C43" }: { color?: string }) {
  return <IconPath d="M20 6L9 17l-5-5" size={13} color={color} strokeWidth={2.6} />;
}

export function MinusIcon({ color = "#146C43" }: { color?: string }) {
  return <IconPath d="M5 12h14" size={17} color={color} strokeWidth={2.4} />;
}

export function PlusIcon({ color = "#146C43" }: { color?: string }) {
  return <IconPath d="M12 5v14M5 12h14" size={17} color={color} strokeWidth={2.4} />;
}

export function TrophyIcon({ color = "#198754" }: { color?: string }) {
  return <IconPath d="M7 4h10v4a5 5 0 0 1-10 0V4zM10 15h4v4h-4zM8 21h8" size={17} color={color} strokeWidth={1.9} />;
}

export function ChatIcon({ color = "#6B7280" }: { color?: string }) {
  return <IconPath d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.4-4.2A8 8 0 0 1 13 4a8 8 0 0 1 8 8z" size={15} color={color} strokeWidth={1.9} />;
}

export function SendIcon({ color = "#F8F8F8" }: { color?: string }) {
  return <IconPath d="M4 12l16-8-6 16-2.5-6.5L4 12z" size={18} color={color} strokeWidth={2} />;
}

export function SparkleIcon({ color = "#146C43" }: { color?: string }) {
  return (
    <IconPath
      d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9L18 16z"
      size={17}
      color={color}
      strokeWidth={1.8}
    />
  );
}

export function LockIcon({ color = "#146C43" }: { color?: string }) {
  return <IconPath d="M6 11h12v10H6zM9 11V8a3 3 0 0 1 6 0v3" size={17} color={color} strokeWidth={2} />;
}

export function ClockIcon({ locked, color = "#6B7280" }: { locked: boolean; color?: string }) {
  return (
    <IconPath
      d={locked ? "M6 11h12v10H6zM9 11V8a3 3 0 0 1 6 0v3" : "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"}
      size={12}
      color={color}
      strokeWidth={2}
    />
  );
}

export function CameraIcon({ color = "#F8F8F8" }: { color?: string }) {
  return (
    <IconPath
      d="M4 8h3l2-2h6l2 2h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
      size={14}
      color={color}
      strokeWidth={1.9}
    />
  );
}
