import cookies from "js-cookie";

export const isAuthenticated = (): boolean => {
  const cookieToken = cookies.get("accessToken");
  let localStorageToken = null;

  if (typeof window !== "undefined") {
    try {
      const tokenString = localStorage.getItem("token");
      if (tokenString) {
        const tokenObj = JSON.parse(tokenString);
        localStorageToken = tokenObj.token || tokenObj;
      }
      
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        localStorageToken = accessToken;
      }
    } catch (error) {
      console.error(error);
    }
  }

  return !!cookieToken || !!localStorageToken;
};

export const isValidProfileResponse = (profileData: any): boolean => {
  if (!profileData) return false;
  
  if (profileData.data && profileData.data._id) return true;
  
  return false;
};

export const checkAuthAndRedirect = (
  _redirectFn: (path: string) => void, 
  profileData?: any
): boolean => {
  if (profileData && !isValidProfileResponse(profileData)) {
    clearAuthData();
    return false;
  }
  
  const isAuth = isAuthenticated();
  if (!isAuth) {
    return false;
  }
  
  return true;
};

export const clearAuthData = (): void => {
  cookies.remove("accessToken");
  
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
  }
}; 





