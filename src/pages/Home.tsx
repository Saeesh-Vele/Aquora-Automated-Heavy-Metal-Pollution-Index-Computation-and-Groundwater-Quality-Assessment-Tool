import { ArrowRight, Shield, BarChart3, FileUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-water.jpg";

const Home = () => {
  const features = [
    {
      icon: FileUp,
      title: "Easy Data Upload",
      description: "Upload CSV or Excel files containing groundwater heavy metal concentration data with geo-coordinates.",
      badge: "CSV / XLSX",
    },
    {
      icon: BarChart3,
      title: "Automatic Computation",
      description: "Calculates Heavy Metal Pollution Indices (HPI, HEI, Cd) using standard scientific formulas.",
      badge: "Standardized",
    },
    {
      icon: Shield,
      title: "Quality Assessment",
      description: "Categorizes water quality as Safe, Slightly Polluted, or Hazardous based on computed indices.",
      badge: "Categorized",
    },
    {
      icon: AlertTriangle,
      title: "Visual Analytics",
      description: "Interactive charts and maps to visualize contaminated areas and pollution patterns.",
      badge: "Maps & Charts",
    },
  ];

  const stats = [
    { label: "Samples Processed", value: "12,482" },
    { label: "Regions Covered", value: "28 States" },
    { label: "Avg. HPI Reduction", value: "14%" },
  ];

  return (
    <div className="min-h-screen text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-primary/20 pointer-events-none" />
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Groundwater monitoring"
            className="h-full w-full object-cover opacity-30"
          />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-36 z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-primary-foreground mb-5 drop-shadow-sm">
                Heavy Metal Pollution Index Calculator
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-8">
                A friendly, reliable tool to analyze groundwater quality and identify heavy metal contamination risks — built for researchers, policymakers and field engineers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/upload">
                  <Button size="lg" variant="secondary" className="group shadow-lg transform-gpu transition-all hover:-translate-y-1">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="bg-transparent border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Stats / glass card */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col items-start shadow-sm transform transition-all hover:scale-[1.02]"
                    style={{ animation: `fadeInUp 400ms ${i * 80}ms both` }}
                  >
                    <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                    <span className="text-xl md:text-2xl font-semibold text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: hero highlight card */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-tr from-white/40 to-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-none w-16 h-16 rounded-xl bg-gradient-to-br from-primary/80 to-secondary/70 flex items-center justify-center text-white shadow-lg">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Automated HMPI Computation</h3>
                    <p className="text-sm text-muted-foreground max-w-lg">
                      Upload a dataset and get validated, reproducible HPI/HEI/Cd computations with per-sample breakdown and geo-visualization.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/30 border border-white/10">
                    <p className="text-xs text-muted-foreground">Validated Inputs</p>
                    <p className="font-semibold">Schema checks & units</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/30 border border-white/10">
                    <p className="text-xs text-muted-foreground">Export</p>
                    <p className="font-semibold">CSV / GeoJSON / PDF</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link to="/upload">
                    <Button size="sm" variant="secondary">Upload Data</Button>
                  </Link>
                  <Link to="/visualization">
                    <Button size="sm" variant="ghost" className="border border-white/10">Explore Demo</Button>
                  </Link>
                </div>
              </div>

              {/* subtle badge */}
              <div className="absolute -top-4 -left-4 bg-accent/80 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                MoJS-ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Monitor Heavy Metals?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Heavy metal contamination in groundwater poses serious health risks. Early detection and monitoring are crucial for protecting communities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 p-3 flex items-center justify-center w-14 h-14">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                        <span className="text-xs bg-primary-100/60 text-primary-800 px-2 py-1 rounded-full">{feature.badge}</span>
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Trusted method</div>
                    <div className="text-xs font-medium text-primary">Learn more →</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Understanding Heavy Metal Pollution</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Heavy metals such as lead, arsenic, cadmium, and mercury can accumulate in groundwater through industrial discharge, agricultural runoff, and natural geological processes.
                </p>
                <p>
                  Prolonged exposure to contaminated water can lead to serious health issues including neurological damage, kidney disease, cancer, and developmental disorders in children.
                </p>
                <p>
                  The Heavy Metal Pollution Index (HMPI) provides a standardized way to assess water quality and identify areas requiring immediate attention.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Link to="/about">
                  <Button variant="outline">Methodology & References</Button>
                </Link>
                <Link to="/results">
                  <Button variant="secondary">View Sample Report</Button>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-card rounded-lg p-8 border border-border shadow-elevation">
              <h3 className="text-2xl font-bold mb-4">Key Indices</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-1">HPI - Heavy Metal Pollution Index</h4>
                  <p className="text-sm text-muted-foreground">Assesses overall contamination level</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">HEI - Heavy Metal Evaluation Index</h4>
                  <p className="text-sm text-muted-foreground">Evaluates cumulative toxic effects</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Cd - Contamination Degree</h4>
                  <p className="text-sm text-muted-foreground">Measures pollution intensity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Ready to Analyze Your Water Quality?</h3>
            <p className="text-muted-foreground mt-2">Upload your groundwater data and receive instant pollution index calculations with geospatial insights.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/upload">
              <Button size="lg" variant="secondary">Start Analysis</Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="ghost" className="border border-primary/10">See Docs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* small footer CTA */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Geo HPI Analyzer • Built for environmental monitoring & public health
      </footer>

      {/* Inline keyframe for small entrance animation (Tailwind JIT allows arbitrary CSS in style tag) */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Home;
