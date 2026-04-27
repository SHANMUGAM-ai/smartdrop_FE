export default function Spinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-wrap" style={{ flexDirection: 'column', gap: 12 }}>
      <div className="spinner" />
      {text && <span style={{ fontSize: '0.84rem', color: 'var(--ink3)', fontWeight: 600 }}>{text}</span>}
    </div>
  );
}
