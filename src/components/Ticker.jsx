import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_ITEMS = [
  { icon: '🚚', text: 'SmartDrop delivers groceries, food, and essentials across Vellore' },
  { icon: '⚡', text: 'Book express delivery in minutes with live order tracking' },
  { icon: '📦', text: 'Single item, multi-item, and bulk delivery options available' },
  { icon: '🏍️', text: 'Trusted local partners pick up and deliver right to your doorstep' },
  { icon: '💸', text: 'Simple pricing, secure payments, and fast support with SmartDrop' },
];

export default function Ticker({ items = DEFAULT_ITEMS, speed = 30 }) {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationId;
    let pos = 0;

    const animate = () => {
      if (!isPaused) {
        pos += 0.5;
        if (pos >= track.scrollWidth / 2) pos = 0;
        track.style.transform = `translateX(-${pos}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  // Duplicate items for seamless loop
  const allItems = [...items, ...items];

  return (
    <div
      className="ticker-wrap"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="ticker-track" ref={trackRef}>
        {allItems.map((item, i) => (
          <div className="ticker-item" key={i}>
            <span className="ticker-icon">{item.icon}</span>
            <span className="ticker-text">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

