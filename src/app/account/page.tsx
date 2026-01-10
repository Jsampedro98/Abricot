"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { authService } from "@/services/api";
import { useRouter } from "next/navigation";

interface AccountFormData {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
}

export default function AccountPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AccountFormData>();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
        // Logic to extract first and last name from the full name string
        const parts = user.name ? user.name.split(' ') : [];
        let firstName = "";
        let lastName = "";

        if (parts.length > 0) {
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
        }


        setValue("firstName", firstName);
        setValue("lastName", lastName);
        setValue("email", user.email);
    }
  }, [user, isLoading, router, setValue]);

  const onSubmit = async (data: AccountFormData) => {
    try {
        setIsSaving(true);
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        
        const updateData: any = {
            name: fullName,
            email: data.email
        };

        if (data.password && data.password.length > 0) {
            updateData.password = data.password;
        }

        await authService.updateProfile(updateData);
        
        // Refresh page to update context
        window.location.reload(); 

    } catch (error) {
        console.error("Failed to update profile", error);
        alert("Erreur lors de la mise à jour du profil.");
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading || !user) {
      return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Mon compte">
      <div className="bg-white rounded-xl border border-border/60 shadow-sm p-8 max-w-4xl mx-auto">
         <div className="mb-8">
             <h2 className="text-xl font-bold text-foreground">Mon compte</h2>
             <p className="text-muted-foreground">{user.name}</p>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
            

            
            <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground">Nom</label>
                <Input 
                    id="lastName"
                    {...register("lastName")}
                    className="bg-gray-50/50 border-gray-200"
                    placeholder="Dupont"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">Prénom</label>
                <Input 
                    id="firstName"
                    {...register("firstName")}
                    className="bg-gray-50/50 border-gray-200"
                    placeholder="Amélie"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                <Input 
                    id="email"
                    {...register("email", { required: true })}
                    className="bg-gray-50/50 border-gray-200"
                    type="email"
                />
            </div>

            <div className="space-y-2">
                 <label htmlFor="password" className="text-sm font-medium text-foreground">Mot de passe</label>
                 <Input 
                    id="password"
                    {...register("password")}
                    className="bg-gray-50/50 border-gray-200"
                    type="password"
                    placeholder="••••••••••••"
                 />
            </div>

            <div className="pt-4">
                <Button 
                    type="submit" 
                    className="bg-[#1A1A1A] hover:bg-[#333] text-white px-6 font-medium cursor-pointer"
                    disabled={isSaving}
                >
                    {isSaving ? "Enregistrement..." : "Modifier les informations"}
                </Button>
            </div>

         </form>
      </div>
    </DashboardLayout>
  );
}
