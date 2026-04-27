import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';


const STATIC_ORDERS = [
  { orderId: 'ORD-956', pickup: 'Vellore Fort', drop: 'CMC Hospital', type: 'Document', size: 'Small', price: 42, payMethod: 'UPI', payStatus: 'Paid', partnerName: 'Kavitha Devi', status: 'delivered', createdAt: new Date().toISOString() },
  { orderId: 'ORD-934', pickup: 'Katpadi', drop: 'Ranipet', type: 'Normal', size: 'Medium', price: 145, payMethod: 'COD', payStatus: 'Completed', partnerName: 'Rajan Kumar', status: 'delivered', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export default function History() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const { data } = await getMyOrders();
          setOrders([...data.orders, ...STATIC_ORDERS]);
        } catch {
          setOrders(STATIC_ORDERS);
        }
      } else {
        setOrders(STATIC_ORDERS);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = orders.filter((o) => {
    const matchesStatus = filter === 'all' ? true : o.status === filter;
    const matchesType = typeFilter === 'all' ? true : o.type === typeFilter;
    const matchesSearch = search.trim() === '' ? true :
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.pickup.toLowerCase().includes(search.toLowerCase()) ||
      o.drop.toLowerCase().includes(search.toLowerCase()) ||
      o.partnerName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
      <div className="wrap-md" style={{ paddingTop: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 9 }}>
          <div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.35rem' }}>{t('history_title')}</h2>
            <p style={{ color: 'var(--ink3)', fontSize: '0.86rem', marginTop: 2 }}>{t('history_sub')}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card cp" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="fi-ico" style={{ flex: 1, minWidth: 200 }}>
              <span className="ico">🔍</span>
              <input
                className="fi" style={{ paddingLeft: 38 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID, location, partner..."
              />
            </div>
            <select
              className="fs"
              style={{ width: 'auto', minWidth: 130, fontSize: '0.82rem', padding: '7px 30px 7px 10px' }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">{t('all_orders')}</option>
              <option value="delivered">{t('delivered')}</option>
              <option value="transit">{t('in_transit')}</option>
              <option value="pending">Pending</option>
            </select>
            <select
              className="fs"
              style={{ width: 'auto', minWidth: 130, fontSize: '0.82rem', padding: '7px 30px 7px 10px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Normal">Normal</option>
              <option value="Fragile">Fragile</option>
              <option value="Food">Food</option>
              <option value="Document">Document</option>
            </select>
          </div>
        </div>

        {loading && <Spinner />}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--ink3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700 }}>{t('no_orders_found')}</div>
          </div>
        )}

        {filtered.map((o) => (
          <div className="hist-card" key={o.orderId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '0.9rem' }}>{o.orderId}</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: 2 }}>{o.pickup} → {o.drop}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <StatusBadge status={o.status} />
                <StatusBadge payStatus={o.payStatus} />
              </div>
            </div>
            <div className="hist-meta">
              <span>📦 {o.type} · {o.size}</span>
              <span>💳 {o.payMethod}</span>
              <span>₹{o.price}</span>
              {o.partnerAmount > 0 && <span style={{ color: 'var(--g)' }}>💰 ₹{o.partnerAmount}</span>}
              <span>👷 {o.partnerName}</span>
            </div>
            <div style={{ marginTop: 9, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="btn btn-g btn-sm" onClick={() => navigate(`/track/${o.orderId}`)}>📍 {t('track_btn')}</button>
              <button className="btn btn-o btn-sm" onClick={() => navigate('/book')}>🔄 Rebook</button>
              {o.status === 'delivered' && (
                <button className="btn btn-g btn-sm" onClick={() => alert('Rating feature coming soon!')}>⭐ {t('rate_btn')}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

