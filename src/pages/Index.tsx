
import React from 'react';
import { Link } from 'react-router-dom';
import { Beaker, ArrowRight, Check, Calendar, BoxesIcon, ShoppingCart, FileText, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beaker className="h-8 w-8 text-lab-600" />
            <div>
              <h1 className="text-lg font-semibold leading-none">LabTrack</h1>
              <p className="text-xs text-muted-foreground">Laboratory Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 animated-bg">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Simplify Your Laboratory Management
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Track inventory, manage facilities, and streamline bookings with our comprehensive laboratory management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Button size="lg" asChild>
                <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
              <BoxesIcon className="h-10 w-10 text-lab-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
              <p className="text-muted-foreground mb-4">
                Track all laboratory equipment, chemicals, and supplies in real-time.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Stock level tracking</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Low stock alerts</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Usage analytics</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
              <Microscope className="h-10 w-10 text-lab-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Facility Management</h3>
              <p className="text-muted-foreground mb-4">
                Efficiently manage laboratory spaces and equipment scheduling.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Lab space booking</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Equipment scheduling</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Maintenance tracking</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '700ms' }}>
              <Calendar className="h-10 w-10 text-lab-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Booking System</h3>
              <p className="text-muted-foreground mb-4">
                Streamline the process of reserving labs and equipment.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Easy scheduling</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Approval workflow</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Calendar integration</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '800ms' }}>
              <ShoppingCart className="h-10 w-10 text-lab-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Purchase Management</h3>
              <p className="text-muted-foreground mb-4">
                Manage purchasing requests and approvals efficiently.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Request tracking</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Budget monitoring</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-lab-600 mr-2" />
                  <span className="text-sm">Vendor management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Beaker className="h-6 w-6 text-lab-600" />
              <span className="text-sm text-muted-foreground">
                © 2024 LabTrack. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6">
              <Button variant="link" size="sm">Privacy Policy</Button>
              <Button variant="link" size="sm">Terms of Service</Button>
              <Button variant="link" size="sm">Contact</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
