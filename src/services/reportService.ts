import { ApiResponse } from '../types/auth';
import api from './api';

const BASE = '/api/v1/admin/reports/export';

export const reportService = {
  /**
   * Xuất báo cáo doanh thu
   * @param startDate Ngày bắt đầu (YYYY-MM-DD)
   * @param endDate Ngày kết thúc (YYYY-MM-DD)
   */
  async exportRevenueReport(startDate?: string, endDate?: string): Promise<string> {
    const res = await api.get<ApiResponse<string>>(`${BASE}/revenue`, {
      params: { startDate, endDate },
    });
    // Trả về chuỗi Base64
    return res.data.data;
  },

  /**
   * Xuất báo cáo tồn kho
   */
  async exportInventoryReport(): Promise<string> {
    const res = await api.get<ApiResponse<string>>(`${BASE}/inventory`);
    // Trả về chuỗi Base64
    return res.data.data;
  },

  /**
   * Xuất báo cáo sản phẩm bán chạy
   * @param limit Số lượng sản phẩm
   */
  async exportTopProductsReport(limit?: number): Promise<string> {
    const res = await api.get<ApiResponse<string>>(`${BASE}/top-products`, {
      params: { limit: limit ?? 10 },
    });
    // Trả về chuỗi Base64
    return res.data.data;
  },
};

export default reportService;
