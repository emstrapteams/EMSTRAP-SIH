import axios from 'axios';
import type {
  RescueLoginResponse,
  RescueTeamDashboardResponse,
} from '../features/rescue/types';

export interface ApiError extends Error {
  status?: number;
  body?: unknown;
}

const API_BASE = String(import.meta.env.VITE_API_URL || '');

function buildApiError(
  message: string,
  status?: number,
  body?: unknown
): ApiError {
  const error = new Error(message) as ApiError;

  if (status !== undefined) {
    error.status = status;
  }

  if (body !== undefined) {
    error.body = body;
  }

  return error;
}

/**
 * Login as Rescue Team
 */
export async function loginRescueTeam(
  identifier: string,
  password: string
): Promise<RescueLoginResponse> {
  if (!API_BASE) {
    throw buildApiError('VITE_API_URL is not configured');
  }

  const url = `${API_BASE}/disaster/auth/login`;

  try {
    const resp = await axios.post(
      url,
      {
        role: 'RESCUE_TEAM',
        identifier,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return resp.data as RescueLoginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        throw buildApiError(
          err.response.data?.message ||
            err.message ||
            'API Error',
          err.response.status,
          err.response.data
        );
      }

      throw buildApiError(
        err.message || 'Network error'
      );
    }

    throw buildApiError('Network error');
  }
}

/**
 * Get live Rescue Team dashboard
 */
export async function getRescueTeamDashboard(
  token: string
): Promise<RescueTeamDashboardResponse> {
  if (!API_BASE) {
    throw buildApiError('VITE_API_URL is not configured');
  }

  const url = `${API_BASE}/disaster/dashboard/rescue-team`;

  try {
    const resp = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    return resp.data as RescueTeamDashboardResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        throw buildApiError(
          err.response.data?.message ||
            err.message ||
            'API Error',
          err.response.status,
          err.response.data
        );
      }

      throw buildApiError(
        err.message || 'Network error'
      );
    }

    throw buildApiError('Network error');
  }
}

/**
 * Update responder status for an emergency
 *
 * Status flow:
 * RESPONDER_ASSIGNED
 *        ↓
 * ACKNOWLEDGED
 *        ↓
 * EN_ROUTE
 *        ↓
 * ARRIVED
 *        ↓
 * RESOLVED
 */
export async function updateResponderStatus(
  token: string,
  emergencyId: string,
  status: string,
  message?: string
) {
  if (!API_BASE) {
    throw buildApiError('VITE_API_URL is not configured');
  }

  const url = `${API_BASE}/disaster/response/status`;

  try {
    const resp = await axios.put(
      url,
      {
        emergencyId,
        status,
        ...(message ? { message } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return resp.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        throw buildApiError(
          err.response.data?.message ||
            err.message ||
            'API Error',
          err.response.status,
          err.response.data
        );
      }

      throw buildApiError(
        err.message || 'Network error'
      );
    }

    throw buildApiError('Network error');
  }
}

export default {
  loginRescueTeam,
  getRescueTeamDashboard,
  updateResponderStatus,
};