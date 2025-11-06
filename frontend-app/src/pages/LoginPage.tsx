import { LoginForm } from '@/components/auth/LoginForm'
import { LayoutDashboard, TrendingUp, Shield, Zap } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Side - Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-white/10"
                  style={{
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          {/* Logo/Brand */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
            </div>
            <p className="text-xl text-slate-300">
              Sistema de gestión empresarial
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Analytics en tiempo real
                </h3>
                <p className="text-slate-400">
                  Monitorea el rendimiento de tu negocio con métricas actualizadas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Seguridad garantizada
                </h3>
                <p className="text-slate-400">
                  Tus datos protegidos con encriptación de nivel empresarial
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Respuesta inmediata
                </h3>
                <p className="text-slate-400">
                  Interfaz optimizada para máxima velocidad y eficiencia
                </p>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-slate-400 text-sm">
              © 2025 Admin Panel. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
