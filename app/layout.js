import "./globals.css";

export const metadata = {
  title: "Affilio AI",
  description: "AI workspace for affiliate marketers"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
