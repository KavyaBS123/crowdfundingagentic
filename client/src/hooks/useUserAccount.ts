import { useThirdweb } from '@/context/ThirdwebContext';
import { useEffect, useState } from 'react';

export interface UserData {
  id: number;
  address: string;
  badges?: string[];
  streakCount?: number;
  // Add more fields as needed
}

export function useUserAccount() {
  const { address } = useThirdweb();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setUser(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/users/address/${address}`)
      .then(async res => {
        if (res.status === 404) {
          // Auto-register user if not found
          const createRes = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
          });
          if (!createRes.ok) throw new Error('Failed to auto-register user');
          return createRes.json();
        }
        if (!res.ok) throw new Error('User not found');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [address]);

  return { user, loading, error };
} 