// One small icon set, drawn to match the cards: 2.4px round strokes.

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const FlipIcon = () => (
  <Icon>
    <path d="M4 8a8 8 0 0 1 14-3l2 2M20 16a8 8 0 0 1-14 3l-2-2" />
    <path d="M20 3v4h-4M4 21v-4h4" />
  </Icon>
);

export const SaveIcon = () => (
  <Icon>
    <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
  </Icon>
);

export const ChatIcon = () => (
  <Icon>
    <path d="M4 5h16v11h-8l-5 4v-4H4z" />
  </Icon>
);

export const PostIcon = () => (
  <Icon>
    <path d="M5 5l14 14M19 5L5 19" />
  </Icon>
);

export const LinkIcon = () => (
  <Icon>
    <path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" />
  </Icon>
);

export const ClubIcon = () => (
  <Icon>
    <rect x="3" y="6" width="11" height="14" rx="2" />
    <path d="M10 6V4h11v14h-4" />
  </Icon>
);
