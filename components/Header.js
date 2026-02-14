import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="fixed top-0 w-full z-50 border-b border-gray-100 bg-white">
            <div className="wrapper h-16 md:h-24 flex items-center justify-start">
                <Link
                    href="https://www.gdgoenkadhanbad.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group h-full"
                >
                    <div className="relative h-full w-48 md:w-96 overflow-hidden rounded-lg">
                        <Image
                            src="/sapling-logo.webp"
                            alt="Saplings Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>
            </div>
        </header>
    );
}
