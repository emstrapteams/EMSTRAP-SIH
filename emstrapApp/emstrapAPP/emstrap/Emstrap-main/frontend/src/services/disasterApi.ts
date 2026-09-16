import axios from 'axios';
import type { RescueLoginResponse, RescueTeamDashboardResponse } from '../features/rescue/types';

export interface ApiError extends Error {
  status?: number;
  body?: unknown;
}

const API_BASE = String(import.meta.env.VITE_API_URL || '');

function buildApiError(message: string, status?: number, body?: unknown): ApiError {
  const e: ApiError = new Error(message);
  if (status) e.status = status;
  if (body !== undefined) e.body = body;
  return e;
}

export async function loginRescueTeam(identifier: string, password: string): Promise<RescueLoginResponse> {
  if (!API_BASE) throw buildApiError('VITE_API_URL is not configured', 0);

  const url = `${API_BASE}/disaster/auth/login`;
  try {
    const resp = await axios.post(url, { role: 'RESCUE_TEAM', identifier, password }, { headers: { 'Content-Type': 'application/json' } });
    return resp.data as RescueLoginResponse;
  } catch (err: any) {
    if (err?.response) {
      throw buildApiError(err.response.data?.message || err.message || 'API Error', err.response.status, err.response.data);
    }
    throw buildApiError(err?.message || 'Network error');
  }
}

export async function getRescueTeamDashboard(token: string): Promise<RescueTeamDashboardResponse> {
  if (!API_BASE) throw buildApiError('VITE_API_URL is not configured', 0);
  const url = `${API_BASE}/disaster/dashboard/rescue-team`;
  try {
    const resp = await axios.get(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    return resp.data as RescueTeamDashboardResponse;
  } catch (err: any) {
    if (err?.response) {
      throw buildApiError(err.response.data?.message || err.message || 'API Error', err.response.status, err.response.data);
    }
    throw buildApiError(err?.message || 'Network error');
  }
}

export default { loginRescueTeam, getRescueTeamDashboard };

