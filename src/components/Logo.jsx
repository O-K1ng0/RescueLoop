export default function Logo({ size = 36 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="RescueLoop logo"
    >
      <defs>
        <linearGradient id="rl-logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#059669" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#rl-logo-grad)" />
      <path d="M 35.88 17.51 A 15 15 0 1 0 46.49 28.12" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
      <path d="M 25 41 C 24 30 31 23 41 23 C 41 33 35 40 25 41 Z" fill="#ffffff" />
      <path d="M 26.5 39.5 L 37 28" fill="none" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
