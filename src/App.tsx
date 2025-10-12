import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Auth from "./pages/Auth";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import PaymentConfirm from "./pages/PaymentConfirm";
import Airtime from "./pages/services/Airtime";
import Data from "./pages/services/Data";
import TV from "./pages/services/TV";
import Electricity from "./pages/services/Electricity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/airtime" element={<Airtime />} />
          <Route path="/services/data" element={<Data />} />
          <Route path="/services/tv" element={<TV />} />
          <Route path="/services/electricity" element={<Electricity />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/payment/confirm" element={<PaymentConfirm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
