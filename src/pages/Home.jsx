import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '../context/LangContext';
import Footer from '../components/Footer';
import Ticker from '../components/Ticker';
import Carousel from '../components/Carousel';

function countUp(target, setter, duration = 1800) {
  let start = 0;
  const step = Math.ceil(target / (duration / 22));
  const iv = setInterval(() => {
    start = Math.min(start + step, target);
    setter(start);
    if (start >= target) clearInterval(iv);
  }, 22);
}

export default function Home() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const [s3, setS3] = useState(0);
  const counted = useRef(false);

  useEffect(() => {
    if (!counted.current) {
      counted.current = true;
      countUp(1847, setS1);
      countUp(243, setS2);
      countUp(6, setS3);
    }
  }, []);

  const cards = [
    { cls: 'hc-book', icon: '📦', titleKey: 'card_book', descKey: 'card_book_desc', to: '/book' },
    { cls: 'hc-track', icon: '📍', titleKey: 'card_track', descKey: 'card_track_desc', to: '/track' },
    { cls: 'hc-part', icon: '🚚', titleKey: 'card_partner', descKey: 'card_partner_desc', to: '/partner' },
    { cls: 'hc-sup', icon: '💬', titleKey: 'card_support', descKey: 'card_support_desc', to: '/support' },
  ];

  const routes = [
    { icon: 'Route', key: 'route1', time: `3-4 ${t('hr')}` },
    { icon: 'Route', key: 'route2', time: `4-5 ${t('hr')}` },
    { icon: 'Route', key: 'route3', time: `45 ${t('min')}` },
    { icon: 'Route', key: 'route4', time: `25 ${t('min')}` },
    { icon: 'Route', key: 'route5', time: `1 ${t('hr')}` },
  ];

  return (
    <div className="page-enter">
      <div className="hero">
        <div className="hero-inner">
          <span className="hero-emoji">SmartDrop</span>
          <h1>
            <span className="acc">{t('hero_h1_acc')}</span><br />
            <span>{t('hero_h1_sub')}</span>
          </h1>
          <p className="hero-tag">{t('hero_sub')}</p>
          <div className="hero-loc">{t('hero_live')}</div>
          <div className="hero-lang">
            <span className="hero-lang-label">{t('lang_label')}</span>
            <div className="hero-lang-toggle">
              <button className={`hlb${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>English</button>
              <button className={`hlb${lang === 'ta' ? ' active' : ''}`} onClick={() => setLang('ta')}>Tamil</button>
            </div>
          </div>
        </div>
      </div>

      <Ticker />

      <div className="routes-strip">
        <div className="ri">
          {routes.map(({ icon, key, time }) => (
            <div className="rpill" key={key}>
              {icon} {t(key)} <span className="rpt">{time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 28, paddingBottom: 0 }}>
        <div style={{ marginBottom: 36 }}>
          <Carousel />
        </div>
        <p style={{ textAlign: 'center', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '1.15rem', marginBottom: 6 }}>{t('home_q')}</p>
        <p style={{ textAlign: 'center', color: 'var(--ink3)', fontSize: '0.88rem', marginBottom: 28 }}>{t('home_q_sub')}</p>

        <div className="home-grid">
          {cards.map(({ cls, icon, titleKey, descKey, to }) => (
            <div className={`hcard ${cls}`} key={to} onClick={() => navigate(to)}>
              <div className="hcard-ico">{icon}</div>
              <div className="hcard-title">{t(titleKey)}</div>
              <div className="hcard-desc">{t(descKey)}</div>
              <div className="hcard-arrow">{'->'}</div>
            </div>
          ))}
        </div>

        <div className="stats-row" style={{ marginTop: 32, marginBottom: 44 }}>
          <div className="stat-box"><div className="stat-num">{s1.toLocaleString('en-IN')}</div><div className="stat-lbl">{t('stat_orders')}</div></div>
          <div className="stat-box"><div className="stat-num">{s2}</div><div className="stat-lbl">{t('stat_partners')}</div></div>
          <div className="stat-box"><div className="stat-num">{s3}</div><div className="stat-lbl">{t('stat_cities')}</div></div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
