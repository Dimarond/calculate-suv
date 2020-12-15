/**
 * Philips specific dicom header metadata
 *
 * @export
 * @interface PhilipsPETPrivateGroup
 */
export interface PhilipsPETPrivateGroup {
    SUVScaleFactor: number | undefined;
    ActivityConcentrationScaleFactor: number | undefined;
}
/**
 * Dicom header metadata
 *
 * @export
 * @interface InstanceMetadata
 */
export interface InstanceMetadata {
    CorrectedImage: string[];
    Units: string;
    RadionuclideHalfLife: number;
    RadionuclideTotalDose: number;
    DecayCorrection: string;
    PatientWeight: number;
    SeriesDate: string;
    SeriesTime: string;
    AcquisitionDate: string;
    AcquisitionTime: string;
    RadiopharmaceuticalStartTime?: string;
    RadiopharmaceuticalStartDateTime?: string;
    PhilipsPETPrivateGroup?: PhilipsPETPrivateGroup;
    GEPrivatePostInjectionDateTime?: string;
    FrameReferenceTime?: number;
    ActualFrameDuration?: number;
    PatientSize?: number;
    PatientSex?: string;
}