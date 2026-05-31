interface WanderAssistLogoProps {
  className?: string;
}

export function WanderAssistLogo({ className }: WanderAssistLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="WanderAssist logo"
      role="img"
      className={className}
    >
      {/* Circular black background */}
      <circle cx="50" cy="50" r="50" fill="#000000" />

      {/* Clip everything to circle */}
      <defs>
        <clipPath id="circle-clip">
          <circle cx="50" cy="50" r="49" />
        </clipPath>
      </defs>
      <g clipPath="url(#circle-clip)">
        {/* ── Tribal horn / wing shapes ── */}
        {/* Left wing */}
        <path
          d="M50 22 C46 20.5, 39 17.5, 33 13 C28.5 9.5, 24 8, 21 11 C24 12.5, 28 14, 31 17.5 C26 16, 20.5 14.5, 17.5 18 C22 19.5, 28.5 21, 32 26 C27 24.5, 21.5 24.5, 18.5 29 C24 27.5, 31.5 29, 36 32 L50 28 Z"
          fill="#ffffff"
        />
        {/* Right wing (mirror) */}
        <path
          d="M50 22 C54 20.5, 61 17.5, 67 13 C71.5 9.5, 76 8, 79 11 C76 12.5, 72 14, 69 17.5 C74 16, 79.5 14.5, 82.5 18 C78 19.5, 71.5 21, 68 26 C73 24.5, 78.5 24.5, 81.5 29 C76 27.5, 68.5 29, 64 32 L50 28 Z"
          fill="#ffffff"
        />

        {/* ── Brand name ── */}
        <text
          x="50"
          y="46"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Cinzel', 'Trajan Pro', Georgia, 'Times New Roman', serif"
          fontWeight="700"
          fontSize="8"
          letterSpacing="1.2"
          fill="#ffffff"
        >
          WANDERASSIST
        </text>

        {/* ── 8-point compass / star (below text) ── */}
        <g transform="translate(50, 62)">
          {/* Cardinal points */}
          <polygon points="0,-7 1.6,-2.5 0,-4 -1.6,-2.5" fill="#ffffff" />
          <polygon points="0,7 1.6,2.5 0,4 -1.6,2.5" fill="#ffffff" />
          <polygon points="7,0 2.5,-1.6 4,0 2.5,1.6" fill="#ffffff" />
          <polygon points="-7,0 -2.5,-1.6 -4,0 -2.5,1.6" fill="#ffffff" />
          {/* Diagonal points */}
          <polygon points="4.5,-4.5 2,-1.2 3.2,-3.2 1.2,-2" fill="#ffffff" />
          <polygon
            points="-4.5,-4.5 -2,-1.2 -3.2,-3.2 -1.2,-2"
            fill="#ffffff"
          />
          <polygon points="4.5,4.5 2,1.2 3.2,3.2 1.2,2" fill="#ffffff" />
          <polygon points="-4.5,4.5 -2,1.2 -3.2,3.2 -1.2,2" fill="#ffffff" />
          {/* Center dot */}
          <circle cx="0" cy="0" r="0.9" fill="#ffffff" />
        </g>

        {/* ── Tagline ── */}
        <text
          x="50"
          y="79"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Cinzel', Georgia, 'Times New Roman', serif"
          fontWeight="400"
          fontSize="4.2"
          letterSpacing="1.4"
          fill="#ffffff"
          opacity="0.82"
        >
          TRAVEL SMART · TRAVEL SAFE
        </text>
      </g>
    </svg>
  );
}
