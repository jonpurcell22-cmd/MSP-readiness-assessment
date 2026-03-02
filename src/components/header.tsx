import Image from "next/image"

export function Header({ rightContent }: { rightContent?: React.ReactNode }) {
  return (
    <header className="bg-background">
      <div className="relative flex items-center justify-center px-6 py-5">
        <div className="relative h-[60px] w-[275px] sm:h-[70px] sm:w-[325px]">
          <Image
            src="/images/logo-main.svg"
            alt="Untapped Channel"
            fill
            style={{ objectFit: "contain", objectPosition: "left center" }}
            priority
          />
        </div>
        {rightContent && <div className="absolute right-6">{rightContent}</div>}
      </div>
      <div className="h-[2px] bg-[var(--brand-green)]" />
    </header>
  )
}
