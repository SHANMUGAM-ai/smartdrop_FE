import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api';

const LOCATIONS = ['Vellore Fort', 'CMC Hospital', 'VIT', 'Katpadi', 'Sathuvachari', 'Bagayam', 'Gandhinagar', 'Gudiyatham', 'Ranipet', 'Ambur'];
const LOCATION_COORDS = {
  'Vellore Fort': [12.9202, 79.1297],
  'CMC Hospital': [12.9249, 79.1355],
  VIT: [12.9692, 79.1559],
  Katpadi: [12.9726, 79.1383],
  Sathuvachari: [12.9447, 79.1641],
  Bagayam: [12.8922, 79.1347],
  Gandhinagar: [12.9494, 79.1388],
  Gudiyatham: [12.946, 78.8738],
  Ranipet: [12.9279, 79.3333],
  Ambur: [12.7916, 78.7167],
};

const BASE_FARE = 30;
const KM_RATE = 8;
const TYPE_CHARGES = { Normal: 0, Fragile: 20, Food: 15, Document: 10 };
const SIZE_CHARGES = { Small: 10, Medium: 20, Large: 40 };
const PER_ITEM_CHARGE = 15;
const PER_KG_RATE = 5;
const PAY_LABELS = {
  UPI: ['UPI', 'GPay / PhonePe / Paytm'],
  COD: ['Cash on Delivery', 'Pay at doorstep'],
};

function resolveLocation(value) {
  const cleanValue = value.trim().toLowerCase();
  if (!cleanValue) return '';

  return LOCATIONS.find((location) => location.toLowerCase() === cleanValue)
    || LOCATIONS.find((location) => location.toLowerCase().startsWith(cleanValue))
    || '';
}

function getRouteDistance(pickup, drop) {
  const pickupCoords = LOCATION_COORDS[pickup];
  const dropCoords = LOCATION_COORDS[drop];

  if (!pickupCoords || !dropCoords) return null;
  if (pickup === drop) return 1;

  const [pickupLat, pickupLng] = pickupCoords;
  const [dropLat, dropLng] = dropCoords;
  const latKm = (pickupLat - dropLat) * 111;
  const lngKm = (pickupLng - dropLng) * 111;
  return Math.max(1, Math.round(Math.sqrt(latKm ** 2 + lngKm ** 2)));
}

function calcFare(pickup, drop, deliveryType, type, size, urgency, items, totalWeight) {
  const resolvedPickup = resolveLocation(pickup);
  const resolvedDrop = resolveLocation(drop);
  if (!resolvedPickup || !resolvedDrop) return null;

  const dist = getRouteDistance(resolvedPickup, resolvedDrop);
  if (!dist) return null;

  const base = BASE_FARE;
  const km = dist * KM_RATE;
  const uc = urgency === 'Express' ? 30 : 0;

  let tc = 0;
  let sc = 0;
  let ic = 0;
  let wc = 0;

  if (deliveryType === 'single') {
    tc = TYPE_CHARGES[type] || 0;
    sc = SIZE_CHARGES[size] || 0;
  } else if (deliveryType === 'multi') {
    ic = (items?.length || 0) * PER_ITEM_CHARGE;
    // Also add type charges for each item
    items?.forEach((it) => {
      tc += TYPE_CHARGES[it.type] || 0;
    });
  } else if (deliveryType === 'bulk') {
    wc = (totalWeight || 0) * PER_KG_RATE;
    sc = SIZE_CHARGES['Large'] || 40; // Bulk always treated as large
  }

  return { base, km, tc, sc, uc, ic, wc, dist, pickup: resolvedPickup, drop: resolvedDrop, total: base + km + tc + sc + uc + ic + wc };
}

export default function Book() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState('single');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [type, setType] = useState('Normal');
  const [size, setSize] = useState('Small');
  const [urgency, setUrgency] = useState('Normal');
  const [payMethod, setPayMethod] = useState('UPI');
  const [customer, setCustomer] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Multi items state
  const [items, setItems] = useState([{ name: '', quantity: 1, type: 'Normal' }]);

  // Bulk weight state
  const [totalWeight, setTotalWeight] = useState(5);

  const fare = calcFare(pickup, drop, deliveryType, type, size, urgency, items, totalWeight);

  const addItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, type: 'Normal' }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const handleSubmit = async () => {
    if (!pickup || !drop) return toast.error('Please enter pickup and drop locations.');
    if (!fare) return toast.error('Please select a valid pickup and drop location from the suggestions.');
    if (!customer) return toast.error('Please enter your name.');
    if (!/^\d{10}$/.test(phone)) return toast.error('Enter a valid 10-digit mobile number.');

    if (deliveryType === 'multi') {
      const validItems = items.filter((it) => it.name.trim() && it.quantity > 0);
      if (validItems.length === 0) return toast.error('Please add at least one valid item.');
    }

    if (deliveryType === 'bulk' && totalWeight <= 0) {
      return toast.error('Please enter a valid total weight.');
    }

    const orderData = {
      customer,
      customerPhone: phone,
      customerEmail: user?.email || '',
      pickup: fare.pickup,
      drop: fare.drop,
      type,
      size,
      urgency,
      price: fare.total,
      payMethod,
      deliveryType,
      items: deliveryType === 'multi' ? items.filter((it) => it.name.trim()) : [],
      totalWeight: deliveryType === 'bulk' ? totalWeight : 0,
    };

    setLoading(true);
    try {
      if (payMethod === 'COD') {
        const { data } = await createOrder(orderData);
        toast.success(data.message || 'Cash on delivery order placed successfully!');
        navigate(`/track/${data.order.orderId}`);
        return;
      }

      navigate('/payment/booking', { state: { orderData } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
      <div className="wrap" style={{ paddingTop: 26 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.35rem' }}>{t('book_title')}</h2>
          <p style={{ color: 'var(--ink3)', fontSize: '0.86rem', marginTop: 2 }}>{t('book_sub')}</p>
        </div>

        <div className="bk-grid">
          <div className="card cp">
            {/* Delivery Type Selector */}
            <div className="fg">
              <label className="fl">{t('delivery_type')}</label>
              <div className="dtype-grid">
                {[
                  ['single', '📦', t('single'), '1 item'],
                  ['multi', '📦📦', t('multi'), 'Multiple items'],
                  ['bulk', '🚚', t('bulk'), 'Weight based'],
                ].map(([value, ico, lbl, sub]) => (
                  <button
                    key={value}
                    className={`dtype-btn${deliveryType === value ? ' sel' : ''}`}
                    onClick={() => setDeliveryType(value)}
                  >
                    <span className="dt-ico">{ico}</span>
                    <div className="dt-lbl">{lbl}</div>
                    <div className="dt-sub">{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="dv" />

            <div className="fg">
              <label className="fl">{t('pickup_label')}</label>
              <div className="fi-ico">
                <span className="ico">P</span>
                <input className="fi" list="smartdrop-locations" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Enter pickup location" />
              </div>
              <div className="loc-pills">
                {LOCATIONS.slice(0, 5).map((location) => (
                  <button key={location} className={`lp${pickup === location ? ' sel' : ''}`} onClick={() => setPickup(location)}>{location}</button>
                ))}
              </div>
            </div>

            <div className="fg">
              <label className="fl">{t('drop_label')}</label>
              <div className="fi-ico">
                <span className="ico">D</span>
                <input className="fi" list="smartdrop-locations" value={drop} onChange={(e) => setDrop(e.target.value)} placeholder="Enter drop location" />
              </div>
              <div className="loc-pills">
                {LOCATIONS.slice(3).map((location) => (
                  <button key={location} className={`lp${drop === location ? ' sel' : ''}`} onClick={() => setDrop(location)}>{location}</button>
                ))}
              </div>
            </div>

            <div className="dv" />
            <datalist id="smartdrop-locations">
              {LOCATIONS.map((location) => <option key={location} value={location} />)}
            </datalist>

            {/* Single Product Fields */}
            {deliveryType === 'single' && (
              <>
                <div className="fg">
                  <label className="fl">{t('parcel_type')}</label>
                  <div className="cgrid">
                    {[['Normal', '+0'], ['Fragile', '+20'], ['Food', '+15'], ['Document', '+10']].map(([value, extra]) => (
                      <button key={value} className={`cbtn${type === value ? ' sel' : ''}`} onClick={() => setType(value)}>
                        {t(`type_${value.toLowerCase()}`)} <span style={{ color: 'var(--o)', fontSize: '0.78rem' }}>{extra}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fg">
                  <label className="fl">{t('size_label')}</label>
                  <select className="fs" value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value="Small">{t('size_small')}</option>
                    <option value="Medium">{t('size_medium')}</option>
                    <option value="Large">{t('size_large')}</option>
                  </select>
                </div>
              </>
            )}

            {/* Multiple Products Fields */}
            {deliveryType === 'multi' && (
              <>
                <div className="fg">
                  <label className="fl">Items</label>
                  {items.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <input
                        type="text"
                        placeholder={t('item_name')}
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder={t('quantity')}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <button className="item-rm" onClick={() => removeItem(idx)} title={t('remove')}>🗑</button>
                    </div>
                  ))}
                  <button className="btn btn-o btn-sm" onClick={addItem} style={{ marginTop: 6 }}>
                    {t('add_item')}
                  </button>
                </div>
              </>
            )}

            {/* Bulk Delivery Fields */}
            {deliveryType === 'bulk' && (
              <>
                <div className="fg bulk-slider">
                  <label className="fl">{t('total_weight')}</label>
                  <div className="sl-row">
                    <span className="sl-lbl">{t('weight_kg')}</span>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={totalWeight}
                      onChange={(e) => setTotalWeight(parseInt(e.target.value))}
                    />
                    <span className="sl-val">{totalWeight}</span>
                  </div>
                  <div className="bulk-hint">
                    {t('per_kg_rate')}: ₹{PER_KG_RATE} · {t('bulk_package')}
                  </div>
                </div>
              </>
            )}

            {/* Common: Urgency */}
            <div className="fg">
              <label className="fl">{t('speed_label')}</label>
              <div className="ugrid">
                {[['Normal', t('speed_normal'), '+0'], ['Express', t('speed_express'), '+30']].map(([value, label, extra]) => (
                  <button key={value} className={`ubtn${urgency === value ? ' sel' : ''}`} onClick={() => setUrgency(value)}>
                    <div className="utit">{label}</div>
                    <div className="uext">{extra}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="dv" />

            <div className="fg">
              <label className="fl">{t('pay_label')}</label>
              <div className="pay-grid">
                {Object.entries(PAY_LABELS).map(([value, [label, sub]]) => (
                  <button key={value} className={`pbtn${payMethod === value ? ' sel' : ''}`} onClick={() => setPayMethod(value)}>
                    <div className="plb">{label}</div>
                    <div className="psb">{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="dv" />

            <div className="fg">
              <label className="fl">{t('customer_label')}</label>
              <input className="fi" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Your name" />
            </div>
            <div className="fg">
              <label className="fl">{t('phone_label')}</label>
              <input className="fi" type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" />
            </div>

            <button className="btn btn-p btn-full btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? (payMethod === 'COD' ? 'Placing COD Order...' : 'Redirecting to UPI...') : t('place_order')}
            </button>
          </div>

          <div className="price-side">
            <div className="card cp">
              <div className="ct">{t('fare_summary')}</div>
              {fare ? (
                <>
                  <div className="fare-row"><span className="fk">{t('base_fare')}</span><span className="fv">Rs.{fare.base}</span></div>
                  <div className="fare-row"><span className="fk">{`${t('distance')} (${fare.dist} km)`}</span><span className="fv">Rs.{fare.km}</span></div>
                  {fare.tc > 0 && <div className="fare-row"><span className="fk">{`${t('type_charge')} (${type})`}</span><span className="fv">+Rs.{fare.tc}</span></div>}
                  {fare.sc > 0 && <div className="fare-row"><span className="fk">{`${t('size_charge')} (${size})`}</span><span className="fv">+Rs.{fare.sc}</span></div>}
                  {fare.ic > 0 && <div className="fare-row"><span className="fk">{t('item_charge')} ({items.length} items)</span><span className="fv">+Rs.{fare.ic}</span></div>}
                  {fare.wc > 0 && <div className="fare-row"><span className="fk">{`${t('total_weight')} (${totalWeight} ${t('weight_kg')})`}</span><span className="fv">+Rs.{fare.wc}</span></div>}
                  {fare.uc > 0 && <div className="fare-row"><span className="fk">{t('express_charge')}</span><span className="fv">+Rs.{fare.uc}</span></div>}
                  <div className="total-box">
                    <div className="t-lbl">{t('total_fare')}</div>
                    <div className="t-amt">Rs.{fare.total}</div>
                  </div>
                  <div className="info-row">Final price may vary slightly based on actual distance.</div>
                </>
              ) : (
                <p style={{ color: 'var(--ink3)', fontSize: '0.84rem', textAlign: 'center', padding: '20px 0' }}>Choose pickup and drop from the location suggestions to see fare</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {fare && (
        <div className="mob-fare-bar">
          <div><div className="mfl">{t('total_fare')}</div><div className="mfp">Rs.{fare.total}</div></div>
          <button className="btn" style={{ background: '#fff', color: 'var(--o)', fontWeight: 700, padding: '10px 18px' }} onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : t('place_order')}
          </button>
        </div>
      )}
    </div>
  );
}
