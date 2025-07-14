import { ITransaction, IUser } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { isSameMonth } from "date-fns";
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

export function calculateMonthlyTransactionChange(
  transactions: ITransaction[]
): number {
  const now = new Date();

  const thisMonthCount = transactions.filter((tx) =>
    isSameMonth(new Date(tx.createdAt), now)
  ).length;

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const lastMonthCount = transactions.filter((tx) =>
    isSameMonth(new Date(tx.createdAt), lastMonthDate)
  ).length;

  let percentChange = 0;

  if (lastMonthCount > 0) {
    percentChange = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
  } else if (thisMonthCount > 0) {
    percentChange = 100;
  } else {
    percentChange = 0;
  }

  return parseFloat(percentChange.toFixed(2));
}

export function calculateMonthlyRevenueChange(
  transactions: ITransaction[]
): number {
  const now = new Date();

  // Start of current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(currentMonthStart.getTime() - 1);

  // Filter transactions for revenue calculation
  const filteredTxs = transactions.filter((tx) => {
    return tx.type === "buy" && ["pending", "completed"].includes(tx.status);
  });

  // Sum token amounts for this month
  const currentMonthRevenue = filteredTxs
    .filter((tx) => new Date(tx.createdAt) >= currentMonthStart)
    .reduce((sum, tx) => sum + parseFloat(tx.amountToken || "0"), 0);

  // Sum token amounts for last month
  const lastMonthRevenue = filteredTxs
    .filter((tx) => {
      const date = new Date(tx.createdAt);
      return date >= lastMonthStart && date < currentMonthStart;
    })
    .reduce((sum, tx) => sum + parseFloat(tx.amountToken || "0"), 0);

  // Calculate percent change
  if (lastMonthRevenue === 0) {
    return currentMonthRevenue > 0 ? 100 : 0;
  }

  const percentChange =
    ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  return percentChange;
}

export function calculateTotalRevenueDollars(
  transactions: ITransaction[]
): number {
  const filteredTxs = transactions.filter((tx) => {
    return tx.type === "buy" && ["pending", "completed"].includes(tx.status);
  });

  let totalRevenueDollars = 0;

  filteredTxs.forEach((tx) => {
    const tokenPrice =
      parseFloat(tx.tokenPriceUSD) > 0 ? parseFloat(tx.tokenPriceUSD) : 0.0002;

    const txRevenueDollars = parseFloat(tx.amountToken) * tokenPrice;

    totalRevenueDollars += txRevenueDollars;
  });

  return totalRevenueDollars;
}

export function calculateTotalSpentDollars(txs: ITransaction[]): number {
  let totalSpent = 0;

  txs.forEach((tx) => {
    const tokenPrice =
      parseFloat(tx.tokenPriceUSD) > 0 ? parseFloat(tx.tokenPriceUSD) : 0.0002;
    totalSpent += tokenPrice * parseFloat(tx.amountToken);
  });

  return totalSpent;
}

export function formatNumber(
  value: number,
  minimumFractionDigits = 0,
  maximumFractionDigits = 2
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

export function formatDateIntoISOString(date: string): string {
  return new Date(date).toISOString().slice(0, 10);
}

export const formatTransactionDate = (dateStr: string): string => {
  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export function getCurrencySymbol(currency: "usd" | "eur" | "pln") {
  return currency === "usd" ? "$" : currency === "eur" ? "€" : "zł";
}

export function truncateWalletAddress(walletaAddress: string): string {
  if (!walletaAddress) return "-";
  return `${walletaAddress.slice(0, 6)}...${walletaAddress.slice(-4)}`;
}

export function truncateTxHash(txHash: string): string {
  if (!txHash) return "-";
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
}
