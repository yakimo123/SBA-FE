import axios from 'axios';

import { District, Province, Ward } from '../types/address';

const BASE_URL = 'https://provinces.open-api.vn/api';

export const provinceService = {
  getProvinces: async (): Promise<Province[]> => {
    const response = await axios.get(`${BASE_URL}/p/`);
    return response.data;
  },
  getDistricts: async (provinceCode: number): Promise<District[]> => {
    const response = await axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`);
    return response.data.districts;
  },
  getWards: async (districtCode: number): Promise<Ward[]> => {
    const response = await axios.get(`${BASE_URL}/d/${districtCode}?depth=2`);
    return response.data.wards;
  },
};
