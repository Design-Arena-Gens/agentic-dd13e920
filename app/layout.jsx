import './globals.css';

export const metadata = {
  title: "De Jongh?s Panelbeating Centre | AI Assistant",
  description: "Trusted auto body repair and spray-painting assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
