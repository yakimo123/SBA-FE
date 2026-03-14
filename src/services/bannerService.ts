import api from './api';

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageKey: string;
  buttonText: string;
  buttonLink: string;
  position: 'MAIN' | 'RIGHT_TOP' | 'RIGHT_BOTTOM';
  sortOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  backgroundColor: string;
  textColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  status: number;
  message: string;
  data: {
    main: Banner[];
    rightTop: Banner[];
    rightBottom: Banner[];
  };
  timestamp: string;
}

export interface BannerAdminItem {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  imageKey: string;
  buttonText?: string;
  buttonLink?: string;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerAdminListResponse {
  status: number;
  message: string;
  data: {
    content: BannerAdminItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
  timestamp: string;
}

export interface BannerAdminDetailResponse {
  status: number;
  message: string;
  data: BannerAdminItem;
  timestamp: string;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  imageKey: string;
  buttonText?: string;
  buttonLink?: string;
  position: 'MAIN' | 'RIGHT_TOP' | 'RIGHT_BOTTOM';
  sortOrder?: number;
  isActive?: boolean;
  startDate: string;
  endDate: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {}

export interface BannerQueryParams {
  page?: number;
  size?: number;
  position?: string;
  isActive?: boolean;
  keyword?: string;
}

const bannerService = {
  getHomeBanners: async (): Promise<BannerResponse> => {
    const response = await api.get<BannerResponse>('/api/banners/home');
    return response.data;
  },

  getAdminBanners: async (params?: BannerQueryParams): Promise<BannerAdminListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.position) queryParams.append('position', params.position);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.keyword) queryParams.append('keyword', params.keyword);

    const response = await api.get<BannerAdminListResponse>(
      `/api/admin/banners?${queryParams.toString()}`
    );
    return response.data;
  },

  getAdminBannerById: async (id: number): Promise<BannerAdminDetailResponse> => {
    const response = await api.get<BannerAdminDetailResponse>(`/api/admin/banners/${id}`);
    return response.data;
  },

  createBanner: async (banner: CreateBannerRequest): Promise<BannerAdminDetailResponse> => {
    const response = await api.post<BannerAdminDetailResponse>('/api/admin/banners', banner);
    return response.data;
  },

  updateBanner: async (id: number, banner: UpdateBannerRequest): Promise<BannerAdminDetailResponse> => {
    const response = await api.put<BannerAdminDetailResponse>(`/api/admin/banners/${id}`, banner);
    return response.data;
  },

  deleteBanner: async (id: number): Promise<{ status: number; message: string; data: null }> => {
    const response = await api.delete<{ status: number; message: string; data: null }>(`/api/admin/banners/${id}`);
    return response.data;
  },

  toggleBannerStatus: async (id: number, isActive: boolean): Promise<BannerAdminDetailResponse> => {
    const response = await api.patch<BannerAdminDetailResponse>(`/api/admin/banners/${id}/status`, { isActive });
    return response.data;
  },
};

export default bannerService;