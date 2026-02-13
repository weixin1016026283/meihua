export const metadata = {
  title: '梅花易数',
  description: '周易梅花易数在线起卦',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
