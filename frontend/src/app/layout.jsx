import "./globals.css";

export const metadata = {
  title: {
    default: "VainyBliss",
    template: "%s | VainyBliss",
  },
  description: "Panel de administracion de VainyBliss.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "VainyBliss",
    description: "Panel de administracion de VainyBliss.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
