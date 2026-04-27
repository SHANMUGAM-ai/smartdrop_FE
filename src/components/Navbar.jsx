import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const NAV_LINKS = [
  { to: '/', icon: '🏠', key: 'nav_home' },
  { to: '/book', icon: '📦', key: 'nav_book' },
  { to: '/track', icon: '📍', key: 'nav_track' },
  { to: '/history', icon: '📋', key: 'nav_history' },
  { to: '/support', icon: '💬', key: 'nav_support' },
];

const PARTNER_LINK = { to: '/partner', icon: '🚚', key: 'nav_partner' };
const DASHBOARD_PATHS = ['/admin', '/admin-dashboard'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboardUser = ['admin', 'superadmin'].includes(user?.role);
  const isPartnerUser = user?.role === 'partner';
  const topNavLinks = isDashboardUser
    ? NAV_LINKS.filter(({ to }) => to === '/')
    : isPartnerUser
      ? NAV_LINKS.filter(({ to }) => ['/', '/support'].includes(to))
      : NAV_LINKS;
  const mobileNavLinks = isDashboardUser
    ? NAV_LINKS.filter(({ to }) => to === '/')
    : isPartnerUser
      ? [...NAV_LINKS.filter(({ to }) => ['/', '/support'].includes(to)), PARTNER_LINK]
      : [...NAV_LINKS.slice(0, 4)];
  const rolePillClass = isDashboardUser
    ? 'role-pill rp-admin'
    : user?.role === 'partner'
      ? 'role-pill rp-partner'
      : 'role-pill rp-user';
  const rolePillLabel = isDashboardUser ? 'dashboard' : user?.role;

  const handleLogout = () => {
    if (!user) return;
    if (window.confirm(`Logout as ${user.name}?`)) {
      logout();
      toast('Logged out');
      navigate('/');
    }
  };

  const handleUserChip = () => {
    if (user) {
      handleLogout();
    } else {
      navigate('/login');
    }
  };

  const navLinkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: '0.84rem',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all .16s',
    color: isActive ? 'var(--o)' : 'var(--ink3)',
    background: isActive ? 'var(--obg)' : 'transparent',
  });

  return (
    <>
      <nav
        className="top-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 400,
          height: 'var(--nav)',
          background: 'var(--sf)',
          borderBottom: '1px solid var(--br)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 18px',
          boxShadow: 'var(--sh)',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            cursor: 'pointer',
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--o)',
              display: 'grid',
              placeItems: 'center',
              fontSize: '1rem',
            }}
          >
            📦
          </div>
          <span
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontWeight: 800,
              fontSize: '1.15rem',
              color: 'var(--ink)',
            }}
          >
            SmartDrop
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, margin: '0 10px' }}>
          {topNavLinks.map(({ to, icon, key }) => (
            <Link key={to} to={to} style={navLinkStyle(location.pathname === to)}>
              {icon} {t(key)}
            </Link>
          ))}

          {user?.role === 'partner' && (
            <Link to={PARTNER_LINK.to} style={navLinkStyle(location.pathname === PARTNER_LINK.to)}>
              {PARTNER_LINK.icon} {t(PARTNER_LINK.key)}
            </Link>
          )}

          {isDashboardUser && (
            <Link to="/admin" style={navLinkStyle(DASHBOARD_PATHS.includes(location.pathname))}>
              📊 Dashboard
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div className="lang-toggle">
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>
              EN
            </button>
            <button className={`lang-btn${lang === 'ta' ? ' active' : ''}`} onClick={() => setLang('ta')}>
              தமிழ்
            </button>
          </div>

          <span className="badge bo" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
            📍 {t('city')}
          </span>

          <div
            onClick={handleUserChip}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--bg2)',
              border: '1px solid var(--br)',
              borderRadius: 40,
              padding: '5px 12px 5px 5px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all .16s',
              whiteSpace: 'nowrap',
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--o)',
                display: 'grid',
                placeItems: 'center',
                fontSize: '0.72rem',
                color: '#fff',
                fontWeight: 800,
              }}
            >
              {user ? user.name[0].toUpperCase() : '?'}
            </div>
            <span>{user ? user.name : t('login')}</span>
            {user && <span className={rolePillClass}>{rolePillLabel}</span>}
          </div>

          {user && (
            <button className="btn btn-red btn-sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              🚪 Logout
            </button>
          )}
        </div>
      </nav>

      <nav
        className="bot-nav"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 400,
          height: 'var(--bot)',
          background: 'var(--sf)',
          borderTop: '1px solid var(--br)',
          padding: '0 4px',
          alignItems: 'center',
          justifyContent: 'space-around',
          boxShadow: '0 -4px 24px rgba(0,0,0,.08)',
        }}
      >
        {mobileNavLinks.map(({ to, icon, key }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '6px 8px',
                borderRadius: 10,
                background: 'none',
                border: 'none',
                color: active ? 'var(--o)' : 'var(--ink4)',
                fontSize: '0.58rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                flex: 1,
                minHeight: 50,
                justifyContent: 'center',
                letterSpacing: '0.02em',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  fontSize: '1.3rem',
                  lineHeight: 1,
                  background: active ? 'var(--obg)' : 'transparent',
                  padding: active ? '4px 12px' : 0,
                  borderRadius: active ? 10 : 0,
                }}
              >
                {icon}
              </span>
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <style>{`@media(max-width:640px){.bot-nav{display:flex!important;}.top-nav{display:none!important;}}`}</style>
    </>
  );
}
