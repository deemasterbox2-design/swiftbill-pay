import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, Plus, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { walletApi, paymentApi } from "@/lib/api";

const Wallet = () => {
  const { toast } = useToast();
  const [currency, setCurrency] = useState<'Naira' | 'Espees'>('Naira');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);
  const [balances, setBalances] = useState({ naira_balance: 0, espees_balance: 0 });

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const response = await walletApi.getBalance();
      if (response.success && response.data) {
        setBalances(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  };

  const handleFundWallet = async () => {
    if (!amount || parseFloat(amount) < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is ₦100",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // For Naira, use Flutterwave payment
      if (currency === 'Naira') {
        const response = await paymentApi.initializeFlutterwave({
          amount: parseFloat(amount),
          email: 'customer@superbills.org', // TODO: Get from user profile
          name: 'SuperBills Customer', // TODO: Get from user profile
          phone: '08012345678' // TODO: Get from user profile
        });

        if (response.success && response.data?.payment_url) {
          // Show loading message
          toast({
            title: "Redirecting to Payment",
            description: "Please wait while we redirect you to Flutterwave...",
          });
          
          // Small delay to show the toast, then redirect to Flutterwave payment page
          setTimeout(() => {
            window.location.href = response.data.payment_url;
          }, 1000);
        } else {
          setIsLoading(false);
          toast({
            title: "Error",
            description: response.message || "Failed to initialize payment",
            variant: "destructive",
          });
        }
      } else {
        // For Espees, use existing fund endpoint
        const response = await walletApi.fund({
          currency,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
        });

        if (response.success) {
          toast({
            title: "Success",
            description: `Wallet funded with ${amount} ESP`,
          });
          setAmount('');
          fetchBalances();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fund wallet",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Wallet</h1>
            <p className="text-muted-foreground">Manage your Naira and Espees balance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 gradient-primary text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <WalletIcon className="h-5 w-5" />
                  <span className="text-sm opacity-90">Naira Balance</span>
                </div>
                <TrendingUp className="h-4 w-4 opacity-90" />
              </div>
              <div className="text-3xl font-bold mb-4">₦{balances.naira_balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full"
                onClick={() => setCurrency('Naira')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Fund Wallet
              </Button>
            </Card>

            <Card className="p-6 gradient-accent text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <WalletIcon className="h-5 w-5" />
                  <span className="text-sm opacity-90">Espees Balance</span>
                </div>
                <TrendingUp className="h-4 w-4 opacity-90" />
              </div>
              <div className="text-3xl font-bold mb-4">{balances.espees_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ESP</div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full"
                onClick={() => setCurrency('Espees')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Fund Wallet
              </Button>
            </Card>
          </div>

          <Card className="p-6">
            <Tabs defaultValue="fund" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
                <TabsTrigger value="history">Transaction History</TabsTrigger>
              </TabsList>

              <TabsContent value="fund" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Select Currency</Label>
                  <select
                    id="currency"
                    value={currency === 'Naira' ? 'naira' : 'espees'}
                    onChange={(e) => setCurrency(e.target.value === 'naira' ? 'Naira' : 'Espees')}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="naira">Naira (₦)</option>
                    <option value="espees">Espees (ESP)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    min="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="card">Debit/Credit Card</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="ussd">USSD</option>
                  </select>
                </div>

                <Button className="w-full" onClick={handleFundWallet} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Fund Wallet'}
                </Button>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <ArrowDownRight className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Wallet Funded</p>
                          <p className="text-sm text-muted-foreground">Jan 10, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-500">+₦5,000</p>
                        <p className="text-xs text-muted-foreground">Card</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium">Airtime Purchase</p>
                          <p className="text-sm text-muted-foreground">Jan 9, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-500">-₦500</p>
                        <p className="text-xs text-muted-foreground">Wallet</p>
                      </div>
                    </div>
                  </Card>

                  <div className="text-center py-8 text-muted-foreground">
                    <p>No more transactions</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Wallet;
