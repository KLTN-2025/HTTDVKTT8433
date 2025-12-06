// Hàm gọi API đăng nhập và đăng ký

async function login(username, password, otp = 0) {
  const url = `${BASE_URL_IDENTITY}/auth/token`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, otp: Number.isFinite(otp) ? otp : 0 })
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      return { ok: false, message: (data && (data.message || data.error)) || `HTTP ${resp.status}` };
    }

    // Chuẩn ApiResponse { code, message?, result }
    const api = data || {};
    if (api.code && api.code !== 1000) {
      return { ok: false, message: api.message || 'Lỗi đăng nhập' };
    }

    const result = api.result || {};
    if (result.token) {
      localStorage.setItem('access_token', result.token);
      localStorage.setItem('token_expiry', result.expiryTime || '');
      return { ok: true, token: result.token };
    }

    return { ok: false, message: 'Không nhận được token' };
  } catch (err) {
    return { ok: false, message: err?.message || 'Lỗi kết nối' };
  }
}

async function registerUser(payload) {
  const url = `${BASE_URL_IDENTITY}/users/registration`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      return { ok: false, message: (data && (data.message || data.error)) || `HTTP ${resp.status}` };
    }

    const api = data || {};
    if (api.code && api.code !== 1000) {
      return { ok: false, message: api.message || 'Đăng ký thất bại' };
    }

    return { ok: true, data: api.result };
  } catch (err) {
    return { ok: false, message: err?.message || 'Lỗi kết nối' };
  }
}
