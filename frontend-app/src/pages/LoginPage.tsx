import { LoginForm } from '@/components/auth/LoginForm';
import { CarouselInstitutional } from '@/components/ui/carousel-institutional';

// Placeholder institutional images (replace with actual images later)
const INSTITUTIONAL_IMAGES = [
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Top Logos */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-start p-6 md:p-8">
        {/* Logo 1 - Top Left */}
        <div className="bg-white rounded-xl shadow-md p-4 w-24 h-24 md:w-28 md:h-28 flex items-center justify-center border-2 border-[hsl(var(--canalco-primary))]">
          <span className="text-sm md:text-base font-bold text-[hsl(var(--canalco-neutral-600))]">
            Logo 1
          </span>
        </div>

        {/* Logo 2 - Top Right */}
        <div className="bg-white rounded-xl shadow-md p-4 w-24 h-24 md:w-28 md:h-28 flex items-center justify-center border-2 border-[hsl(var(--canalco-primary))]">
          <span className="text-sm md:text-base font-bold text-[hsl(var(--canalco-neutral-600))]">
            Logo 2
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-screen pt-32 lg:pt-0">
        {/* Left Side - Carousel (Hidden on mobile, shown on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="w-full max-w-xl h-[600px] rounded-3xl border-4 border-[hsl(var(--canalco-primary))] overflow-hidden shadow-2xl">
            <CarouselInstitutional
              images={INSTITUTIONAL_IMAGES}
              autoplayDelay={3000}
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Welcome Title */}
            <div className="text-center mb-8">
              <h1
                className="text-4xl md:text-5xl font-bold text-[hsl(var(--canalco-neutral-900))] tracking-tight"
                style={{ letterSpacing: '0.05em' }}
              >
                BIENVENIDO
              </h1>
            </div>

            {/* Login Form Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[hsl(var(--canalco-neutral-200))]">
              <LoginForm />
            </div>

            {/* Footer Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[hsl(var(--canalco-neutral-600))]">
                © 2025 Canalcongroup. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
