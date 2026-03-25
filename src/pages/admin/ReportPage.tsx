import { useState } from 'react';
import {
  FileText,
  RefreshCw,
  TrendingUp,
  Package,
  BarChart2,
  Loader2,
  Clock,
} from 'lucide-react';
import { reportService } from '@/services/reportService';
import { downloadExcelFileFromBase64 } from '@/utils/exportUtils';
import {
  endOfMonth,
  endOfQuarter,
  format,
  startOfMonth,
  startOfQuarter,
} from 'date-fns';

const css = `
  .db-root {
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
    --danger: #b03030;
    --danger-soft: #fdf2f2;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --shadow-lg: 0 12px 40px rgba(26,22,18,0.12), 0 4px 12px rgba(26,22,18,0.06);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  .db-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .db-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(255,106,0,0.35); flex-shrink: 0;
  }
  .db-icon-badge svg { color: white; width: 24px; height: 24px; }
  .db-title {
    font-family: 'Outfit', sans-serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .db-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .db-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .db-refresh-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 18px; border: 1px solid var(--border);
    border-radius: var(--radius); background: var(--surface);
    font-family: 'Inter', sans-serif; font-size: 0.85rem;
    font-weight: 500; color: var(--ink-2); cursor: pointer;
    transition: all 0.15s;
  }
  .db-refresh-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

  .rp-filter-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
    padding: 24px; margin-bottom: 28px;
  }
  .rp-filter-title {
    font-family: 'Outfit', sans-serif; font-size: 1.1rem;
    font-weight: 500; color: var(--ink); margin: 0 0 16px 0;
  }
  .rp-filter-actions {
    display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  }
  .db-quick-date-btn {
    padding: 7px 12px; border: 1px solid #d1d5db; border-radius: 6px;
    background: var(--surface-2); font-size: 0.85rem; color: var(--ink-2);
    cursor: pointer; font-weight: 500; transition: all 0.2s;
  }
  .db-quick-date-btn:hover { background: var(--surface); border-color: var(--ink-3); }
  .rp-clear-btn {
    padding: 7px 12px; border: 1px solid var(--border); border-radius: 6px;
    background: transparent; font-size: 0.85rem; color: var(--ink-2);
    cursor: pointer; font-weight: 500; transition: all 0.2s;
  }
  .rp-clear-btn:hover { border-color: var(--danger); color: var(--danger); }

  .rp-grid {
    display: grid; gap: 24px;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    margin-bottom: 28px;
  }
  .rp-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
    padding: 24px; display: flex; flex-direction: column;
    transition: box-shadow 0.2s;
  }
  .rp-card:hover { box-shadow: var(--shadow-lg); }
  .rp-card-header {
    display: flex; align-items: center; gap: 16px; margin-bottom: 16px;
  }
  .rp-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .rp-icon.green { background: var(--success-soft); color: var(--success); }
  .rp-icon.blue { background: #e8f4fd; color: #1a6fa8; }
  .rp-icon.red { background: var(--danger-soft); color: #ee4d2d; }
  .rp-card-title {
    font-family: 'Outfit', sans-serif; font-size: 1.15rem;
    font-weight: 500; color: var(--ink); margin: 0;
  }
  .rp-badge {
    display: inline-block; padding: 2px 8px; border-radius: 12px;
    font-size: 0.75rem; font-weight: 500; background: var(--surface-2);
    color: var(--ink-2); margin-top: 4px;
  }
  .rp-desc { font-size: 0.875rem; color: var(--ink-3); margin: 0 0 24px 0; flex-grow: 1; line-height: 1.5; }
  
  .rp-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 10px 16px; border: none; border-radius: 8px;
    color: white; font-size: 0.9rem; font-weight: 500; cursor: pointer;
    transition: opacity 0.2s;
  }
  .rp-btn:hover:not(:disabled) { opacity: 0.9; }
  .rp-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .rp-btn.green { background: var(--success); }
  .rp-btn.blue { background: #1a6fa8; }
  .rp-btn.red { background: #ee4d2d; }
  .rp-hint {
    text-align: center; font-size: 0.75rem; color: var(--ink-3); margin-top: 8px;
  }

  .rp-history {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
    padding: 24px;
  }
  .rp-history-title {
    font-family: 'Outfit', sans-serif; font-size: 1.1rem;
    font-weight: 500; color: var(--ink); margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;
  }
  .rp-history-empty {
    padding: 32px; text-align: center; background: var(--surface-2);
    border-radius: 8px; color: var(--ink-3); font-size: 0.9rem;
    border: 1px dashed var(--border);
  }
`;

export default function ReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isExportingRevenue, setIsExportingRevenue] = useState(false);
  const [isExportingInventory, setIsExportingInventory] = useState(false);
  const [isExportingTopProducts, setIsExportingTopProducts] = useState(false);

  const setThisMonth = () => {
    const today = new Date();
    setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
  };

  const setThisQuarter = () => {
    const today = new Date();
    setStartDate(format(startOfQuarter(today), 'yyyy-MM-dd'));
    setEndDate(format(endOfQuarter(today), 'yyyy-MM-dd'));
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const currentPeriodText = () => {
    if (startDate && endDate) return `From ${startDate} to ${endDate}`;
    if (startDate) return `From ${startDate}`;
    if (endDate) return `To ${endDate}`;
    return 'Custom Range';
  };

  const handleExportRevenue = async () => {
    try {
      setIsExportingRevenue(true);
      const base64Data = await reportService.exportRevenueReport(
        startDate || undefined,
        endDate || undefined
      );
      const dateSuffix = startDate && endDate ? `_${startDate}_${endDate}` : '';
      const filename = `BaoCaoDoanhThu${dateSuffix}.xlsx`;
      downloadExcelFileFromBase64(base64Data, filename);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error exporting revenue report');
    } finally {
      setIsExportingRevenue(false);
    }
  };

  const handleExportInventory = async () => {
    try {
      setIsExportingInventory(true);
      const base64Data = await reportService.exportInventoryReport();
      const filename = `BaoCaoTonKho.xlsx`;
      downloadExcelFileFromBase64(base64Data, filename);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error exporting inventory report');
    } finally {
      setIsExportingInventory(false);
    }
  };

  const handleExportTopProducts = async () => {
    try {
      setIsExportingTopProducts(true);
      const base64Data = await reportService.exportTopProductsReport();
      const filename = `BaoCaoBanChay.xlsx`;
      downloadExcelFileFromBase64(base64Data, filename);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error exporting top products report');
    } finally {
      setIsExportingTopProducts(false);
    }
  };

  return (
    <div className="db-root">
      <style>{css}</style>

      {/* Header */}
      <div className="db-header">
        <div className="db-header-left">
          <div className="db-icon-badge">
            <FileText />
          </div>
          <div>
            <h1 className="db-title">Reports & Data Export</h1>
            <div className="db-divider" />
            <p className="db-subtitle" style={{ marginTop: 6 }}>
              Export Excel reports by date range or full dataset
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="db-refresh-btn"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Date Filter */}
      <div className="rp-filter-card">
        <h3 className="rp-filter-title">Date Range</h3>
        <div className="rp-filter-actions">
          <input
            type="date"
            className="db-refresh-btn"
            style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="From date"
          />
          <span style={{ color: 'var(--ink-3)' }}>-</span>
          <input
            type="date"
            className="db-refresh-btn"
            style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="To date"
          />
          <button type="button" className="db-quick-date-btn" onClick={setThisMonth}>
            This Month
          </button>
          <button type="button" className="db-quick-date-btn" onClick={setThisQuarter}>
            This Quarter
          </button>
          {(startDate || endDate) && (
            <button type="button" className="rp-clear-btn" onClick={clearFilter}>
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="rp-grid">
        {/* Card 1 */}
        <div className="rp-card">
          <div className="rp-card-header">
            <div className="rp-icon green">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="rp-card-title">Revenue Report</h3>
              <span className="rp-badge">{currentPeriodText()}</span>
            </div>
          </div>
          <p className="rp-desc">
            Revenue statistics by period, sales trend analysis
          </p>
          <button
            type="button"
            className="rp-btn green"
            onClick={handleExportRevenue}
            disabled={isExportingRevenue}
          >
            {isExportingRevenue ? (
              <><Loader2 size={18} className="animate-spin" /> Exporting...</>
            ) : (
              <><FileText size={18} /> Export Excel</>
            )}
          </button>
          {(!startDate && !endDate) && (
            <div className="rp-hint">Export full dataset if no date selected</div>
          )}
        </div>

        {/* Card 2 */}
        <div className="rp-card">
          <div className="rp-card-header">
            <div className="rp-icon blue">
              <Package size={24} />
            </div>
            <div>
              <h3 className="rp-card-title">Inventory Report</h3>
              <span className="rp-badge">Current Time</span>
            </div>
          </div>
          <p className="rp-desc">
            Current inventory statistics by branch and product
          </p>
          <button
            type="button"
            className="rp-btn blue"
            onClick={handleExportInventory}
            disabled={isExportingInventory}
          >
            {isExportingInventory ? (
              <><Loader2 size={18} className="animate-spin" /> Exporting...</>
            ) : (
              <><FileText size={18} /> Export Excel</>
            )}
          </button>
          <div className="rp-hint">Export inventory data at current time</div>
        </div>

        {/* Card 3 */}
        <div className="rp-card">
          <div className="rp-card-header">
            <div className="rp-icon red">
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 className="rp-card-title">Top Products Report</h3>
              <span className="rp-badge">Top products</span>
            </div>
          </div>
          <p className="rp-desc">
            List of best-selling products, performance analysis by sales
          </p>
          <button
            type="button"
            className="rp-btn red"
            onClick={handleExportTopProducts}
            disabled={isExportingTopProducts}
          >
            {isExportingTopProducts ? (
              <><Loader2 size={18} className="animate-spin" /> Exporting...</>
            ) : (
              <><FileText size={18} /> Export Excel</>
            )}
          </button>
          <div className="rp-hint">Export list of top selling products</div>
        </div>
      </div>

      {/* History Optional */}
      <div className="rp-history">
        <h3 className="rp-history-title">
          <Clock size={20} /> Export History
        </h3>
        <div className="rp-history-empty">
          Coming soon - will display report export history
        </div>
      </div>
    </div>
  );
}
