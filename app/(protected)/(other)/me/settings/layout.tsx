import { SettingsNav } from "./_components/SettingsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // md+: nav | content | spacer, so the content sits in the middle of the page.
    <div className="flex min-h-full flex-col md:grid md:grid-cols-[14rem_minmax(0,1fr)_14rem]">
      <aside className="custom-scrollbar flex-shrink-0 overflow-x-auto p-3 md:sticky md:top-0 md:self-start md:overflow-x-visible md:pt-8">
        <SettingsNav />
      </aside>

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">{children}</div>

      <div aria-hidden className="hidden md:block" />
    </div>
  );
}
