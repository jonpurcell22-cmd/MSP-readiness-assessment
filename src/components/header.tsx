import Image from "next/image";

export function Header({ rightContent }: { rightContent?: React.ReactNode }) {
  return (
    <header className="bg-background">
      <div className="relative flex items-center justify-center px-6 py-5">
        <Image
          src="/images/Untapped%20Channel%20Main%20Logo%20Transparent%20bg.svg"
          alt="Untapped Channel"
          width={280}
          height={64}
          priority
        />
        {rightContent && <div className="absolute right-6">{rightContent}</div>}
      </div>
      <div className="h-[2px] bg-[var(--brand-green)]" />
    </header>
  );
}
