// File: Services.tsx | Path: src/pages/Services.tsx
// Function: Services selection page displaying all available bill payment services
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Smartphone,
  Wifi,
  Tv,
  Zap,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    id: "airtime",
    name: "Airtime Recharge",
    description: "Instant airtime for all networks",
    icon: Smartphone,
    gradient: "from-blue-500 to-cyan-500",
    path: "/services/airtime",
  },
  {
    id: "data",
    name: "Data Bundles",
    description: "Affordable data plans",
    icon: Wifi,
    gradient: "from-purple-500 to-pink-500",
    path: "/services/data",
  },
  {
    id: "tv",
    name: "TV Subscriptions",
    description: "DSTV, GOtv, Startimes & more",
    icon: Tv,
    gradient: "from-orange-500 to-red-500",
    path: "/services/tv",
  },
  {
    id: "electricity",
    name: "Electricity Bills",
    description: "Pay for prepaid & postpaid",
    icon: Zap,
    gradient: "from-yellow-500 to-orange-500",
    path: "/services/electricity",
  },
  {
    id: "education",
    name: "Education",
    description: "WAEC, JAMB, NECO results",
    icon: GraduationCap,
    gradient: "from-green-500 to-teal-500",
    path: "/services/education",
  },
  {
    id: "insurance",
    name: "Insurance",
    description: "Vehicle insurance renewal",
    icon: ShieldCheck,
    gradient: "from-indigo-500 to-purple-500",
    path: "/services/insurance",
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose a Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Fast, secure, and reliable bill payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.id} to={service.path}>
                  <Card className="group p-6 hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient} shadow-medium`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-smooth">
                          {service.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {service.description}
                        </p>
                        <div className="flex items-center text-sm text-primary font-medium">
                          Get started
                          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Card className="mt-12 p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-start gap-4">
              <CreditCard className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Payment Methods</h3>
                <p className="text-muted-foreground">
                  Pay with Naira, Espees, or your Wallet balance. All transactions are secure and instant.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Services;
