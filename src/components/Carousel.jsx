import React, { useState, useEffect, useCallback } from 'react';

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: 'carousel-home.jpeg',
    title: 'SmartDrop Home',
    link: '/book',
    imagePosition: 'center center',
    hideContent: true,
  },
  {
    id: 2,
    image: 'carousel-partner.jpeg',
    title: 'Partner Services',
    link: '/partner',
    imagePosition: 'center center',
    hideContent: true,
  },
  {
    id: 3,
    image: 'carousel-user.jpeg',
    title: 'User Benefits',
    link: '/book',
    imagePosition: 'center center',
    hideContent: true,
  },
  {
    id: 4,
    image: 'carousel-track.jpeg',
    title: 'Track Deliveries Live',
    link: '/track',
    imagePosition: 'center center',
    hideContent: true,
  },
];

export default function Carousel({ slides = DEFAULT_SLIDES, autoPlay = true, interval = 5000 }) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  const goTo = useCallback((index) => {
    setCurrent((index + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [isAutoPlaying, interval, next]);

  return (
    <div
      className="carousel-wrap"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(autoPlay)}
    >
      <div className="carousel-viewport">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-slide${index === current ? ' active' : ''}`}
            style={{ transform: `translateX(${(index - current) * 100}%)` }}
          >
            <div className="carousel-bg">
              {slide.image ? (
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading="lazy"
                  style={{ objectPosition: slide.imagePosition || 'center center' }}
                />
              ) : (
                <div className="carousel-gradient" style={{ background: slide.gradient || 'linear-gradient(135deg, var(--o) 0%, var(--o2) 100%)' }} />
              )}
              <div className="carousel-overlay" />
            </div>
            {slide.hideContent ? (
              <a href={slide.link} className="carousel-full-link" aria-label={slide.title} />
            ) : (
              <div className="carousel-content">
                <h2 className="carousel-title">{slide.title}</h2>
                <p className="carousel-subtitle">{slide.subtitle}</p>
                <a href={slide.link} className="carousel-cta" style={{ background: slide.color }}>
                  {slide.cta}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="carousel-arrow carousel-prev" onClick={prev} aria-label="Previous slide">
        ‹
      </button>
      <button className="carousel-arrow carousel-next" onClick={next} aria-label="Next slide">
        ›
      </button>

      <div className="carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot${index === current ? ' active' : ''}`}
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

