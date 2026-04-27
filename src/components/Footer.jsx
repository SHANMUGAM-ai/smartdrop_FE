import { useLang } from '../context/LangContext';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <strong>SmartDrop</strong> — {t('footer_tag')}<br />
      <span style={{ fontSize: '0.74rem', marginTop: 3, display: 'block' }}>
        © 2026 SmartDrop. {t('footer_rights')}
      </span>
      {/* Secret admin shortcut — triple click */}
      <span
        style={{ fontSize: '0.6rem', color: 'transparent', cursor: 'default', userSelect: 'none' }}
        onClick={(e) => { if (e.detail === 3) navigate('/admin-login'); }}
      >·</span>
    </footer>
  );
}
