import Image from "next/image"

export function Header({ rightContent }: { rightContent?: React.ReactNode }) {
  return (
    <header
      className="relative z-10"
      style={{
        background: "rgba(10,10,15,0.8)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
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
        {rightContent && (
          <div className="absolute right-6" style={{ color: "#8b8b9a", fontSize: 13 }}>
            {rightContent}
          </div>
        )}
      </div>
    </header>
  )
}
