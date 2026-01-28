import Image from "next/image";
import Link from "next/link";

interface Props {
  onLogoClick?: () => void;
}

export const Logo = ({ onLogoClick }: Props) => {
  return (
    <Link
      href="/"
      className="flex flex-shrink-0 items-center gap-2 transition-opacity hover:opacity-80 sm:gap-3"
      onClick={onLogoClick}
      aria-label="Penn Marketplace home"
    >
      <Image
        src="/images/logo.png"
        alt="Penn Marketplace Logo"
        width={36}
        height={36}
        className="object-contain"
      />
      <span className="text-foreground hidden text-xl font-bold sm:inline">Penn Marketplace</span>
    </Link>
  );
};
