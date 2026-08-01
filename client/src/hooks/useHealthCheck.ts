import { useState, useEffect, useRef } from 'react';

type HealthStatus = 'online' | 'offline' | 'checking';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export function useHealthCheck(intervalMs = 30000): HealthStatus {
  const [status, setStatus] = useState<HealthStatus>('checking');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
      setStatus(res.ok ? 'online' : 'offline');
    } catch {
      setStatus('offline');
    }
  };

  useEffect(() => {
    check();
    timerRef.current = setInterval(check, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalMs]);

  return status;
}
