import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, BarChart3, MessageCircle, Zap, Award, QrCode, Globe } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "MRL Compliance Monitoring",
      description: "Automatically track Maximum Residue Limits with real-time alerts and withdrawal period calculations.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Users,
      title: "Multi-Role Dashboard",
      description: "Specialized interfaces for farmers, veterinarians, and administrators with role-based access control.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: BarChart3,
      title: "AMU Analytics",
      description: "Comprehensive antimicrobial usage tracking with detailed reporting and trend analysis.",
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      icon: MessageCircle,
      title: "AI-Powered Support",
      description: "Intelligent chatbot with multilingual FAQ support to assist users 24/7.",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: QrCode,
      title: "QR Code Verification",
      description: "Generate verification codes for compliant animals to build consumer trust and transparency.",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Award,
      title: "Gamification System",
      description: "Reward points and achievements to encourage compliance and best practices.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Zap,
      title: "Real-time Alerts",
      description: "Instant notifications for treatment schedules, compliance issues, and important updates.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Available in multiple languages to serve farmers and veterinarians across regions.",
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Comprehensive Farm Management{" "}
            <span className="gradient-primary bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to ensure food safety, regulatory compliance, and efficient farm management in one powerful platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-border/50 gradient-card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Shield className="w-5 h-5 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Trusted by 1000+ Farms Worldwide</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Farm Management?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and veterinarians who trust JeevSarthi for their compliance and monitoring needs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;