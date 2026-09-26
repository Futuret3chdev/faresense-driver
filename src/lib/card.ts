export type Vehicle = {
  fuel: number;
  mpg: number;
  wear: number;
  floor: number;
  tip: number;
};

export type Offer = {
  payout: number;
  tripMiles: number;
  tripMin: number;
  pickupMiles: number;
  pickupMin: number;
};

export type VerdictKind = "take" | "borderline" | "skip" | "short";

export type LogItem = {
  id: string;
  at: number;
  decision: "accepted" | "declined";
  payout: number;
  hourly: number;
  net: number;
  kind: VerdictKind;
  pickupMiles: number;
};

export const IRS_H2_2026 = 0.76;

export const exampleOffer: Offer = {
  payout: 14.8,
  tripMiles: 7.2,
  tripMin: 18,
  pickupMiles: 3.4,
  pickupMin: 9,
};

export const defaultVehicle: Vehicle = {
  fuel: 3.89,
  mpg: 28,
  wear: 0.22,
  floor: 22,
  tip: 0,
};

const VEHICLE_KEY = "faresense_card_vehicle_v1";
const OFFER_KEY = "faresense_card_offer_v1";
const LOG_KEY = "faresense_card_log_v1";

export function num(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function score(offer: Offer, vehicle: Vehicle) {
  const mpg = vehicle.mpg > 0 ? vehicle.mpg : 0.01;
  const costPerMile = vehicle.fuel / mpg + vehicle.wear;
  const miles = Math.max(0, offer.tripMiles) + Math.max(0, offer.pickupMiles);
  const minutes = Math.max(0, offer.tripMin) + Math.max(0, offer.pickupMin);
  const vehicleCost = miles * costPerMile;
  const net = offer.payout + vehicle.tip - vehicleCost;
  const hourly = minutes > 0 ? net / (minutes / 60) : 0;
  const perMile = miles > 0 ? net / miles : 0;
  const irs = miles * IRS_H2_2026;
  const enough = offer.payout > 0 && miles > 0 && minutes > 0;
  let kind: VerdictKind = "short";
  if (enough && hourly < vehicle.floor) kind = "skip";
  else if (enough && hourly < vehicle.floor * 1.15) kind = "borderline";
  else if (enough) kind = "take";
  return { costPerMile, miles, minutes, vehicleCost, net, hourly, perMile, irs, kind };
}

export function loadVehicle(): Vehicle {
  return { ...defaultVehicle, ...read(VEHICLE_KEY) };
}

export function loadOffer(): Offer {
  return { ...exampleOffer, ...read(OFFER_KEY) };
}

export function loadLog(): LogItem[] {
  const raw = read(LOG_KEY);
  return Array.isArray(raw) ? raw.slice(0, 40) : [];
}

export function saveVehicle(vehicle: Vehicle) {
  write(VEHICLE_KEY, vehicle);
}

export function saveOffer(offer: Offer) {
  write(OFFER_KEY, offer);
}

export function saveLog(log: LogItem[]) {
  write(LOG_KEY, log.slice(0, 40));
}

function read(key: string) {
  if (typeof localStorage === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}
