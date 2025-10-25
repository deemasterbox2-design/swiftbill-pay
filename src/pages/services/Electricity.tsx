// File: Electricity.tsx | Path: src/pages/services/Electricity.tsx
// Function: Electricity bill payment page with meter verification and token generation
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Loader2, CheckCircle2, Wallet as WalletIcon } from "lucide-react";
import { vtpassApi, walletApi, emailApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Electricity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [discos, setDiscos] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [meterType, setMeterType] = useState("");
  const [walletBalances, setWalletBalances] = useState({ naira_balance: 0, espees_balance: 0 });
  
  const [formData, setFormData] = useState({
    serviceID: "",
    meterNumber: "",
    type: "prepaid",
    amount: "",
    phone: "",
    recipientEmail: "",
    paymentMethod: "naira",
    walletCurrency: "Naira" as "Naira" | "Espees",
  });

  useEffect(() => {
    loadDiscos();
    loadWalletBalances();
  }, []);

  const loadWalletBalances = async () => {
    const response = await walletApi.getBalance();
    if (response.success && response.data) {
      setWalletBalances(response.data);
    }
  };

  const loadDiscos = async () => {
    const response = await vtpassApi.getServices("power");
    if (response.success && response.data && response.data.length > 0) {
      setDiscos(response.data);
    } else {
      // Fallback data from VTPass API
      setDiscos([
        { serviceID: "aedc-electric", name: "Abuja Electricity (AEDC)" },
        { serviceID: "benin-electric", name: "Benin Electricity (BEDC)" },
        { serviceID: "eko-electric", name: "Eko Electricity (EKEDC)" },
        { serviceID: "enugu-electric", name: "Enugu Electricity (EEDC)" },
        { serviceID: "ibadan-electric", name: "Ibadan Electricity (IBEDC)" },
        { serviceID: "ikeja-electric", name: "Ikeja Electricity (IKEDC)" },
        { serviceID: "jos-electric", name: "Jos Electricity (JED)" },
        { serviceID: "kaduna-electric", name: "Kaduna Electricity (KAEDCO)" },
        { serviceID: "kano-electric", name: "Kano Electricity (KEDCO)" },
        { serviceID: "portharcourt-electric", name: "Port Harcourt Electricity (PHED)" },
      ]);
    }
  };

  const verifyMeter = async () => {
    setIsLoading(true);
    const response = await vtpassApi.verifyCustomer({
      serviceID: formData.serviceID,
      billersCode: formData.meterNumber,
      type: formData.type,
    });
    setIsLoading(false);

    if (response.success && response.data) {
      setCustomerName(response.data.Customer_Name || "");
      setMeterType(response.data.Meter_Type || formData.type.toUpperCase());
      setStep(2);
      toast({
        title: "Verification successful",
        description: `Customer: ${response.data.Customer_Name}`,
      });
    } else {
      toast({
        title: "Verification failed",
        description: response.message || "Invalid meter number",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 2) {
      setIsLoading(true);
      const response = await vtpassApi.pay({
        serviceID: formData.serviceID,
        billersCode: formData.meterNumber,
        amount: parseFloat(formData.amount),
        phone: formData.phone,
        paymentMethod: formData.paymentMethod as any,
        walletCurrency: formData.paymentMethod === 'wallet' ? formData.walletCurrency : undefined,
      });
      
      setIsLoading(false);
      
      if (response.success) {
        // Send token email if available
        if (response.data?.token && formData.recipientEmail) {
          await emailApi.sendToken({
            recipient_email: formData.recipientEmail,
            recipient_name: customerName,
            meter_number: formData.meterNumber,
            token: response.data.token,
            amount: parseFloat(formData.amount),
            disco: discos.find(d => d.serviceID === formData.serviceID)?.name || '',
            transaction_id: response.data.request_id || '',
          });
        }
        
        setStep(3);
        toast({
          title: "Success!",
          description: "Electricity payment successful",
        });
      } else {
        toast({
          title: "Payment failed",
          description: response.message || "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="bg-muted/50 text-xs text-muted-foreground text-center py-1 px-2 sticky top-0 z-50">
        File: src/pages/services/Electricity.tsx
      </div>
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Electricity Bills</h1>
            <p className="text-muted-foreground">Pay for prepaid & postpaid meters</p>
          </div>

          {/* Wallet Balances */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <WalletIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Naira Wallet</p>
                  <p className="text-lg font-bold">₦{walletBalances.naira_balance.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <WalletIcon className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Espees Wallet</p>
                  <p className="text-lg font-bold">€{walletBalances.espees_balance.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          {step === 1 && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="disco">Select Disco</Label>
                  <select
                    id="disco"
                    value={formData.serviceID}
                    onChange={(e) => setFormData({ ...formData, serviceID: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    required
                  >
                    <option value="">Choose electricity provider...</option>
                    {discos.map((disco) => (
                      <option key={disco.serviceID} value={disco.serviceID}>
                        {disco.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.serviceID && (
                  <>
                    <div className="space-y-2">
                      <Label>Meter Type</Label>
                      <RadioGroup
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="prepaid" id="prepaid" />
                          <Label htmlFor="prepaid" className="cursor-pointer">Prepaid</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="postpaid" id="postpaid" />
                          <Label htmlFor="postpaid" className="cursor-pointer">Postpaid</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meter">Meter Number</Label>
                      <Input
                        id="meter"
                        type="text"
                        placeholder="Enter meter number"
                        value={formData.meterNumber}
                        onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₦)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="1000"
                        min="500"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Minimum: ₦500</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="08012345678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        pattern="0[789]\d{9}"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipientEmail">Recipient Email (for token delivery)</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.recipientEmail}
                        onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Token will be sent to this email</p>
                    </div>
                  </>
                )}

                <Button
                  onClick={verifyMeter}
                  className="w-full"
                  size="lg"
                  disabled={!formData.meterNumber || !formData.amount || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Confirm Payment</h2>
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disco:</span>
                    <span className="font-medium">
                      {discos.find(d => d.serviceID === formData.serviceID)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meter Number:</span>
                    <span className="font-medium">{formData.meterNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meter Type:</span>
                    <span className="font-medium">{meterType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-primary">₦{formData.amount}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="naira" id="naira" />
                      <Label htmlFor="naira" className="flex-1 cursor-pointer">Pay with Naira</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="espees" id="espees" />
                      <Label htmlFor="espees" className="flex-1 cursor-pointer">Pay with Espees</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer">Pay from Wallet</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.paymentMethod === 'wallet' && (
                  <div className="space-y-3">
                    <Label>Select Wallet Currency</Label>
                    <RadioGroup
                      value={formData.walletCurrency}
                      onValueChange={(value: "Naira" | "Espees") => setFormData({ ...formData, walletCurrency: value })}
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="Naira" id="wallet-naira" />
                        <Label htmlFor="wallet-naira" className="flex-1 cursor-pointer">
                          Naira Wallet (₦{walletBalances.naira_balance.toLocaleString()})
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="Espees" id="wallet-espees" />
                        <Label htmlFor="wallet-espees" className="flex-1 cursor-pointer">
                          Espees Wallet (€{walletBalances.espees_balance.toLocaleString()})
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Payment"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                ₦{formData.amount} has been credited to meter {formData.meterNumber}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/transactions")}>
                  View History
                </Button>
                <Button className="flex-1" onClick={() => window.location.reload()}>
                  Pay Again
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Electricity;
