"use client"

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "@/api/auth";
import { IProfileResponse, IUser } from "@/types/auth";
import { clearToken, setTokenToLocalStorage } from "@/lib/tokenStorage";
import { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const queryClient = new QueryClient();

type UserContextType = {
  user: IUser | null;
  profile: IProfileResponse | null;
  loginUser: (userInfo: any, token: string) => void;
  logoutUser: () => void;
  forceLogout: (reason?: string) => void;
  fetchUserProfile: () => Promise<void>;
  isLoadingProfile: boolean;
  isAuthenticated: boolean;
  updateUserProfile?: (data: any) => void;
  syncUserProfile: () => Promise<void>;
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

  const syncUserProfile = async () => {
    try {
      const profileData = await authApi.getMe();
      if (profileData && profileData.statusCode === 200) {
        setProfile(profileData);
        if (isClient) {
          localStorage.setItem("userProfile", JSON.stringify(profileData));
        }
        setUser((prevUser) => {
          const updatedUser = {
            ...(prevUser || {}),
            _id: profileData.data._id,
            fullName: profileData.data.fullName,
            email: profileData.data.email,
            phone: profileData.data.phone,
            role: profileData.data.role,
            status: profileData.data.status,
          };
          if (isClient) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
          return updatedUser as any;
        });
      }
    } catch (error) {
      console.error("Error syncing user profile:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profileData = await authApi.getMe();
      if (profileData && profileData.statusCode === 200) {
        setProfile(profileData);
        if (typeof window !== "undefined") {
          localStorage.setItem("userProfile", JSON.stringify(profileData));
          
          const profileDataAny = profileData.data as any;
          if (profileDataAny.accessToken) {
            localStorage.setItem("accessToken", profileDataAny.accessToken);
            localStorage.setItem("token", profileDataAny.accessToken);
            setTokenToLocalStorage(profileDataAny.accessToken);
          }
          
          // Đồng bộ hóa trạng thái user chính để cập nhật quyền và thông tin ngay lập tức
          setUser((prevUser) => {
            const updatedUser = {
              ...(prevUser || {}),
              _id: profileData.data._id || profileData.data.id,
              id: profileData.data._id || profileData.data.id,
              fullName: profileData.data.fullName,
              email: profileData.data.email,
              phone: profileData.data.phone,
              role: profileData.data.role,
              status: profileData.data.status,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser as any;
          });
        }
      }
    } catch (error: any) {
      // Silently handle errors when fetching profile - user might not be authenticated
      if (typeof window !== "undefined") {
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
        // Request FCM Token for Push Notifications
        import("@/lib/firebase").then(({ requestForToken }) => {
          requestForToken();
        }).catch(err => console.error("Firebase module load error", err));
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

  const forceLogout = (reason?: string) => {
    clearToken();
    setUser(null);
    setProfile(null);
    setHasToken(false);
    if (isClient) {
      localStorage.removeItem("userProfile");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    
    // Show blocked notification
    import("react-toastify").then(({ toast }) => {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Tài khoản của bạn đã bị khóa!</span>
          <span className="text-sm">Lý do: {reason || 'Không có lý do được cung cấp'}</span>
          <span className="text-sm">Liên hệ 0963785612 để được hỗ trợ</span>
        </div>,
        { autoClose: false, toastId: 'blocked-user' }
      );
    });

    // Clear query cache and hard redirect to home
    queryClient.clear();
    if (typeof window !== 'undefined') {
      window.location.href = "/";
    }
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
    forceLogout,
    fetchUserProfile,
    syncUserProfile,
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
