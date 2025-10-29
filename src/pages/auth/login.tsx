"use client"

import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/siradu.png" alt="siradu" className="w-32 h-32 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-primary mb-2">Siradu Admin</h1>
          <p className="text-muted-foreground">Kelola aplikasi Anda dengan mudah</p>
        </div>
        <LoginForm />
        {/* <p className="text-center text-sm text-muted-foreground mt-6">
          Demo credentials: admin@example.com / password123
        </p> */}
      </div>
    </div>
  )
}
