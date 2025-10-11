import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, Plus, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const Wallet = () => {
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
              <div className="text-3xl font-bold mb-4">₦0.00</div>
              <Button variant="secondary" size="sm" className="w-full">
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
              <div className="text-3xl font-bold mb-4">0.00 ESP</div>
              <Button variant="secondary" size="sm" className="w-full">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <select
                    id="payment-method"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="card">Debit/Credit Card</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="ussd">USSD</option>
                  </select>
                </div>

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Fund Wallet
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
