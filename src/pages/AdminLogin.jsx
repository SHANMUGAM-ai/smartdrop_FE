import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const lockTimer = useRef(null);

  const handleLogin = async () => {
    if (locked) {
      toast.error('Locked. Try again in 5 minutes.');
      return;
    }

    if (!email || !pass) {
      setErrMsg('Enter username and password.');
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, pass);

      if (!['admin', 'superadmin'].includes(data.user.role)) {
        toast.error('Not a dashboard account.');
        return;
      }

      toast.success('Dashboard Access Granted');
      navigate('/admin');
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPass('');

      if (newAttempts >= 3) {
        setLocked(true);
        setErrMsg('');
        lockTimer.current = setTimeout(() => {
          setLocked(false);
          setAttempts(0);
        }, 5 * 60000);
        toast.error('Locked after 3 failed attempts.');
      } else {
        setErrMsg(`Invalid credentials. ${3 - newAttempts} attempt${3 - newAttempts === 1 ? '' : 's'} left.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-portal">
      <div className="adm-card">
        <div className="adm-logo">
          <div className="adm-logo-mk">📊</div>
          <span className="adm-title">SmartDrop Dashboard</span>
        </div>
        <p className="adm-sub">Restricted Access. Authorized Personnel Only.</p>

        <div className="attempt-row">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`adot${i <= attempts ? ' used' : ''}`} />
          ))}
        </div>

        {errMsg && <div className="adm-err show">{errMsg}</div>}
        {locked && <div className="adm-lock show">Locked after 3 failed attempts. Try again in 5 minutes.</div>}

        <input
          className="adm-fi"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Dashboard Email"
          autoComplete="off"
          disabled={locked}
        />

        <input
          className="adm-fi"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Dashboard Password"
          disabled={locked}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <button className="adm-btn" onClick={handleLogin} disabled={locked || loading}>
          {loading ? 'Verifying...' : 'Login to Dashboard'}
        </button>
      </div>
    </div>
  );
}
