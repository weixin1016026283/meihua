'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseBrowser } from './supabase';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchSubscription(session.user.id);
      setLoading(false);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchSubscription(session.user.id);
        else setSubscription(null);
      }
    );
    return () => authSub.unsubscribe();
  }, []);

  async function fetchSubscription(userId) {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    setSubscription(data);
  }

  async function signIn() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
  }

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    setUser(null);
    setSubscription(null);
  }

  function refreshSubscription() {
    if (user) fetchSubscription(user.id);
  }

  const isSubscribed = subscription?.status === 'active' &&
    new Date(subscription.current_period_end) > new Date();

  return (
    <UserContext.Provider value={{ user, subscription, isSubscribed, loading, signIn, signOut, refreshSubscription }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
