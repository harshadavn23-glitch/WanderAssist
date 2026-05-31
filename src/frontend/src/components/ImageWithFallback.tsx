// ImageWithFallback.tsx
// Renders an <img> with graceful fallback when the image fails to load.
// Fallback: gradient bg (blue-to-indigo) + destination name + landscape icon.

import { ImageOff } from "lucide-react";
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  /** Extra style for both img and fallback container */
  style?: React.CSSProperties;
  /** Called when image fails to load */
  onError?: () => void;
}

/**
 * Drop-in replacement for <img> that shows a styled placeholder
 * when the image URL fails to load — no broken-image browser icon ever shown.
 */
export function ImageWithFallback({
  src,
  alt,
  className = "",
  fallbackLabel,
  style,
  onError,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  const label = fallbackLabel ?? alt;

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 select-none ${className}`}
        style={{
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #312e81 60%, #4c1d95 100%)",
          ...style,
        }}
        aria-label={label}
        role="img"
      >
        <ImageOff className="w-8 h-8 text-white/40 shrink-0" />
        <span className="text-white/70 text-xs font-medium text-center px-2 leading-tight line-clamp-2">
          {label}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        setFailed(true);
        onError?.();
      }}
      loading="lazy"
    />
  );
}
