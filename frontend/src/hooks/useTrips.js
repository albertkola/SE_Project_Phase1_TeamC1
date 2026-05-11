import { useEffect, useRef, useState, useCallback } from 'react';
import { searchTrips as apiSearchTrips } from '../api/trips.api';

const DEBOUNCE_MS = 300;

function makeKey(params) {
  const cleaned = {};
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
  }
  return JSON.stringify(cleaned, Object.keys(cleaned).sort());
}

export default function useTrips(initialParams = {}) {
  const [params, setParams] = useState(initialParams);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cacheRef = useRef(new Map());
  const reqIdRef = useRef(0);
  const timerRef = useRef(null);

  const runSearch = useCallback(async (next) => {
    const key = makeKey(next);
    const cached = cacheRef.current.get(key);
    if (cached) {
      setResults(cached);
      setLoading(false);
      setError(null);
      return;
    }

    const myReqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const { trips } = await apiSearchTrips(next);
      if (myReqId !== reqIdRef.current) return;
      cacheRef.current.set(key, trips);
      setResults(trips);
    } catch (err) {
      if (myReqId !== reqIdRef.current) return;
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]?.message
        || err?.message
        || 'Search failed';
      setError(msg);
      setResults([]);
    } finally {
      if (myReqId === reqIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      runSearch(params);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [params, runSearch]);

  const updateParams = useCallback((updater) => {
    setParams((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );
  }, []);

  const refresh = useCallback(() => {
    cacheRef.current.delete(makeKey(params));
    runSearch(params);
  }, [params, runSearch]);

  return { params, setParams: updateParams, results, loading, error, refresh };
}
