/** Extension contract only: real pigment computation is not implemented in v1. */
export interface SpectralSample {
  wavelengthNm: number;
  reflectance: number;
}
export interface PigmentData {
  id: string;
  name: string;
  reflectance: readonly SpectralSample[];
  absorption?: readonly number[];
  scattering?: readonly number[];
}
export interface PigmentComponent {
  pigment: PigmentData;
  concentration: number;
  proportion: number;
}
export interface PigmentMixingInput {
  components: readonly PigmentComponent[];
  thicknessMm: number;
  illuminant: "D65";
}
export interface PigmentMixingModel {
  id: string;
  version: string;
  mixReflectance: (input: PigmentMixingInput) => readonly SpectralSample[];
}
// Future Kubelka–Munk: spectra → XYZ → sRGB. Do not reuse ideal-filter CMY.
