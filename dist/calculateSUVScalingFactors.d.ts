import { InstanceMetadata } from './types';
/**
 * Javascript object containing the SUV and SUL factors.
 * TODO, the result property names may changes
 *
 * @interface ScalingFactorResult
 */
interface ScalingFactorResult {
    suvbw: number;
    suvlbm?: number;
    suvbsa?: number;
}
/**
 * Calculate the SUV factor
 *
 * Note: Rescale Slope / Intercept must still be applied. These must be applied
 *       on a per-Frame basis, since some scanners may have different values per Frame.
 *
 * @export
 * @param {InstanceMetadata[]} instances
 * @returns {ScalingFactorResult[]}
 */
export default function calculateSUVScalingFactors(instances: InstanceMetadata[]): ScalingFactorResult[];
export { calculateSUVScalingFactors };
