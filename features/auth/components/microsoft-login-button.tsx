import { SocialButton } from "./SocialButton";

export function MicrosoftIcon({
  className = "size-[16px]",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 23 23"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  );
}

interface MicrosoftLoginButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
  lastUsed?: boolean;
}

export function MicrosoftLoginButton({
  onClick,
  isLoading,
  lastUsed,
}: MicrosoftLoginButtonProps) {
  return (
    <SocialButton
      label="Continue with Microsoft"
      icon={<MicrosoftIcon />}
      onClick={onClick}
      isLoading={isLoading}
      lastUsed={lastUsed}
    />
  );
}
