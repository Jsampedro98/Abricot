import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full font-sans bg-white">
      {/* Left Column: Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10 flex justify-center lg:justify-start">
             <Image src="/logo-orange.svg" alt="Abricot" width={180} height={50} priority />
          </div>
          
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-primary text-center lg:text-left">
            {title}
          </h2>

          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-50">
        <Image
          src="/login-image.jpg"
          alt="Au travail"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
