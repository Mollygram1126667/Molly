export const metadata = {
  title: 'Trading Platform',
  description: 'Deposit and trading platform with webhooks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
