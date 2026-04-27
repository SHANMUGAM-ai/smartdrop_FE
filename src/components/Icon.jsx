const baseStyle = {
  width: '1em',
  height: '1em',
  display: 'inline-block',
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  verticalAlign: 'middle',
};

function Svg({ children, style }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ ...baseStyle, ...style }}>
      {children}
    </svg>
  );
}

const iconMap = {
  package: (<Svg><path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z" /><path d="M4.5 7 12 11l7.5-4" /><path d="M12 11v10" /></Svg>),
  location: (<Svg><path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z" /><circle cx="12" cy="10" r="2.2" /></Svg>),
  truck: (<Svg><path d="M3 7h11v8H3z" /><path d="M14 10h3l3 3v2h-6z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="17.5" cy="17.5" r="1.5" /></Svg>),
  chat: (<Svg><path d="M5 6.5h14v9H9l-4 3v-3H5z" /><path d="M8.5 10.5h7" /><path d="M8.5 13h4.5" /></Svg>),
  home: (<Svg><path d="M4 10.5 12 4l8 6.5" /><path d="M6.5 9.5V20h11V9.5" /><path d="M10 20v-5h4v5" /></Svg>),
  history: (<Svg><path d="M5 6.5h14V20H5z" /><path d="M8 4v5" /><path d="M16 4v5" /><path d="M8 11h8" /><path d="M8 15h5" /></Svg>),
  support: (<Svg><path d="M12 19v-2.5" /><path d="M7.5 9.5a4.5 4.5 0 1 1 7.2 3.6c-1 .8-1.7 1.4-1.7 2.4" /><circle cx="12" cy="21" r=".7" fill="currentColor" stroke="none" /></Svg>),
  search: (<Svg><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></Svg>),
  arrowRight: (<Svg><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>),
  route: (<Svg><circle cx="6.5" cy="17.5" r="1.5" /><circle cx="17.5" cy="6.5" r="1.5" /><path d="M8 17.5c4.5 0 1-8 7-8" /><path d="m13.5 7 2-2 2 2" /></Svg>),
  lock: (<Svg><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8.5a4 4 0 1 1 8 0V11" /></Svg>),
  money: (<Svg><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M7 9h.01M17 15h.01" /></Svg>),
  size: (<Svg><path d="M5 8V5h3" /><path d="m19 8V5h-3" /><path d="M5 16v3h3" /><path d="m19 16v3h-3" /><path d="M9 5 5 9" /><path d="m15 5 4 4" /><path d="m9 19-4-4" /><path d="m15 19 4-4" /></Svg>),
  partner: (<Svg><circle cx="9" cy="8" r="2.5" /><path d="M4.5 18a4.5 4.5 0 0 1 9 0" /><path d="M15 9h5" /><path d="M17.5 6.5v5" /></Svg>),
  flag: (<Svg><path d="M6 4v16" /><path d="M6 5h10l-1.5 3L16 11H6" /></Svg>),
  bike: (<Svg><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M7 17 10 10h4l3 7" /><path d="M10 10h3" /><path d="M11 10 9 6" /></Svg>),
  auto: (<Svg><path d="M3 15h14l2-5H5L3 15Z" /><circle cx="6" cy="18" r="2" /><circle cx="14" cy="18" r="2" /><path d="M5 10h4" /></Svg>),
  van: (<Svg><path d="M3 15h14v-6H6L3 12v3Z" /><circle cx="6" cy="18" r="2" /><circle cx="14" cy="18" r="2" /><path d="M12 9h5" /></Svg>),
  scooter: (<Svg><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M9 17h5l2.5-5H13" /><path d="M10.5 9H13l-1.2 3" /><path d="M9.5 9H7" /></Svg>),
  user: (<Svg><circle cx="12" cy="8" r="3" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" /></Svg>),
};

export default function Icon({ name, size = 20, style, className }) {
  const icon = iconMap[name];
  if (!icon) return null;

  return (
    <span className={className} style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      {icon}
    </span>
  );
}
