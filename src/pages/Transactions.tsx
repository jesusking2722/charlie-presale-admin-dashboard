import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Eye,
  Send,
  Copy,
  CheckCheck,
  Loader,
  Inbox,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/components/DataProvider";
import {
  formatNumber,
  formatTransactionDate,
  getCurrencySymbol,
  truncateTxHash,
} from "@/lib/utils";
import { useWeb3 } from "@/hooks/use-web3";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { transferCHRLEToUser } from "@/lib/scripts/web3.scripts";
import * as XLSX from "xlsx";

type TTransaction = {
  _id: string;
  type: "buy" | "withdraw";
  userId: string;
  userEmail: string;
  amount: string;
  chrleAmount: string;
  status: "pending" | "failed" | "completed";
  date: string;
  receiptAddress: string;
  hash: string | null;
  stripeStatus: string | null;
};

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [isTxIdCopied, setIsTxIdCopied] = useState<boolean>(false);
  const [isTxHashCopied, setIsTxHashCopied] = useState<boolean>(false);
  const [isReceiptWalletAddressCopied, setIsReceiptWalletAddressCopied] =
    useState<boolean>(false);
  const [sendLoading, setSendLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const { users, transactions, updateUserById, updateTransactionById } =
    useData();

  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { sendCHRLEToUserWalletAddress } = useWeb3();

  // Mock transaction data
  const [formattedTransactions, setFormattedTransactions] = useState<
    TTransaction[]
  >([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    TTransaction[]
  >([]);

  const handleSelectTransaction = (txId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, txId]);
    } else {
      setSelectedTransactions(selectedTransactions.filter((id) => id !== txId));
    }
  };

  const handleSendTokens = async (tx: TTransaction) => {
    try {
      setSendLoading(true);
      // await sendCHRLEToUserWalletAddress(
      //   tx.chrleAmount,
      //   address,
      //   tx.receiptAddress
      // );

      const txResult = await sendCHRLEToUserWalletAddress(
        "10",
        address,
        tx.receiptAddress
      );

      if (txResult) {
        const { hash, timestamp } = txResult;

        const response = await transferCHRLEToUser(
          tx._id,
          hash,
          timestamp,
          tx.receiptAddress,
          tx.userId
        );

        if (response.ok) {
          const { user, transaction } = response.data;

          updateUserById(user._id, user);
          updateTransactionById(transaction._id, transaction);

          setFormattedTransactions((prev) =>
            prev.map((tx) =>
              tx._id === transaction._id ? { ...tx, status: "completed" } : tx
            )
          );

          toast({
            title: "Tokens Sent Successfully",
            description:
              "CHRLE tokens have been transferred to the user's wallet.",
          });
        } else {
          toast({ title: "Transfer failed", description: response.message });
        }
      }
    } catch (error) {
      console.error("handle send tokens error: ", error);
      toast({
        title: "Transaction failed",
        description: "Something went wrong",
      });
    } finally {
      setSendLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "succeeded":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleTxIdCopy = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setIsTxIdCopied(true);
    setTimeout(() => {
      setIsTxIdCopied(false);
    }, 2000);
  };

  const handleTxHashCopy = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    setIsTxHashCopied(true);
    setTimeout(() => {
      setIsTxHashCopied(false);
    }, 2000);
  };

  const handleReceiptWalletAddressCopy = (receiptWalletAddress: string) => {
    navigator.clipboard.writeText(receiptWalletAddress);
    setIsReceiptWalletAddressCopied(true);
    setTimeout(() => {
      setIsReceiptWalletAddressCopied(false);
    }, 2000);
  };

  const handleViewTxHash = (txHash: string) => {
    window.open(
      `https://bscscan.com/tx/${txHash}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleExport = () => {
    const data = formattedTransactions.map((tx) => ({
      "Transaction ID": tx._id,
      Type: tx.type,
      "User Email": tx.userEmail,
      "Fiat Amount": tx.amount,
      "CHRLE Amount": tx.chrleAmount,
      Status: tx.status,
      "Receipt Address": tx.receiptAddress,
      "Transaction Hash": tx.hash,
      Date: tx.date,
      "Stripe Status": tx.stripeStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const fileName = `transactions_${new Date().toISOString()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    const covertTransactionData = () => {
      const formattedTransactionList: TTransaction[] = transactions.map(
        (tx) => {
          const userEmail =
            users.find((user) => user._id === tx.userId)?.email ?? "Unknown";
          const amount = `${getCurrencySymbol(tx.currency)}${formatNumber(
            tx.amountFiat / 100
          )}`;
          const formattedDate = formatTransactionDate(tx.createdAt);

          return {
            _id: tx._id,
            type: tx.type,
            userId: tx.userId,
            userEmail: userEmail,
            amount,
            chrleAmount: tx.amountToken,
            status: tx.status,
            receiptAddress: tx.to,
            hash: tx.txHash,
            date: formattedDate,
            stripeStatus: tx.stripeStatus,
          };
        }
      );

      setFormattedTransactions(formattedTransactionList);
      setFilteredTransactions(formattedTransactionList);
    };

    covertTransactionData();
  }, [users, transactions]);

  useEffect(() => {
    if (statusFilter !== "all") {
      const filteredTransactionsList = formattedTransactions.filter(
        (tx) => tx.type === statusFilter.toLowerCase()
      );
      setFilteredTransactions(filteredTransactionsList);
    } else {
      setFilteredTransactions(formattedTransactions);
    }
  }, [statusFilter, formattedTransactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Transactions Management
        </h1>
        <p className="text-muted-foreground">
          Monitor and process CHRLE token transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transactions ({transactions.length})</span>
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
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Stripe Status</TableHead>
                  <TableHead>CHRLE Tokens</TableHead>
                  <TableHead>Transaction Status</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTransactions.includes(tx._id)}
                        onCheckedChange={(checked) =>
                          handleSelectTransaction(tx._id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      #{tx._id.padStart(4, "0")}
                    </TableCell>
                    <TableCell>{tx.userEmail}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>
                      <span className={getStatusBadge(tx.stripeStatus)}>
                        {tx.stripeStatus}
                      </span>
                    </TableCell>
                    <TableCell>{tx.chrleAmount} CHRLE</TableCell>
                    <TableCell>
                      <span className={getStatusBadge(tx.status)}>
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell>{truncateTxHash(tx.hash ?? "")}</TableCell>
                    <TableCell>{tx.date}</TableCell>
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
                              <DialogTitle>Transaction Details</DialogTitle>
                              <DialogDescription>
                                Complete transaction information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Transaction ID
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      #{truncateTxHash(tx._id)}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleTxIdCopy(tx._id)}
                                    >
                                      {!isTxIdCopied ? (
                                        <Copy className="h-4 w-4" />
                                      ) : (
                                        <CheckCheck className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Stripe Status
                                  </label>
                                  <p>
                                    <span
                                      className={getStatusBadge(
                                        tx.stripeStatus
                                      )}
                                    >
                                      {tx.stripeStatus}
                                    </span>
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    User Email
                                  </label>
                                  <p className="font-medium">{tx.userEmail}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Fiat Amount
                                  </label>
                                  <p className="font-medium">{tx.amount}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    CHRLE Tokens
                                  </label>
                                  <p className="font-medium">
                                    {tx.chrleAmount} CHRLE
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Transaction Status
                                  </label>
                                  <p>
                                    <span className={getStatusBadge(tx.status)}>
                                      {tx.status}
                                    </span>
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Receiption Address
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono text-sm break-all">
                                      {tx.receiptAddress}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleReceiptWalletAddressCopy(
                                          tx.receiptAddress
                                        )
                                      }
                                    >
                                      {!isReceiptWalletAddressCopied ? (
                                        <Copy className="h-4 w-4" />
                                      ) : (
                                        <CheckCheck className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                {tx.hash && (
                                  <div className="col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Transaction Hash
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <p className="font-mono text-sm break-all">
                                        {truncateTxHash(tx.hash)}
                                      </p>

                                      <div className="flex items-center gap-0">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleTxHashCopy(tx.hash)
                                          }
                                        >
                                          {!isTxHashCopied ? (
                                            <Copy className="h-4 w-4" />
                                          ) : (
                                            <CheckCheck className="h-4 w-4" />
                                          )}
                                        </Button>

                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleViewTxHash(tx.hash)
                                          }
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Date
                                  </label>
                                  <p className="font-medium">{tx.date}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {tx.status === "pending" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Confirm</DialogTitle>
                                <DialogDescription>
                                  Confirm to send {tx.chrleAmount} CHRLE to{" "}
                                  {tx.userEmail}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Amount
                                  </label>
                                  <p className="font-medium">
                                    {tx.chrleAmount} CHRLE
                                  </p>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Receiption User's Email
                                  </label>
                                  <p className="font-medium">{tx.userEmail}</p>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Receiption User's Wallet Address
                                  </label>
                                  <p className="font-medium">
                                    {tx.receiptAddress}
                                  </p>
                                </div>

                                <div className="w-full">
                                  <Button
                                    variant="secondary"
                                    className="w-full flex items-center justify-center gap-1 transition-all duration-200"
                                    disabled={sendLoading}
                                    onClick={() => {
                                      if (!isConnected) {
                                        open();
                                      } else {
                                        handleSendTokens(tx);
                                      }
                                    }}
                                  >
                                    {!isConnected ? (
                                      "Connect Wallet"
                                    ) : sendLoading ? (
                                      <>
                                        <span className="text-gray-400">
                                          Sending...
                                        </span>
                                        <Loader className="h-4 w-4 text-gray-400" />
                                      </>
                                    ) : (
                                      `Send ${tx.chrleAmount} CHRLE`
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTransactions.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center gap-4 p-14">
                <Inbox className="h-8 w-8 text-gray-400" />
                <p className="text-gray-400">No transactions found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
