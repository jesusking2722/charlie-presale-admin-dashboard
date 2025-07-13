import fetchInstance from "../fetchInstance";
import { LOGIN } from "../apis";

export const login = async (email: string, password: string) => {
  return await fetchInstance(LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};
