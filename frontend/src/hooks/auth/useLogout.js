export const useLogout = () => {
  const logout = () => {
    localStorage.removeItem('token')
  };

  return { logout };
};
