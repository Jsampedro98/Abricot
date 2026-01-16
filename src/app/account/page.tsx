"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { authService } from "@/services/api";
import { useRouter } from "next/navigation";
import { Lock, User as UserIcon } from "lucide-react";

interface ProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
}

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  // Profile Form
  const { 
      register: registerProfile, 
      handleSubmit: handleSubmitProfile, 
      setValue: setProfileValue,
      formState: { errors: {} } 
  } = useForm<ProfileFormData>();

  // Password Form
  const { 
      register: registerPassword, 
      handleSubmit: handleSubmitPassword, 
      reset: resetPassword,
      formState: { errors: passwordErrors } 
  } = useForm<PasswordFormData>();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
        const parts = user.name ? user.name.split(' ') : [];
        let firstName = "";
        let lastName = "";

        if (parts.length > 0) {
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
        }

        setProfileValue("firstName", firstName);
        setProfileValue("lastName", lastName);
        setProfileValue("email", user.email);
    }
  }, [user, isLoading, router, setProfileValue]);

  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
        setIsSavingProfile(true);
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        
        await authService.updateProfile({
            name: fullName,
            email: data.email
        });
        
        window.location.reload(); 

    } catch (error) {
        console.error("Failed to update profile", error);
        alert("Erreur lors de la mise à jour du profil.");
    } finally {
        setIsSavingProfile(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormData) => {
    try {
        setIsSavingPassword(true);
        
        await authService.updatePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
        });
        
        alert("Mot de passe mis à jour avec succès !");
        resetPassword();

    } catch (error) {
        console.error("Failed to update password", error);
        if (error instanceof Error) {
             alert(error.message);
        } else {
             alert("Erreur lors de la mise à jour du mot de passe.");
        }
    } finally {
        setIsSavingPassword(false);
    }
  };

  if (isLoading || !user) {
      return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Mon compte">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
         
         <div className="flex items-center gap-3 mb-8">
             <div className="h-12 w-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-lg font-bold">
                 {user.name?.charAt(0).toUpperCase()}
             </div>
             <div>
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
             </div>
         </div>

         {/* Profile Section */}
         <div className="bg-white rounded-xl border border-border/60 shadow-sm p-8">
             <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                 <UserIcon className="h-5 w-5 text-gray-500" />
                 <h3 className="text-lg font-semibold text-foreground">Informations personnelles</h3>
             </div>

             <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Nom</label>
                        <Input 
                            {...registerProfile("lastName")}
                            className="bg-gray-50/50 border-gray-200"
                            placeholder="Dupont"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Prénom</label>
                        <Input 
                            {...registerProfile("firstName")}
                            className="bg-gray-50/50 border-gray-200"
                            placeholder="Amélie"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input 
                        {...registerProfile("email", { required: true })}
                        className="bg-gray-50/50 border-gray-200"
                        type="email"
                    />
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-6 font-medium"
                        disabled={isSavingProfile}
                    >
                        {isSavingProfile ? "Enregistrement..." : "Mettre à jour le profil"}
                    </Button>
                </div>
             </form>
         </div>

         {/* Security Section */}
         <div className="bg-white rounded-xl border border-border/60 shadow-sm p-8">
             <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                 <Lock className="h-5 w-5 text-gray-500" />
                 <h3 className="text-lg font-semibold text-foreground">Sécurité</h3>
             </div>

             <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Mot de passe actuel</label>
                     <Input 
                        {...registerPassword("currentPassword", { required: true })}
                        className="bg-gray-50/50 border-gray-200"
                        type="password"
                        placeholder="••••••••••••"
                     />
                </div>

                <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Nouveau mot de passe</label>
                     <Input 
                        {...registerPassword("newPassword", { 
                            required: true, 
                            minLength: 8,
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
                        })}
                        className="bg-gray-50/50 border-gray-200"
                        type="password"
                        placeholder="••••••••••••"
                     />
                     {passwordErrors.newPassword && (
                         <p className="text-xs text-red-500">
                             Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.
                         </p>
                     )}
                     {!passwordErrors.newPassword && (
                         <p className="text-xs text-muted-foreground mt-1">Au moins 8 caractères, une majuscule, une minuscule et un chiffre.</p>
                     )}
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        className="bg-[#1A1A1A] hover:bg-[#333] text-white px-6 font-medium"
                        disabled={isSavingPassword}
                    >
                        {isSavingPassword ? "Enregistrement..." : "Changer le mot de passe"}
                    </Button>
                </div>
             </form>
         </div>

      </div>
    </DashboardLayout>
  );
}
