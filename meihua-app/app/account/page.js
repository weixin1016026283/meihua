'use client';
import { useState, useEffect } from 'react';
import { useUser } from '../../lib/UserContext';

const TX = {
  zh: {
    title: '我的账户', back: '← 返回', langToggle: 'EN',
    email: '邮箱', plan: '订阅方案', status: '状态', expiresOn: '到期时间',
    free: '免费版', subscription: '月度订阅 ($3.49/月)', daypass: '日票',
    active: '有效', canceled: '已取消', past_due: '付款逾期', inactive: '未订阅',
    cancelSub: '取消订阅',
    cancelConfirm: '确定要取消订阅吗？取消后当前周期内仍可使用。',
    cancelSuccess: '订阅已取消，当前周期结束前仍可使用。',
    deleteAccount: '删除账户',
    deleteConfirm: '确定要删除账户吗？此操作不可恢复，所有数据将被永久删除。',
    deleteSuccess: '账户已删除。',
    signOut: '退出登录',
    notLoggedIn: '请先登录',
    signIn: '登录',
    processing: '处理中...',
    error: '操作失败，请重试。',
  },
  en: {
    title: 'My Account', back: '← Back', langToggle: '中文',
    email: 'Email', plan: 'Plan', status: 'Status', expiresOn: 'Expires',
    free: 'Free', subscription: 'Monthly ($3.49/mo)', daypass: 'Day Pass',
    active: 'Active', canceled: 'Canceled', past_due: 'Past Due', inactive: 'Not Subscribed',
    cancelSub: 'Cancel Subscription',
    cancelConfirm: 'Are you sure? You can still use it until the end of the current billing period.',
    cancelSuccess: 'Subscription canceled. Access continues until the end of the current period.',
    deleteAccount: 'Delete Account',
    deleteConfirm: 'Are you sure? This action is irreversible. All your data will be permanently deleted.',
    deleteSuccess: 'Account deleted.',
    signOut: 'Sign Out',
    notLoggedIn: 'Please sign in first',
    signIn: 'Sign In',
    processing: 'Processing...',
    error: 'Something went wrong. Please try again.',
  },
};

const C = { bg: '#fafafa', card: '#fff', t1: '#111', t2: '#666', t3: '#999', border: '#e5e5e5', danger: '#d44', accent: '#111' };

export default function AccountPage() {
  const [lang, setLang] = useState('zh');
  const { user, subscription, isSubscribed, loading, signIn, signOut, refreshSubscription } = useUser();
  const [busy, setBusy] = useState(false);
  const t = TX[lang];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: C.t3 }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <div style={{ maxWidth: 540, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👤</div>
          <div style={{ fontSize: 16, color: C.t2, marginBottom: 24 }}>{t.notLoggedIn}</div>
          <button onClick={signIn} style={{ padding: '12px 32px', background: C.accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{t.signIn}</button>
          <div style={{ marginTop: 20 }}>
            <a href="/" style={{ fontSize: 13, color: C.t3, textDecoration: 'none' }}>{t.back}</a>
          </div>
        </div>
      </div>
    );
  }

  const avatar = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name || user.email;
  const planLabel = subscription?.plan === 'subscription' ? t.subscription : subscription?.plan === 'daypass' ? t.daypass : t.free;
  const statusLabel = subscription?.status ? (t[subscription.status] || subscription.status) : t.inactive;
  const expires = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '—';
  const canCancel = subscription?.status === 'active' && subscription?.stripe_subscription_id;

  async function handleCancel() {
    if (!confirm(t.cancelConfirm)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/account/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        alert(t.cancelSuccess);
        refreshSubscription();
      } else {
        const data = await res.json();
        alert(data.error || t.error);
      }
    } catch { alert(t.error); }
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm(t.deleteConfirm)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        alert(t.deleteSuccess);
        signOut();
        window.location.href = '/';
      } else {
        const data = await res.json();
        alert(data.error || t.error);
      }
    } catch { alert(t.error); }
    setBusy(false);
  }

  const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${C.border}`, fontSize: 14 };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: C.t1 }}>
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 16px' }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 4px' }}>
          <a href="/mingpan" style={{ fontSize: 13, color: C.t3, textDecoration: 'none' }}>{t.back}</a>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</span>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} style={{ padding: '5px 10px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#555' }}>{t.langToggle}</button>
        </div>

        {/* PROFILE */}
        <div style={{ textAlign: 'center', padding: '30px 0 20px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', background: '#eee', border: '2px solid #e5e5e5' }}>
            {avatar
              ? <img src={avatar} alt="" width={64} height={64} style={{ objectFit: 'cover' }} referrerPolicy="no-referrer" />
              : <div style={{ lineHeight: '64px', fontSize: 24, color: '#555' }}>{name[0].toUpperCase()}</div>}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 13, color: C.t3 }}>{user.email}</div>
        </div>

        {/* SUBSCRIPTION INFO */}
        <div style={{ background: C.card, borderRadius: 12, padding: '4px 16px', border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={rowStyle}>
            <span style={{ color: C.t2 }}>{t.plan}</span>
            <span style={{ fontWeight: 500 }}>{planLabel}</span>
          </div>
          <div style={rowStyle}>
            <span style={{ color: C.t2 }}>{t.status}</span>
            <span style={{ fontWeight: 500, color: subscription?.status === 'active' ? '#28a745' : C.t1 }}>{statusLabel}</span>
          </div>
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span style={{ color: C.t2 }}>{t.expiresOn}</span>
            <span style={{ fontWeight: 500 }}>{expires}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 40 }}>
          {canCancel && (
            <button onClick={handleCancel} disabled={busy} style={{ padding: '14px', background: C.card, color: C.danger, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1 }}>
              {busy ? t.processing : t.cancelSub}
            </button>
          )}
          <button onClick={() => { signOut(); window.location.href = '/'; }} style={{ padding: '14px', background: C.card, color: C.t1, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {t.signOut}
          </button>
          <button onClick={handleDelete} disabled={busy} style={{ padding: '14px', background: C.card, color: C.danger, border: `1px solid ${C.danger}33`, borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1 }}>
            {busy ? t.processing : t.deleteAccount}
          </button>
        </div>
      </div>
    </div>
  );
}
