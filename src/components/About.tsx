import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Target, Heart, Lightbulb } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Food Safety First",
      description: "Our primary mission is ensuring safe food production through rigorous MRL monitoring and compliance tracking."
    },
    {
      icon: Heart,
      title: "Animal Welfare",
      description: "Promoting responsible antimicrobial use that protects both animal health and public safety."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Leveraging cutting-edge technology to simplify complex regulatory requirements for farmers and vets."
    },
    {
      icon: CheckCircle,
      title: "Compliance Made Easy",
      description: "Transforming complicated regulations into simple, actionable insights that anyone can follow."
    }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About{" "}
            <span className="gradient-primary bg-clip-text text-transparent">FarmGuard</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            FarmGuard is a comprehensive digital platform designed to revolutionize farm management through 
            advanced MRL (Maximum Residue Limits) and AMU (Antimicrobial Usage) monitoring. We bridge the gap 
            between regulatory compliance and practical farm operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Enhancing Food Safety & Animal Husbandry
            </h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              In today's agricultural landscape, ensuring food safety while maintaining animal health requires 
              precise monitoring and compliance with strict regulations. FarmGuard provides farmers, veterinarians, 
              and administrators with the tools they need to succeed.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Real-time Monitoring</h4>
                  <p className="text-muted-foreground">Track antimicrobial usage and withdrawal periods in real-time</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Regulatory Compliance</h4>
                  <p className="text-muted-foreground">Automatic calculations ensure compliance with MRL standards</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">User-Friendly Interface</h4>
                  <p className="text-muted-foreground">Intuitive design that works for users of all technical levels</p>
                </div>
              </div>
            </div>
          </div>

          <div className="gradient-card rounded-2xl p-8 shadow-medium">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground mb-6">Compliance Rate Achieved</div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-2xl font-bold text-foreground">1000+</div>
                  <div className="text-sm text-muted-foreground">Active Farms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">Veterinarians</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">50K+</div>
                  <div className="text-sm text-muted-foreground">Animals Monitored</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card 
                key={index}
                className="text-center shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-border/50"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;