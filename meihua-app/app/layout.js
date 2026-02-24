import { UserProvider } from '../lib/UserContext';

export const metadata = {
  title: '星问 StarAsk',
  description: 'Ask Anything — 梅花易数 · 占星 · 命盘解析',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body style={{ margin: 0, padding: 0 }}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
