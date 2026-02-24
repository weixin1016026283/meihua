'use client';
import { useState, useRef, useEffect } from 'react';
import { useUser } from './UserContext';

const labels = {
  zh: { signIn: '登录', account: '我的账户', signOut: '退出登录' },
  en: { signIn: 'Sign In', account: 'My Account', signOut: 'Sign Out' },
};

export default function UserButton({ lang = 'zh' }) {
  const { user, loading, signIn, signOut } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const t = labels[lang] || labels.zh;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <button onClick={signIn} style={{
        padding: '4px 10px', background: 'rgba(0,0,0,0.06)',
        border: 'none', borderRadius: 8, cursor: 'pointer',
        fontSize: 13, color: '#555', fontWeight: 500,
      }}>
        {t.signIn}
      </button>
    );
  }

  const avatar = user.user_metadata?.avatar_url;
  const initial = (user.user_metadata?.full_name || user.email || '?')[0].toUpperCase();

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: 28, height: 28, borderRadius: '50%', border: '2px solid #e5e5e5',
        padding: 0, cursor: 'pointer', overflow: 'hidden', background: '#eee',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {avatar
          ? <img src={avatar} alt="" width={28} height={28} style={{ objectFit: 'cover' }} referrerPolicy="no-referrer" />
          : <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>{initial}</span>}
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 36, background: '#fff',
          border: '1px solid #e5e5e5', borderRadius: 10, padding: 8,
          minWidth: 180, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 2000,
        }}>
          <div style={{ padding: '6px 10px', fontSize: 12, color: '#999', borderBottom: '1px solid #f0f0f0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
          <a href="/account" onClick={() => setOpen(false)} style={{
            display: 'block', padding: '8px 10px', fontSize: 13,
            color: '#333', textDecoration: 'none', borderRadius: 6,
          }}>{t.account}</a>
          <button onClick={() => { signOut(); setOpen(false); }} style={{
            display: 'block', width: '100%', padding: '8px 10px',
            fontSize: 13, color: '#d44', background: 'none',
            border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: 6,
          }}>{t.signOut}</button>
        </div>
      )}
    </div>
  );
}
