"use client"

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "@/api/auth";
import { IProfileResponse, IUser } from "@/interface/auth";
import { clearToken, setTokenToLocalStorage } from "@/lib/tokenStorage";
import { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const queryClient = new QueryClient();

type UserContextType = {
  user: IUser | null;
  profile: IProfileResponse | null;
  loginUser: (userInfo: any, token: string) => void;
  logoutUser: () => void;
  fetchUserProfile: () => Promise<void>;
  isLoadingProfile: boolean;
  isAuthenticated: boolean;
  updateUserProfile?: (data: any) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<null | IUser>(null);
  const [profile, setProfile] = useState<IProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  const [hasToken, setHasToken] = useState(false);
  const loginUser = (userInfo: any, token: string) => {
    setUser(userInfo);
    setHasToken(true);
    if (isClient) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("token", token);
      setTokenToLocalStorage(token);
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile(parsedProfile);
        } catch (error) {
          console.error("Error parsing stored profile:", error);
        }
      }
    }
  };

  const updateUserProfile = (data: any) => {
    if (profile && profile.data) {
      setProfile({
        ...profile,
        data: {
          ...profile.data,
          ...data,
        },
      });
      if (isClient) {
        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            ...profile,
            data: {
              ...profile.data,
              ...data,
            },
          }),
        );
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profileData = await authApi.getMe();
      if (profileData && profileData.statusCode === 200) {
        setProfile(profileData);
        if (isClient) {
          localStorage.setItem("userProfile", JSON.stringify(profileData));
        }
      }
    } catch (error: any) {
      if (isClient) {
        const storedProfile = localStorage.getItem("userProfile");
        if (storedProfile) {
          try {
            setProfile(JSON.parse(storedProfile));
          } catch (e) {
            console.error("Error parsing stored profile:", e);
          }
        }
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Set client flag and initialize from localStorage immediately
  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      const storedProfile = localStorage.getItem("userProfile");
      const storedToken =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (storedToken) {
        setHasToken(true);
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }

      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile(parsedProfile);
          setIsLoadingProfile(false);
        } catch (error) {
          console.error("Error parsing stored profile:", error);
        }
      }

      if (storedToken) {
        fetchUserProfile();
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    }
  }, [user, isClient]);

  const logoutUser = () => {
    clearToken();
    setUser(null);
    setProfile(null);
    setHasToken(false);
    if (isClient) {
      localStorage.removeItem("userProfile");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
    }
    router.push("/");
    queryClient.clear();
  };

  const isAuthenticatedValue = useMemo(() => {
    if (!isClient) {
      return false;
    }
    return !!(user || profile || hasToken);
  }, [isClient, user, profile, hasToken]);

  const contextValue = useMemo(() => ({
    user,
    profile,
    loginUser,
    logoutUser,
    fetchUserProfile,
    isLoadingProfile,
    isAuthenticated: isAuthenticatedValue,
    updateUserProfile,
  }), [user, profile, isLoadingProfile, isAuthenticatedValue]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
