import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/">
      <Image
        width={125}
        height={80}
        src="/clothes.jpg"
        alt="Clothes Saldos Americanos Logo"
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        style={{
          width: "auto",
          height: "auto",
        }}
      />
    </Link>
  );
}
