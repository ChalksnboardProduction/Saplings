import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="fixed top-0 w-full z-50 border-b border-gray-100 bg-white">
            <div className="wrapper h-24 flex items-center justify-start">
                <Link
                    href="https://thevenkateshwarschool.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group h-full"
                >
                    <div className="relative h-full w-96 overflow-hidden rounded-lg">
                        <Image
                            src="/tvs-logo.png"
                            alt="The Venkateshwar School Logo"
                            fill
                            className="object-fill"
                            priority
                        />
                    </div>
                </Link>
            </div>
        </header>
    );
}
