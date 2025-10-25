// File: TV.tsx | Path: src/pages/services/TV.tsx
// Function: TV subscription service page with smartcard verification, package selection, and renewal
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tv as TvIcon, Loader2, CheckCircle2 } from "lucide-react";
import { vtpassApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { WalletBalances } from "@/components/WalletBalances";

const TV = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [subscriptionAction, setSubscriptionAction] = useState<"renew" | "change" | "">("");
  
  const [formData, setFormData] = useState({
    serviceID: "",
    smartcard: "",
    variation_code: "",
    amount: "",
    phone: "",
    quantity: "1",
    paymentMethod: "naira",
    walletCurrency: "Naira" as "Naira" | "Espees",
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    const response = await vtpassApi.getServices("tv-subscription");
    if (response.success && response.data && response.data.length > 0) {
      setProviders(response.data);
    } else {
      // Fallback data from VTPass API
      setProviders([
        { serviceID: "dstv", name: "DSTV" },
        { serviceID: "gotv", name: "GOtv" },
        { serviceID: "startimes", name: "Startimes" },
        { serviceID: "showmax", name: "Showmax" },
      ]);
    }
  };

  const loadPackages = async (serviceID: string) => {
    setIsLoading(true);
    const response = await vtpassApi.getVariations(serviceID);
    setIsLoading(false);
    
    if (response.success && response.data?.variations) {
      setPackages(response.data.variations);
    }
  };

  const handleProviderChange = (serviceID: string) => {
    setFormData({ ...formData, serviceID, variation_code: "", amount: "" });
    loadPackages(serviceID);
  };

  const handlePackageChange = (variation_code: string) => {
    const selectedPackage = packages.find(p => p.variation_code === variation_code);
    setFormData({
      ...formData,
      variation_code,
      amount: selectedPackage?.variation_amount || "",
    });
  };

  const verifySmartcard = async () => {
    if (!formData.serviceID || !formData.smartcard || !formData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const response = await vtpassApi.verifyCustomer({
      serviceID: formData.serviceID,
      billersCode: formData.smartcard,
    });
    setIsLoading(false);

    if (response.success && response.data) {
      setVerificationData(response.data);
      setStep(2);
      toast({
        title: "Verification successful",
        description: `Customer: ${response.data.Customer_Name}`,
      });
    } else {
      toast({
        title: "Verification failed",
        description: response.message || "Invalid smartcard number",
        variant: "destructive",
      });
    }
  };

  const handleActionSelect = (action: "renew" | "change") => {
    setSubscriptionAction(action);
    
    if (action === "renew") {
      // Use renewal amount from verification
      setFormData({
        ...formData,
        amount: verificationData?.Renewal_Amount || "",
        variation_code: "",
      });
      setStep(3);
    } else {
      // Load packages for change
      loadPackages(formData.serviceID);
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 4) {
      setIsLoading(true);
      
      const paymentData: any = {
        serviceID: formData.serviceID,
        billersCode: formData.smartcard,
        phone: formData.phone,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod as any,
        walletCurrency: formData.paymentMethod === 'wallet' ? formData.walletCurrency : undefined,
        subscription_type: subscriptionAction,
      };

      // Add variation_code and quantity only for "change" action
      if (subscriptionAction === "change") {
        paymentData.variation_code = formData.variation_code;
        paymentData.quantity = parseInt(formData.quantity);
      }

      const response = await vtpassApi.pay(paymentData);
      
      setIsLoading(false);
      
      if (response.success) {
        setStep(5);
        toast({
          title: "Success!",
          description: "TV subscription successful",
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

  const selectedPackage = packages.find(p => p.variation_code === formData.variation_code);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="bg-muted/50 text-xs text-muted-foreground text-center py-1 px-2 sticky top-0 z-50">
        File: src/pages/services/TV.tsx
      </div>
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 mx-auto mb-4 flex items-center justify-center">
              <TvIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">TV Subscription</h1>
            <p className="text-muted-foreground">DSTV, GOtv, Startimes & more</p>
          </div>

          <WalletBalances />

          {step === 1 && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="provider">Select TV Provider</Label>
                  <select
                    id="provider"
                    value={formData.serviceID}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    required
                  >
                    <option value="">Choose provider...</option>
                    {providers.map((provider) => (
                      <option key={provider.serviceID} value={provider.serviceID}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.serviceID && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="smartcard">
                        {formData.serviceID === 'dstv' ? 'Smartcard' : 'IUC'} Number
                      </Label>
                      <Input
                        id="smartcard"
                        type="text"
                        placeholder="Enter smartcard/IUC number"
                        value={formData.smartcard}
                        onChange={(e) => setFormData({ ...formData, smartcard: e.target.value })}
                        required
                      />
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

                <Button
                  onClick={verifySmartcard}
                  className="w-full"
                  size="lg"
                  disabled={!formData.serviceID || !formData.smartcard || !formData.phone || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Customer"
                  )}
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && verificationData && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
              <div className="space-y-3 bg-muted/50 p-4 rounded-lg mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Name:</span>
                  <span className="font-medium">{verificationData.Customer_Name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Smartcard Number:</span>
                  <span className="font-medium">{formData.smartcard}</span>
                </div>
                {verificationData.Status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${verificationData.Status === 'ACTIVE' ? 'text-green-600' : 'text-orange-600'}`}>
                      {verificationData.Status}
                    </span>
                  </div>
                )}
                {verificationData.Current_Bouquet && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Bouquet:</span>
                    <span className="font-medium">{verificationData.Current_Bouquet}</span>
                  </div>
                )}
                {verificationData.Due_Date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{new Date(verificationData.Due_Date).toLocaleDateString()}</span>
                  </div>
                )}
                {verificationData.Renewal_Amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Renewal Amount:</span>
                    <span className="font-bold text-primary">₦{verificationData.Renewal_Amount}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-base">What do you want to do?</Label>
                <Button
                  onClick={() => handleActionSelect("renew")}
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-start"
                >
                  <span className="font-semibold">Renew Current Bouquet</span>
                  {verificationData.Current_Bouquet && verificationData.Renewal_Amount && (
                    <span className="text-sm text-muted-foreground">
                      {verificationData.Current_Bouquet} - ₦{verificationData.Renewal_Amount}
                    </span>
                  )}
                </Button>
                <Button
                  onClick={() => handleActionSelect("change")}
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-start"
                >
                  <span className="font-semibold">Change Bouquet</span>
                  <span className="text-sm text-muted-foreground">
                    Select a different package
                  </span>
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => {
                  setStep(1);
                  setVerificationData(null);
                }}
              >
                Back
              </Button>
            </Card>
          )}

          {step === 3 && subscriptionAction === "change" && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Select Package</h2>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="package">Choose Bouquet</Label>
                    <select
                      id="package"
                      value={formData.variation_code}
                      onChange={(e) => handlePackageChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="">Select package...</option>
                      {packages.map((pkg) => (
                        <option key={pkg.variation_code} value={pkg.variation_code}>
                          {pkg.name} - ₦{pkg.variation_amount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Number of Months</Label>
                    <select
                      id="quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="1">1 Month</option>
                      <option value="2">2 Months</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                  </div>

                  {selectedPackage && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-bold text-primary text-lg">
                          ₦{(parseFloat(formData.amount) * parseInt(formData.quantity)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setStep(4)}
                      disabled={!formData.variation_code}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {step === 3 && subscriptionAction === "renew" && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Renewal Summary</h2>
              <div className="space-y-3 bg-muted/50 p-4 rounded-lg mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{verificationData?.Customer_Name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Package:</span>
                  <span className="font-medium">{verificationData?.Current_Bouquet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renewal Amount:</span>
                  <span className="font-bold text-primary">₦{formData.amount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(4)}
                >
                  Continue to Payment
                </Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Confirm Purchase</h2>
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium">
                      {providers.find(p => p.serviceID === formData.serviceID)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{verificationData?.Customer_Name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Smartcard:</span>
                    <span className="font-medium">{formData.smartcard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action:</span>
                    <span className="font-medium capitalize">{subscriptionAction} Package</span>
                  </div>
                  {subscriptionAction === "change" && selectedPackage && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Package:</span>
                        <span className="font-medium">{selectedPackage.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{formData.quantity} Month(s)</span>
                      </div>
                    </>
                  )}
                  {subscriptionAction === "renew" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Package:</span>
                      <span className="font-medium">{verificationData?.Current_Bouquet}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground font-semibold">Total Amount:</span>
                    <span className="font-bold text-primary text-lg">
                      ₦{subscriptionAction === "change" 
                        ? (parseFloat(formData.amount) * parseInt(formData.quantity)).toLocaleString()
                        : parseFloat(formData.amount).toLocaleString()}
                    </span>
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
                    onClick={() => setStep(3)}
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

          {step === 5 && (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Subscription Successful!</h2>
              <p className="text-muted-foreground mb-6">
                {subscriptionAction === "renew" 
                  ? `${verificationData?.Current_Bouquet} has been renewed`
                  : `${selectedPackage?.name} has been activated`
                } for smartcard {formData.smartcard}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/transactions")}>
                  View History
                </Button>
                <Button className="flex-1" onClick={() => window.location.reload()}>
                  Subscribe Again
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TV;
