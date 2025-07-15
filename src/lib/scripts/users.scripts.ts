import fetchInstance from "../fetchInstance";
import { FETCH_ALL_USERS, UPDATE_USER_BY_ID } from "../apis";
import { IUser } from "@/types";

export const fetchAllUsers = async () => {
  return await fetchInstance(FETCH_ALL_USERS, { method: "GET" });
};

export const updateUserById = async (
  id: string,
  updatingFields: Partial<IUser>
) => {
  return await fetchInstance(UPDATE_USER_BY_ID + id, {
    method: "PATCH",
    body: JSON.stringify({ updatingFields }),
  });
};
