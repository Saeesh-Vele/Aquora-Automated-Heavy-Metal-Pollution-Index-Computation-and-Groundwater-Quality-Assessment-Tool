import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import {
  Upload,
  Map as MapIcon,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import type { CalculationResult } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";

const Visualization = () => {
  const [results, setResults] = useState<CalculationResult[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedResults = sessionStorage.getItem("waterAnalysisResults");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      toast({
        title: "No Data Found",
        description: "Please upload a file first",
        variant: "destructive",
      });
    }
  }, [toast]);

  if (results.length === 0) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <Card className="shadow-glow bg-gradient-card w-full max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Upload className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Upload your water quality data to see interactive charts and maps.
            </p>
            <Button size="lg" onClick={() => navigate("/upload")}>
              Upload Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data
  const categoryData = [
    {
      name: "Safe",
      value: results.filter((r) => r.category === "Safe").length,
      color: "hsl(var(--success))",
    },
    {
      name: "Slightly Polluted",
      value: results.filter((r) => r.category === "Slightly Polluted").length,
      color: "hsl(var(--warning))",
    },
    {
      name: "Hazardous",
      value: results.filter((r) => r.category === "Hazardous").length,
      color: "hsl(var(--destructive))",
    },
  ].filter((d) => d.value > 0);

  const indicesData = results.map((r) => ({
    name: r.id,
    HPI: r.hpi,
    HEI: r.hei,
    Cd: r.cd,
  }));

  // Sort by HPI for clearer bar chart
  const sortedIndicesData = [...indicesData].sort((a, b) => b.HPI - a.HPI);

  const samplesWithCoordinates = results.filter(
    (r) => r.latitude && r.longitude
  );
  const hasMapData = samplesWithCoordinates.length > 0;

  const getMarkerColor = (category: string) => {
    switch (category) {
      case "Safe":
        return "#10b981";
      case "Slightly Polluted":
        return "#f59e0b";
      case "Hazardous":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  };

  const defaultCenter: [number, number] = hasMapData
    ? [
        Number(samplesWithCoordinates[0].latitude),
        Number(samplesWithCoordinates[0].longitude),
      ]
    : [20, 78]; // India center fallback

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 animate-fade-in">
            Data Visualization
          </h1>
          <p className="text-muted-foreground">
            Explore {results.length} samples with interactive charts and
            geographic mapping
          </p>
        </div>

        <Tabs defaultValue="charts" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="flex items-center gap-2"
              disabled={!hasMapData}
            >
              <MapIcon className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-8">
            {/* Pie Chart */}
            <Card className="shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Water Quality Distribution
                </CardTitle>
                <CardDescription>
                  Percentage of samples in each pollution category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, percent }: any) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="shadow-elevation">
              <CardHeader>
                <CardTitle>Heavy Metal Pollution Index (HPI)</CardTitle>
                <CardDescription>
                  Samples sorted by HPI values (higher = worse)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sortedIndicesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={90}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="HPI" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Line Chart */}
            <Card className="shadow-elevation">
              <CardHeader>
                <CardTitle>Pollution Indices Trends</CardTitle>
                <CardDescription>
                  Comparison across HPI, HEI, and Cd values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={indicesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={90}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="HPI"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="HEI"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Cd"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            {hasMapData ? (
              <Card className="shadow-elevation">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5" />
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription>
                    Sample locations colored by pollution category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px] rounded-xl overflow-hidden shadow-elevation border border-border">
                    <MapContainer
                      center={defaultCenter}
                      zoom={6}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {samplesWithCoordinates.map((sample, index) => (
                        <CircleMarker
                          key={index}
                          center={[sample.latitude!, sample.longitude!]}
                          radius={8}
                          fillColor={getMarkerColor(sample.category)}
                          color="#fff"
                          weight={2}
                          opacity={1}
                          fillOpacity={0.8}
                        >
                          <Popup>
                            <div className="text-sm space-y-1">
                              <p className="font-semibold">{sample.id}</p>
                              <p className="text-xs">Category: {sample.category}</p>
                              <p className="text-xs">HPI: {sample.hpi}</p>
                              <p className="text-xs">HEI: {sample.hei}</p>
                              <p className="text-xs">Cd: {sample.cd}</p>
                            </div>
                          </Popup>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </div>
                  <div className="mt-4 flex gap-4 justify-center text-sm">
                    <span className="px-3 py-1 rounded-full bg-success/20 text-success">
                      Safe
                    </span>
                    <span className="px-3 py-1 rounded-full bg-warning/20 text-warning">
                      Slightly Polluted
                    </span>
                    <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive">
                      Hazardous
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-elevation">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <MapIcon className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No Geographic Data</h2>
                  <p className="text-muted-foreground text-center">
                    Your dataset does not include latitude/longitude values
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Visualization;
