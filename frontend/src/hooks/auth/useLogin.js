import { authService } from "../../services";
import Cookies from "js-cookie";

export const useLogin = () => {
  const login = async (walletAddr) => {
    const user = await authService.login(walletAddr);
    if (user) {
      Cookies.set("currentUser", JSON.stringify(user));
    }
    return user;
  };

  return { login };
};
