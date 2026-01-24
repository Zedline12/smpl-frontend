export function SocialAuthErrorText({ error }: { error: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-fade-in-up">
      {error}
    </div>
  );
}
