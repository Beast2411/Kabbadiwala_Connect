// Mock Service for Scrap Item AI scanning and estimated calculations
import { simulateDelay, calculateTotalValue } from "../utils/helpers";
import { mockMaterials } from "../data/mockData";
import { SCRAP_CATEGORIES } from "../utils/constants";
import * as tmImage from "@teachablemachine/image";

const MODEL_BASE_URL = "/AI_Model/";
let modelPromise;

const modelMaterials = {
  Battery: {
    id: "ai_battery",
    name: "Battery Scrap",
    category: "e_waste",
    pricePerKg: 95,
    unit: "kg",
    icon: "🔋",
    shortDescription: "Battery detected by the AI model. Handle as hazardous material.",
    safetyWarning: "Do not puncture or open batteries. Wear gloves and eye protection."
  },
  PCB: {
    id: "ai_pcb",
    name: "E-Waste PCB Board",
    category: "e_waste",
    pricePerKg: 240,
    unit: "kg",
    icon: "💻",
    shortDescription: "Circuit board detected by the AI model.",
    safetyWarning: "Do not break or crush circuit boards."
  },
  Television: {
    id: "ai_television",
    name: "Television Scrap",
    category: "e_waste",
    pricePerKg: 120,
    unit: "kg",
    icon: "📺",
    shortDescription: "Television detected by the AI model.",
    safetyWarning: "Handle screens carefully and avoid broken glass."
  },
  "Washing Machine": {
    id: "ai_washing_machine",
    name: "Washing Machine Scrap",
    category: "e_waste",
    pricePerKg: 190,
    unit: "kg",
    icon: "⚙️",
    shortDescription: "Washing machine detected by the AI model.",
    safetyWarning: "Disconnect power and watch for sharp metal edges."
  },
  Keyboard: {
    id: "ai_keyboard",
    name: "Keyboard Scrap",
    category: "e_waste",
    pricePerKg: 120,
    unit: "kg",
    icon: "⌨️",
    shortDescription: "Computer keyboard detected by the AI model.",
    safetyWarning: "Do not burn plastic parts."
  },
  Microwave: {
    id: "ai_microwave",
    name: "Microwave Scrap",
    category: "e_waste",
    pricePerKg: 80,
    unit: "kg",
    icon: "📦",
    shortDescription: "Microwave oven detected by the AI model.",
    safetyWarning: "Do not dismantle the high-voltage capacitor."
  },
  Mobile: {
    id: "ai_mobile",
    name: "Mobile Phone Scrap",
    category: "e_waste",
    pricePerKg: 650,
    unit: "kg",
    icon: "📱",
    shortDescription: "Mobile phone detected by the AI model.",
    safetyWarning: "Remove and isolate swollen batteries safely."
  },
  Mouse: {
    id: "ai_mouse",
    name: "Computer Mouse Scrap",
    category: "e_waste",
    pricePerKg: 100,
    unit: "kg",
    icon: "🖱️",
    shortDescription: "Computer mouse detected by the AI model.",
    safetyWarning: "Do not burn plastic parts."
  },
  Player: {
    id: "ai_player",
    name: "Media Player Scrap",
    category: "e_waste",
    pricePerKg: 90,
    unit: "kg",
    icon: "🎵",
    shortDescription: "Media player detected by the AI model.",
    safetyWarning: "Remove batteries before sorting."
  },
  Printer: {
    id: "ai_printer",
    name: "Printer Scrap",
    category: "e_waste",
    pricePerKg: 75,
    unit: "kg",
    icon: "🖨️",
    shortDescription: "Printer detected by the AI model.",
    safetyWarning: "Avoid toner dust and wear a mask while handling."
  }
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
  const detected = modelMaterials[topPrediction.label] || {
    ...mockMaterials[0],
    name: topPrediction.label,
    shortDescription: `${topPrediction.label} detected by the AI model.`
  };
  
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
