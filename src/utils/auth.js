// src/utils/auth.js  (purani file ko is poori file se REPLACE kar do)

export const getToken = () => {
  try {
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
};

export const getUserName = () => {
  try {
    return localStorage.getItem("user_name") || "";
  } catch {
    return "";
  }
};

export const setUserName = (name) => {
  try {
    localStorage.setItem("user_name", name || "");
  } catch {
    /* ignore */
  }
};

// JWT ke andar "exp" (expiry) hota hai. Guzar gaya ho to user logged-in nahi mana jayega.
export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_name");
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_name");
  window.location.href = "/login";
};