import api from './api';
import type { VoucherResponse } from '../types';

const BASE = '/api/v1/vouchers';

const voucherService = {
    /** Validate voucher code for a user */
    validate(code: string, userId: number): Promise<boolean> {
        return api.get<{ data: boolean }>(`${BASE}/validate`, { params: { code, userId } }).then((r) => r.data.data);
    },

    /** Get voucher details by code */
    getByCode(code: string): Promise<VoucherResponse> {
        return api.get<{ data: VoucherResponse }>(`${BASE}/code/${code}`).then((r) => r.data.data);
    },
};

export default voucherService;
