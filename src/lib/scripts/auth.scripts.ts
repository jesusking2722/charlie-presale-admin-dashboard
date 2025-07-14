import fetchInstance from "../fetchInstance";
import { FETCH_ME, LOGIN } from "../apis";

export const login = async (email: string, password: string) => {
  return await fetchInstance(LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const fetchMe = async (id: string) => {
  return await fetchInstance(FETCH_ME, {
    method: "POST",
    body: JSON.stringify({ id }),
  });
};
