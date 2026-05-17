import { API_BASE_URL } from '@/constants/api';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearTokens, getAccessToken, getEmployeeId, saveEmployeeId, saveTokens } from './auth';

type AuthContextValue = {
  loading: boolean;
  signedIn: boolean;
  employeeId: string | null;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const empId = await getEmployeeId();
      const token = await getAccessToken();
      const signed = !!token;
      setSignedIn(signed);
      setEmployeeId(empId);
      // redirect to appropriate screen after checking token
      try {
        if (signed) {
          router.replace('/(tabs)/shopping' as any);
        } else {
          router.replace('/login' as any);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const signOut = async () => {
    await clearTokens();
    setSignedIn(false);
    router.replace('/login' as any);
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log(`Attempting to sign in with email: ${API_BASE_URL}/auth/login` , JSON.stringify({ email, password }));
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.log(`Login failed: ${res.status} - ${text}`);
        return { ok: false, error: text || `HTTP ${res.status}` };
      }
      console.log(`Login successful: ${res.status}`);
      const data = await res.json();
      console.log(`Login response data:`, data);
      if (data.employeeId) {
          console.log(`Login response saving employeeId:`, data.employeeId);
          await saveEmployeeId(data.employeeId + "");
          setEmployeeId(data.employeeId);
        }
        console.log(`Login response saving accessToken:`, data.accessToken);
      if (data.accessToken) {
        console.log(`Login response saving accessToken:`, data.accessToken);
        await saveTokens(data.accessToken, data.refreshToken);
        setSignedIn(true);
        router.replace('/(tabs)/shopping' as any);
        return { ok: true };
      }

      return { ok: false, error: 'No access token returned' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  return (
    <AuthContext.Provider value={{ loading, signedIn, employeeId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
