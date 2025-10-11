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

const TV = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  
  const [formData, setFormData] = useState({
    serviceID: "",
    smartcard: "",
    variation_code: "",
    amount: "",
    phone: "",
    paymentMethod: "naira",
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
    setIsLoading(true);
    const response = await vtpassApi.verifyCustomer({
      serviceID: formData.serviceID,
      billersCode: formData.smartcard,
    });
    setIsLoading(false);

    if (response.success && response.data) {
      setCustomerName(response.data.Customer_Name || "");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 2) {
      setIsLoading(true);
      const response = await vtpassApi.pay({
        serviceID: formData.serviceID,
        billersCode: formData.smartcard,
        variation_code: formData.variation_code,
        amount: parseFloat(formData.amount),
        phone: formData.phone,
        paymentMethod: formData.paymentMethod as any,
      });
      
      setIsLoading(false);
      
      if (response.success) {
        setStep(3);
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
                      <Label htmlFor="package">Select Package</Label>
                      {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <select
                          id="package"
                          value={formData.variation_code}
                          onChange={(e) => handlePackageChange(e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          required
                        >
                          <option value="">Choose package...</option>
                          {packages.map((pkg) => (
                            <option key={pkg.variation_code} value={pkg.variation_code}>
                              {pkg.name} - ₦{pkg.variation_amount}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smartcard">Smartcard Number</Label>
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
                  disabled={!formData.variation_code || !formData.smartcard || isLoading}
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
                <h2 className="text-xl font-semibold mb-4">Confirm Purchase</h2>
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium">
                      {providers.find(p => p.serviceID === formData.serviceID)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package:</span>
                    <span className="font-medium">{selectedPackage?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Smartcard:</span>
                    <span className="font-medium">{formData.smartcard}</span>
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
              <h2 className="text-2xl font-bold mb-2">Subscription Successful!</h2>
              <p className="text-muted-foreground mb-6">
                {selectedPackage?.name} has been activated for smartcard {formData.smartcard}
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
