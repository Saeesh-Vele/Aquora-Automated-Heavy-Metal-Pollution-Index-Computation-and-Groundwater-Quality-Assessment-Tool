// Heavy Metal Pollution Index Calculations

export interface WaterSample {
  id?: string;
  latitude?: number | string;
  Longitude?: number | string;
  Latitude?: number | string;
  longitude?: number | string;
  lat?: number | string;
  lon?: number | string;
  lng?: number | string;
  [key: string]: any; // For metal concentrations
}

export interface CalculationResult {
  id: string;
  latitude?: number;
  longitude?: number;
  hpi: number;
  hei: number;
  cd: number;
  category: "Safe" | "Slightly Polluted" | "Hazardous";
  metals: { [key: string]: number };
}

// Standard WHO guideline values (mg/L) for common heavy metals
export const WHO_STANDARDS: { [key: string]: number } = {
  As: 0.01,
  Cd: 0.003,
  Cr: 0.05,
  Cu: 2.0,
  Fe: 0.3,
  Pb: 0.01,
  Mn: 0.4,
  Ni: 0.07,
  Zn: 3.0,
  Hg: 0.006,
};

// --- Helpers ---

// Safe number parser (handles strings, trims, and ignores invalid)
function parseNumber(v: any): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(String(v).trim());
  return Number.isNaN(n) ? undefined : n;
}

// Pick the first defined value among multiple possible keys
function pickNumber(sample: any, keys: string[]): number | undefined {
  for (const key of keys) {
    if (key in sample) {
      const val = parseNumber(sample[key]);
      if (val !== undefined) return val;
    }
  }
  return undefined;
}

// --- Calculations ---

// Calculate Heavy Metal Pollution Index (HPI)
export function calculateHPI(sample: WaterSample, metals: string[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  metals.forEach((metal) => {
    const concentration = parseNumber(sample[metal]) || 0;
    const standard = WHO_STANDARDS[metal] || 1;

    const weight = 1 / standard;
    const subIndex = (concentration / standard) * 100;

    weightedSum += weight * subIndex;
    totalWeight += weight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// Calculate Heavy Metal Evaluation Index (HEI)
export function calculateHEI(sample: WaterSample, metals: string[]): number {
  let sum = 0;
  metals.forEach((metal) => {
    const concentration = parseNumber(sample[metal]) || 0;
    const standard = WHO_STANDARDS[metal] || 1;
    sum += concentration / standard;
  });
  return sum;
}

// Calculate Contamination Degree (Cd)
export function calculateCd(sample: WaterSample, metals: string[]): number {
  let sum = 0;
  metals.forEach((metal) => {
    const concentration = parseNumber(sample[metal]) || 0;
    const standard = WHO_STANDARDS[metal] || 1;
    sum += concentration / standard;
  });
  return sum;
}

// Categorize water quality based on HPI
export function categorizeWaterQuality(
  hpi: number
): "Safe" | "Slightly Polluted" | "Hazardous" {
  if (hpi < 100) return "Safe";
  if (hpi < 200) return "Slightly Polluted";
  return "Hazardous";
}

// Process all samples and calculate indices
export function processWaterSamples(samples: WaterSample[]): CalculationResult[] {
  if (!samples || samples.length === 0) return [];

  // Detect metal columns (exclude id/lat/lon variants)
  const firstSample = samples[0];
  const exclude = [
    "id",
    "latitude",
    "longitude",
    "lat",
    "lon",
    "lng",
    "Latitude",
    "Longitude",
  ].map((k) => k.toLowerCase());

  const metalColumns = Object.keys(firstSample).filter(
    (key) => !exclude.includes(key.toLowerCase())
  );

  return samples.map((sample, index) => {
    const hpi = calculateHPI(sample, metalColumns);
    const hei = calculateHEI(sample, metalColumns);
    const cd = calculateCd(sample, metalColumns);
    const category = categorizeWaterQuality(hpi);

    const metals: { [key: string]: number } = {};
    metalColumns.forEach((metal) => {
      metals[metal] = parseNumber(sample[metal]) || 0;
    });

    return {
      id: sample.id?.toString() || `Sample ${index + 1}`,
      latitude: pickNumber(sample, ["latitude", "Latitude", "lat"]),
      longitude: pickNumber(sample, ["longitude", "Longitude", "lon", "lng"]),
      hpi: Math.round(hpi * 100) / 100,
      hei: Math.round(hei * 100) / 100,
      cd: Math.round(cd * 100) / 100,
      category,
      metals,
    };
  });
}
