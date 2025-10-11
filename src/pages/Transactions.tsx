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
import { Download, Search, Filter, CheckCircle2, XCircle, Clock } from "lucide-react";

const Transactions = () => {
  const transactions = [
    {
      id: "TXN001",
      service: "MTN Airtime",
      amount: 500,
      status: "success",
      date: "2025-01-10 14:30",
      phone: "08012345678",
    },
    {
      id: "TXN002",
      service: "DSTV Subscription",
      amount: 5000,
      status: "success",
      date: "2025-01-09 10:15",
      smartcard: "1234567890",
    },
    {
      id: "TXN003",
      service: "Airtel Data Bundle",
      amount: 1000,
      status: "pending",
      date: "2025-01-08 16:45",
      phone: "08098765432",
    },
    {
      id: "TXN004",
      service: "EKEDC Electricity",
      amount: 3000,
      status: "failed",
      date: "2025-01-07 09:20",
      meter: "12345678901",
    },
  ];

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
            <Button className="mt-4 md:mt-0">
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
              <Select defaultValue="all">
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
              <Select defaultValue="7days">
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
