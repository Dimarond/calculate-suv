'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Javascript object that handles dates and compute the time.
 *
 * @export
 * @class FullDateInterface
 */
class FullDateInterface {
  /**
   * Creates an instance of FullDateInterface.
   * @param {string} date formatted as yyyy-mm-ddTHH:MM:SS.FFFFFFZ
   * @memberof FullDateInterface
   */
  constructor(date) {
    this.fullDate = date;
  }
  /**
   * returns time since 1 january 1970
   *
   * @returns {number} time in sec
   * @memberof FullDateInterface
   */


  getTimeInSec() {
    // yyyy-mm-ddTHH:MM:SS.FFFFFFZ
    const dateString = this.fullDate.substring(0, 10);
    const timeString = this.fullDate.substring(11, 28); // yyyy-mm-dd

    const yyyy = parseInt(dateString.substring(0, 4), 10);
    const mm = dateString.length >= 7 ? parseInt(dateString.substring(5, 7), 10) : undefined;
    const dd = dateString.length >= 10 ? parseInt(dateString.substring(8, 10), 10) : undefined;

    if (isNaN(yyyy) || mm !== undefined && isNaN(mm) || dd !== undefined && isNaN(dd) || yyyy < 1970 || yyyy > 3000 || mm && (mm < 1 || mm > 12) || dd && (dd < 1 || dd > 31)) {
      throw new Error(`invalid date '${dateString}'`);
    }

    const dateJS = new Date(`${dateString}T00:00:00.000000Z`); // HHMMSS.FFFFFF

    const HH = parseInt(timeString.substring(0, 2), 10);
    const MM = timeString.length >= 5 ? parseInt(timeString.substring(3, 5), 10) : undefined;
    const SS = timeString.length >= 8 ? parseInt(timeString.substring(6, 8), 10) : undefined;
    const fractionalStr = timeString.substring(9, 15);
    const FFFFFF = fractionalStr ? parseInt(fractionalStr, 10) * Math.pow(10, -fractionalStr.length) : undefined;

    if (isNaN(HH) || MM !== undefined && isNaN(MM) || SS !== undefined && isNaN(SS) || FFFFFF !== undefined && isNaN(FFFFFF) || HH < 0 || HH > 23 || MM && (MM < 0 || MM > 59) || SS && (SS < 0 || SS > 59) || FFFFFF && (FFFFFF < 0 || FFFFFF > 999999)) {
      throw new Error(`invalid time '${timeString}'`);
    }

    let timeInSec = dateJS.getTime() / 1000;
    timeInSec += HH * 3600;

    if (MM !== undefined) {
      timeInSec += MM * 60;
    }

    if (SS !== undefined) {
      timeInSec += SS;
    }

    if (FFFFFF !== undefined) {
      timeInSec += FFFFFF;
    }

    return timeInSec;
  }
  /**
   * returns time since 1 january 1970
   *
   * @returns {number} time in microsec
   * @memberof FullDateInterface
   */


  getTimeInMicroSec() {
    const timeInMicroSec = this.getTimeInSec() * 1e6;
    return timeInMicroSec;
  }

}
/**
 * Combines two javascript objects containing the date and time information
 *
 * @export
 * @param {DateInterface} date
 * @param {TimeInterface} time
 * @returns {FullDateInterface}
 */

function combineDateTime(date, time) {
  const hours = `${time.hours || '00'}`.padStart(2, '0');
  const minutes = `${time.minutes || '00'}`.padStart(2, '0');
  const seconds = `${time.seconds || '00'}`.padStart(2, '0');
  const month = `${date.month}`.padStart(2, '0');
  const day = `${date.day}`.padStart(2, '0');
  const fractionalSeconds = `${time.fractionalSeconds || '000000'}`.padEnd(6, '0');
  const dateString = `${date.year}-${month}-${day}`;
  const timeString = `T${hours}:${minutes}:${seconds}.${fractionalSeconds}Z`;
  const fullDateString = `${dateString}${timeString}`;
  return new FullDateInterface(fullDateString);
}

/**
 * Check the number of days for a picked month and year
 * algorithm based on http://stackoverflow.com/questions/1433030/validate-number-of-days-in-a-given-month
 *
 * @param {number} m
 * @param {number} y
 * @returns {number} number of days
 */
function daysInMonth(m, y) {
  // m is 0 indexed: 0-11
  switch (m) {
    case 2:
      return y % 4 === 0 && y % 100 || y % 400 === 0 ? 29 : 28;

    case 9:
    case 4:
    case 6:
    case 11:
      return 30;

    default:
      return 31;
  }
}
/**
 * Check if the date is valid
 *
 * @param {number} d
 * @param {number} m
 * @param {number} y
 * @returns {boolean} boolean result
 */


function isValidDate(d, m, y) {
  // make year is a number
  if (isNaN(y)) {
    return false;
  }

  return m > 0 && m <= 12 && d > 0 && d <= daysInMonth(m, y);
}
/**
 * Parses a DA formatted string into a Javascript object
 * @param {string} date a string in the DA VR format
 * @param {boolean} [validate] - true if an exception should be thrown if the date is invalid
 * @returns {DateInterface} Javascript object with properties year, month and day or undefined if not present or not 8 bytes long
 */


function parseDA(date) {
  if (!date || date.length !== 8 || typeof date !== 'string') {
    throw new Error(`invalid DA '${date}'`);
  }

  const yyyy = parseInt(date.substring(0, 4), 10);
  const mm = parseInt(date.substring(4, 6), 10);
  const dd = parseInt(date.substring(6, 8), 10);

  if (isValidDate(dd, mm, yyyy) !== true) {
    throw new Error(`invalid DA '${date}'`);
  }

  return {
    year: yyyy,
    month: mm,
    day: dd
  };
}

/**
 * Parses a TM formatted string into a javascript object with properties for hours, minutes, seconds and fractionalSeconds
 * @param {string} time - a string in the TM VR format
 * @returns {string} javascript object with properties for hours, minutes, seconds and fractionalSeconds or undefined if no element or data.  Missing fields are set to undefined
 */
function parseTM(time) {
  if (!time || time.length < 2 || typeof time !== 'string') {
    // must at least have HH
    throw new Error(`invalid TM '${time}'`);
  } // 0123456789
  // HHMMSS.FFFFFF


  const hh = parseInt(time.substring(0, 2), 10);
  const mm = time.length >= 4 ? parseInt(time.substring(2, 4), 10) : undefined;
  const ss = time.length >= 6 ? parseInt(time.substring(4, 6), 10) : undefined;
  const fractionalStr = time.length >= 8 ? time.substring(7, 13) : undefined;
  const ffffff = fractionalStr ? parseInt(fractionalStr, 10) * Math.pow(10, 6 - fractionalStr.length) : undefined;

  if (isNaN(hh) || mm !== undefined && isNaN(mm) || ss !== undefined && isNaN(ss) || ffffff !== undefined && isNaN(ffffff) || hh < 0 || hh > 23 || mm && (mm < 0 || mm > 59) || ss && (ss < 0 || ss > 59) || ffffff && (ffffff < 0 || ffffff > 999999)) {
    throw new Error(`invalid TM '${time}'`);
  }

  return {
    hours: hh,
    minutes: mm,
    seconds: ss,
    fractionalSeconds: ffffff
  };
}

/**
 * Utility to create a FullDateInterface object given a string formatted as yyyy-mm-ddTHH:MM:SS.FFFFFFZ
 *
 * @export
 * @param {string} dateTime
 * @returns {FullDateInterface}
 */

function dateTimeToFullDateInterface(dateTime) {
  const date = parseDA(dateTime.substring(0, 8));
  const time = parseTM(dateTime.substring(8));
  return combineDateTime(date, time);
}

/**
 * Calcualte the scan times
 *
 * @export
 * @param {InstanceMetadataForScanTimes[]} instances
 * @returns {FullDateInterface[]}
 */

function calculateScanTimes(instances) {
  const {
    SeriesDate,
    SeriesTime,
    GEPrivatePostInjectionDateTime
  } = instances[0];
  const results = new Array(instances.length);
  const seriesDate = parseDA(SeriesDate);
  const seriesTime = parseTM(SeriesTime);
  const seriesDateTime = combineDateTime(seriesDate, seriesTime);
  let earliestAcquisitionDateTime = new FullDateInterface(`3000-01-01T00:00:00.000000Z`);
  let timeError = earliestAcquisitionDateTime.getTimeInSec();
  instances.forEach(instance => {
    const {
      AcquisitionDate,
      AcquisitionTime
    } = instance;
    const acquisitionDate = parseDA(AcquisitionDate);
    const acquisitionTime = parseTM(AcquisitionTime);
    const acquisitionDateTime = combineDateTime(acquisitionDate, acquisitionTime);

    if (earliestAcquisitionDateTime.getTimeInSec() >= timeError) {
      earliestAcquisitionDateTime = acquisitionDateTime;
    } else {
      earliestAcquisitionDateTime = acquisitionDateTime.getTimeInSec() < earliestAcquisitionDateTime.getTimeInSec() ? acquisitionDateTime : earliestAcquisitionDateTime;
    }
  });

  if (earliestAcquisitionDateTime.getTimeInSec() >= timeError) {
    throw new Error('Earliest acquisition time or date could not be parsed.');
  }

  if (seriesDateTime.getTimeInSec() <= earliestAcquisitionDateTime.getTimeInSec()) {
    return results.fill(seriesDateTime);
  } else {
    if (GEPrivatePostInjectionDateTime) {
      // GE Private scan
      return results.fill(dateTimeToFullDateInterface(GEPrivatePostInjectionDateTime));
    } else {
      const hasValidFrameTimes = instances.every(instance => {
        return instance.FrameReferenceTime && instance.FrameReferenceTime > 0 && instance.ActualFrameDuration && instance.ActualFrameDuration > 0;
      });
      console.log(hasValidFrameTimes); // TODO: Temporarily commented out the checks and logic below to
      // investigate the BQML_AC_DT_<_S_DT + SIEMENS case
      //if (!hasValidFrameTimes) {

      return results.fill(earliestAcquisitionDateTime); //}

      /* Siemens PETsyngo	3.x	multi-injection logic
      - backcompute	from	center	(average	count	rate	)	of	time	window	for	bed	position	(frame)	in	series (reliable	in	all	cases)
      - Acquisition	Date	(0x0008,0x0022)	and	Time	(0x0008,0x0032) are	the	start	of	the	bed	position	(frame)
      - Frame	Reference	Time	(0x0054,0x1300) is	the	offset	(ms)	from	the	scan	Date	and	Time we	want	to	the	average	count	rate	time
      */

      /*return instances.map(instance => {
        const {
          FrameReferenceTime,
          ActualFrameDuration,
          RadionuclideHalfLife,
          AcquisitionDate,
          AcquisitionTime,
        } = instance;
        // Some of these checks are only here because the compiler is complaining
        // We could potentially use the ! operator instead
        if (!FrameReferenceTime || FrameReferenceTime <= 0) {
          throw new Error(
            `FrameReferenceTime is invalid: ${FrameReferenceTime}`
          );
        }
               if (!ActualFrameDuration || ActualFrameDuration <= 0) {
          throw new Error(
            `ActualFrameDuration is invalid: ${ActualFrameDuration}`
          );
        }
               if (!RadionuclideHalfLife) {
          throw new Error('RadionuclideHalfLife is required');
        }
               if (!AcquisitionDate) {
          throw new Error('AcquisitionDate is required');
        }
               if (!AcquisitionTime) {
          throw new Error('AcquisitionTime is required');
        }
               const acquisitionDate: DateInterface = parseDA(AcquisitionDate);
        const acquisitionTime: TimeInterface = parseTM(AcquisitionTime);
        const acquisitionDateTime: FullDateInterface = combineDateTime(
          acquisitionDate,
          acquisitionTime
        );
               const frameDurationInSec = ActualFrameDuration / 1000;
        const decayConstant = Math.log(2) / RadionuclideHalfLife;
        const decayDuringFrame = decayConstant * frameDurationInSec;
        // TODO: double check this is correctly copied from QIBA pseudocode
        const averageCountRateTimeWithinFrameInSec =
          (1 / decayConstant) *
          Math.log(decayDuringFrame / (1 - Math.exp(-decayConstant)));
        const scanDateTimeAsNumber =
          Number(acquisitionDateTime) -
          FrameReferenceTime / 1000 +
          averageCountRateTimeWithinFrameInSec;
               const scanDate = new Date(scanDateTimeAsNumber);
        console.log('SIEMENS PATH');
        console.log(new Date(scanDateTimeAsNumber));
        return scanDate;
      });*/
    }
  }
}

function calculateSUVlbmScalingFactor(inputs) {
  const {
    PatientSex,
    PatientWeight,
    PatientSize
  } = inputs;
  let LBM;
  const bodyMassIndex = PatientWeight * PatientWeight / (PatientSize * PatientSize * 10000); // convert size in cm

  if (PatientSex === 'F') {
    LBM = 1.07 * PatientWeight - 120 * bodyMassIndex;
  } else if (PatientSex === 'M') {
    LBM = 1.1 * PatientWeight - 148 * bodyMassIndex;
  } else {
    throw new Error(`PatientSex is an invalid value: ${PatientSex}`);
  }

  return LBM * 1000; // convert in gr
}

function calculateSUVbsaScalingFactor(inputs) {
  const {
    PatientWeight,
    PatientSize
  } = inputs;
  let BSA = Math.pow(PatientWeight, 0.425) * Math.pow(PatientSize * 100, 0.725) * 71.84;
  return BSA;
}

/**
 * Calculate start time
 *
 * @export
 * @param {{
 *   RadiopharmaceuticalStartDateTime?: string;
 *   RadiopharmaceuticalStartTime?: string;
 *   SeriesDate?: string;
 * }} input
 * @returns {FullDateInterface}
 */

function calculateStartTime(input) {
  const {
    RadiopharmaceuticalStartDateTime,
    RadiopharmaceuticalStartTime,
    SeriesDate
  } = input;
  let time;
  let date;

  if (RadiopharmaceuticalStartDateTime) {
    return dateTimeToFullDateInterface(RadiopharmaceuticalStartDateTime);
  } else if (RadiopharmaceuticalStartTime && SeriesDate) {
    // start Date	is not explicit - assume	same as	Series Date;
    // but consider	spanning midnight
    // TODO: do we need some logic to check if the scan went over midnight?
    time = parseTM(RadiopharmaceuticalStartTime);
    date = parseDA(SeriesDate);
    return combineDateTime(date, time);
  }

  throw new Error(`Invalid input: ${input}`);
}

/**
 * The injected dose used to calculate SUV is corrected for the
 * decay that occurs between the time of injection and the start of the scan
 *
 * @param {InstanceMetadata[]} instances
 * @returns {number[]}
 */

function calculateDecayCorrection(instances) {
  const {
    RadionuclideTotalDose,
    RadionuclideHalfLife,
    RadiopharmaceuticalStartDateTime,
    RadiopharmaceuticalStartTime,
    SeriesDate
  } = instances[0];
  const scanTimes = calculateScanTimes(instances);
  const startTime = calculateStartTime({
    RadiopharmaceuticalStartDateTime,
    RadiopharmaceuticalStartTime,
    SeriesDate
  });
  return instances.map((_, index) => {
    const scanTime = scanTimes[index];
    const decayTimeInSec = scanTime.getTimeInSec() - startTime.getTimeInSec();

    if (decayTimeInSec < 0) {
      throw new Error('Decay time cannot be less than zero');
    }

    const decayedDose = RadionuclideTotalDose * Math.pow(2, -decayTimeInSec / RadionuclideHalfLife);
    return 1 / decayedDose;
  });
}

function arrayEquals(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
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


function calculateSUVScalingFactors(instances) {
  const {
    CorrectedImage,
    Units,
    PhilipsPETPrivateGroup,
    PatientWeight,
    PatientSex,
    PatientSize
  } = instances[0];

  if (!CorrectedImage.includes('ATTN') || !CorrectedImage.includes('DECY')) {
    throw new Error(`CorrectedImage must contain "ATTN" and "DECY": ${CorrectedImage}`);
  } // Sanity check that every instance provided has identical
  // values for series-level metadata. If not, the provided
  // data is invalid.


  const isSingleSeries = instances.every(instance => {
    return instance.Units === Units && arrayEquals(instance.CorrectedImage, CorrectedImage) && instance.PatientWeight === PatientWeight && instance.PatientSex === PatientSex && instance.PatientSize === PatientSize && instance.RadionuclideHalfLife === instances[0].RadionuclideHalfLife && instance.RadionuclideTotalDose === instances[0].RadionuclideTotalDose && instance.DecayCorrection === instances[0].DecayCorrection && instance.SeriesDate === instances[0].SeriesDate && instance.SeriesTime === instances[0].SeriesTime;
  });

  if (!isSingleSeries) {
    throw new Error('The set of instances does not appear to come from one Series. Every instance must have identical values for series-level metadata properties');
  }

  let decayCorrectionArray = new Array(instances.length);
  decayCorrectionArray = calculateDecayCorrection(instances);
  let results = new Array(instances.length);
  const weightInGrams = PatientWeight * 1000;

  if (Units === 'BQML') {
    results = decayCorrectionArray.map(function (value) {
      return value * weightInGrams;
    });
  } else if (Units === 'CNTS') {
    const hasValidSUVScaleFactor = instances.every(instance => {
      var _instance$PhilipsPETP, _instance$PhilipsPETP2;

      return instance.PhilipsPETPrivateGroup && ((_instance$PhilipsPETP = instance.PhilipsPETPrivateGroup) === null || _instance$PhilipsPETP === void 0 ? void 0 : _instance$PhilipsPETP.SUVScaleFactor) !== undefined && ((_instance$PhilipsPETP2 = instance.PhilipsPETPrivateGroup) === null || _instance$PhilipsPETP2 === void 0 ? void 0 : _instance$PhilipsPETP2.SUVScaleFactor) !== 0;
    });
    const hasValidActivityConcentrationScaleFactor = instances.every(instance => {
      var _instance$PhilipsPETP3, _instance$PhilipsPETP4, _instance$PhilipsPETP5;

      return instance.PhilipsPETPrivateGroup && !((_instance$PhilipsPETP3 = instance.PhilipsPETPrivateGroup) !== null && _instance$PhilipsPETP3 !== void 0 && _instance$PhilipsPETP3.SUVScaleFactor) && ((_instance$PhilipsPETP4 = instance.PhilipsPETPrivateGroup) === null || _instance$PhilipsPETP4 === void 0 ? void 0 : _instance$PhilipsPETP4.ActivityConcentrationScaleFactor) !== undefined && ((_instance$PhilipsPETP5 = instance.PhilipsPETPrivateGroup) === null || _instance$PhilipsPETP5 === void 0 ? void 0 : _instance$PhilipsPETP5.ActivityConcentrationScaleFactor) !== 0;
    }); //console.log(`hasValidSUVScaleFactor: ${hasValidSUVScaleFactor}`);
    //console.log(`hasValidActivityConcentrationScaleFactor: ${hasValidActivityConcentrationScaleFactor}`);

    if (hasValidSUVScaleFactor) {
      results = instances.map( // Added ! to tell Typescript that this can't be undefined, since we are testing it
      // in the .every loop above.
      instance => instance.PhilipsPETPrivateGroup.SUVScaleFactor);
    } else if (hasValidActivityConcentrationScaleFactor) {
      // if (0x7053,0x1000) not present, but (0x7053,0x1009) is present, then (0x7053,0x1009) * Rescale Slope,
      // scales pixels to Bq/ml, and proceed as if Units are BQML
      results = instances.map((instance, index) => {
        // Added ! to tell Typescript that this can't be undefined, since we are testing it
        // in the .every loop above.
        return instance.PhilipsPETPrivateGroup.ActivityConcentrationScaleFactor * decayCorrectionArray[index] * weightInGrams;
      });
    } else {
      throw new Error(`Units are in CNTS, but PhilipsPETPrivateGroup has invalid values: ${JSON.stringify(PhilipsPETPrivateGroup)}`);
    }
  } else if (Units === 'GML') {
    // assumes that GML indicates SUVbw instead of SUVlbm
    results.fill(1);
  } else {
    throw new Error(`Units has an invalid value: ${Units}`);
  } // get BSA


  let suvbsaFactor;

  if (PatientWeight && PatientSize) {
    const sulInputs = {
      PatientWeight,
      PatientSize
    };
    suvbsaFactor = calculateSUVbsaScalingFactor(sulInputs);
  } // get LBM


  let suvlbmFactor;

  if (PatientWeight && PatientSex && PatientSize) {
    const suvlbmInputs = {
      PatientWeight,
      PatientSex,
      PatientSize
    };
    suvlbmFactor = calculateSUVlbmScalingFactor(suvlbmInputs);
  }

  return results.map(function (result, index) {
    const factors = {
      suvbw: result
    };

    if (suvbsaFactor) {
      // multiply for BSA
      factors.suvbsa = decayCorrectionArray[index] * suvbsaFactor;
    }

    if (suvlbmFactor) {
      // multiply for LBM
      factors.suvlbm = decayCorrectionArray[index] * suvlbmFactor;
    } // factor formulaes taken from:
    // https://www.medicalconnections.co.uk/kb/calculating-suv-from-pet-images/


    return factors;
  });
}

exports.calculateSUVScalingFactors = calculateSUVScalingFactors;
//# sourceMappingURL=calculate-suv.cjs.development.js.map