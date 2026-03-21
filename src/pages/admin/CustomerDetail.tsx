import {
  ArrowLeft,
  Calendar,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Star,
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import userService, { UserDashboardResponse } from '../../services/userService';

const css = `
  .cd-root {
    --bg: #f3f4f6;
    --surface: #ffffff;
    --surface-2: #f9fafb;
    --border: #e5e7eb;
    --ink: #111827;
    --ink-2: #4b5563;
    --ink-3: #6b7280;
    --accent: #ee4d2d;
    --accent-soft: #fef2f2;
    --success: #2d7a4f;
    --success-soft: #edf7f2;
    --violet: #ee4d2d;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  .cd-header {
    display: flex; align-items: center; gap: 16px; margin-bottom: 28px;
  }
  .cd-back-btn {
    width: 40px; height: 40px; border-radius: 10px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--ink-2); cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .cd-back-btn:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }
  .cd-title {
    font-family: 'Outfit', sans-serif; font-size: 1.5rem;
    font-weight: 400; color: var(--ink); margin: 0 0 4px;
  }
  .cd-id { font-family: 'Outfit', sans-serif; font-size: 0.85rem; color: var(--ink-3); }

  .cd-grid { display: grid; gap: 24px; grid-template-columns: 1fr 2fr; }
  @media (max-width: 900px) { .cd-grid { grid-template-columns: 1fr; } }

  .cd-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .cd-card-header {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .cd-card-title {
    font-family: 'Outfit', sans-serif; font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--ink-3); margin: 0;
    display: flex; align-items: center; gap: 8px;
  }
  .cd-card-body { padding: 24px; }
  .cd-avatar {
    width: 96px; height: 96px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-soft) 0%, #fca5a5 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif; font-size: 2.5rem;
    color: var(--accent); margin: 0 auto 16px;
  }
  .cd-name { font-size: 1.25rem; font-weight: 600; text-align: center; margin: 0 0 8px; }
  .cd-status {
    display: inline-block; padding: 4px 12px; border-radius: 20px;
    font-size: 0.75rem; font-weight: 600;
    background: var(--success-soft); color: var(--success);
    margin-bottom: 24px;
  }
  .cd-info-row {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 14px; font-size: 0.9rem; color: var(--ink-2);
  }
  .cd-info-row svg { color: var(--ink-3); flex-shrink: 0; }
  .cd-stats {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    padding-top: 20px; border-top: 1px solid var(--border);
  }
  .cd-stat { text-align: center; }
  .cd-stat-value { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 700; }
  .cd-stat-label { font-size: 0.75rem; color: var(--ink-3); text-transform: uppercase; margin-top: 4px; }
  .cd-order-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0; border-bottom: 1px solid var(--border);
  }
  .cd-order-row:last-child { border-bottom: none; }
  .cd-order-id { font-family: 'Outfit', sans-serif; font-weight: 500; color: var(--violet); }
  .cd-order-date { font-size: 0.85rem; color: var(--ink-3); }
  .cd-order-amount { font-weight: 600; }
  .cd-order-status {
    padding: 3px 10px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 600;
    background: var(--success-soft); color: var(--success);
  }
  .cd-empty {
    text-align: center; padding: 24px 0; color: var(--ink-3);
    font-size: 0.9rem; font-family: 'Inter', sans-serif;
  }
`;

const getInitials = (name?: string) => {
  if (!name) return 'U';
  return name.trim().split(/\\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
};

export function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<UserDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      userService.getUserDashboard(id)
        .then(res => setDashboard(res))
        .catch(err => console.error('Failed to load dashboard', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="cd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{css}</style>
        <Loader2 className="animate-spin" size={32} color="var(--accent)" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="cd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{css}</style>
        <div className="cd-empty">User not found</div>
      </div>
    );
  }

  const user = dashboard.userInfo;

  return (
    <div className="cd-root">
      <style>{css}</style>

      <div className="cd-header">
        <button
          type="button"
          onClick={() => navigate('/admin/customers')}
          className="cd-back-btn"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="cd-title">Customer Profile</h1>
          <p className="cd-id">ID: {user?.userId}</p>
        </div>
      </div>

      <div className="cd-grid">
        {/* LEFT COLUMN: User Info */}
        <div className="cd-card">
          <div className="cd-card-body" style={{ textAlign: 'center' }}>
            <div className="cd-avatar">{getInitials(user?.fullName)}</div>
            <h2 className="cd-name">{user?.fullName || 'No Name'}</h2>
            <span
              className="cd-status"
              style={{
                background: user?.isActive ? 'var(--success-soft)' : '#fdf2f2',
                color: user?.isActive ? 'var(--success)' : '#b03030'
              }}
            >
              {user?.isActive ? 'Active' : 'Blocked'}
            </span>
            <div style={{ textAlign: 'left' }}>
              <div className="cd-info-row">
                <Mail size={16} />
                <span>{user?.email || 'No email provided'}</span>
              </div>
              <div className="cd-info-row">
                <Phone size={16} />
                <span>{user?.phoneNumber || 'No phone provided'}</span>
              </div>
              <div className="cd-info-row">
                <MapPin size={16} />
                <span>{user?.address || 'N/A'}</span>
              </div>
              <div className="cd-info-row">
                <Calendar size={16} />
                <span>Joined {new Date(user?.registrationDate).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <div className="cd-stats">
              <div className="cd-stat">
                <div className="cd-stat-value">{dashboard.totalOrders || 0}</div>
                <div className="cd-stat-label">Orders</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-value">₫{dashboard.totalSpent?.toLocaleString('vi-VN') || 0}</div>
                <div className="cd-stat-label">Spent</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Orders, Reviews, Wishlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Orders */}
          <div className="cd-card">
            <div className="cd-card-header">
              <h3 className="cd-card-title">
                <ShoppingBag size={14} /> Recent Orders
              </h3>
            </div>
            <div className="cd-card-body">
              {dashboard.recentOrders?.length > 0 ? (
                dashboard.recentOrders.map((order: any, i: number) => (
                  <div key={i} className="cd-order-row">
                    <div>
                      <p className="cd-order-id" style={{ margin: 0 }}>#{order.orderCode || order.id}</p>
                      <p className="cd-order-date" style={{ margin: '4px 0 0' }}>
                        {new Date(order.orderDate || order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="cd-order-amount" style={{ margin: 0 }}>₫{order.totalAmount?.toLocaleString('vi-VN') || 0}</p>
                    </div>
                    <span className="cd-order-status">{order.status || 'Completed'}</span>
                  </div>
                ))
              ) : (
                <div className="cd-empty">No recent orders found.</div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Built-in Reviews */}
            <div className="cd-card">
              <div className="cd-card-header">
                <h3 className="cd-card-title">
                  <Star size={14} /> Recent Reviews
                </h3>
              </div>
              <div className="cd-card-body">
                {dashboard.recentReviews?.length > 0 ? (
                  dashboard.recentReviews.map((review: any, i: number) => (
                    <div key={i} style={{ marginBottom: i !== dashboard.recentReviews.length - 1 ? 16 : 0 }}>
                      <div style={{ display: 'flex', gap: 4, color: 'var(--accent)', marginBottom: 8 }}>
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={14} fill={idx < (review.rating || 5) ? 'currentColor' : 'none'} color={idx < (review.rating || 5) ? 'currentColor' : '#ccc'} />
                        ))}
                      </div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{review.productName || 'Product'}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--ink-2)', fontStyle: 'italic' }}>
                        "{review.comment || review.content || 'Great!'}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="cd-empty">No written reviews yet.</div>
                )}
              </div>
            </div>

            {/* Wishlist */}
            <div className="cd-card">
              <div className="cd-card-header">
                <h3 className="cd-card-title">
                  <Heart size={14} /> Wishlist
                </h3>
              </div>
              <div className="cd-card-body">
                {dashboard.wishlist?.length > 0 ? (
                  dashboard.wishlist.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i !== dashboard.wishlist.length - 1 ? 12 : 0 }}>
                      <div style={{ width: 40, height: 40, background: 'var(--surface-2)', borderRadius: 8 }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>{item.productName || 'Product'}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--ink-3)' }}>
                          Added {new Date(item.addedAt || new Date()).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cd-empty">Wishlist is empty.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
