export default function FeaturesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="px-5 sm:px-4 lg:px-6">{children}</div>;
}
