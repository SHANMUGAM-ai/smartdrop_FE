import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLang } from '../context/LangContext';
import { trackOrder, verifyDeliveryOtp } from '../api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const DEMO_ORDER = {
  orderId: 'ORD-1001',
  customer: 'Demo User',
  pickup: 'Vellore Fort',
  drop: 'CMC Hospital',
  type: 'Normal',
  size: 'Small',
  urgency: 'Normal',
  price: 86,
  payMethod: 'UPI',
  payStatus: 'Paid',
  status: 'out_for_delivery',
  partnerName: 'Rajan Kumar',
  partnerPhone: '9876543210',
  partnerVehicle: 'Bike',
  partnerRating: 4.8,
  timeline: [
    { event: 'Order Placed', done: true, time: '10:00 AM' },
    { event: 'Partner Assigned', done: true, time: '10:05 AM' },
    { event: 'Picked Up', done: true, time: '10:20 AM' },
    { event: 'Out for Delivery', done: true, time: '10:35 AM' },
    { event: 'Delivered', done: false },
  ],
};

export default function Track() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const [orderId, setOrderId] = useState(id || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    if (id) doTrack(id);
  }, [id]);

  const doTrack = async (searchId) => {
    const sid = (searchId || orderId).trim();
    if (!sid) return toast.error('Please enter an order ID.');

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data } = await trackOrder(sid);
      setOrder(data.order);
    } catch {
      if (sid === 'ORD-1001') setOrder(DEMO_ORDER);
      else setError(t('not_found'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryOtpVerify = async () => {
    if (!order?.orderId) return;
    if (!/^\d{4}$/.test(deliveryOtp)) return toast.error('Enter the 4-digit delivery OTP.');

    setVerifyingOtp(true);
    try {
      await verifyDeliveryOtp(order.orderId, { otp: deliveryOtp });
      toast.success('Delivery OTP verified! Partner can now complete delivery.');
      doTrack(order.orderId);
      setDeliveryOtp('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const timelineSteps = order?.timeline || [];
  const doneCount = timelineSteps.filter((step) => step.done).length;
  const nowIdx = doneCount < timelineSteps.length ? doneCount : -1;

  return (
    <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
      <div className="wrap-md" style={{ paddingTop: 26 }}>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.35rem' }}>{t('track_title')}</h2>
          <p style={{ color: 'var(--ink3)', fontSize: '0.86rem', marginTop: 2 }}>{t('track_sub')}</p>
        </div>

        <div className="card cp" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="fi-ico" style={{ flex: 1 }}>
              <span className="ico">Search</span>
              <input
                className="fi"
                style={{ paddingLeft: 70 }}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t('track_placeholder')}
                onKeyDown={(e) => e.key === 'Enter' && doTrack()}
              />
            </div>
            <button className="btn btn-p" onClick={() => doTrack()} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
              {loading ? '...' : t('track_btn')}
            </button>
          </div>
          {error && <p style={{ color: 'var(--r)', fontSize: '0.84rem', marginTop: 10, fontWeight: 600 }}>{error}</p>}
        </div>

        {loading && <Spinner text="Tracking your order..." />}

        {order && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    padding: '16px 20px 8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1rem' }}>{order.orderId}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ink3)', marginTop: 2 }}>
                      {order.pickup} to {order.drop}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <StatusBadge status={order.status} />
                    <StatusBadge payStatus={order.payStatus} />
                  </div>
                </div>

                <div className="map-box">
                  <div className="map-grid" />
                  <svg className="msvg" viewBox="0 0 400 170">
                    <polyline points="44,90 120,58 200,72 280,42 344,73" fill="none" stroke="var(--obd)" strokeWidth="2" strokeDasharray="5,4" />
                    <circle cx="44" cy="90" r="5" fill="var(--o)" />
                    <circle cx="344" cy="73" r="5" fill="var(--g)" />
                  </svg>
                  <span className="mpin" style={{ left: '8%', top: '58%' }}>
                    Pickup {order.pickup?.split(' ')[0]}
                  </span>
                  <span className="mpin" style={{ left: '78%', top: '46%' }}>
                    Drop {order.drop?.split(' ')[0]}
                  </span>
                  {['accepted', 'picked_up', 'out_for_delivery'].includes(order.status) && <span className="mtrk">Ride</span>}
                </div>

                <div className="t-meta" style={{ margin: '0 20px 16px' }}>
                  {[
                    ['Type', order.type],
                    ['Size', order.size],
                    ['Partner', order.partnerName || 'Assigning...'],
                    ['Payment', order.payMethod],
                  ].map(([label, value]) => (
                    <div className="tm-card" key={label}>
                      <div className="tm-lbl">{label}</div>
                      <div className="tm-val">{value}</div>
                    </div>
                  ))}
                </div>

                {order.partner && (
                  <div style={{ margin: '0 20px 16px', padding: 14, background: 'var(--bbg)', borderRadius: 12, border: '1px solid var(--bbd)' }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--ink3)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 8,
                      }}
                    >
                      Delivery Partner
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'var(--b)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '1.1rem',
                          color: '#fff',
                          fontWeight: 800,
                        }}
                      >
                        {order.partnerName?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{order.partnerName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginTop: 2 }}>
                          {order.partnerVehicle && `${order.partnerVehicle}`}
                          {order.partnerRating && ` · ${order.partnerRating} star`}
                        </div>
                      </div>
                      {order.partnerPhone && (
                        <a href={`tel:${order.partnerPhone}`} className="btn btn-sm" style={{ background: 'var(--b)', color: '#fff' }}>
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {order.status === 'out_for_delivery' && (
                  <div style={{ margin: '0 20px 16px', padding: 14, background: 'var(--obg)', borderRadius: 12, border: '1px solid var(--obd)' }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--o)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 8,
                      }}
                    >
                      Delivery OTP
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', marginBottom: 10 }}>
                      Share this 4-digit OTP with <strong>{order.partnerName}</strong> to confirm receipt.
                    </p>
                    {order.deliveryOtpVerified ? (
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--g)' }}>OTP verified. Awaiting final delivery.</div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="text"
                            maxLength={4}
                            value={deliveryOtp}
                            onChange={(e) => setDeliveryOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="4-digit OTP"
                            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--br)', fontSize: '0.9rem', width: 120 }}
                            onKeyDown={(e) => e.key === 'Enter' && handleDeliveryOtpVerify()}
                          />
                          <button className="btn btn-p btn-sm" onClick={handleDeliveryOtpVerify} disabled={verifyingOtp}>
                            {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--ink3)', marginTop: 6 }}>
                          OTP sent to your registered phone number.
                        </p>
                      </>
                    )}
                  </div>
                )}

                <div className="tl-wrap">
                  {timelineSteps.map((step, index) => {
                    const isDone = step.done;
                    const isNow = !isDone && index === nowIdx;
                    const dotCls = isDone ? 'done' : isNow ? 'now' : 'pend';

                    return (
                      <div className="tl-item" key={`${step.event}-${index}`}>
                        <div className="tl-left">
                          <div className={`tl-dot ${dotCls}`}>{isDone ? 'OK' : index + 1}</div>
                          <div className={`tl-line${isDone ? ' tl-dline' : ''}`} />
                        </div>
                        <div className="tl-right">
                          <div className="tl-title">{step.event}</div>
                          {step.time && <div className="tl-time">Time {step.time}</div>}
                          {isNow && <div className="tl-sub" style={{ color: 'var(--g)' }}>In progress...</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="price-side">
              <div className="card cp">
                <div className="ct">Fare</div>
                <div className="total-box">
                  <div className="t-lbl">Total Paid</div>
                  <div className="t-amt">Rs.{order.price}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-o btn-full" onClick={() => navigate('/book')}>
                    Rebook
                  </button>
                  <button className="btn btn-g btn-full" onClick={() => navigate('/support')}>
                    Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!order && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>Order</div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Enter an order ID above to track</p>
            <button
              className="btn btn-o btn-sm"
              onClick={() => {
                setOrderId('ORD-1001');
                doTrack('ORD-1001');
              }}
            >
              Try Demo: ORD-1001
            </button>
          </div>
        )}
      </div>

      <style>{`@media(max-width:640px){.t-meta{grid-template-columns:1fr 1fr!important;}}`}</style>
    </div>
  );
}
