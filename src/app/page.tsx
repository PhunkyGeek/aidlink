import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/studio-bg.jpg" // Replace with a relevant image or background pattern if needed
          alt="Studio background"
          layout="fill"
          objectFit="cover"
          className="opacity-80"
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 sm:px-12 md:px-20 lg:px-32">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
          AidLink
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 mb-10">
          Community-Powered Aid. On Chain.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md mx-auto">
          <Link
            href="/login"
            className="flex-1 bg-white text-black px-6 py-3 rounded-lg text-center text-sm font-medium hover:bg-gray-200"
          >
            Browse Aid Requests
          </Link>
          <Link
            href="/login"
            className="flex-1 border border-white px-6 py-3 rounded-lg text-center text-sm font-medium hover:bg-white hover:text-black"
          >
            Submit a Request
          </Link>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="relative z-10 flex justify-between items-center px-6 py-4 text-sm text-white">
        <Link href="/" className="hover:underline">
          Skip
        </Link>
        <Link href="/auth/zklogin/callback" className="hover:underline">
          Sign In
        </Link>
      </footer>
    </div>
  );
}
