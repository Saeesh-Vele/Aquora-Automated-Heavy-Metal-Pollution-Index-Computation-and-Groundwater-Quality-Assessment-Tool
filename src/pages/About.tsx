import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  HelpCircle,
  Calculator,
  Database,
  Info,
} from "lucide-react";
import { WHO_STANDARDS } from "@/lib/calculations";

const About = () => {
  const steps = [
    {
      title: "Prepare Your Data",
      desc:
        "Format groundwater data in CSV or Excel with columns for sample ID, optional coordinates (latitude/longitude), and metal concentrations in mg/L.",
    },
    {
      title: "Upload Your File",
      desc:
        "Go to the Upload page and drag-and-drop or browse to select your file. The system validates and processes automatically.",
    },
    {
      title: "Review Results",
      desc:
        "View calculated HPI, HEI and Cd indices for each sample. Results are categorized as Safe, Slightly Polluted, or Hazardous.",
    },
    {
      title: "Visualize & Export",
      desc:
        "Explore interactive charts and maps, then export results to CSV/GeoJSON for reporting or GIS analysis.",
    },
  ];

  const healthImpacts = [
    {
      metal: "Arsenic (As)",
      impact:
        "Skin lesions, cancer, cardiovascular disease and developmental issues in children.",
    },
    {
      metal: "Lead (Pb)",
      impact: "Neurological damage, impaired brain development in children, kidney problems.",
    },
    {
      metal: "Cadmium (Cd)",
      impact: "Kidney damage, bone demineralization, possible carcinogenic effects on chronic exposure.",
    },
    {
      metal: "Mercury (Hg)",
      impact: "Impacts nervous and immune systems; very harmful to developing fetuses and children.",
    },
  ];

  return (
    <div className="min-h-screen py-12 bg-background text-foreground">
      {/* Hero */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">About HMPI Calculator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn how to use this tool and understand heavy metal pollution indices for better groundwater monitoring and decision-making.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        {/* How to Use: timeline/stepper */}
        <Card className="shadow-elevation">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-primary" />
              How to Use This Application
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ol className="relative border-l border-border/60 pl-6 space-y-6">
              {steps.map((s, i) => (
                <li key={i} className="relative">
                  <div className="absolute -left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-semibold">
                    {i + 1}
                  </div>
                  <div className="ml-1">
                    <h3 className="font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Indices accordion */}
        <Card className="shadow-elevation">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Understanding Pollution Indices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="hpi">
                <AccordionTrigger className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">HPI — Heavy Metal Pollution Index</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3">
                  <p>
                    HPI is a weighted arithmetic mean that reflects the combined influence of measured heavy metals on overall water quality.
                  </p>
                  <pre className="font-mono text-sm bg-muted p-2 rounded">HPI = Σ(Wi × Qi) / ΣWi</pre>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>HPI &lt; 100 — Safe</li>
                    <li>100 ≤ HPI &lt; 200 — Slightly Polluted</li>
                    <li>HPI ≥ 200 — Hazardous</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="hei">
                <AccordionTrigger className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">HEI — Heavy Metal Evaluation Index</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3">
                  <p>
                    HEI sums the ratios of each metal concentration to its standard permissible limit; it shows cumulative toxic load.
                  </p>
                  <pre className="font-mono text-sm bg-muted p-2 rounded">HEI = Σ(Ci / Si)</pre>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>HEI &lt; 10 — Low</li>
                    <li>10 ≤ HEI &lt; 20 — Medium</li>
                    <li>HEI ≥ 20 — High</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cd">
                <AccordionTrigger className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">Cd — Contamination Degree</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3">
                  <p>
                    Cd provides an aggregated contamination score based on contamination factors for each measured metal.
                  </p>
                  <pre className="font-mono text-sm bg-muted p-2 rounded">Cd = Σ(Ci / Si)</pre>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Cd &lt; 1 — Unpolluted</li>
                    <li>1 ≤ Cd &lt; 3 — Slightly polluted</li>
                    <li>Cd ≥ 3 — Moderate to heavy pollution</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* WHO Standards grid: aligned */}
        <Card className="shadow-elevation">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-primary" />
              WHO Guideline Values (mg/L)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(WHO_STANDARDS).map(([metal, value]) => (
                <div
                  key={metal}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-card"
                  role="group"
                >
                  <div className="flex flex-col">
                    <div className="font-semibold text-foreground">{metal}</div>
                    <div className="text-sm text-muted-foreground">Limit</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{value}</div>
                    <div className="text-xs text-muted-foreground">mg/L</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health impacts: aligned cards */}
        <Card className="shadow-elevation">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              Health Impact of Heavy Metals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthImpacts.map((h) => (
                <div key={h.metal} className="p-4 rounded-lg bg-muted/40 border border-border flex gap-4 items-start">
                  <div className="flex-none w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {/* initials */}
                    <span className="text-sm">{h.metal.split(" ")[0].slice(0,2)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{h.metal}</div>
                    <div className="text-sm text-muted-foreground mt-1">{h.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* References */}
        <Card className="shadow-elevation">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              References & Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <a
                  className="underline hover:text-primary"
                  href="https://www.who.int/publications/i/item/9789241549950"
                  target="_blank"
                  rel="noreferrer"
                >
                  WHO - Guidelines for Drinking-water Quality
                </a>
              </li>
              <li>Prasad, B. & Bose, J.M. (2001). Evaluation of heavy metal pollution index for surface and spring water near mining areas.</li>
              <li>Edet, A.E. & Offiong, O.E. (2002). Evaluation of water quality pollution indices for heavy metal contamination monitoring.</li>
              <li>US EPA - National Primary Drinking Water Regulations (official website).</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
