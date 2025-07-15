import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Copy, CheckCheck, Inbox } from "lucide-react";
import {
  calculateTotalSpentDollars,
  formatDateIntoISOString,
  formatNumber,
  truncateTxHash,
  truncateWalletAddress,
} from "@/lib/utils";
import { useData } from "@/components/DataProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as XLSX from "xlsx";

type TUser = {
  _id: string;
  name: string;
  email: string;
  registeredDate: string;
  totalTransactions: number;
  totalSpent: number;
  balance: string;
  walletAddress: string;
};

const Users = () => {
  const [formattedUsers, setFormattedUsers] = useState<TUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<TUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isUserIdCopied, setIsUserIdCopied] = useState<boolean>(false);
  const [isWalletAddressCopied, setIsWalletAddressCopied] =
    useState<boolean>(false);

  const { users, transactions } = useData();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleUserIdCopy = (userId: string) => {
    navigator.clipboard.writeText(userId);
    setIsUserIdCopied(true);
    setTimeout(() => {
      setIsUserIdCopied(false);
    }, 2000);
  };

  const handleWalletAddressCopy = (walletAddress: string) => {
    navigator.clipboard.writeText(walletAddress);
    setIsWalletAddressCopied(true);
    setTimeout(() => {
      setIsWalletAddressCopied(false);
    }, 2000);
  };

  const handleExport = () => {
    const exportData = users.map((user) => ({
      ID: user._id,
      Name: user.name || "-",
      Email: user.email || "-",
      Role: user.role,
      EmailVerified: user.emailVerified ? "Yes" : "No",
      WalletAddress: user.walletAddress || "-",
      Balance: user.balance,
      SignedInVia: user.signedOption,
      CreatedAt: user.createdAt,
      UpdatedAt: user.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const fileName = `users_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    const covertUsersData = () => {
      if (users.length > 0) {
        const formattedUsersList: TUser[] = users.map((user) => {
          const userTxs = transactions.filter((tx) => tx.userId === user._id);
          const totalSpent = calculateTotalSpentDollars(
            userTxs.filter(
              (tx) =>
                (tx.type === "buy" && tx.status === "pending") ||
                tx.status === "completed"
            )
          );

          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            registeredDate: formatDateIntoISOString(user.createdAt),
            totalTransactions: userTxs.length,
            totalSpent,
            balance: user.balance,
            walletAddress: user.walletAddress,
          };
        });

        setFormattedUsers(formattedUsersList);
        setFilteredUsers(formattedUsersList);
      }
    };

    covertUsersData();
  }, [users, transactions]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(formattedUsers);
    } else {
      const lowerSearch = searchTerm.toLowerCase();

      const filtered = formattedUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(lowerSearch) ||
          user.email?.toLowerCase().includes(lowerSearch) ||
          user.walletAddress?.toLowerCase().includes(lowerSearch) ||
          user.balance?.toLowerCase().includes(lowerSearch)
      );

      setFilteredUsers(filtered);
    }
  }, [searchTerm, formattedUsers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and view user activity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({users.length})</span>
            <Button size="sm" onClick={handleExport}>
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select> */}
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      id="select-all"
                      checked={selectedUsers.length === users.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onCheckedChange={(checked) =>
                          handleSelectUser(user._id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.registeredDate}</TableCell>
                    <TableCell>{user.totalTransactions}</TableCell>
                    <TableCell>${formatNumber(user.totalSpent)}</TableCell>
                    <TableCell>{user.balance} CHRLE</TableCell>
                    <TableCell>
                      {truncateWalletAddress(user.walletAddress)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                              <DialogDescription>
                                View user information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    ID
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      #{truncateTxHash(user._id)}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUserIdCopy(user._id)}
                                    >
                                      {!isUserIdCopied ? (
                                        <Copy className="h-4 w-4" />
                                      ) : (
                                        <CheckCheck className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Name
                                  </label>
                                  <p className="font-medium">{user.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    User Email
                                  </label>
                                  <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Total spent
                                  </label>
                                  <p className="font-medium">
                                    ${user.totalSpent}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Balance
                                  </label>
                                  <p className="font-medium">
                                    {user.balance} CHRLE
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Wallet Address
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono text-sm break-all">
                                      {user.walletAddress}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleWalletAddressCopy(
                                          user.walletAddress
                                        )
                                      }
                                    >
                                      {!isWalletAddressCopied ? (
                                        <Copy className="h-4 w-4" />
                                      ) : (
                                        <CheckCheck className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Registered Date
                                  </label>
                                  <p className="font-medium">
                                    {user.registeredDate}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center gap-4 p-14">
                <Inbox className="h-8 w-8 text-gray-400" />
                <p className="text-gray-400">No users found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
