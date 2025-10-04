import { useState, useCallback, useMemo } from "react";
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  CloudDownload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { processWaterSamples, type WaterSample } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";

type ValidationResult = { ok: boolean; errors: string[]; warnings?: string[] };

const SAMPLE_CSV = `id,latitude,longitude,Cd,Pb,Cr,Ni,As,Cu,Zn,Hg
S1,28.7041,77.1025,0.002,0.025,0.05,0.01,0.002,0.1,0.2,0.0001
S2,28.5355,77.3910,0.01,0.04,0.1,0.02,0.005,0.2,0.5,0.0002
S3,27.1767,78.0081,0.05,0.12,0.3,0.1,0.01,0.4,0.8,0.0005
`.trim();

const MAX_PREVIEW_ROWS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const requiredCoordinateFields = useMemo(
    () => ["latitude", "lat"],
    []
  );
  const requiredLongitudeFields = useMemo(
    () => ["longitude", "lon", "lng"],
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateSchema = (rows: any[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!rows || rows.length === 0) {
      errors.push("No rows found in the file.");
      return { ok: false, errors };
    }
    const headers = Object.keys(rows[0]).map((h) => h.trim());
    const lowerHeaders = headers.map((h) => h.toLowerCase());

    // Check coordinates
    const hasLat = lowerHeaders.some((h) =>
      requiredCoordinateFields.includes(h)
    );
    const hasLon = lowerHeaders.some((h) =>
      requiredLongitudeFields.includes(h)
    );
    if (!hasLat || !hasLon) {
      warnings.push(
        "No latitude/longitude columns detected. Geo-visualization will be unavailable."
      );
    }

    // Check for at least one metal column (common abbreviations)
    const metalCandidates = ["cd", "pb", "cr", "ni", "as", "cu", "zn", "hg", "fe", "mn"];
    const hasMetal = lowerHeaders.some((h) => metalCandidates.includes(h));
    if (!hasMetal) {
      errors.push(
        "No metal concentration columns detected. Please include at least one metal column (e.g., Cd, Pb, Cr, Ni, As, Cu, Zn, Hg)."
      );
    }

    // Basic numeric check on first row for metal columns
    if (hasMetal) {
      const first = rows[0];
      const metalCols = Object.keys(first).filter((k) =>
        metalCandidates.includes(k.toLowerCase())
      );
      if (metalCols.length === 0) {
        errors.push("Metal columns detected but could not be parsed correctly.");
      }
    }

    return { ok: errors.length === 0, errors, warnings };
  };

  const parseCSVBuffer = (text: string): Promise<any[]> =>
    new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as any[]);
        },
        error: (err) => reject(err),
      });
    });

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadedFile(file);
    setPreviewRows([]);
    setPreviewHeaders([]);

    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File too large. Maximum allowed size is 10MB.");
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      let data: any[] = [];

      if (fileExtension === "csv") {
        const text = await file.text();
        data = await parseCSVBuffer(text);
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet, { raw: false }) as any[];
      } else {
        throw new Error("Unsupported file format. Please upload CSV or Excel files.");
      }

      // Preview and validation
      setPreviewHeaders(Object.keys(data[0] || {}).slice(0, 20));
      setPreviewRows(data.slice(0, MAX_PREVIEW_ROWS));

      const validation = validateSchema(data);
      if (!validation.ok) {
        setIsProcessing(false);
        toast({
          title: "Schema validation failed",
          description: validation.errors.join(" "),
          variant: "destructive",
        });
        return;
      }

      if (validation.warnings && validation.warnings.length) {
        toast({
          title: "Validation warning",
          description: validation.warnings.join(" "),
          variant: "default",
        });
      }

      // Process and calculate indices
      const results = processWaterSamples(data as WaterSample[]);

      // Store results in sessionStorage for results page
      sessionStorage.setItem("waterAnalysisResults", JSON.stringify(results));

      setIsProcessing(false);
      toast({
        title: "Success",
        description: `Processed ${results.length} samples successfully`,
      });

      // Navigate to results page
      setTimeout(() => {
        navigate("/results");
      }, 500);
    } catch (error: any) {
      setIsProcessing(false);
      const message = error?.message || "Failed to process file";
      toast({
        title: "Upload Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_input.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearPreview = () => {
    setPreviewRows([]);
    setPreviewHeaders([]);
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Upload Water Quality Data</h1>
          <p className="text-lg text-muted-foreground">
            Upload your CSV or Excel file containing groundwater heavy metal concentration measurements.
          </p>
        </div>

        <Card className="mb-6 shadow-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Data Format & Quick Actions
            </CardTitle>
            <CardDescription>
              Your file should include id, coordinates (optional) and metal concentration columns (mg/L).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <span><strong>id</strong> - Unique identifier for each sample</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <span><strong>latitude, longitude</strong> - Geographic coordinates (optional but recommended)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <span><strong>Metal columns</strong> - As, Cd, Cr, Cu, Fe, Pb, Mn, Ni, Zn, Hg (mg/L)</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Tip: Use standard column headings (Cd, Pb, Cr) for best results. Units must be mg/L.
                </div>
              </div>

              <div className="flex-none flex flex-col gap-2">
                <Button variant="secondary" size="sm" onClick={downloadSample} className="flex items-center gap-2">
                  <CloudDownload className="h-4 w-4" /> Download sample CSV
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  // open a small modal or navigate to docs - simplified here with toast
                  toast({
                    title: "Schema Help",
                    description: "Use columns like id, latitude, longitude, Cd, Pb, Cr (see sample download).",
                  });
                }}>
                  Need help?
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-2 border-dashed transition-all ${isDragging ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/50"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <UploadIcon className="h-12 w-12 text-primary" />
            </div>

            <h3 className="text-2xl font-semibold mb-2">{isProcessing ? "Processing file..." : "Drop your file here"}</h3>
            <p className="text-muted-foreground mb-4 text-center">or click the button below to browse (CSV, XLSX, XLS)</p>

            <div className="flex gap-3 items-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                disabled={isProcessing}
              />
              <label htmlFor="file-upload">
                <Button disabled={isProcessing} asChild>
                  <span className="cursor-pointer">{isProcessing ? "Processing..." : "Select File"}</span>
                </Button>
              </label>

              <Button variant="outline" onClick={() => { clearPreview(); }}>
                <X className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>

            {uploadedFile && (
              <p className="mt-4 text-sm text-muted-foreground">Selected: {uploadedFile.name}</p>
            )}

            <div className="mt-4 text-xs text-muted-foreground">
              Max file size: 10MB • Files parsed locally in your browser
            </div>
          </CardContent>
        </Card>

        {previewRows.length > 0 && (
          <Card className="mt-6 mb-6">
            <CardHeader>
              <CardTitle>Preview (first {previewRows.length} rows)</CardTitle>
              <CardDescription>Quick preview before full processing — columns detected: {previewHeaders.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground uppercase">
                    <tr>
                      {previewHeaders.map((h) => (
                        <th key={h} className="pr-4 pb-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-muted/5" : ""}>
                        {previewHeaders.map((h) => (
                          <td key={h} className="py-2 pr-4 align-top">
                            {String(row[h] ?? "").slice(0, 120)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Supported formats are CSV, XLSX, and XLS. Maximum file size is 10MB.
            Ensure your data follows the format requirements above for accurate calculations.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Upload;
