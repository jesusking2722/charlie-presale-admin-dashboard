import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateMonthlyRevenueChange,
  calculateMonthlyTransactionChange,
  calculateTotalRevenueDollars,
  calculateUserGrowth,
  formatNumber,
} from "@/lib/utils";
import { Users, CreditCard, TrendingUp, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useData } from "@/components/DataProvider";

const initialStats = [
  {
    title: "Total Users",
    value: "1,234",
    change: "+12%",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Total Transactions",
    value: "5,678",
    change: "+8%",
    icon: CreditCard,
    color: "text-green-600",
  },
  {
    title: "Pending Transactions",
    value: "89",
    change: "-5%",
    icon: TrendingUp,
    color: "text-orange-600",
  },
  {
    title: "Total Revenue",
    value: "$123,456",
    change: "+15%",
    icon: DollarSign,
    color: "text-purple-600",
  },
];

type TStat = {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
};

type TRecentTransaction = {
  id: string;
  userEmail: string;
  status: "pending" | "completed";
  amount: number;
};

const Index = () => {
  const [stats, setStats] = useState<TStat[]>(initialStats);
  const [recentTransactions, setRecentTransactions] = useState<
    TRecentTransaction[]
  >([]);

  const { users, transactions } = useData();

  useEffect(() => {
    const covertUsersData = () => {
      const percentChange = calculateUserGrowth(users);

      setStats((prevStats) =>
        prevStats.map((stat) =>
          stat.title.includes("Users")
            ? {
                ...stat,
                value: users.length.toLocaleString(),
                change: `${
                  percentChange >= 0 ? "+" : ""
                }${percentChange.toFixed(2)}%`,
              }
            : stat
        )
      );
    };

    const convertTransactionsData = () => {
      const pendingTxList = transactions.filter(
        (tx: any) => tx?.status === "pending"
      );

      const totalPercentChange =
        calculateMonthlyTransactionChange(transactions);
      const pendingPercentChange =
        calculateMonthlyTransactionChange(pendingTxList);
      const revenuePercentChange = calculateMonthlyRevenueChange(transactions);
      const revenueUsd = calculateTotalRevenueDollars(transactions);

      const sortedTxList = [...transactions].sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      const recentTxList = sortedTxList
        .slice(0, 3)
        .filter((tx) => tx.status === "pending" || tx.status === "completed")
        .map((tx) => {
          const foundUser = users.find((u) => u._id === tx.userId);
          const tokenPrice =
            parseFloat(tx.tokenPriceUSD) > 0
              ? parseFloat(tx.tokenPriceUSD)
              : 0.0002;

          return {
            id: tx._id,
            userEmail: foundUser?.email || "Unknown",
            status: tx.status,
            amount: parseFloat(tx.amountToken) * tokenPrice,
          } as TRecentTransaction;
        });

      setRecentTransactions(recentTxList);

      setStats((prevStats) =>
        prevStats.map((stat) =>
          stat.title.includes("Transactions")
            ? {
                ...stat,
                value: transactions.length.toLocaleString(),
                change: `${
                  totalPercentChange >= 0 ? "+" : ""
                }${totalPercentChange.toFixed(2)}%`,
              }
            : stat.title.includes("Pending")
            ? {
                ...stat,
                value: pendingTxList.length.toLocaleString(),
                change: `${
                  pendingPercentChange >= 0 ? "+" : ""
                }${pendingPercentChange.toFixed(2)}%`,
              }
            : stat.title.includes("Total Revenue")
            ? {
                ...stat,
                change: `${
                  revenuePercentChange >= 0 ? "+" : ""
                }${revenuePercentChange.toFixed(2)}%`,
                value: `$${formatNumber(revenueUsd)}`,
              }
            : stat
        )
      );
    };
    covertUsersData();
    convertTransactionsData();
  }, [users, transactions]);

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome to Charlie Unicorn AI Presale Admin Dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      Transaction #{tx.id.slice(0, 6)}...
                      {tx.id.slice(-4)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tx.userEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${formatNumber(tx.amount)}</p>
                    <span className={getStatusBadge(tx.status)}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
                onClick={() => (window.location.href = "/transactions")}
              >
                <p className="font-medium">Process Pending Transactions</p>
                <p className="text-sm text-muted-foreground">
                  Review and approve pending CHRLE token transfers
                </p>
              </button>
              <button
                className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
                onClick={() => (window.location.href = "/users")}
              >
                <p className="font-medium">Export User Data</p>
                <p className="text-sm text-muted-foreground">
                  Download user information and transaction history
                </p>
              </button>
              <button
                className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
                onClick={() => (window.location.href = "/settings")}
              >
                <p className="font-medium">System Settings</p>
                <p className="text-sm text-muted-foreground">
                  Configure dashboard preferences and security
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
