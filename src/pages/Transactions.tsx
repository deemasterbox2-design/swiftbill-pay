// File: Transactions.tsx | Path: src/pages/Transactions.tsx
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search, Filter, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { transactionApi } from "@/lib/api";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Transactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("7days");

  useEffect(() => {
    loadTransactions();
  }, [statusFilter, dateFilter]);

  const loadTransactions = async () => {
    setIsLoading(true);
    const response = await transactionApi.getHistory({
      status: statusFilter !== "all" ? statusFilter : undefined,
      dateRange: dateFilter,
    });
    setIsLoading(false);

    if (response.success && response.data) {
      setTransactions(response.data);
    } else {
      toast({
        title: "Failed to load transactions",
        description: response.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = async () => {
    const response = await transactionApi.exportCSV();
    if (response.success) {
      toast({
        title: "Export successful",
        description: "Your CSV file has been downloaded",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Transaction History</h1>
              <p className="text-muted-foreground">View and export your payment history</p>
            </div>
            <Button className="mt-4 md:mt-0" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, phone, or service..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {isLoading ? (
            <Card className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Loading transactions...</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactions.map((txn) => (
              <Card key={txn.id} className="p-6 hover:shadow-medium transition-smooth">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(txn.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{txn.service}</h3>
                        {getStatusBadge(txn.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Transaction ID: {txn.id}
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{txn.date}</p>
                        {txn.phone && <p>Phone: {txn.phone}</p>}
                        {txn.smartcard && <p>Smartcard: {txn.smartcard}</p>}
                        {txn.meter && <p>Meter: {txn.meter}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right md:text-left">
                    <p className="text-2xl font-bold text-primary">₦{txn.amount.toLocaleString()}</p>
                    {txn.status === "pending" && (
                      <Button variant="outline" size="sm" className="mt-2">
                        Check Status
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
              ))}
            </div>
          )}

          {transactions.length === 0 && (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground mb-6">
                  Start making payments to see your transaction history here
                </p>
                <Button>Browse Services</Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;
