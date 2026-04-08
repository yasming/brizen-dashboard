const API_URL = import.meta.env.VITE_API_URL;

function handleUnauthorized(response: Response): void {
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
}

export const login = async (credentials: { email: string; password: string }) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
};

export const getBets = async (token: string) => {
  const response = await fetch(`${API_URL}/bets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  handleUnauthorized(response);
  const data = await response.json();
  return Array.isArray(data?.bets) ? data.bets : [];
};


export const getSports = async (token: string) => {
  const response = await fetch(`${API_URL}/sports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  handleUnauthorized(response);
  const data = await response.json();
  return data.sports;
};

export interface BetPayload {
  date: string;
  event: string;
  bet: string;
  odd: string | null;
  fair_odd: string | null;
  closing_odd: string | null;
  clv: string | null;
  value: string | null;
  lucro: string | null;
  total: string | null;
}

export const createBet = async (token: string, betData: BetPayload) => {
  const response = await fetch(`${API_URL}/bets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(betData),
  });

  handleUnauthorized(response);
  if (!response.ok) {
    throw new Error('Failed to create bet');
  }

  return response.json();
};

export const updateBetResult = async (token: string, betId: number, result: number) => {
  const response = await fetch(`${API_URL}/bets/${betId}/result`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ result }),
  });

  handleUnauthorized(response);
  if (!response.ok) {
    throw new Error('Failed to update result');
  }

  return response.json();
};

export const updateBet = async (token: string, betId: number, betData: BetPayload) => {
  const response = await fetch(`${API_URL}/bets/${betId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(betData),
  });

  handleUnauthorized(response);
  if (!response.ok) {
    throw new Error('Failed to update bet');
  }

  return response.json();
};

export const deleteBet = async (token: string, betId: number) => {
  const response = await fetch(`${API_URL}/bets/${betId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  handleUnauthorized(response);
  if (!response.ok) {
    throw new Error('Failed to delete bet');
  }

  return response.status === 204 ? null : response.json();
};
