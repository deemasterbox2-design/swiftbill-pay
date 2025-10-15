// File: WalletBalances.tsx | Path: src/components/WalletBalances.tsx
import { Card } from "@/components/ui/card";
import { Wallet as WalletIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { walletApi } from "@/lib/api";

export const WalletBalances = () => {
  const [balances, setBalances] = useState({ naira_balance: 0, espees_balance: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    setIsLoading(true);
    const response = await walletApi.getBalance();
    setIsLoading(false);
    
    if (response.success && response.data) {
      setBalances(response.data);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <WalletIcon className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Naira Wallet</p>
            <p className="text-lg font-bold">₦{balances.naira_balance.toLocaleString()}</p>
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
            <p className="text-lg font-bold">€{balances.espees_balance.toLocaleString()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
