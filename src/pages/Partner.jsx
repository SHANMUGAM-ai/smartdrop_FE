import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { readPartnerPhoto } from '../utils/imageUpload';
import {
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  getPartnerOrders,
  getPartnerEarnings,
  verifyDeliveryOtp,
} from '../api';

const PARTNER_VEHICLES = [
  { emoji: '🏍️', label: 'Bike', value: 'Bike' },
  { emoji: '🛺', label: 'Auto', value: 'Auto' },
  { emoji: '🚐', label: 'Van', value: 'Van' },
  { emoji: '🚚', label: 'Truck', value: 'Truck' },
  { emoji: '🚛', label: 'Lorry', value: 'Lorry' },
];

const PARTNER_SERVICES = ['Single Product', 'Multi Product', 'House Shift'];

export default function Partner() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('ord');
  const [loading, setLoading] = useState(false);

  // Orders state
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [earningsData, setEarningsData] = useState(null);

  // OTP modal state
  const [otpModal, setOtpModal] = useState({ open: false, orderId: '', otp: '' });
  const [otpLoading, setOtpLoading] = useState(false);

  // Registration form
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    zone: 'Vellore City',
    serviceType: 'Single Product',
    vehicle: 'Bike',
    vehicleNumber: '',
    licenseNumber: '',
    rcBookNumber: '',
    personPhotoUrl: '',
  });

  useEffect(() => {
    if (user?.role === 'partner') {
      loadPartnerData();
    }
  }, [user, tab]);

  const loadPartnerData = async () => {
    setLoading(true);
    try {
      if (tab === 'ord') {
        const [availRes, activeRes] = await Promise.allSettled([
          getAvailableOrders(),
          getPartnerOrders(),
        ]);
        if (availRes.status === 'fulfilled') setAvailableOrders(availRes.value.data.orders || []);
        if (activeRes.status === 'fulfilled') setActiveOrders(activeRes.value.data.orders || []);
      } else if (tab === 'earn') {
        const { data } = await getPartnerEarnings();
        setEarningsData(data);
      }
    } catch (err) {
      console.error('Partner data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await acceptOrder(orderId);
      toast.success('Order accepted! 🎉');
      loadPartnerData();
    } catch (err) {
      toast.error(err.message || 'Failed to accept order.');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    // For delivery, open OTP modal first
    if (status === 'delivered') {
      setOtpModal({ open: true, orderId, otp: '' });
      return;
    }

    try {
      await updateOrderStatus(orderId, { status });
      const statusLabels = {
        picked_up: 'Picked up! 📦',
        out_for_delivery: 'Out for delivery! 🛵',
        delivered: 'Delivered! ✅',
      };
      toast.success(statusLabels[status] || 'Status updated.');
      loadPartnerData();
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const handleDeliverWithOtp = async () => {
    if (!/^\d{4}$/.test(otpModal.otp)) {
      return toast.error('Enter the 4-digit delivery OTP from customer.');
    }
    setOtpLoading(true);
    try {
      // First verify the OTP
      await verifyDeliveryOtp(otpModal.orderId, { otp: otpModal.otp });
      // Then mark delivered
      await updateOrderStatus(otpModal.orderId, { status: 'delivered' });
      toast.success('Delivered! ✅ Wallet credited.');
      setOtpModal({ open: false, orderId: '', otp: '' });
      loadPartnerData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP or delivery failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const photoDataUrl = await readPartnerPhoto(file);
      setForm((current) => ({ ...current, personPhotoUrl: photoDataUrl }));
      toast.success('Profile photo selected.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      event.target.value = '';
    }
  };

  const handleRegister = () => {
    if (!form.name || !form.phone || !form.zone || !form.serviceType || !form.vehicle || !form.vehicleNumber || !form.licenseNumber || !form.rcBookNumber || !form.personPhotoUrl) {
      return toast.error('Fill all partner registration fields.');
    }
    toast.success(`${t('register_btn')} - ${form.name}`);
  };

  if (!user) {
    return (
      <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
        <div className="wrap-sm" style={{ paddingTop: 26 }}>
          <div className="card cp" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>Partner</div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", marginBottom: 10 }}>{t('card_partner')}</h2>
            <p style={{ color: 'var(--ink3)', marginBottom: 20 }}>{t('card_partner_desc')}</p>
            <button className="btn btn-p" onClick={() => navigate('/login')}>Login to Continue</button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'partner') {
    return (
      <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
        <div className="wrap-sm" style={{ paddingTop: 26 }}>
          <div className="card cp" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>🚚</div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", marginBottom: 10 }}>Partner Access Only</h2>
            <p style={{ color: 'var(--ink3)', marginBottom: 20 }}>This page is only available for delivery partners.</p>
            <button className="btn btn-p" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (user.partnerStatus !== 'Approved') {
    return (
      <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
        <div className="wrap-sm" style={{ paddingTop: 26 }}>
          <div className="card cp" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", marginBottom: 10 }}>Approval Pending</h2>
            <p style={{ color: 'var(--ink3)', marginBottom: 8, lineHeight: 1.5 }}>
              Your partner application is currently under review.
            </p>
            <p style={{ color: 'var(--ink3)', marginBottom: 24, fontSize: '0.85rem' }}>
              Status: <span className="badge by">{user.partnerStatus || 'Pending'}</span>
            </p>
            <button className="btn btn-p" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  const maxEarn = earningsData?.weekly?.length
    ? Math.max(...earningsData.weekly.map((w) => w.earn))
    : 1;

  return (
    <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
      <div className="wrap-md" style={{ paddingTop: 26 }}>
        <div className="pt-hdr">
          <div className="pt-av">
            {form.personPhotoUrl ? <img src={form.personPhotoUrl} alt={form.name || user.name} className="pt-av-img" /> : user.name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginTop: 2 }}>Active · {user.zone || 'Vellore City'}</div>
            <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
              <span className="badge bg-b">{t('online')}</span>
              {user.partnerStatus && <span className={`badge ${user.partnerStatus === 'Approved' ? 'bg-b' : 'by'}`}>{user.partnerStatus}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--g)' }}>
              ₹{Math.round(earningsData?.partner?.totalEarnings || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink3)' }}>{t('today')}</div>
          </div>
        </div>

        <div className="pt-tabs">
          {[['ord', t('orders_tab')], ['earn', t('earnings_tab')], ['reg', t('register_tab')]].map(([key, label]) => (
            <button key={key} className={`pt-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {loading && <Spinner text="Loading..." />}

        {tab === 'ord' && !loading && (
          <div>
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="ct" style={{ marginBottom: 12 }}>🛵 Active Deliveries</div>
                {activeOrders.map((o) => (
                  <div className="ao-card" key={o.orderId}>
                    <div className="ao-route">{o.pickup} {'->'} {o.drop}</div>
                    <div className="ao-meta">
                      <span>{o.type}</span>
                      <span>₹{o.price}</span>
                      {o.partnerAmount > 0 && <span style={{ color: 'var(--g)' }}>💰 ₹{o.partnerAmount}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="ao-actions">
                      {o.status === 'accepted' && (
                        <button className="btn btn-p btn-sm" onClick={() => handleStatusUpdate(o.orderId, 'picked_up')}>📦 Mark Picked Up</button>
                      )}
                      {o.status === 'picked_up' && (
                        <button className="btn btn-o btn-sm" onClick={() => handleStatusUpdate(o.orderId, 'out_for_delivery')}>🛵 Out for Delivery</button>
                      )}
                      {o.status === 'out_for_delivery' && (
                        <button className="btn btn-gr btn-sm" onClick={() => handleStatusUpdate(o.orderId, 'delivered')}>✅ Mark Delivered</button>
                      )}
                      <button className="btn btn-g btn-sm" onClick={() => navigate(`/track/${o.orderId}`)}>Track</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available Orders */}
            <div className="ct" style={{ marginBottom: 12 }}>📦 Available Orders</div>
            {availableOrders.length === 0 ? (
              <div className="card cp" style={{ textAlign: 'center', padding: 32, color: 'var(--ink3)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
                <p>No available orders right now. Check back soon!</p>
              </div>
            ) : (
              availableOrders.map((o) => (
                <div className="ao-card" key={o.orderId}>
                  <div className="ao-route">{o.pickup} {'->'} {o.drop}</div>
                  <div className="ao-meta">
                    <span>{o.type}</span>
                    <span>{o.size}</span>
                    <span>₹{o.price}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    <StatusBadge status={o.status} />
                    <span className="badge bo">{o.urgency}</span>
                  </div>
                  <div className="ao-actions">
                    <button className="btn btn-p btn-sm" onClick={() => handleAcceptOrder(o.orderId)}>✅ Accept Order</button>
                    <button className="btn btn-g btn-sm" onClick={() => navigate(`/track/${o.orderId}`)}>Track</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'earn' && !loading && earningsData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
              {[['Wallet', `₹${Math.round(earningsData.wallet?.balance || 0).toLocaleString('en-IN')}`, 'var(--g)'], ['This Month', `₹${Math.round(earningsData.partner?.totalEarnings || 0).toLocaleString('en-IN')}`, 'var(--o)'], ['Deliveries', `${earningsData.partner?.totalOrders || 0}`, 'var(--b)'], ['Rating', `${earningsData.partner?.rating || 4.5} ⭐`, 'var(--p)']].map(([lbl, val, col]) => (
                <div className="card cp" style={{ textAlign: 'center' }} key={lbl}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ink3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{lbl}</div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.4rem', fontWeight: 900, color: col }}>{val}</div>
                </div>
              ))}
            </div>

            <div className="card cp" style={{ marginBottom: 14 }}>
              <div className="ct">{t('weekly_earn')}</div>
              <div className="earn-bars">
                {earningsData.weekly?.map(({ day, earn }) => (
                  <div className="e-col" key={day}>
                    <div className="e-bar" style={{ height: `${maxEarn > 0 ? (earn / maxEarn) * 100 : 5}%` }} title={`₹${Math.round(earn)}`}>
                      <span className="e-tip">₹{Math.round(earn)}</span>
                    </div>
                    <div className="e-day">{day}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card cp">
              <div className="ct">{t('recent_deliveries')}</div>
              <div className="tbl-w">
                <table className="dtbl">
                  <thead><tr><th>Order</th><th>Route</th><th>Type</th><th>Earned</th><th>Status</th></tr></thead>
                  <tbody>
                    {earningsData.recentOrders?.map((o) => (
                      <tr key={o.orderId}>
                        <td style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700 }}>{o.orderId}</td>
                        <td>{o.pickup} {'->'} {o.drop}</td>
                        <td><span className="badge bo">{o.type}</span></td>
                        <td style={{ color: 'var(--g)', fontWeight: 700 }}>₹{Math.round(o.partnerAmount || 0)}</td>
                        <td><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'reg' && (
          <div className="card cp" style={{ maxWidth: 560 }}>
            <div className="ct">{t('reg_title')}</div>
            <div className="fg">
              <label className="fl">{t('name_label')}</label>
              <input className="fi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="fg">
              <label className="fl">{t('phone_label')}</label>
              <input className="fi" type="tel" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="fg">
              <label className="fl">{t('zone_label')}</label>
              <select className="fs" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
                {['Vellore City', 'Katpadi', 'Gudiyatham', 'Ranipet', 'Ambur'].map((zone) => <option key={zone}>{zone}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Service Type</label>
              <select className="fs" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                {PARTNER_SERVICES.map((service) => <option key={service}>{service}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">🚚 {t('vehicle_lbl')}</label>
              <div className="vgrid">
                {PARTNER_VEHICLES.map(({ emoji, label, value }) => (
                  <button key={value} type="button" className={`vbtn${form.vehicle === value ? ' sel' : ''}`} onClick={() => setForm({ ...form, vehicle: value })}>
                    <span className="vlb">{emoji} {label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label className="fl">🔢 {t('vnum_label')}</label>
              <input className="fi" placeholder="TN23 AB 1234" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
            </div>
            <div className="fg">
              <label className="fl">🪪 License Number</label>
              <input className="fi" placeholder="Driving license number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
            </div>
            <div className="fg">
              <label className="fl">📘 RC Book Number</label>
              <input className="fi" placeholder="RC book number" value={form.rcBookNumber} onChange={(e) => setForm({ ...form, rcBookNumber: e.target.value })} />
            </div>
            <div className="fg">
              <label className="fl">🖼️ Profile Photo</label>
              <div className="photo-upload-card">
                <div className="photo-circle-preview">
                  {form.personPhotoUrl ? (
                    <img src={form.personPhotoUrl} alt={form.name || 'Partner profile'} className="photo-circle-img" />
                  ) : (
                    <span>{(form.name || user.name || 'P')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="photo-upload-copy">
                  <div className="photo-upload-title">Upload JPG or PNG image</div>
                  <div className="photo-upload-sub">Circle profile preview will be shown here.</div>
                </div>
                <label className="btn btn-o btn-sm photo-upload-btn">
                  {form.personPhotoUrl ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handlePhotoUpload} hidden />
                </label>
              </div>
            </div>
            <button className="btn btn-p btn-full" style={{ padding: 13 }} onClick={handleRegister}>{t('register_btn')}</button>
          </div>
        )}
      </div>

      {/* OTP Modal for Delivery */}
      {otpModal.open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card cp" style={{ maxWidth: 380, width: '100%' }}>
            <div className="ct">🔐 Delivery Verification</div>
            <p style={{ color: 'var(--ink2)', fontSize: '0.84rem', marginBottom: 14 }}>
              Ask customer for the 4-digit OTP to complete delivery of <strong>{otpModal.orderId}</strong>.
            </p>
            <div className="fg" style={{ marginBottom: 14 }}>
              <label className="fl">Enter 4-digit OTP</label>
              <input
                className="fi"
                type="text"
                maxLength={4}
                value={otpModal.otp}
                onChange={(e) => setOtpModal({ ...otpModal, otp: e.target.value.replace(/\D/g, '') })}
                placeholder="e.g. 1234"
                onKeyDown={(e) => e.key === 'Enter' && handleDeliverWithOtp()}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-g btn-full" onClick={() => setOtpModal({ open: false, orderId: '', otp: '' })}>Cancel</button>
              <button className="btn btn-gr btn-full" onClick={handleDeliverWithOtp} disabled={otpLoading}>
                {otpLoading ? 'Verifying...' : '✅ Mark Delivered'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

