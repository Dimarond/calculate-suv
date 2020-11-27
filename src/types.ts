export interface PhilipsPETPrivateGroup {
  SUVScaleFactor: number | undefined; // 0x7053,0x1000
  ActivityConcentrationScaleFactor: number | undefined; // 0x7053,0x1009
}

export interface InstanceMetadata {
  CorrectedImage: string[];
  Units: string; // 'BQML' | 'CNTS' | 'GML'; // Units (0x0054,0x1001)
  RadionuclideHalfLife: number; // 	RadionuclideHalfLife(0x0018,0x1075)	in	Radiopharmaceutical	Information	Sequence(0x0054,0x0016)
  TotalDose: number;
  DecayCorrection: string; //'ADMIN' | 'START';
  PatientWeight: number;
  SeriesDate: string;
  SeriesTime: string;
  AcquisitionDate: string;
  AcquisitionTime: string;

  // Marked as optional but at least either RadiopharmaceuticalStartDateTime
  // or both RadiopharmaceuticalStartTime and SeriesDate are required.
  RadiopharmaceuticalStartTime?: string; // From the old version of the DICOM standard
  RadiopharmaceuticalStartDateTime?: string;

  PhilipsPETPrivateGroup?: PhilipsPETPrivateGroup;
  GEPrivatePostInjectionDateTime?: string;

  // Only used in Siemens case
  FrameReferenceTime?: number;
  ActualFrameDuration?: number;

  // Only used for SUL
  PatientSize?: number;
  PatientSex?: string; //'M' | 'F';
}