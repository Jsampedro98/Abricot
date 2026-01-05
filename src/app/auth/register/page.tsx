"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/auth-layout";

import { useAuth } from "@/context/auth-context";
import { useState } from "react";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { register: registerUser } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const password = watch("password");

  const onSubmit = async (data: any) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      await registerUser({ email: data.email, password: data.password });
    } catch (error: any) {
       console.error(error);
       setAuthError(error.message || "Erreur lors de l'inscription.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Inscription">
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
              autoComplete="new-password"
               {...register("password", { required: true })}
            />
             {errors.password && <span className="text-sm text-red-500">Ce champ est requis</span>}
          </div>
        </div>
        
         <div>
           <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmer le mot de passe
          </label>
          <div className="mt-1">
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
               {...register("confirmPassword", { 
                  required: true, 
                  validate: value => value === password || "Les mots de passe ne correspondent pas"
                })}
            />
             {errors.confirmPassword && <span className="text-sm text-red-500">{errors.confirmPassword.message as string}</span>}
          </div>
        </div>

        <div>
          <Button type="submit" variant="secondary" className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white py-6">
            S'inscrire
          </Button>
        </div>
        
        <div className="flex flex-col items-center space-y-4 text-sm mt-6">
             <p className="text-gray-500">
                Déjà inscrit ?{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:text-primary-dark underline">
                  Se connecter
                </Link>
             </p>
        </div>
      </form>
    </AuthLayout>
  );
}
