import React, { Fragment, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  Download,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Search,
  X,
  Copy,
  Globe,
} from "lucide-react";
import type { CalculationResult } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 12;

const Results = () => {
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Helper: normalize raw stored results into the shape this component expects
  const normalizeResults = (raw: any[]): CalculationResult[] => {
    const latKeys = ["latitude", "Latitude", "lat", "Lat"];
    const lonKeys = ["longitude", "Longitude", "lon", "lng", "Lon", "Lng"];

    const pickNumber = (obj: any, keys: string[]) => {
      for (const k of keys) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, k)) {
          const v = obj[k];
          if (v === undefined || v === null || v === "") continue;
          const n = Number(String(v).trim());
          if (!Number.isNaN(n)) return n;
        }
      }
      return null;
    };

    const pickNumericAlt = (obj: any, possibilities: string[]) => {
      for (const k of possibilities) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, k)) {
          const v = obj[k];
          if (v === undefined || v === null || v === "") continue;
          const n = Number(String(v).trim());
          if (!Number.isNaN(n)) return n;
        }
      }
      return null;
    };

    return raw.map((r: any, idx: number) => {
      const latitude = pickNumber(r, latKeys);
      const longitude = pickNumber(r, lonKeys);

      const hpi = pickNumericAlt(r, ["hpi", "HPI", "hpi_value", "hpiValue", "hpi_val"]);
      const hei = pickNumericAlt(r, ["hei", "HEI", "hei_value", "heiValue"]);
      const cd = pickNumericAlt(r, ["cd", "Cd", "contamination_degree", "contaminationDegree"]);

      const id = r.id ?? r.sample_id ?? r.SampleID ?? r.Location ?? `sample-${idx + 1}`;
      const category = r.category ?? r.Category ?? r.status ?? "Unknown";

      // Build normalized object while retaining original fields (useful for "Details")
      return {
        ...r,
        id,
        latitude,
        longitude,
        hpi: hpi === null ? null : hpi,
        hei: hei === null ? null : hei,
        cd: cd === null ? null : cd,
        category,
      } as CalculationResult;
    });
  };

  useEffect(() => {
    const storedResults = sessionStorage.getItem("waterAnalysisResults");
    if (!storedResults) {
      toast({
        title: "No Data Found",
        description: "Please upload a file first",
        variant: "destructive",
      });
      navigate("/upload");
      return;
    }

    try {
      const parsed = JSON.parse(storedResults);
      if (!Array.isArray(parsed)) throw new Error("Expected an array in sessionStorage");

      const normalized = normalizeResults(parsed);

      // Keep only entries that have something to show (id + either coords or numeric metric)
      const filtered = normalized.filter((r) => {
        return Boolean(r.id) && (
          (typeof r.latitude === "number" && typeof r.longitude === "number") ||
          typeof r.hpi === "number" ||
          typeof r.hei === "number" ||
          typeof r.cd === "number"
        );
      });

      setResults(filtered);
    } catch (err) {
      console.error("Failed parsing stored results:", err);
      toast({
        title: "Corrupt Data",
        description: "Failed to parse stored results. Please re-upload your file.",
        variant: "destructive",
      });
      navigate("/upload");
    }
  }, [navigate, toast]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => set.add(r.category ?? "Unknown"));
    return Array.from(set);
  }, [results]);

  const filtered = useMemo(() => {
    let list = results;
    if (query.trim() !== "") {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          String(r.id).toLowerCase().includes(q) ||
          (typeof r.latitude === "number" && String(r.latitude).toLowerCase().includes(q)) ||
          (typeof r.longitude === "number" && String(r.longitude).toLowerCase().includes(q))
      );
    }
    if (categoryFilter) {
      list = list.filter((r) => r.category === categoryFilter);
    }
    return list;
  }, [results, query, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getCategoryBadge = (category: string) => {
    const variants: {
      [key: string]: { variant: "default" | "destructive" | "secondary"; icon: any };
    } = {
      Safe: { variant: "default", icon: ShieldCheck },
      "Slightly Polluted": { variant: "secondary", icon: AlertCircle },
      Hazardous: { variant: "destructive", icon: AlertTriangle },
    };

    const config = variants[category] || variants["Safe"];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {category}
      </Badge>
    );
  };

  const exportToCSV = (rows: CalculationResult[]) => {
    if (rows.length === 0) {
      toast({ title: "No rows", description: "Nothing to export", variant: "destructive" });
      return;
    }

    const headers = ["id", "latitude", "longitude", "hpi", "hei", "cd", "category"];
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = (r as any)[h];
            if (val === undefined || val === null) return "";
            const s = String(val).replace(/"/g, '""');
            return s.includes(",") ? `"${s}"` : s;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `water-analysis-results-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Results have been exported to CSV",
    });
  };

  const exportToGeoJSON = (rows: CalculationResult[]) => {
    const features = rows
      .filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number")
      .map((r) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
        properties: {
          id: r.id,
          hpi: r.hpi,
          hei: r.hei,
          cd: r.cd,
          category: r.category,
        },
      }));

    const geojson = { type: "FeatureCollection", features };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `water-analysis-results-${Date.now()}.geojson`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "GeoJSON Exported",
      description: "GeoJSON file ready for GIS / map tools",
    });
  };

  const copySampleToClipboard = async (r: CalculationResult) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(r, null, 2));
      toast({ title: "Copied", description: `Sample ${r.id} copied to clipboard` });
    } catch {
      toast({ title: "Copy failed", description: "Unable to copy to clipboard", variant: "destructive" });
    }
  };

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter(null);
    setPage(1);
  };

  const stats = useMemo(() => {
    return {
      total: results.length,
      safe: results.filter((r) => r.category === "Safe").length,
      slightlyPolluted: results.filter((r) => r.category === "Slightly Polluted").length,
      hazardous: results.filter((r) => r.category === "Hazardous").length,
      avgHPI: results.length > 0 ? (results.reduce((sum, r) => sum + (r.hpi || 0), 0) / results.length).toFixed(2) : "0",
    };
  }, [results]);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-1">Analysis Results</h1>
            <p className="text-muted-foreground">
              Heavy Metal Pollution Indices for <strong>{results.length}</strong> samples
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                aria-label="Search samples"
                className="bg-transparent outline-none text-sm"
                placeholder="Search by id / lat / lon"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="ml-2 text-muted-foreground" aria-label="clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                className="rounded-lg border border-border px-3 py-1 text-sm bg-white"
                value={categoryFilter ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setCategoryFilter(v === "" ? null : v);
                  setPage(1);
                }}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <Button variant="outline" onClick={() => resetFilters()} size="sm">
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => exportToCSV(filtered)} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => exportToGeoJSON(filtered)} variant="ghost" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                GeoJSON
              </Button>
              <Button onClick={() => navigate("/visualization")} size="sm">
                View Charts
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-card shadow-elevation">
            <CardHeader>
              <CardDescription>Total Samples</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-card shadow-elevation border-success/50">
            <CardHeader>
              <CardDescription className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Safe
              </CardDescription>
              <CardTitle className="text-3xl text-success">{stats.safe}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-card shadow-elevation border-warning/50">
            <CardHeader>
              <CardDescription className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Slightly Polluted
              </CardDescription>
              <CardTitle className="text-3xl text-warning">{stats.slightlyPolluted}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-card shadow-elevation border-destructive/50">
            <CardHeader>
              <CardDescription className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Hazardous
              </CardDescription>
              <CardTitle className="text-3xl text-destructive">{stats.hazardous}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-card shadow-elevation">
            <CardHeader>
              <CardDescription>Avg HPI</CardDescription>
              <CardTitle className="text-3xl">{stats.avgHPI}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Results table */}
        <Card className="shadow-elevation">
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
            <CardDescription>
              HPI: Heavy Metal Pollution Index | HEI: Heavy Metal Evaluation Index | Cd: Contamination Degree
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto results-table">
              <Table>
                <TableHeader>
                  <TableRow className="items-center">
                    <TableHead className="align-middle whitespace-nowrap py-3">Sample ID</TableHead>
                    <TableHead className="align-middle whitespace-nowrap py-3">Latitude</TableHead>
                    <TableHead className="align-middle whitespace-nowrap py-3">Longitude</TableHead>
                    <TableHead className="align-middle whitespace-nowrap py-3 text-right">HPI</TableHead>
                    <TableHead className="align-middle whitespace-nowrap py-3 text-right">HEI</TableHead>
                    <TableHead className="align-middle whitespace-nowrap py-3 text-right">Cd</TableHead>
                    <TableHead className="align-middle whitespace-nowrap py-3">Category</TableHead>
                    <TableHead className="align-middle whitespace-nowrap py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paged.map((result, idx) => {
                    const globalIndex = (page - 1) * PAGE_SIZE + idx;
                    const expanded = expandedIndex === globalIndex;

                    return (
                      <Fragment key={result.id ?? globalIndex}>
                        <TableRow>
                          <TableCell className="align-middle font-medium py-3">{result.id}</TableCell>
                          <TableCell className="align-middle py-3">
                            {typeof result.latitude === "number" ? result.latitude.toFixed(6) : "N/A"}
                          </TableCell>
                          <TableCell className="align-middle py-3">
                            {typeof result.longitude === "number" ? result.longitude.toFixed(6) : "N/A"}
                          </TableCell>
                          <TableCell className="align-middle text-right font-mono py-3">
                            {typeof result.hpi === "number" ? result.hpi : "-"}
                          </TableCell>
                          <TableCell className="align-middle text-right font-mono py-3">
                            {typeof result.hei === "number" ? result.hei : "-"}
                          </TableCell>
                          <TableCell className="align-middle text-right font-mono py-3">
                            {typeof result.cd === "number" ? result.cd : "-"}
                          </TableCell>
                          <TableCell className="align-middle py-3">{getCategoryBadge(result.category)}</TableCell>
                          <TableCell className="align-middle py-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setExpandedIndex(expanded ? null : globalIndex)}>
                                {expanded ? "Hide" : "Details"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => copySampleToClipboard(result)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {expanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/5 py-3">
                              {/* You can expand this to show the full normalized object or formatted calculation steps */}
                              <div className="text-sm text-muted-foreground">
                                <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(result, null, 2)}</pre>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {filtered.length === 0 ? (
                  <>Showing 0 of 0 results</>
                ) : (
                  <>
                    Showing {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage(1)} disabled={page === 1}>
                  First
                </Button>
                <Button size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                  Prev
                </Button>
                <div className="px-3 text-sm">{page} / {totalPages}</div>
                <Button size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                  Next
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                  Last
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;
