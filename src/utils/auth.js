import jwt_decode from "jwt-decode";

export const saveToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");

export const isAdmin = () => {
  const token = getToken();
  if (!token) return false;
  const decoded = jwt_decode(token);
  return decoded.is_admin || false;
};
