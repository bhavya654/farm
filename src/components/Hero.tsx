import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farm.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Modern farm landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Ensuring Food Safety & Compliance</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up">
            Digital Farm Management for{" "}
            <span className="gradient-hero bg-clip-text text-transparent">
              MRL & AMU Monitoring
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto animate-slide-up" style={{animationDelay: "0.2s"}}>
            Streamline antimicrobial usage tracking, ensure regulatory compliance, and enhance food safety with our comprehensive digital platform designed for farmers and veterinarians.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{animationDelay: "0.4s"}}>
            <Link to="/auth">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg shadow-strong hover:shadow-medium transition-all hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg bg-white/10 border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: "0.6s"}}>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-gray-300">Active Farmers</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-accent/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-gray-300">Compliance Rate</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-info/20 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-info" />
              </div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-gray-300">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;