import '../styles/globals.css';
export const metadata = {
  title: "Mapbox App",
  description: "Next.js app with Mapbox 3D view",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


