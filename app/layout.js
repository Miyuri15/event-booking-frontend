import "./globals.css";

export const metadata = {
  title: "Event Booking Portal",
  description: "Frontend for the Event Booking microservices assignment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
