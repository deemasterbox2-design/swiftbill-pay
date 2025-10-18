// File: Data.tsx | Path: src/pages/services/Data.tsx
// Function: Data bundle purchase page with network and plan selection
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wifi, Loader2, CheckCircle2 } from "lucide-react";
import { vtpassApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { WalletBalances } from "@/components/WalletBalances";

const Data = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [networks, setNetworks] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    serviceID: "",
    phone: "",
    variation_code: "",
    amount: "",
    paymentMethod: "naira",
    walletCurrency: "Naira" as "Naira" | "Espees",
  });

  useEffect(() => {
    loadNetworks();
  }, []);

  const loadNetworks = async () => {
    const response = await vtpassApi.getServices("data");
    if (response.success && response.data && response.data.length > 0) {
      setNetworks(response.data);
    } else {
      // Fallback data from VTPass API
      setNetworks([
        { serviceID: "mtn-data", name: "MTN Data" },
        { serviceID: "airtel-data", name: "Airtel Data" },
        { serviceID: "glo-data", name: "Glo Data" },
        { serviceID: "etisalat-data", name: "9mobile Data" },
      ]);
    }
  };

  const loadPlans = async (serviceID: string) => {
    setIsLoading(true);
    const response = await vtpassApi.getVariations(serviceID);
    setIsLoading(false);
    
    if (response.success && response.data?.variations) {
      setPlans(response.data.variations);
    }
  };

  const handleNetworkChange = (serviceID: string) => {
    setFormData({ ...formData, serviceID, variation_code: "", amount: "" });
    loadPlans(serviceID);
  };

  const handlePlanChange = (variation_code: string) => {
    const selectedPlan = plans.find(p => p.variation_code === variation_code);
    setFormData({
      ...formData,
      variation_code,
      amount: selectedPlan?.variation_amount || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!/^0[789]\d{9}$/.test(formData.phone)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid Nigerian phone number",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setIsLoading(true);
      const response = await vtpassApi.pay({
        serviceID: formData.serviceID,
        billersCode: formData.phone,
        variation_code: formData.variation_code,
        amount: parseFloat(formData.amount),
        phone: formData.phone,
        paymentMethod: formData.paymentMethod as any,
        walletCurrency: formData.paymentMethod === 'wallet' ? formData.walletCurrency : undefined,
      });
      
      setIsLoading(false);
      
      if (response.success) {
        setStep(3);
        toast({
          title: "Success!",
          description: "Data bundle purchase successful",
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

  const selectedPlan = plans.find(p => p.variation_code === formData.variation_code);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center">
              <Wifi className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Data Bundles</h1>
            <p className="text-muted-foreground">Affordable data plans for all networks</p>
          </div>

          <WalletBalances />

          {step === 1 && (
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="network">Select Network</Label>
                  <select
                    id="network"
                    value={formData.serviceID}
                    onChange={(e) => handleNetworkChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    required
                  >
                    <option value="">Choose network...</option>
                    {networks.map((network) => (
                      <option key={network.serviceID} value={network.serviceID}>
                        {network.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.serviceID && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="plan">Select Data Plan</Label>
                      {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <select
                          id="plan"
                          value={formData.variation_code}
                          onChange={(e) => handlePlanChange(e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          required
                        >
                          <option value="">Choose plan...</option>
                          {plans.map((plan) => (
                            <option key={plan.variation_code} value={plan.variation_code}>
                              {plan.name} - ₦{plan.variation_amount}
                            </option>
                          ))}
                        </select>
                      )}
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
                  </>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={!formData.variation_code}>
                  Continue
                </Button>
              </form>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Confirm Purchase</h2>
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-medium">
                      {networks.find(n => n.serviceID === formData.serviceID)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Plan:</span>
                    <span className="font-medium">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone Number:</span>
                    <span className="font-medium">{formData.phone}</span>
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
                          Naira Wallet
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="Espees" id="wallet-espees" />
                        <Label htmlFor="wallet-espees" className="flex-1 cursor-pointer">
                          Espees Wallet
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
              <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
              <p className="text-muted-foreground mb-6">
                {selectedPlan?.name} has been activated on {formData.phone}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/transactions")}>
                  View History
                </Button>
                <Button className="flex-1" onClick={() => window.location.reload()}>
                  Buy Again
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Data;
