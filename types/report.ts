export interface HairLossAssessment {
  pattern: string;
  severity: {
    score: number;
    category: string;
  };
  hairlineRecession: string;
  crownThinning: string;
  overallDensity: string;
  distinctiveCharacteristics: string;
}

export interface Characteristics {
  hairColor: string;
  hairTexture: string;
  hairThickness: string;
  hairDensity: string;
  faceShape: string;
  scalpCondition: string;
  growthPattern: string;
}

export interface Recommendations {
  approach: string;
  graftCount: number;
  specialConsiderations: string;
  expectedResults: string;
}

export interface StructuredReport {
  isStructured: boolean;
  hairLossAssessment: HairLossAssessment;
  characteristics: Characteristics;
  recommendations: Recommendations;
  summary: string;
}

export interface UnstructuredReport {
  isStructured: false;
  rawText: string;
}

export type Report = StructuredReport | UnstructuredReport;

export interface ClientData {
  id: string;
  name: string;
  age: number | null;
  notes: string;
  frontImageUrl: string;
  selectedHairline: string;
  selectedHairstyle: string;
  hairlineTitle: string;
  hairlineDescription: string;
  hairstyleTitle: string;
  hairstyleDescription: string;
  report: Report;
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
} 