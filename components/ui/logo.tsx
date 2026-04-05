import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/">
      <Image
        width={125}
        height={70.31}
        src="/clothes.jpg"
        alt="Clothes Saldos Americanos Logo"
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
      />
    </Link>
  );
}
