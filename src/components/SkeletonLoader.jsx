import React from 'react';

/* Skeleton shapes */
export const SkeletonText = ({ width = '100%', height = 16, style = {} }) => (
  <div className="skeleton" style={{ width, height, borderRadius: 6, ...style }} />
);

export const SkeletonCircle = ({ size = 48 }) => (
  <div className="skeleton" style={{ width: size, height: size, borderRadius: '50%' }} />
);

export const SkeletonRect = ({ width = '100%', height = 120, radius = 12 }) => (
  <div className="skeleton" style={{ width, height, borderRadius: radius }} />
);

/* Card skeleton for product/order cards */
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <SkeletonRect height={160} radius={12} />
    <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SkeletonText width="75%" height={18} />
      <SkeletonText width="50%" height={14} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <SkeletonText width="40%" height={20} />
        <SkeletonText width="30%" height={32} style={{ borderRadius: 8 }} />
      </div>
    </div>
  </div>
);

/* Grid of skeleton cards */
export const SkeletonGrid = ({ count = 4 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/* Full page skeleton for dashboard/list pages */
export const SkeletonPage = () => (
  <div className="page-enter" style={{ padding: '24px 0' }}>
    <div className="wrap">
      <SkeletonText width="40%" height={28} style={{ marginBottom: 20 }} />
      <SkeletonGrid count={4} />
    </div>
  </div>
);

const SkeletonLoader = () => <SkeletonPage />;

export default SkeletonLoader;

