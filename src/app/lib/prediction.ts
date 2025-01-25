import * as tf from "@tensorflow/tfjs";

// IMPORTANT: Must match training code
const globalMinYear = 1990;
const globalMaxYear = 2030;

/**
 * cyclical encoding
 */
function encodeCyclical(value: number, maxValue: number) {
  const sinVal = Math.sin((2 * Math.PI * value) / maxValue);
  const cosVal = Math.cos((2 * Math.PI * value) / maxValue);
  return [sinVal, cosVal];
}

/**
 * parseDateToFeatures matches the logic used during training:
 *   - yearScaled
 *   - cycMonthSin, cycMonthCos
 *   - cycDaySin, cycDayCos
 */
function parseDateToFeatures(dateString: string) {
  const date = new Date(dateString);
  const fullYear = date.getUTCFullYear();
  const yearScaled =
    (fullYear - globalMinYear) / (globalMaxYear - globalMinYear);

  // month in [1..12]
  const month = date.getUTCMonth() + 1;
  const [monthSin, monthCos] = encodeCyclical(month, 12);

  // day of year in [1..366]
  const startOfYear = new Date(fullYear, 0, 1);
  const dayIndex = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const dayOfYear = Math.max(1, Math.min(dayIndex, 366));
  const [daySin, dayCos] = encodeCyclical(dayOfYear, 366);

  return [yearScaled, monthSin, monthCos, daySin, dayCos];
}

let cachedModel: tf.LayersModel | null = null;

export interface PredictionResult {
  o3: {
    mean: number;
    maxValue: number;
    maxHour: number;
    aqi: number;
  };
  co: {
    mean: number;
    maxValue: number;
    maxHour: number;
    aqi: number;
  };
  so2: {
    mean: number;
    maxValue: number;
    maxHour: number;
    aqi: number;
  };
  no2: {
    mean: number;
    maxValue: number;
    maxHour: number;
    aqi: number;
  };
  overallAQI: number;
}

export async function loadModel() {
  if (cachedModel) return cachedModel;

  try {
    cachedModel = await tf.loadLayersModel(
      "/models/pollution-model/model.json"
    );
    return cachedModel;
  } catch (error) {
    console.error("Failed to load model:", error);
    throw new Error("Failed to load prediction model");
  }
}

export async function predict(
  date: string,
  longitude: number,
  latitude: number
): Promise<PredictionResult> {
  const model = await loadModel();

  // Prepare input using same transformations as training
  const [yearScaled, monthSin, monthCos, daySin, dayCos] =
    parseDateToFeatures(date);

  // Features = [ yearScaled, cycMonthSin, cycMonthCos, cycDaySin, cycDayCos, longitude, latitude ]
  const inputTensor = tf.tensor2d([
    [yearScaled, monthSin, monthCos, daySin, dayCos, longitude, latitude],
  ]);

  // Perform prediction
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const result = Array.from(prediction.dataSync()); // Float32Array of length 16

  // Dispose Tensors
  inputTensor.dispose();
  prediction.dispose();

  return {
    o3: {
      mean: result[0],
      maxValue: result[1],
      maxHour: result[2],
      aqi: result[3],
    },
    co: {
      mean: result[4],
      maxValue: result[5],
      maxHour: result[6],
      aqi: result[7],
    },
    so2: {
      mean: result[8],
      maxValue: result[9],
      maxHour: result[10],
      aqi: result[11],
    },
    no2: {
      mean: result[12],
      maxValue: result[13],
      maxHour: result[14],
      aqi: result[15],
    },
    overallAQI: Math.max(result[3], result[7], result[11], result[15]),
  };
}
