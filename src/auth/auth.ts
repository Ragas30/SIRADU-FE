export const getToken = () => localStorage.getItem("auth_token");
export const clearAuth = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};