import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage — IntersectionObserver-based lazy loading
 * Props:
 * - src: image URL
 * - alt: alt text
 * - placeholder: optional placeholder image/URL
 * - className: optional CSS class
 * - style: optional inline styles
 */
export default function LazyImage({ src, alt = '', placeholder, className = '', style = {} }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLoad = () => setLoaded(true);

  return (
    <div
      ref={imgRef}
      className={`lazy-img-wrap${className ? ' ' + className : ''}${loaded ? ' loaded' : ''}`}
      style={style}
    >
      {!loaded && (
        <div className="lazy-img-skeleton">
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: style.borderRadius || 0 }} />
        </div>
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className="lazy-img"
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
        />
      )}
    </div>
  );
}

