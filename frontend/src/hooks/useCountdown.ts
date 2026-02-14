import { useState, useEffect, useCallback } from "react";

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isExpired: boolean;
  totalSeconds: number;
  percentage: number;
}

export function useCountdown(
  expiresAt: number,
  totalDurationMs?: number,
): CountdownResult {
  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const diff = Math.max(0, expiresAt - now);
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const total = totalDurationMs ? totalDurationMs / 1000 : 1;
    const percentage = totalDurationMs
      ? Math.max(0, Math.min(100, (diff / totalDurationMs) * 100))
      : 0;

    return {
      hours,
      minutes,
      seconds,
      formatted: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      isExpired: diff <= 0,
      totalSeconds,
      percentage,
    };
  }, [expiresAt, totalDurationMs]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    if (timeLeft.isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, timeLeft.isExpired]);

  return timeLeft;
}
