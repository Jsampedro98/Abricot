"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/auth-layout";

import { useAuth } from "@/context/auth-context";
import { useState } from "react";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<{ firstName: string; lastName: string; email: string; password: string; confirmPassword: string }>();
  const { register: registerUser } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const password = watch("password");

  const onSubmit = async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      await registerUser({ 
          email: data.email, 
          password: data.password,
          name: fullName 
      });
    } catch (error) {
       console.error(error);
       if (error instanceof Error) {
         setAuthError(error.message);
       } else {
         setAuthError("Erreur lors de l'inscription.");
       }
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

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <div className="mt-1">
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  {...register("firstName", { required: true })}
                  placeholder="John"
                />
                {errors.firstName && <span className="text-sm text-red-500">Requis</span>}
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <div className="mt-1">
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  {...register("lastName", { required: true })}
                  placeholder="Doe"
                />
                {errors.lastName && <span className="text-sm text-red-500">Requis</span>}
              </div>
            </div>
        </div>

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
              placeholder="john.doe@example.com"
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
             <p className="text-xs text-muted-foreground mt-1">Au moins 8 caractères, une majuscule, une minuscule et un chiffre.</p>
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
          <Button type="submit" variant="secondary" className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white py-6" disabled={isLoading}>
            {isLoading ? "Inscription..." : "S'inscrire"}
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
