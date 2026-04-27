import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  createAdmin,
  getAllOrders,
  getAllTickets,
  getAllUsers,
  getPartners,
  getStats,
  updateOrder,
  updateTicket,
  updateUserAccess,
} from '../api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const DEMO_ORDERS = [
  {
    orderId: 'ORD-1002',
    customer: 'Priya S.',
    pickup: 'Vellore',
    drop: 'Katpadi',
    type: 'Normal',
    partnerName: 'Rajan Kumar',
    price: 80,
    payMethod: 'UPI',
    payStatus: 'Paid',
    status: 'accepted',
  },
  {
    orderId: 'ORD-1001',
    customer: 'Arun M.',
    pickup: 'CMC',
    drop: 'VIT',
    type: 'Food',
    partnerName: 'Kavitha Devi',
    price: 45,
    payMethod: 'COD',
    payStatus: 'Pending',
    status: 'out_for_delivery',
  },
  {
    orderId: 'ORD-1000',
    customer: 'Selvi R.',
    pickup: 'Gudiyatham',
    drop: 'Vellore',
    type: 'Fragile',
    partnerName: 'Senthil Raja',
    price: 215,
    payMethod: 'Card',
    payStatus: 'Completed',
    status: 'delivered',
  },
];

const DEMO_PARTNERS = [
  {
    _id: 'p1',
    name: 'Rajan Kumar',
    email: 'rajan@smartdrop.test',
    phone: '9876543210',
    zone: 'Vellore City',
    serviceType: 'Single Product',
    vehicle: 'Bike',
    vehicleNumber: 'TN23 AB 1234',
    licenseNumber: 'TN0120240001111',
    rcBookNumber: 'RCVEL12345',
    personPhotoUrl: '',
    totalOrders: 87,
    rating: 4.8,
    totalEarnings: 6240,
    isOnline: true,
    partnerStatus: 'Approved',
    isBlocked: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    partnerReviewedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    partnerReviewedBy: { name: 'Super Admin', email: 'superadmin@smartdrop.test', role: 'superadmin' },
    partnerReviewNotes: 'All submitted documents matched the application.',
  },
  {
    _id: 'p2',
    name: 'Kavitha Devi',
    email: 'kavitha@smartdrop.test',
    phone: '9123456780',
    zone: 'Katpadi',
    serviceType: 'Multi Product',
    vehicle: 'Auto',
    vehicleNumber: 'TN23 AC 7788',
    licenseNumber: 'TN0120240002222',
    rcBookNumber: 'RCKTP98765',
    personPhotoUrl: '',
    totalOrders: 64,
    rating: 4.6,
    totalEarnings: 4880,
    isOnline: true,
    partnerStatus: 'Pending',
    isBlocked: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    partnerReviewNotes: '',
  },
];

const DEMO_TICKETS = [
  {
    _id: 't1',
    ticketId: 'TKT-2001',
    name: 'Anita M.',
    contact: '9876543210',
    issueType: 'Delivery Issue',
    message: 'My parcel is late by 2 hours.',
    status: 'Open',
    unread: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 't2',
    ticketId: 'TKT-2000',
    name: 'Bala S.',
    contact: 'bala@email.com',
    issueType: 'Payment Issue',
    message: 'Double charged on UPI.',
    status: 'Resolved',
    unread: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_STATS = {
  total: 28,
  delivered: 26,
  transit: 2,
  pending: 0,
  dailyDeliveries: 0,
  revenue: 3480,
  platformEarning: 522,
  partnerPayout: 2958,
  commissionPercent: 15,
  deliveryTypes: { single: 20, multi: 5, bulk: 3 },
};

const VEHICLE_EMOJI = {
  Bike: 'Bike',
  Auto: 'Auto',
  Van: 'Van',
  Truck: 'Truck',
  Lorry: 'Lorry',
};

const ORDER_STATUS_OPTIONS = ['pending', 'accepted', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'];
const PARTNER_STATUS_PRIORITY = { Pending: 0, Rejected: 1, Approved: 2 };

function formatCurrency(value) {
  return `Rs.${Math.round(value || 0).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN');
}

function getPartnerBadgeClass(status) {
  if (status === 'Approved') return 'bg-b';
  if (status === 'Rejected') return 'br-b';
  return 'by';
}

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'superadmin';

  const [tab, setTab] = useState('orders');
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [partners, setPartners] = useState(DEMO_PARTNERS);
  const [selectedPartnerId, setSelectedPartnerId] = useState(DEMO_PARTNERS[0]?._id || null);
  const [partnerReviewDrafts, setPartnerReviewDrafts] = useState({});
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState(DEMO_TICKETS);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState({ base: 30, km: 8, exp: 30, sm: 10, lg: 40 });
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin',
  });

  useEffect(() => {
    if (!user) return;

    if (!['admin', 'superadmin'].includes(user.role)) {
      navigate('/admin-login');
      return;
    }

    loadData();
  }, [user, navigate]);

  const syncPartners = (partnerList) => {
    setPartners(partnerList);
    setSelectedPartnerId((current) => {
      if (current && partnerList.some((partner) => partner._id === current)) return current;
      return partnerList.find((partner) => partner.partnerStatus === 'Pending')?._id || partnerList[0]?._id || null;
    });
    setPartnerReviewDrafts((current) => {
      const next = {};
      partnerList.forEach((partner) => {
        next[partner._id] = current[partner._id] ?? partner.partnerReviewNotes ?? '';
      });
      return next;
    });
  };

  const loadData = async () => {
    setLoading(true);

    const [statsRes, ordersRes, ticketsRes, usersRes, partnersRes] = await Promise.allSettled([
      getStats(),
      getAllOrders(),
      getAllTickets(),
      getAllUsers(),
      getPartners(),
    ]);

    if (statsRes.status === 'fulfilled') {
      setStats(statsRes.value.data.stats || DEFAULT_STATS);
    } else {
      setStats(DEFAULT_STATS);
    }

    if (ordersRes.status === 'fulfilled') {
      setOrders((ordersRes.value.data.orders || []).concat(DEMO_ORDERS));
    } else {
      setOrders(DEMO_ORDERS);
    }

    if (ticketsRes.status === 'fulfilled') {
      setTickets((ticketsRes.value.data.tickets || []).concat(DEMO_TICKETS));
    } else {
      setTickets(DEMO_TICKETS);
    }

    if (usersRes.status === 'fulfilled') {
      setUsers(usersRes.value.data.users || []);
    } else {
      setUsers([]);
    }

    if (partnersRes.status === 'fulfilled') {
      const partnerList = (partnersRes.value.data.partners || []).length ? partnersRes.value.data.partners : DEMO_PARTNERS;
      syncPartners(partnerList);
    } else {
      syncPartners(DEMO_PARTNERS);
    }

    setLoading(false);
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrder(orderId, { status });
      setOrders((current) => current.map((order) => (order.orderId === orderId ? { ...order, status } : order)));
      toast.success(`Order ${orderId} updated.`);
    } catch (err) {
      toast.error(err.message || 'Could not update order. Using local demo update.');
      setOrders((current) => current.map((order) => (order.orderId === orderId ? { ...order, status } : order)));
    }
  };

  const handleTicketResolve = async (id) => {
    try {
      await updateTicket(id, { status: 'Resolved' });
    } catch {
      // Keep the UI usable in demo/offline mode.
    }

    setTickets((current) =>
      current.map((ticket) =>
        ticket._id === id ? { ...ticket, status: 'Resolved', unread: false } : ticket
      )
    );
    toast.success('Ticket resolved.');
  };

  const handleAccessChange = async (id, updates) => {
    try {
      const { data } = await updateUserAccess(id, updates);
      const updatedUser = data.user;
      setUsers((current) => current.map((item) => (item._id === id ? updatedUser : item)));
      setPartners((current) => current.map((item) => (item._id === id ? updatedUser : item)));
      setPartnerReviewDrafts((current) => ({
        ...current,
        [id]: updatedUser.partnerReviewNotes ?? current[id] ?? '',
      }));
      toast.success('Access updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update access.');
    }
  };

  const handlePartnerReview = async (partner, partnerStatus) => {
    if (!partner?._id) return;
    await handleAccessChange(partner._id, {
      partnerStatus,
      partnerReviewNotes: partnerReviewDrafts[partner._id] ?? '',
    });
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();

    try {
      await createAdmin(adminForm);
      toast.success(`${adminForm.role === 'superadmin' ? 'Super admin' : 'Admin'} created successfully.`);
      setAdminForm({ name: '', email: '', phone: '', password: '', role: 'admin' });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to create admin.');
    }
  };

  const handlePricingSave = () => {
    toast.success('Pricing updated locally.');
  };

  const openTickets = tickets.filter((ticket) => ticket.unread).length;
  const adminUsers = users.filter((item) => ['admin', 'superadmin'].includes(item.role));
  const sortedPartners = [...partners].sort((a, b) => {
    const statusDiff = (PARTNER_STATUS_PRIORITY[a.partnerStatus] ?? 99) - (PARTNER_STATUS_PRIORITY[b.partnerStatus] ?? 99);
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
  const selectedPartner =
    sortedPartners.find((partner) => partner._id === selectedPartnerId) || sortedPartners[0] || null;

  const kpiCards = [
    {
      label: 'Total Users',
      value: users.filter((item) => item.role === 'user').length,
      helper: 'Registered customers',
    },
    {
      label: 'Total Partners',
      value: partners.length,
      helper: `${partners.filter((item) => item.partnerStatus === 'Pending').length} pending`,
    },
    {
      label: 'Daily Deliveries',
      value: stats.dailyDeliveries || 0,
      helper: 'Completed today',
    },
    {
      label: 'Platform Revenue',
      value: formatCurrency(stats.platformEarning),
      helper: `${stats.commissionPercent || 15}% commission`,
    },
    {
      label: 'Partner Payout',
      value: formatCurrency(stats.partnerPayout),
      helper: 'Total earnings paid',
    },
  ];

  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ marginTop: 'var(--nav)', paddingTop: 40 }}>
        <Spinner text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ marginTop: 'var(--nav)', paddingBottom: 48 }}>
      <div className="wrap" style={{ paddingTop: 26 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.4rem' }}>Dashboard</h2>
            <p style={{ color: 'var(--ink3)', fontSize: '0.85rem', marginTop: 2 }}>
              Logged in as <strong>{user.name}</strong>
            </p>
          </div>
          <button
            className="btn btn-red btn-sm"
            onClick={() => {
              logout();
              navigate('/');
              toast('Logged out');
            }}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: 18,
          }}
        >
          {kpiCards.map((card) => (
            <div className="card cp" key={card.label}>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink3)', fontWeight: 700 }}>{card.label}</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.5rem', fontWeight: 900, marginTop: 8 }}>
                {card.value}
              </div>
              <div style={{ color: 'var(--ink3)', fontSize: '0.8rem', marginTop: 8 }}>{card.helper}</div>
            </div>
          ))}
        </div>

        <div className="adm-tabs">
          {[
            ['orders', 'Orders'],
            ['users', 'Users'],
            ['partners', 'Partners'],
            ['pricing', 'Pricing'],
            ['feedback', `Support${openTickets ? ` (${openTickets})` : ''}`],
            ...(user.role === 'superadmin' ? [['admins', 'Admins']] : []),
          ].map(([key, label]) => (
            <button
              key={key}
              className={`adm-tab${tab === key ? ' active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="card cp">
            <div className="ct">All Orders</div>
            <div className="tbl-w">
              <table className="dtbl">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Route</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={`${order.orderId}-${order.status}`}>
                      <td>{order.orderId}</td>
                      <td>
                        {order.pickup} to {order.drop}
                      </td>
                      <td>{order.customer || '-'}</td>
                      <td>{formatCurrency(order.price)}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td><StatusBadge payStatus={order.payStatus} /></td>
                      <td>
                        <select
                          className="fs"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        >
                          {ORDER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="card cp">
            <div className="ct">Users</div>
            <div className="tbl-w">
              <table className="dtbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.role}</td>
                      <td>{item.isBlocked ? 'Blocked' : 'Active'}</td>
                      <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm btn-o"
                          onClick={() => handleAccessChange(item._id, { isBlocked: !item.isBlocked })}
                        >
                          {item.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'partners' && (
          sortedPartners.length === 0 ? (
            <div className="card cp" style={{ textAlign: 'center', padding: 36, color: 'var(--ink3)' }}>
              No partner applications found yet.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(280px, 360px) minmax(0, 1fr)',
                gap: 16,
                alignItems: 'start',
              }}
            >
              <div className="card cp">
                <div className="ct">Partner Applications</div>
                <div style={{ color: 'var(--ink3)', fontSize: '0.83rem', marginBottom: 12 }}>
                  {sortedPartners.filter((partner) => partner.partnerStatus === 'Pending').length} pending verification
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {sortedPartners.map((partner) => {
                    const isSelected = selectedPartner?._id === partner._id;
                    return (
                      <button
                        key={partner._id}
                        type="button"
                        className="card cp"
                        onClick={() => setSelectedPartnerId(partner._id)}
                        style={{
                          textAlign: 'left',
                          border: isSelected ? '2px solid var(--o)' : '1px solid rgba(15,23,42,0.08)',
                          background: isSelected ? 'rgba(255, 184, 77, 0.08)' : 'var(--sf)',
                          boxShadow: 'none',
                          padding: 14,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <div>
                            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800 }}>{partner.name}</div>
                            <div style={{ color: 'var(--ink3)', fontSize: '0.82rem', marginTop: 4 }}>
                              {partner.zone || 'Vellore City'} | {VEHICLE_EMOJI[partner.vehicle] || partner.vehicle || 'Vehicle'}
                            </div>
                          </div>
                          <span className={`badge ${getPartnerBadgeClass(partner.partnerStatus)}`}>
                            {partner.partnerStatus || 'Pending'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--ink3)', fontSize: '0.8rem', marginTop: 10 }}>
                          Submitted: {formatDate(partner.createdAt)}
                        </div>
                        <div style={{ color: 'var(--ink3)', fontSize: '0.8rem', marginTop: 4 }}>
                          {partner.phone || 'No phone'} | {partner.email || 'No email'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedPartner && (
                <div className="card cp">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 24,
                          overflow: 'hidden',
                          background: 'var(--bg2)',
                          display: 'grid',
                          placeItems: 'center',
                          fontFamily: "'Outfit',sans-serif",
                          fontSize: '2rem',
                          fontWeight: 800,
                          color: 'var(--o)',
                        }}
                      >
                        {selectedPartner.personPhotoUrl ? (
                          <img
                            src={selectedPartner.personPhotoUrl}
                            alt={selectedPartner.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          selectedPartner.name?.[0]?.toUpperCase() || 'P'
                        )}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '1.25rem' }}>
                          {selectedPartner.name}
                        </div>
                        <div style={{ color: 'var(--ink3)', fontSize: '0.88rem', marginTop: 4 }}>
                          Applied on {formatDate(selectedPartner.createdAt)}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className={`badge ${getPartnerBadgeClass(selectedPartner.partnerStatus)}`}>
                            {selectedPartner.partnerStatus || 'Pending'}
                          </span>
                          <span className={`badge ${selectedPartner.isBlocked ? 'br-b' : 'bb'}`}>
                            {selectedPartner.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                          <span className={`badge ${selectedPartner.isOnline ? 'bg-b' : 'by'}`}>
                            {selectedPartner.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedPartner.rating || 4.5} star</div>
                      <div style={{ color: 'var(--ink3)', fontSize: '0.82rem', marginTop: 4 }}>
                        {selectedPartner.totalOrders || 0} orders completed
                      </div>
                      <div style={{ color: 'var(--g)', fontWeight: 800, marginTop: 6 }}>
                        {formatCurrency(selectedPartner.totalEarnings)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 12,
                      marginTop: 18,
                    }}
                  >
                    {[
                      ['Email', selectedPartner.email || '-'],
                      ['Phone', selectedPartner.phone || '-'],
                      ['Zone', selectedPartner.zone || '-'],
                      ['Service Type', selectedPartner.serviceType || '-'],
                      ['Vehicle', selectedPartner.vehicle || '-'],
                      ['Vehicle Number', selectedPartner.vehicleNumber || '-'],
                      ['License Number', selectedPartner.licenseNumber || '-'],
                      ['RC Book Number', selectedPartner.rcBookNumber || '-'],
                    ].map(([label, value]) => (
                      <div className="card cp" key={label} style={{ boxShadow: 'none', padding: 14 }}>
                        <div style={{ color: 'var(--ink3)', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {label}
                        </div>
                        <div style={{ marginTop: 7, fontWeight: 700, wordBreak: 'break-word' }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 12,
                      marginTop: 16,
                    }}
                  >
                    <div className="card cp" style={{ boxShadow: 'none', padding: 14 }}>
                      <div className="ct" style={{ marginBottom: 10 }}>Verification</div>
                      <div style={{ color: 'var(--ink2)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                        <div>Reviewed at: {formatDate(selectedPartner.partnerReviewedAt)}</div>
                        <div>
                          Reviewed by: {selectedPartner.partnerReviewedBy?.name || '-'}
                          {selectedPartner.partnerReviewedBy?.role ? ` (${selectedPartner.partnerReviewedBy.role})` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="card cp" style={{ boxShadow: 'none', padding: 14 }}>
                      <div className="ct" style={{ marginBottom: 10 }}>Application Notes</div>
                      <textarea
                        className="fi"
                        rows={4}
                        value={partnerReviewDrafts[selectedPartner._id] ?? selectedPartner.partnerReviewNotes ?? ''}
                        onChange={(e) =>
                          setPartnerReviewDrafts((current) => ({
                            ...current,
                            [selectedPartner._id]: e.target.value,
                          }))
                        }
                        placeholder="Add verification notes before approving or rejecting this partner."
                        style={{ resize: 'vertical', minHeight: 110 }}
                      />
                    </div>
                  </div>

                  {!isSuperAdmin && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 12,
                        borderRadius: 14,
                        background: 'rgba(255, 184, 77, 0.12)',
                        color: 'var(--ink2)',
                        fontSize: '0.88rem',
                      }}
                    >
                      Super admin login is required to verify and approve partner registrations.
                    </div>
                  )}

                  <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-p"
                      disabled={!isSuperAdmin}
                      onClick={() => handlePartnerReview(selectedPartner, 'Approved')}
                    >
                      Verify and Approve
                    </button>
                    <button
                      className="btn btn-red"
                      disabled={!isSuperAdmin}
                      onClick={() => handlePartnerReview(selectedPartner, 'Rejected')}
                    >
                      Reject Application
                    </button>
                    <button
                      className="btn btn-o"
                      onClick={() => handleAccessChange(selectedPartner._id, { isBlocked: !selectedPartner.isBlocked })}
                    >
                      {selectedPartner.isBlocked ? 'Unblock Partner' : 'Block Partner'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {tab === 'pricing' && (
          <div className="card cp" style={{ maxWidth: 560 }}>
            <div className="ct">Pricing</div>
            {[
              ['base', 'Base Fare'],
              ['km', 'Per KM'],
              ['exp', 'Express Charge'],
              ['sm', 'Small Parcel'],
              ['lg', 'Large Parcel'],
            ].map(([key, label]) => (
              <div className="fg" key={key}>
                <label className="fl">{label}</label>
                <input
                  className="fi"
                  type="number"
                  value={pricing[key]}
                  onChange={(e) => setPricing((current) => ({ ...current, [key]: Number(e.target.value) }))}
                />
              </div>
            ))}
            <button className="btn btn-p" onClick={handlePricingSave}>
              Save Pricing
            </button>
          </div>
        )}

        {tab === 'feedback' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {tickets.map((ticket) => (
              <div className="card cp" key={ticket._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800 }}>
                      {ticket.ticketId || ticket._id}
                    </div>
                    <div style={{ color: 'var(--ink3)', fontSize: '0.84rem', marginTop: 4 }}>
                      {ticket.name} | {ticket.contact}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`badge ${ticket.status === 'Resolved' ? 'bg-b' : 'by'}`}>{ticket.status}</div>
                    <div style={{ color: 'var(--ink3)', fontSize: '0.8rem', marginTop: 6 }}>
                      {formatDate(ticket.createdAt)}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontWeight: 700 }}>{ticket.issueType}</div>
                <p style={{ marginTop: 8, color: 'var(--ink2)' }}>{ticket.message}</p>
                {ticket.status !== 'Resolved' && (
                  <button className="btn btn-p btn-sm" onClick={() => handleTicketResolve(ticket._id)}>
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'admins' && user.role === 'superadmin' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 16 }}>
            <form className="card cp" onSubmit={handleCreateAdmin}>
              <div className="ct">Create Admin</div>
              <div className="fg">
                <label className="fl">Name</label>
                <input
                  className="fi"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm((current) => ({ ...current, name: e.target.value }))}
                />
              </div>
              <div className="fg">
                <label className="fl">Email</label>
                <input
                  className="fi"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm((current) => ({ ...current, email: e.target.value }))}
                />
              </div>
              <div className="fg">
                <label className="fl">Phone</label>
                <input
                  className="fi"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm((current) => ({ ...current, phone: e.target.value }))}
                />
              </div>
              <div className="fg">
                <label className="fl">Password</label>
                <input
                  className="fi"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm((current) => ({ ...current, password: e.target.value }))}
                />
              </div>
              <div className="fg">
                <label className="fl">Role</label>
                <select
                  className="fs"
                  value={adminForm.role}
                  onChange={(e) => setAdminForm((current) => ({ ...current, role: e.target.value }))}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <button className="btn btn-p" type="submit">
                Create
              </button>
            </form>

            <div className="card cp">
              <div className="ct">Existing Admins</div>
              <div className="tbl-w">
                <table className="dtbl">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
