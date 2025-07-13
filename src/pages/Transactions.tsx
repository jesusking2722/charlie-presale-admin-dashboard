
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Eye, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  // Mock transaction data
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      userId: 'user1',
      userEmail: 'john@example.com',
      amount: '$1,200',
      chrleAmount: '12,000 CHRLE',
      status: 'pending',
      date: '2024-01-25 14:30',
      paymentMethod: 'Bank Transfer',
      walletAddress: '0x1234...5678'
    },
    {
      id: '2',
      userId: 'user2',
      userEmail: 'jane@example.com',
      amount: '$800',
      chrleAmount: '8,000 CHRLE',
      status: 'completed',
      date: '2024-01-24 10:15',
      paymentMethod: 'Credit Card',
      walletAddress: '0xabcd...efgh'
    },
    {
      id: '3',
      userId: 'user3',
      userEmail: 'bob@example.com',
      amount: '$2,500',
      chrleAmount: '25,000 CHRLE',
      status: 'pending',
      date: '2024-01-25 09:45',
      paymentMethod: 'PayPal',
      walletAddress: '0x9876...5432'
    },
    {
      id: '4',
      userId: 'user4',
      userEmail: 'alice@example.com',
      amount: '$500',
      chrleAmount: '5,000 CHRLE',
      status: 'failed',
      date: '2024-01-23 16:20',
      paymentMethod: 'Bank Transfer',
      walletAddress: '0xdef0...1234'
    }
  ]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(transactions.map(tx => tx.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectTransaction = (txId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, txId]);
    } else {
      setSelectedTransactions(selectedTransactions.filter(id => id !== txId));
    }
  };

  const handleSendTokens = (txId: string) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === txId ? { ...tx, status: 'completed' } : tx
      )
    );
    toast({
      title: "Tokens Sent Successfully",
      description: "CHRLE tokens have been transferred to the user's wallet.",
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions Management</h1>
        <p className="text-muted-foreground">
          Monitor and process CHRLE token transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transactions ({transactions.length})</span>
            <Button size="sm">Export Data</Button>
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
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-tx"
                checked={selectedTransactions.length === transactions.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all-tx" className="text-sm font-medium">
                Select All
              </label>
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
                  <TableHead>CHRLE Tokens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTransactions.includes(tx.id)}
                        onCheckedChange={(checked) => handleSelectTransaction(tx.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">#{tx.id.padStart(4, '0')}</TableCell>
                    <TableCell>{tx.userEmail}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>{tx.chrleAmount}</TableCell>
                    <TableCell>
                      <span className={getStatusBadge(tx.status)}>
                        {tx.status}
                      </span>
                    </TableCell>
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
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                                  <p className="font-medium">#{tx.id.padStart(4, '0')}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                                  <p><span className={getStatusBadge(tx.status)}>{tx.status}</span></p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">User Email</label>
                                  <p className="font-medium">{tx.userEmail}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                                  <p className="font-medium">{tx.paymentMethod}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Fiat Amount</label>
                                  <p className="font-medium">{tx.amount}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">CHRLE Tokens</label>
                                  <p className="font-medium">{tx.chrleAmount}</p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                                  <p className="font-mono text-sm break-all">{tx.walletAddress}</p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                                  <p className="font-medium">{tx.date}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {tx.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSendTokens(tx.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
