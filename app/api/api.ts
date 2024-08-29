// utils/api.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: 'http://localhost:3001', // URL de tu backend
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session && session.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const refreshToken = async (token: { accessToken: string; }) => {
  try {
    const refreshTokenResponse = await fetch('http://localhost:3001/auth/refresh-token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });
    console.log("He refescado token.");
    
    if (refreshTokenResponse.status === 200 || refreshTokenResponse.status === 201) {
      const { access_token: newToken } = await refreshTokenResponse.json();
      console.log(newToken);
      
      return newToken;
    } else {
      console.error('Failed to refresh token');
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};


export default api;
