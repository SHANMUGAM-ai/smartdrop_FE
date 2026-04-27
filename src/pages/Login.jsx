import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { uploadToCloudinary } from '../utils/imageUpload';

const PARTNER_VEHICLES = [
  { emoji: '🏍️', label: 'Bike', value: 'Bike' },
  { emoji: '🛺', label: 'Auto', value: 'Auto' },
  { emoji: '🚐', label: 'Van', value: 'Van' },
  { emoji: '🚚', label: 'Truck', value: 'Truck' },
  { emoji: '🚛', label: 'Lorry', value: 'Lorry' },
];
const PARTNER_SERVICES = ['Single Product', 'Multi Product', 'House Shift'];

export default function Login() {
  const { login, register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname;

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    zone: 'Vellore City',
    serviceType: 'Single Product',
    vehicle: 'Bike',
    vehicleNumber: '',
    licenseNumber: '',
    rcBookNumber: '',
    personPhotoUrl: '',
  });

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const photoUrl = await uploadToCloudinary(file);
      setForm((current) => ({ ...current, personPhotoUrl: photoUrl }));
      toast.success('Profile photo uploaded to Cloudinary.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) return toast.error('Enter email and password.');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate(redirectTo || (['admin', 'superadmin'].includes(data.user.role) ? '/admin' : data.user.role === 'partner' ? '/partner' : '/'), { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields.');
    if (
      role === 'partner' &&
      (!form.phone || !form.zone || !form.serviceType || !form.vehicle || !form.vehicleNumber || !form.licenseNumber || !form.rcBookNumber || !form.personPhotoUrl)
    ) {
      return toast.error('Fill all partner registration fields.');
    }
    setLoading(true);
    try {
      const data = await register({ ...form, role });
      if (role === 'partner') {
        toast.success(data.message || 'Registration submitted! Please wait for admin approval.');
        setMode('login');
        return;
      }
      toast.success(`Account created! Welcome, ${data.user.name}!`);
      navigate(redirectTo || '/', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="card cp" style={{ width: '100%', maxWidth: mode === 'register' && role === 'partner' ? 520 : 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--o)', display: 'grid', placeItems: 'center', fontSize: '1.4rem', margin: '0 auto 10px' }}>📦</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.2rem' }}>SmartDrop</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink3)', marginTop: 2 }}>Fast. Smart. Reliable.</div>
          </div>

          <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 10, padding: 3, marginBottom: 20, gap: 3 }}>
            {[['login', '🔐 Login'], ['register', '✨ Register']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 8,
                  border: 'none',
                  background: mode === m ? 'var(--sf)' : 'transparent',
                  fontFamily: "'Outfit',sans-serif",
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: mode === m ? 'var(--o)' : 'var(--ink3)',
                  boxShadow: mode === m ? 'var(--sh)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.16s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <div className="fg">
              <label className="fl">I am a</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['user', '👤 Customer'], ['partner', '🚚 Delivery Partner']].map(([r, label]) => (
                  <button key={r} className={`cbtn${role === r ? ' sel' : ''}`} onClick={() => setRole(r)}>{label}</button>
                ))}
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="fg">
              <label className="fl">Full Name</label>
              <input className="fi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
            </div>
          )}

          <div className="fg">
            <label className="fl">Email</label>
            <input className="fi" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>

          {mode === 'register' && (
            <div className="fg">
              <label className="fl">{role === 'partner' ? 'Phone' : 'Phone (optional)'}</label>
              <input className="fi" type="tel" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" />
            </div>
          )}

          {mode === 'register' && role === 'partner' && (
            <>
              <div className="fg">
                <label className="fl">Zone</label>
                <select className="fs" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
                  {['Vellore City', 'Katpadi', 'Gudiyatham', 'Ranipet', 'Ambur'].map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div className="fg">
                <label className="fl">Service Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                  {PARTNER_SERVICES.map((service) => (
                    <button
                      key={service}
                      className={`cbtn${form.serviceType === service ? ' sel' : ''}`}
                      onClick={() => setForm({ ...form, serviceType: service })}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fg">
                <label className="fl">🚚 Vehicle</label>
                <div className="vgrid">
                  {PARTNER_VEHICLES.map(({ emoji, label, value }) => (
                    <button
                      key={value}
                      type="button"
                      className={`vbtn${form.vehicle === value ? ' sel' : ''}`}
                      onClick={() => setForm({ ...form, vehicle: value })}
                    >
                      <span className="vlb">{emoji} {label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="fg">
                <label className="fl">🔢 Vehicle Number</label>
                <input className="fi" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="TN23 AB 1234" />
              </div>

              <div className="fg">
                <label className="fl">🪪 License Number</label>
                <input className="fi" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} placeholder="Driving license number" />
              </div>

              <div className="fg">
                <label className="fl">📘 RC Book Number</label>
                <input className="fi" value={form.rcBookNumber} onChange={(e) => setForm({ ...form, rcBookNumber: e.target.value })} placeholder="RC book / registration number" />
              </div>

              <div className="fg">
                <label className="fl">🖼️ Profile Photo</label>
                <div className="photo-upload-card">
                  <div className="photo-circle-preview">
                    {form.personPhotoUrl ? (
                      <img src={form.personPhotoUrl} alt={form.name || 'Partner profile'} className="photo-circle-img" />
                    ) : (
                      <span>{(form.name || 'P')[0].toUpperCase()}</span>
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
            </>
          )}

          <div className="fg">
            <label className="fl">Password</label>
            <input
              className="fi"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
              onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
            />
          </div>

          <button className="btn btn-p btn-full btn-lg" onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? '🔐 Login' : '✨ Create Account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--ink3)', marginTop: 14 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: 'var(--o)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
