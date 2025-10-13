import { Button } from "@/components/ui/button";
import { Wallet, User, Menu, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary blur-lg opacity-30"></div>
              <Zap className="relative h-6 w-6 text-primary" fill="currentColor" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              SuperBills
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Services
            </Link>
            <Link to="/wallet" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Wallet
            </Link>
            <Link to="/transactions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              History
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2" asChild>
              <Link to="/wallet">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">₦0.00</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
              <Link to="/services">
                <Menu className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
