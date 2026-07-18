export type UnitSystem = "metric" | "imperial";

const KG_TO_LB = 2.2046226218;

export function kgToDisplay(weightKg: number, unitSystem: UnitSystem) {
  return unitSystem === "imperial" ? weightKg * KG_TO_LB : weightKg;
}

export function displayToKg(weight: number, unitSystem: UnitSystem) {
  return unitSystem === "imperial" ? weight / KG_TO_LB : weight;
}

export function formatWeight(weightKg: number, unitSystem: UnitSystem) {
  const value = kgToDisplay(weightKg, unitSystem);
  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${unitSystem === "imperial" ? "lb" : "kg"}`;
}

export function unitLabel(unitSystem: UnitSystem) {
  return unitSystem === "imperial" ? "lb" : "kg";
}
