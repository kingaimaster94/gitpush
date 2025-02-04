import axios from "axios"
import { getAuthorizationHeader } from "../utils/getAuthorizationHeader"
import { jwtDecode } from "jwt-decode";

export class AuthService {
  constructor(url) {
    this.instance = axios.create({
      baseURL: url,
      timeout: 30000,
      timeoutErrorMessage: "Time out!",
    });
  }

  login = (walletAddr) => {
    return this.instance
      .post("/login", {
        walletAddr
      })
      .then((res) => {
        const decodedToken = jwtDecode(res.data.token.replace("Bearer ", ""))
        localStorage.setItem('token', res.data.token.replace("Bearer ", ""))

        return {
          userId: decodedToken.userId,
          username: decodedToken.username,
          avatar: decodedToken.avatar,
          exp: decodedToken.exp,
          iat: decodedToken.iat
        }
      });
  };

  getMe = (userId) => {
    return this.instance
      .get(`/users/${userId}`, {
        headers: getAuthorizationHeader(),
      })
      .then((res) => {
        return res.data;
      });
  };

  uploadAvatar = (userId, newAvatar) => {
    const formData = new FormData();
    formData.append("file", newAvatar);
    return this.instance
      .post(`/users/${userId}/upload`, formData, {
        headers: getAuthorizationHeader(),
      })
      .then((res) => {
        return {
          newAvatar: res.data.data.url,
        };
      });
  };
}
