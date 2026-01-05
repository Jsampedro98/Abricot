"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@/types/auth";
import { authService } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserSearchProps {
  onSelect: (user: User) => void;
  excludeUserIds?: string[];
  placeholder?: string;
}

export function UserSearch({ onSelect, excludeUserIds = [], placeholder = "Rechercher un utilisateur..." }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
        if (query.trim().length >= 2) {
            handleSearch();
        } else {
            setResults([]);
        }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close results
  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
              setShowResults(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async () => {
    try {
        setIsLoading(true);
        const users = await authService.searchUsers(query);
        // Filter out excluded users (like current members)
        const filtered = users.filter(u => !excludeUserIds.includes(u.id));
        setResults(filtered);
        setShowResults(true);
    } catch (error) {
        console.error("Search failed", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSelect = (user: User) => {
      onSelect(user);
      setQuery("");
      setResults([]);
      setShowResults(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
        <div className="flex items-center gap-2">
            <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="bg-gray-50/50 border-gray-200"
                onFocus={() => {
                    if (results.length > 0) setShowResults(true);
                }}
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground absolute right-3" />}
        </div>

        {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                {results.map(user => (
                    <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelect(user)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 text-left transition-colors"
                    >
                         <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">
                                {user.name?.substring(0, 2).toUpperCase() || <UserIcon className="h-3 w-3" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">{user.name || "Sans nom"}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                         </div>
                         <Plus className="h-4 w-4 text-gray-400" />
                    </button>
                ))}
            </div>
        )}
        
        {showResults && results.length === 0 && query.length >= 2 && !isLoading && (
             <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2 text-center text-xs text-muted-foreground">
                 Aucun utilisateur trouvé
             </div>
        )}
    </div>
  );
}
