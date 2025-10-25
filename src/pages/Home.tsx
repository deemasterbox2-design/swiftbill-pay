// File: Home.tsx | Path: src/pages/Home.tsx
// Function: Main landing page with hero section, features, and service links
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Zap,
  Shield,
  Clock,
  Smartphone,
  Wifi,
  Tv,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      <div className="bg-muted/50 text-xs text-muted-foreground text-center py-1 px-2 sticky top-0 z-50">
        File: src/pages/Home.tsx
      </div>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2RjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhjMCA0LjQxOC0zLjU4MiA4LTggOHMtOC0zLjU4Mi04LTh2LThjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Fast & Secure Payments</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Pay Your Bills{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                In Seconds
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Recharge airtime, buy data, pay for TV subscriptions, electricity bills, and more. No registration required for quick payments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary text-white shadow-strong hover:shadow-medium transition-smooth" asChild>
                <Link to="/services">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SuperBills?</h2>
              <p className="text-lg text-muted-foreground">Simple, fast, and secure</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 shadow-soft hover:shadow-medium transition-smooth">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Processing</h3>
                <p className="text-muted-foreground">
                  All transactions are processed instantly. Get your airtime, data, or tokens immediately.
                </p>
              </Card>

              <Card className="p-6 shadow-soft hover:shadow-medium transition-smooth">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                <p className="text-muted-foreground">
                  Bank-level security for all transactions. Your payment information is always protected.
                </p>
              </Card>

              <Card className="p-6 shadow-soft hover:shadow-medium transition-smooth">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Available</h3>
                <p className="text-muted-foreground">
                  Pay your bills anytime, anywhere. Our service is available round the clock.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Services</h2>
              <p className="text-lg text-muted-foreground">Quick access to our most used services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/services/airtime">
                <Card className="group p-6 hover:shadow-strong transition-all hover:-translate-y-1 cursor-pointer">
                  <Smartphone className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-smooth" />
                  <h3 className="text-xl font-semibold mb-2">Airtime</h3>
                  <p className="text-muted-foreground mb-4">All networks available</p>
                  <div className="flex items-center text-primary font-medium">
                    Buy now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                  </div>
                </Card>
              </Link>

              <Link to="/services/data">
                <Card className="group p-6 hover:shadow-strong transition-all hover:-translate-y-1 cursor-pointer">
                  <Wifi className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-smooth" />
                  <h3 className="text-xl font-semibold mb-2">Data Bundles</h3>
                  <p className="text-muted-foreground mb-4">Affordable plans</p>
                  <div className="flex items-center text-primary font-medium">
                    Buy now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                  </div>
                </Card>
              </Link>

              <Link to="/services/tv">
                <Card className="group p-6 hover:shadow-strong transition-all hover:-translate-y-1 cursor-pointer">
                  <Tv className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-smooth" />
                  <h3 className="text-xl font-semibold mb-2">TV Subscription</h3>
                  <p className="text-muted-foreground mb-4">DSTV, GOtv & more</p>
                  <div className="flex items-center text-primary font-medium">
                    Subscribe <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMTZ2OGMwIDQuNDE4LTMuNTgyIDgtOCA4cy04LTMuNTgyLTgtOHYtOGMwLTQuNDE4IDMuNTgyLTggOC04czggMy41ODIgOCA4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Create an account to track your transactions, manage your wallet, and enjoy exclusive benefits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth">
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/services">
                  Browse Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-primary" fill="currentColor" />
                  <span className="text-lg font-bold">SuperBills</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Fast, secure, and reliable bill payments for everyone.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Services</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/services/airtime" className="hover:text-primary transition-smooth">Airtime</Link></li>
                  <li><Link to="/services/data" className="hover:text-primary transition-smooth">Data</Link></li>
                  <li><Link to="/services/tv" className="hover:text-primary transition-smooth">TV</Link></li>
                  <li><Link to="/services/electricity" className="hover:text-primary transition-smooth">Electricity</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/about" className="hover:text-primary transition-smooth">About</Link></li>
                  <li><Link to="/contact" className="hover:text-primary transition-smooth">Contact</Link></li>
                  <li><Link to="/terms" className="hover:text-primary transition-smooth">Terms</Link></li>
                  <li><Link to="/privacy" className="hover:text-primary transition-smooth">Privacy</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/help" className="hover:text-primary transition-smooth">Help Center</Link></li>
                  <li><Link to="/faq" className="hover:text-primary transition-smooth">FAQ</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} SuperBills. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
