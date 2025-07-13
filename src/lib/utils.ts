import { IUser } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the % change in user count between this month and last month.
 *
 * @param usersList - Array of all users from your backend.
 * @returns number - Percent change. Positive = growth, negative = drop.
 */
export function calculateUserGrowth(usersList: IUser[]): number {
  const now = new Date();

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = startOfThisMonth;

  const thisMonthCount = usersList.filter((user) => {
    const createdAt = new Date(user.createdAt);
    return createdAt >= startOfThisMonth;
  }).length;

  const lastMonthCount = usersList.filter((user) => {
    const createdAt = new Date(user.createdAt);
    return createdAt >= startOfLastMonth && createdAt < endOfLastMonth;
  }).length;

  let percentChange = 0;

  if (lastMonthCount > 0) {
    percentChange = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
  } else if (thisMonthCount > 0) {
    percentChange = 100;
  } else {
    percentChange = 0;
  }

  return percentChange;
}
