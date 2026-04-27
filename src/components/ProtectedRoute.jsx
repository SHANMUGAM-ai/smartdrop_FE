import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please login to continue.', { id: 'auth-required' });
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div style={{ marginTop: 'var(--nav)', minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
        <Spinner text="Checking login..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
