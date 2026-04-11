export const getTokenFromLocalStorage = async () => {
    return new Promise((resolve, _reject) => {
      const tokenLocal = localStorage.getItem("token");
      const token = tokenLocal && JSON.parse(tokenLocal);
      resolve(token?.token || "");
    });
  };
  
  export const setTokenToLocalStorage = (token: string) => {
    try {
      const tokenString = JSON.stringify({ token });
      localStorage.setItem("token", tokenString);
    } catch (error) {
      console.error(error);
    }
  };
  
  export const clearToken = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.error(error);
    }
  };
  





