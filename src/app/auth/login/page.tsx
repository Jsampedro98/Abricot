"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const onSubmit = async (data: any) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      await login({ email: data.email, password: data.password });
    } catch (error: any) {
      console.error(error);
      setAuthError(error.message || "Erreur lors de la connexion. Vérifiez vos identifiants.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Connexion">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {authError && (
          <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
            {authError}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", { required: true })}
            />
            {errors.email && <span className="text-sm text-red-500">Ce champ est requis</span>}
          </div>
        </div>

        <div>
           <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <div className="mt-1">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
               {...register("password", { required: true })}
            />
             {errors.password && <span className="text-sm text-red-500">Ce champ est requis</span>}
          </div>
        </div>

        <div>
          <Button type="submit" variant="secondary" className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white py-6">
            Se connecter
          </Button>
        </div>
        
        <div className="flex flex-col items-center space-y-4 text-sm mt-6">
             <Link href="/auth/forgot-password" className="font-medium text-primary hover:text-primary-dark underline">
                Mot de passe oublié?
             </Link>
             
             <p className="text-gray-500">
                Pas encore de compte ?{' '}
                <Link href="/auth/register" className="font-medium text-primary hover:text-primary-dark underline">
                  Créer un compte
                </Link>
             </p>
        </div>
      </form>
    </AuthLayout>
  );
}
