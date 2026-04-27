import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { createOrder, createRazorpayOrder, getRazorpayKey, verifyPayment } from '../api';
import Spinner from '../components/Spinner';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const orderData = location.state?.orderData;
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');

  const isCodOrder = orderData?.payMethod === 'COD';
  const isUpiOrder = orderData?.payMethod === 'UPI';

  useEffect(() => {
    if (!orderData) {
      toast.error('No order data found. Please book again.');
      navigate('/book');
      return;
    }

    if (!isUpiOrder) {
      setLoading(false);
      return;
    }

    const loadRazorpayKey = async () => {
      try {
        const { data } = await getRazorpayKey();
        setRazorpayKey(data.keyId);
      } catch {
        setRazorpayKey(import.meta.env.VITE_RAZORPAY_KEY_ID || '');
      } finally {
        setLoading(false);
      }
    };

    loadRazorpayKey();
  }, [isUpiOrder, navigate, orderData]);

  useEffect(() => {
    if (!isUpiOrder) return;
    if (document.getElementById('razorpay-script')) return;

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, [isUpiOrder]);

  const handlePayment = async () => {
    if (!razorpayKey) {
      toast.error('Payment gateway not configured.');
      return;
    }

    setProcessing(true);
    try {
      const { data } = await createRazorpayOrder({
        amount: orderData.price,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          customer: orderData.customer,
          pickup: orderData.pickup,
          drop: orderData.drop,
        },
      });

      const razorpayOrder = data.order;
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'SmartDrop',
        description: `Delivery from ${orderData.pickup} to ${orderData.drop}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderData: {
                ...orderData,
                customerEmail: user?.email || orderData.customerEmail || '',
              },
            });

            toast.success('UPI payment successful! Order placed.');
            navigate(`/track/${verifyRes.data.order.orderId}`);
          } catch (err) {
            toast.error(err.message || 'Payment verification failed.');
            setProcessing(false);
          }
        },
        prefill: {
          name: orderData.customer,
          email: user?.email || '',
          contact: orderData.customerPhone,
        },
        theme: {
          color: '#ea580c',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast('Payment cancelled. You can retry.', { icon: 'i' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Failed to initiate payment.');
      setProcessing(false);
    }
  };

  const handleCodOrder = async () => {
    setProcessing(true);
    try {
      const { data } = await createOrder({
        ...orderData,
        customerEmail: user?.email || orderData.customerEmail || '',
      });
      toast.success(data.message || 'Cash on delivery order placed successfully!');
      navigate(`/track/${data.order.orderId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place cash on delivery order.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
        <Spinner text="Loading payment gateway..." />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
      <div className="wrap-sm" style={{ paddingTop: 26 }}>
        <div className="card cp" style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--o)', display: 'grid', placeItems: 'center', fontSize: '1.6rem', margin: '0 auto 12px' }}>
              {isCodOrder ? '📦' : '💳'}
            </div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.3rem' }}>
              {isCodOrder ? 'Confirm Cash on Delivery' : 'Secure UPI Payment'}
            </h2>
            <p style={{ color: 'var(--ink3)', fontSize: '0.85rem', marginTop: 4 }}>
              {isCodOrder ? 'Place your order and pay at doorstep' : 'Complete your booking with Razorpay'}
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: 'var(--ink3)', fontSize: '0.85rem' }}>Route</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{orderData?.pickup} to {orderData?.drop}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: 'var(--ink3)', fontSize: '0.85rem' }}>Delivery Type</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {orderData?.deliveryType === 'single' ? 'Single Package' : orderData?.deliveryType === 'multi' ? 'Multiple Packages' : 'Bulk Delivery'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: 'var(--ink3)', fontSize: '0.85rem' }}>Customer</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{orderData?.customer}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: 'var(--ink3)', fontSize: '0.85rem' }}>Payment Method</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{isCodOrder ? 'Cash on Delivery' : 'UPI via Razorpay'}</span>
            </div>
            <div style={{ height: 1, background: 'var(--br)', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink3)', fontSize: '0.9rem' }}>Total Amount</span>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '1.6rem', color: 'var(--o)' }}>Rs.{orderData?.price}</span>
            </div>
          </div>

          <button
            className="btn btn-p btn-full btn-lg"
            onClick={isCodOrder ? handleCodOrder : handlePayment}
            disabled={processing}
          >
            {processing ? 'Processing...' : isCodOrder ? '📦 Place COD Order' : '💳 Pay with Razorpay'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--ink3)', marginTop: 14 }}>
            {isCodOrder
              ? 'Cash will be collected when the order reaches the customer.'
              : 'UPI payment is secured by Razorpay.'}
          </p>
        </div>
      </div>
    </div>
  );
}
