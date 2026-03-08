import {
  ArrowLeft,
  Calendar,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .cd-root {
    --bg: #f5f3ef;
    --surface: #ffffff;
    --surface-2: #faf9f7;
    --border: #e8e3da;
    --ink: #1a1612;
    --ink-2: #5c5347;
    --ink-3: #9c9085;
    --accent: #c9521a;
    --accent-soft: #fdf1eb;
    --success: #2d7a4f;
    --success-soft: #edf7f2;
    --violet: #4a3f8f;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
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
    font-family: 'DM Serif Display', serif; font-size: 1.5rem;
    font-weight: 400; color: var(--ink); margin: 0 0 4px;
  }
  .cd-id { font-family: 'DM Mono', monospace; font-size: 0.85rem; color: var(--ink-3); }

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
    font-family: 'DM Mono', monospace; font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--ink-3); margin: 0;
    display: flex; align-items: center; gap: 8px;
  }
  .cd-card-body { padding: 24px; }
  .cd-avatar {
    width: 96px; height: 96px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-soft) 0%, #f4c4a8 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif; font-size: 2.5rem;
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
  .cd-stat-value { font-family: 'DM Mono', monospace; font-size: 1.5rem; font-weight: 700; }
  .cd-stat-label { font-size: 0.75rem; color: var(--ink-3); text-transform: uppercase; margin-top: 4px; }
  .cd-order-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0; border-bottom: 1px solid var(--border);
  }
  .cd-order-row:last-child { border-bottom: none; }
  .cd-order-id { font-family: 'DM Mono', monospace; font-weight: 500; color: var(--violet); }
  .cd-order-date { font-size: 0.85rem; color: var(--ink-3); }
  .cd-order-amount { font-weight: 600; }
  .cd-order-status {
    padding: 3px 10px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 600;
    background: var(--success-soft); color: var(--success);
  }
`;

export function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

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
          <p className="cd-id">ID: {id}</p>
        </div>
      </div>

      <div className="cd-grid">
        <div className="cd-card">
          <div className="cd-card-body" style={{ textAlign: 'center' }}>
            <div className="cd-avatar">N</div>
            <h2 className="cd-name">Nguyen Van A</h2>
            <span className="cd-status">Active</span>
            <div style={{ textAlign: 'left' }}>
              <div className="cd-info-row">
                <Mail size={16} />
                <span>vana@example.com</span>
              </div>
              <div className="cd-info-row">
                <Phone size={16} />
                <span>+84 123 456 789</span>
              </div>
              <div className="cd-info-row">
                <MapPin size={16} />
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
              <div className="cd-info-row">
                <Calendar size={16} />
                <span>Joined Jan 2023</span>
              </div>
            </div>
            <div className="cd-stats">
              <div className="cd-stat">
                <div className="cd-stat-value">15</div>
                <div className="cd-stat-label">Orders</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-value">₫25M</div>
                <div className="cd-stat-label">Spent</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="cd-card">
            <div className="cd-card-header">
              <h3 className="cd-card-title">
                <ShoppingBag size={14} /> Recent Orders
              </h3>
              <button style={{ fontSize: '0.85rem', color: 'var(--violet)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                View All
              </button>
            </div>
            <div className="cd-card-body">
              {[1, 2, 3].map((i) => (
                <div key={i} className="cd-order-row">
                  <div>
                    <p className="cd-order-id" style={{ margin: 0 }}>#ORD-240{i}</p>
                    <p className="cd-order-date" style={{ margin: '4px 0 0' }}>Jan 2{i}, 2024</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="cd-order-amount" style={{ margin: 0 }}>₫{i},500,000</p>
                    <p className="cd-order-date" style={{ margin: '4px 0 0' }}>3 items</p>
                  </div>
                  <span className="cd-order-status">Delivered</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="cd-card">
              <div className="cd-card-header">
                <h3 className="cd-card-title">
                  <Star size={14} /> Recent Reviews
                </h3>
              </div>
              <div className="cd-card-body">
                <div style={{ display: 'flex', gap: 4, color: 'var(--accent)', marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map((_) => <Star key={_} size={14} fill="currentColor" />)}
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>iPhone 15 Pro Max</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--ink-2)', fontStyle: 'italic' }}>
                  "Great product, highly recommend!"
                </p>
              </div>
            </div>

            <div className="cd-card">
              <div className="cd-card-header">
                <h3 className="cd-card-title">
                  <Heart size={14} /> Wishlist
                </h3>
              </div>
              <div className="cd-card-body">
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, background: 'var(--surface-2)', borderRadius: 8 }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>MacBook Air M2</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--ink-3)' }}>Added Jan 15</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: 'var(--surface-2)', borderRadius: 8 }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>Sony WH-1000XM5</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--ink-3)' }}>Added Jan 10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
