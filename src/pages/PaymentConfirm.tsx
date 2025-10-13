import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Download, Home, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { transactionApi, paymentApi } from "@/lib/api";

const PaymentConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestId = searchParams.get('request_id');
    const reference = searchParams.get('reference');
    const transactionId = searchParams.get('transaction_id');
    const status = searchParams.get('status');
    
    // If this is a Flutterwave redirect with transaction_id, verify payment first
    if (transactionId) {
      verifyFlutterwavePayment(transactionId);
      return;
    }
    
    if (!requestId && !reference) {
      toast({
        title: "Invalid Request",
        description: "No transaction reference found",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    // Fetch transaction details
    fetchTransactionDetails(requestId || reference);
  }, [searchParams]);

  const verifyFlutterwavePayment = async (transactionId: string) => {
    try {
      const response = await paymentApi.verifyFlutterwave(transactionId);
      
      if (response.success) {
        toast({
          title: "Payment Verified",
          description: `Your wallet has been credited with ₦${response.data?.amount}`,
        });
        // Redirect to wallet page after successful verification
        setTimeout(() => {
          navigate('/wallet');
        }, 3000);
      } else {
        toast({
          title: "Payment Failed",
          description: response.message || "Payment verification failed",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate('/wallet');
        }, 3000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionDetails = async (ref: string) => {
    try {
      const response = await transactionApi.getDetails(ref);
      if (response.success && response.data) {
        setTransaction(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load transaction details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!transaction) return;
    
    try {
      const response = await transactionApi.downloadReceipt(transaction.request_id);
      if (response.success) {
        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${transaction.request_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Receipt downloaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p>Loading transaction details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-8">
              Your transaction has been completed successfully
            </p>

            {transaction && (
              <div className="bg-muted/50 rounded-lg p-6 mb-6 text-left">
                <h2 className="font-semibold text-lg mb-4">Transaction Details</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-medium">{transaction.request_id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{transaction.service_name}</span>
                  </div>
                  
                  {transaction.biller_code && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {transaction.service_id?.includes('electricity') ? 'Meter Number' : 
                         transaction.service_id?.includes('tv') ? 'Smartcard' : 'Phone Number'}
                      </span>
                      <span className="font-medium">{transaction.biller_code}</span>
                    </div>
                  )}
                  
                  {transaction.token && (
                    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg border-2 border-dashed border-primary">
                      <span className="text-sm text-muted-foreground">Electricity Token</span>
                      <span className="font-mono text-xl font-bold text-primary">{transaction.token}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">₦{parseFloat(transaction.amount).toLocaleString()}</span>
                  </div>
                  
                  {transaction.convenience_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Convenience Fee</span>
                      <span className="font-medium">₦{parseFloat(transaction.convenience_fee).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-semibold">Total Paid</span>
                    <span className="font-bold text-lg">
                      ₦{parseFloat(transaction.total_amount).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium capitalize">{transaction.payment_method}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{new Date(transaction.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleDownloadReceipt}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/transactions')}
              >
                <Receipt className="h-4 w-4 mr-2" />
                View All Transactions
              </Button>
              
              <Button 
                className="flex-1"
                onClick={() => navigate('/services')}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentConfirm;
