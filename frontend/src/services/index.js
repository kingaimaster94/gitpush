import { AuthService } from "./auth.service";

export const authService = new AuthService(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`);
