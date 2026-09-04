// Mock Service for Scrap Item AI scanning and estimated calculations
import { simulateDelay, calculateTotalValue } from "../utils/helpers";
import { mockMaterials } from "../data/mockData";
import { SCRAP_CATEGORIES } from "../utils/constants";

export const scanMaterial = async (imageSrc) => {
  await simulateDelay(1200); // simulate ML recognition delay
  // Pick random material or default to Copper Wire for demo
  const randomIndex = Math.floor(Math.random() * 3);
  const detected = mockMaterials[randomIndex] || mockMaterials[0];
  
  return {
    success: true,
    detectedMaterial: detected,
    confidence: detected.confidence,
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
