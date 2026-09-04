// Mock Service for Scrap Item AI scanning and estimated calculations
import { simulateDelay, calculateTotalValue } from "../utils/helpers";
import { mockMaterials } from "../data/mockData";
import { SCRAP_CATEGORIES } from "../utils/constants";
import * as tmImage from "@teachablemachine/image";

const MODEL_BASE_URL = "/AI_Model/";
let modelPromise;

const materialByLabel = {
  Battery: "mat_2",
  PCB: "mat_3",
  Television: "mat_6",
  "Washing Machine": "mat_5",
  Keyboard: "mat_3",
  Microwave: "mat_5",
  Mobile: "mat_3",
  Mouse: "mat_3",
  Player: "mat_3",
  Printer: "mat_3"
};

const loadScanModel = () => {
  if (!modelPromise) {
    modelPromise = tmImage.load(
      `${MODEL_BASE_URL}model.json`,
      `${MODEL_BASE_URL}metadata.json`
    );
  }
  return modelPromise;
};

const imageFromDataUrl = (imageSrc) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be read."));
    image.src = imageSrc;
  });

export const scanMaterial = async (imageSrc) => {
  if (!imageSrc) throw new Error("Please take or upload a photo first.");

  const [model, image] = await Promise.all([
    loadScanModel(),
    imageFromDataUrl(imageSrc)
  ]);
  const predictions = (await model.predict(image))
    .map(({ className, probability }) => ({
      label: className,
      confidence: Math.round(probability * 100)
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const topPrediction = predictions[0];
  const materialId = materialByLabel[topPrediction.label] || "mat_3";
  const detected = mockMaterials.find((material) => material.id === materialId) || mockMaterials[0];
  
  return {
    success: true,
    detectedMaterial: detected,
    detectedLabel: topPrediction.label,
    confidence: topPrediction.confidence,
    predictions: predictions.slice(0, 3),
    imagePreview: imageSrc || null
  };
};

export const getEstimatedPrice = async (materialId, weightKg) => {
  await simulateDelay(300);
  const material = mockMaterials.find(m => m.id === materialId) || mockMaterials[0];
  const totalValue = calculateTotalValue(material.pricePerKg, weightKg);
  
  return {
    material,
    weightKg: Number(weightKg) || 0,
    pricePerKg: material.pricePerKg,
    totalValue,
    calculatedAt: new Date().toISOString()
  };
};

export const getAllMaterials = async () => {
  await simulateDelay(200);
  return mockMaterials;
};

export const getMaterialCategories = async () => {
  return SCRAP_CATEGORIES;
};
