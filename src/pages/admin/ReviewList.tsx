import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Reply,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import reviewService, {
  type ReviewResponse,
} from '@/services/reviewService';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .rvl-root {
    --bg: #f5f3ef;
    --surface: #ffffff;
    --surface-2: #faf9f7;
    --border: #e8e3da;
    --ink: #1a1612;
    --ink-2: #5c5347;
    --ink-3: #9c9085;
    --accent: #c9521a;
    --accent-soft: #fdf1eb;
    --violet: #4a3f8f;
    --violet-soft: #eeecf8;
    --success: #2d7a4f;
    --success-soft: #edf7f2;
    --warning: #905a10;
    --warning-soft: #fef6eb;
    --danger: #b03030;
    --danger-soft: #fdf2f2;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  .rvl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .rvl-header-left { display: flex; align-items: center; gap: 16px; }
  .rvl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .rvl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .rvl-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .rvl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .rvl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .rvl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }

  .rvl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .rvl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2); flex-wrap: wrap; gap: 12px;
  }
  .rvl-search-wrap { position: relative; display: flex; align-items: center; }
  .rvl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .rvl-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 260px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .rvl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .rvl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .rvl-table { width: 100%; border-collapse: collapse; }
  .rvl-table thead tr { border-bottom: 1px solid var(--border); }
  .rvl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .rvl-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .rvl-table tbody tr:last-child td { border-bottom: none; }
  .rvl-table tbody tr:hover td { background: var(--accent-soft); }

  .rvl-product-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .rvl-user-text { font-size: 0.85rem; color: var(--ink-2); }
  .rvl-comment-text { font-size: 0.83rem; color: var(--ink-2); max-width: 260px; }

  .rvl-rating {
    display: flex; align-items: center; gap: 4px;
    color: var(--accent); font-size: 0.85rem; font-weight: 600;
  }
  .rvl-rating svg { width: 14px; height: 14px; fill: currentColor; }

  .rvl-reply-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--success-soft); color: var(--success);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px;
  }
  .rvl-no-reply-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--surface-2); color: var(--ink-3);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px;
  }

  .rvl-actions { display: flex; gap: 6px; align-items: center; }
  .rvl-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s;
  }
  .rvl-btn-reply { color: var(--violet); }
  .rvl-btn-reply:hover { background: var(--violet-soft); border-color: var(--violet); }
  .rvl-btn-delete { color: var(--danger); }
  .rvl-btn-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  .rvl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .rvl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .rvl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }

  .rvl-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; padding: 16px 20px;
    border-top: 1px solid var(--border); background: var(--surface-2);
  }
  .rvl-page-btn {
    display: flex; align-items: center; justify-content: center;
    min-width: 32px; height: 32px; padding: 0 8px;
    border-radius: 7px; border: 1px solid var(--border);
    background: var(--surface); font-size: 0.8rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s; color: var(--ink-2);
  }
  .rvl-page-btn:hover:not(:disabled) { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
  .rvl-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .rvl-page-btn.active {
    background: var(--accent); color: white; border-color: var(--accent);
  }

  .rvl-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; backdrop-filter: blur(2px);
  }
  .rvl-modal {
    background: var(--surface); border-radius: var(--radius-lg);
    box-shadow: 0 20px 60px rgba(0,0,0,0.15); width: 480px; max-width: 90vw;
    overflow: hidden;
  }
  .rvl-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
  }
  .rvl-modal-title {
    font-family: 'DM Serif Display', serif; font-size: 1.2rem;
    font-weight: 400; margin: 0;
  }
  .rvl-modal-close {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: var(--surface-2); cursor: pointer; color: var(--ink-3);
    transition: all 0.15s;
  }
  .rvl-modal-close:hover { background: var(--danger-soft); color: var(--danger); }
  .rvl-modal-body { padding: 24px; }
  .rvl-modal-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 16px 24px; border-top: 1px solid var(--border);
    background: var(--surface-2);
  }
  .rvl-modal-btn {
    padding: 8px 20px; border-radius: 8px; font-size: 0.85rem;
    font-weight: 500; cursor: pointer; transition: all 0.15s; border: none;
  }
  .rvl-modal-btn-cancel {
    background: var(--surface); border: 1px solid var(--border); color: var(--ink-2);
  }
  .rvl-modal-btn-cancel:hover { background: var(--surface-2); }
  .rvl-modal-btn-primary {
    background: var(--accent); color: white;
  }
  .rvl-modal-btn-primary:hover { background: #b0450f; }
  .rvl-modal-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .rvl-modal-btn-danger {
    background: var(--danger); color: white;
  }
  .rvl-modal-btn-danger:hover { background: #9a2020; }

  .rvl-textarea {
    width: 100%; min-height: 100px; border: 1px solid var(--border);
    border-radius: 8px; padding: 12px; font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; resize: vertical; outline: none; color: var(--ink);
  }
  .rvl-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }

  .rvl-review-info { margin-bottom: 16px; padding: 12px; background: var(--surface-2); border-radius: 8px; }
  .rvl-review-info-row { display: flex; gap: 8px; font-size: 0.83rem; margin-bottom: 4px; }
  .rvl-review-info-label { color: var(--ink-3); min-width: 80px; }
  .rvl-review-info-value { color: var(--ink); font-weight: 500; }

  .rvl-error {
    padding: 10px 16px; background: var(--danger-soft); color: var(--danger);
    border-radius: 8px; font-size: 0.83rem; margin-bottom: 16px;
  }
  .rvl-success {
    padding: 10px 16px; background: var(--success-soft); color: var(--success);
    border-radius: 8px; font-size: 0.83rem; margin-bottom: 16px;
  }
`;

const PAGE_SIZE = 10;

export function ReviewList() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Reply modal
  const [replyTarget, setReplyTarget] = useState<ReviewResponse | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<ReviewResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadReviews = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await reviewService.getReviews({
        page: p,
        size: PAGE_SIZE,
        sortBy: 'reviewDate',
        sortDir: 'desc',
      });
      setReviews(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews(page);
  }, [page, loadReviews]);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  // Reply
  const openReplyModal = (review: ReviewResponse) => {
    setReplyTarget(review);
    setReplyText(review.replyComment || '');
    setErrorMsg('');
  };

  const handleReply = async () => {
    if (!replyTarget || !replyText.trim() || !user) return;
    setIsReplying(true);
    setErrorMsg('');
    try {
      await reviewService.replyToReview(replyTarget.reviewId, user.userId, {
        replyComment: replyText.trim(),
      });
      setSuccessMsg('Phản hồi đánh giá thành công!');
      setReplyTarget(null);
      setReplyText('');
      await loadReviews(page);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setIsReplying(false);
    }
  };

  // Delete
  const openDeleteModal = (review: ReviewResponse) => {
    setDeleteTarget(review);
    setErrorMsg('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setErrorMsg('');
    try {
      await reviewService.deleteReview(deleteTarget.reviewId);
      setSuccessMsg('Xóa đánh giá thành công!');
      setDeleteTarget(null);
      // If last item on page, go back one page
      if (reviews.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await loadReviews(page);
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Không thể xóa đánh giá. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side search filter
  const filtered = search.trim()
    ? reviews.filter(
        (r) =>
          r.userFullName.toLowerCase().includes(search.toLowerCase()) ||
          r.productName.toLowerCase().includes(search.toLowerCase()) ||
          r.comment.toLowerCase().includes(search.toLowerCase())
      )
    : reviews;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rvl-root">
      <style>{css}</style>

      {/* Header */}
      <div className="rvl-header">
        <div className="rvl-header-left">
          <div className="rvl-icon-badge">
            <MessageSquare />
          </div>
          <div>
            <h1 className="rvl-title">
              Quản lý đánh giá
              {totalElements > 0 && (
                <span className="rvl-count-pill">{totalElements}</span>
              )}
            </h1>
            <div className="rvl-divider" />
            <p className="rvl-subtitle" style={{ marginTop: 6 }}>
              Xem, phản hồi và quản lý đánh giá sản phẩm
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && <div className="rvl-success">{successMsg}</div>}
      {errorMsg && !replyTarget && !deleteTarget && (
        <div className="rvl-error">{errorMsg}</div>
      )}

      {/* Table Card */}
      <div className="rvl-table-card">
        <div className="rvl-table-toolbar">
          <div className="rvl-search-wrap">
            <Search />
            <input
              className="rvl-search"
              placeholder="Tìm theo sản phẩm, người dùng, nội dung…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="rvl-table-meta">
            {filtered.length} / {totalElements} đánh giá
          </span>
        </div>

        {isLoading ? (
          <div className="rvl-empty">
            <div className="rvl-empty-icon" style={{ animation: 'pulse 1.5s infinite' }}>
              <MessageSquare size={22} />
            </div>
            <p className="rvl-empty-text">Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rvl-empty">
            <div className="rvl-empty-icon">
              <MessageSquare size={22} />
            </div>
            <p className="rvl-empty-text">Không tìm thấy đánh giá nào</p>
          </div>
        ) : (
          <table className="rvl-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Người đánh giá</th>
                <th>Điểm</th>
                <th>Nội dung</th>
                <th>Ngày</th>
                <th>Phản hồi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.reviewId}>
                  <td>
                    <span className="rvl-product-text">{r.productName}</span>
                  </td>
                  <td>
                    <span className="rvl-user-text">{r.userFullName}</span>
                  </td>
                  <td>
                    <div className="rvl-rating">
                      {r.rating}
                      <Star size={14} />
                    </div>
                  </td>
                  <td>
                    <span
                      className="rvl-comment-text"
                      title={r.comment}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {r.comment}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.83rem' }}>
                    {formatDate(r.reviewDate)}
                  </td>
                  <td>
                    {r.replyComment ? (
                      <span className="rvl-reply-badge" title={r.replyComment}>
                        <Reply size={11} />
                        Đã phản hồi
                      </span>
                    ) : (
                      <span className="rvl-no-reply-badge">Chưa phản hồi</span>
                    )}
                  </td>
                  <td>
                    <div className="rvl-actions">
                      <button
                        type="button"
                        className="rvl-btn rvl-btn-reply"
                        title={r.replyComment ? 'Sửa phản hồi' : 'Phản hồi'}
                        onClick={() => openReplyModal(r)}
                      >
                        <Reply size={14} />
                      </button>
                      <button
                        type="button"
                        className="rvl-btn rvl-btn-delete"
                        title="Xóa"
                        onClick={() => openDeleteModal(r)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="rvl-pagination">
            <button
              className="rvl-page-btn"
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter((i) => {
                // Show first, last, current, and neighbors
                return i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1;
              })
              .reduce<(number | 'ellipsis')[]>((acc, i, idx, arr) => {
                if (idx > 0 && i - (arr[idx - 1] as number) > 1) {
                  acc.push('ellipsis');
                }
                acc.push(i);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e${idx}`} style={{ padding: '0 4px', color: 'var(--ink-3)' }}>
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    className={`rvl-page-btn ${item === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(item as number)}
                  >
                    {(item as number) + 1}
                  </button>
                )
              )}
            <button
              className="rvl-page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyTarget && (
        <div className="rvl-modal-overlay" onClick={() => setReplyTarget(null)}>
          <div className="rvl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rvl-modal-header">
              <h2 className="rvl-modal-title">
                {replyTarget.replyComment ? 'Sửa phản hồi' : 'Phản hồi đánh giá'}
              </h2>
              <button className="rvl-modal-close" onClick={() => setReplyTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="rvl-modal-body">
              <div className="rvl-review-info">
                <div className="rvl-review-info-row">
                  <span className="rvl-review-info-label">Sản phẩm:</span>
                  <span className="rvl-review-info-value">{replyTarget.productName}</span>
                </div>
                <div className="rvl-review-info-row">
                  <span className="rvl-review-info-label">Người dùng:</span>
                  <span className="rvl-review-info-value">{replyTarget.userFullName}</span>
                </div>
                <div className="rvl-review-info-row">
                  <span className="rvl-review-info-label">Điểm:</span>
                  <span className="rvl-review-info-value" style={{ display: 'flex', gap: 2 }}>
                    {replyTarget.rating}
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        style={{
                          fill: i < replyTarget.rating ? '#c9521a' : 'none',
                          color: i < replyTarget.rating ? '#c9521a' : '#ccc',
                        }}
                      />
                    ))}
                  </span>
                </div>
                <div className="rvl-review-info-row">
                  <span className="rvl-review-info-label">Nội dung:</span>
                  <span className="rvl-review-info-value">{replyTarget.comment}</span>
                </div>
              </div>
              {errorMsg && <div className="rvl-error">{errorMsg}</div>}
              <label style={{ fontSize: '0.83rem', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Nội dung phản hồi
              </label>
              <textarea
                className="rvl-textarea"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập phản hồi của bạn..."
                maxLength={500}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--ink-3)', marginTop: 4 }}>
                {replyText.length}/500
              </div>
            </div>
            <div className="rvl-modal-footer">
              <button
                className="rvl-modal-btn rvl-modal-btn-cancel"
                onClick={() => setReplyTarget(null)}
              >
                Hủy
              </button>
              <button
                className="rvl-modal-btn rvl-modal-btn-primary"
                disabled={isReplying || !replyText.trim()}
                onClick={handleReply}
              >
                {isReplying ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="rvl-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="rvl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rvl-modal-header">
              <h2 className="rvl-modal-title">Xác nhận xóa</h2>
              <button className="rvl-modal-close" onClick={() => setDeleteTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="rvl-modal-body">
              <div className="rvl-review-info">
                <div className="rvl-review-info-row">
                  <span className="rvl-review-info-label">Sản phẩm:</span>
                  <span className="rvl-review-info-value">{deleteTarget.productName}</span>
                </div>
                <div className="rvl-review-info-row">
                  <span className="rvl-review-info-label">Người dùng:</span>
                  <span className="rvl-review-info-value">{deleteTarget.userFullName}</span>
                </div>
                <div className="rvl-review-info-row">
                  <span className="rvl-review-info-label">Nội dung:</span>
                  <span className="rvl-review-info-value">{deleteTarget.comment}</span>
                </div>
              </div>
              {errorMsg && <div className="rvl-error">{errorMsg}</div>}
              <p style={{ fontSize: '0.9rem', color: 'var(--danger)', margin: 0 }}>
                Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="rvl-modal-footer">
              <button
                className="rvl-modal-btn rvl-modal-btn-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>
              <button
                className="rvl-modal-btn rvl-modal-btn-danger"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
