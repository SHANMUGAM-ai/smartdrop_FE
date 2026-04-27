import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLang } from '../context/LangContext';
import { submitTicket } from '../api';

const ISSUE_TYPES = [
  ['Delivery Issue', '🚚'], ['Payment Issue', '💳'], ['Partner Issue', '👷'], ['Other', '❓'],
];

export default function Support() {
  const { t } = useLang();
  const [form, setForm]       = useState({ name: '', contact: '', orderId: '', message: '' });
  const [issueType, setIssue] = useState('Delivery Issue');
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.contact || !form.message) return toast.error('Please fill all required fields.');
    setLoading(true);
    try {
      const { data } = await submitTicket({ ...form, issueType });
      setSubmitted(data.ticket?.ticketId || 'TKT-' + Math.floor(Math.random() * 9000 + 1000));
    } catch {
      // Offline demo mode
      setSubmitted('TKT-' + Math.floor(Math.random() * 9000 + 1000));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
        <div className="wrap-sm" style={{ paddingTop: 26 }}>
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 14 }}>✅</div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.2rem', marginBottom: 8 }}>{t('ticket_submitted')}</h3>
            <p style={{ color: 'var(--ink3)', fontSize: '0.88rem', marginBottom: 5 }}>
              {t('ticket_id_label')} <strong style={{ color: 'var(--o)' }}>{submitted}</strong>
            </p>
            <p style={{ color: 'var(--ink3)', fontSize: '0.84rem', marginBottom: 20 }}>{t('ticket_respond')}</p>
            <button className="btn btn-p" onClick={() => { setSubmitted(null); setForm({ name: '', contact: '', orderId: '', message: '' }); }}>
              {t('submit_another')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
      <div className="wrap-sm" style={{ paddingTop: 26 }}>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.35rem' }}>{t('support_title')}</h2>
          <p style={{ color: 'var(--ink3)', fontSize: '0.86rem', marginTop: 2 }}>{t('support_sub')}</p>
        </div>

        <div className="card cp">
          <div className="ct">📝 Submit a Support Request</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg" style={{ margin: 0 }}>
              <label className="fl">{t('your_name')}</label>
              <input className="fi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label className="fl">{t('contact_label')}</label>
              <input className="fi" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
            </div>
          </div>

          <div className="fg" style={{ marginTop: 12 }}>
            <label className="fl">{t('order_id_opt')}</label>
            <input className="fi" placeholder="e.g. ORD-1001" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} />
          </div>

          <div className="fg">
            <label className="fl">{t('issue_type')}</label>
            <div className="issue-grid">
              {ISSUE_TYPES.map(([type, icon]) => (
                <button key={type} className={`isbtn${issueType === type ? ' sel' : ''}`} onClick={() => setIssue(type)}>
                  <span className="iic">{icon}</span>
                  <span>{t(type.toLowerCase().replace(/ /g, '_'))}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="fg">
            <label className="fl">{t('describe_issue')}</label>
            <textarea className="fta" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
          </div>

          <button className="btn btn-p btn-full" style={{ padding: '14px', fontSize: '0.92rem' }} onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Submitting...' : t('submit_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
