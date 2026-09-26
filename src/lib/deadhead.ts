export type Zone = "dead" | "lukewarm" | "earning";

export type Offer = {
  payout: number;
  tip: number;
  tripMiles: number;
  tripMin: number;
  pickupMiles: number;
  pickupMin: number;
  backMiles: number;
  backMin: number;
  tolls: number;
  zone: Zone;
};

export type Vehicle = {
  fuelPrice: number;
  mpg: number;
  wear: number;
  floor: number;
};

export type Inputs = Offer & Vehicle;

export type VerdictKind = "take" | "strand" | "skip" | "stay";

export type Verdict = {
  kind: VerdictKind;
  title: string;
  text: string;
  cpm: number;
  outMiles: number;
  outMin: number;
  emptyMiles: number;
  emptyMin: number;
  tripHour: number;
  trueHour: number;
  tripNet: number;
  trueNet: number;
  emptyCost: number;
  needPayout: number;
  gap: number;
};

export type Preset = {
  id: string;
  name: string;
  blurb: string;
  offer: Offer;
};

export const defaultVehicle: Vehicle = {
  fuelPrice: 3.89,
  mpg: 28,
  wear: 0.22,
  floor: 22,
};

export const presets: Preset[] = [
  {
    id: "airport",
    name: "Airport red-eye",
    blurb: "Card looks rich. The lot is behind you and the city is asleep.",
    offer: {
      payout: 46,
      tip: 0,
      tripMiles: 28,
      tripMin: 40,
      pickupMiles: 6,
      pickupMin: 12,
      backMiles: 22,
      backMin: 35,
      tolls: 0,
      zone: "dead",
    },
  },
  {
    id: "culdesac",
    name: "Cul-de-sac",
    blurb: "Short suburban drop. Nothing picks up out there.",
    offer: {
      payout: 14.2,
      tip: 0,
      tripMiles: 8.4,
      tripMin: 24,
      pickupMiles: 3.1,
      pickupMin: 8,
      backMiles: 12,
      backMin: 20,
      tolls: 0,
      zone: "dead",
    },
  },
  {
    id: "bar",
    name: "Bar close",
    blurb: "Downtown is still paying. Going home empty would be the mistake.",
    offer: {
      payout: 21,
      tip: 4,
      tripMiles: 3.8,
      tripMin: 14,
      pickupMiles: 0.8,
      pickupMin: 4,
      backMiles: 4,
      backMin: 10,
      tolls: 0,
      zone: "earning",
    },
  },
  {
    id: "stadium",
    name: "Stadium exit",
    blurb: "Traffic eats the return, but you will catch something on the way.",
    offer: {
      payout: 29,
      tip: 2,
      tripMiles: 11,
      tripMin: 28,
      pickupMiles: 3.5,
      pickupMin: 10,
      backMiles: 8,
      backMin: 22,
      tolls: 0,
      zone: "lukewarm",
    },
  },
  {
    id: "bridge",
    name: "Bridge toll",
    blurb: "Fare looks fine until the toll comes out of your pocket tonight.",
    offer: {
      payout: 32,
      tip: 0,
      tripMiles: 9,
      tripMin: 22,
      pickupMiles: 2,
      pickupMin: 6,
      backMiles: 9,
      backMin: 20,
      tolls: 7.5,
      zone: "dead",
    },
  },
];

export const zones: { id: Zone; title: string; detail: string }[] = [
  {
    id: "dead",
    title: "Dead",
    detail: "Every mile and minute back is unpaid.",
  },
  {
    id: "lukewarm",
    title: "Lukewarm",
    detail: "A thin trip covers some of it. We still charge 55% of the miles and 70% of the time.",
  },
  {
    id: "earning",
    title: "Still earning",
    detail: "Stay where you drop. The ride home is optional, so it is not in the hourly.",
  },
];

const STORAGE_KEY = "deadhead_v1";

function finite(n: number, fallback = 0) {
  return Number.isFinite(n) ? n : fallback;
}

export function costPerMile(vehicle: Vehicle) {
  const mpg = Math.max(finite(vehicle.mpg, 28), 0.1);
  return finite(vehicle.fuelPrice, 3.89) / mpg + finite(vehicle.wear, 0.22);
}

export function analyze(input: Inputs): Verdict {
  const cpm = costPerMile(input);
  const outMiles = Math.max(finite(input.tripMiles), 0) + Math.max(finite(input.pickupMiles), 0);
  const outMin = Math.max(finite(input.tripMin), 0) + Math.max(finite(input.pickupMin), 0);
  const backMiles = Math.max(finite(input.backMiles), 0);
  const backMin = Math.max(finite(input.backMin), 0);

  let emptyMiles = 0;
  let emptyMin = 0;
  if (input.zone === "dead") {
    emptyMiles = backMiles;
    emptyMin = backMin;
  } else if (input.zone === "lukewarm") {
    emptyMiles = backMiles * 0.55;
    emptyMin = backMin * 0.7;
  }

  const gross = finite(input.payout) + finite(input.tip);
  const tolls = Math.max(finite(input.tolls), 0);
  const floor = finite(input.floor, 22);

  const tripVehicle = outMiles * cpm;
  const tripNet = gross - tolls - tripVehicle;
  const tripHour = tripNet / (Math.max(outMin, 1) / 60);

  const trueVehicle = (outMiles + emptyMiles) * cpm;
  const trueNet = gross - tolls - trueVehicle;
  const trueMinutes = Math.max(outMin + emptyMin, 1);
  const trueHour = trueNet / (trueMinutes / 60);
  const emptyCost = emptyMiles * cpm;
  const needPayout = floor * (trueMinutes / 60) - finite(input.tip) + tolls + trueVehicle;
  const gap = needPayout - finite(input.payout);

  const money0 = (n: number) => `$${Math.abs(n).toFixed(0)}`;

  let kind: VerdictKind;
  let title: string;
  let text: string;

  if (input.zone === "earning" && tripHour >= floor) {
    kind = "stay";
    title = "Take it. Stay there.";
    text =
      backMiles < 0.5
        ? `The card is about ${money0(tripHour)}/hr after the car, and the drop is still inside your fence. No empty ride home.`
        : `The card is about ${money0(tripHour)}/hr after the car. The drop still earns, so driving ${backMiles.toFixed(0)} miles home empty would invent a loss. Start the next trip where this one ends.`;
  } else if (input.zone === "earning") {
    kind = "skip";
    title = "Skip";
    text = `Even if the next trip starts at the drop, this is about ${money0(tripHour)}/hr against a ${money0(floor)} floor. A live zone does not rescue a thin fare.`;
  } else if (tripHour >= floor && trueHour < floor - 1) {
    kind = "strand";
    title = "Strand";
    const more = gap > 0 && gap < 1 ? "under a dollar" : money0(Math.max(gap, 0));
    text = `Uber's card is about ${money0(tripHour)}/hr. After the unpaid ride back it is ${money0(trueHour)}/hr. The hidden piece is ${money0(emptyCost)} and ${Math.round(emptyMin)} minutes. It needs ${more} more on the payout to clear your floor.`;
  } else if (trueHour >= floor - 1) {
    kind = "take";
    title = "Take it";
    text =
      trueHour >= floor
        ? `True hourly is about ${money0(trueHour)} after fuel, wear, tolls, and the ride back. The empty leg costs ${money0(emptyCost)} and you still clear ${money0(floor)}.`
        : `After the ride back you are a hair under ${money0(floor)}/hr. The empty leg costs ${money0(emptyCost)}. That is close enough to take.`;
  } else {
    kind = "skip";
    title = "Skip";
    text = `About ${money0(trueHour)}/hr once the car and the ride back are honest. Another ${money0(Math.max(gap, 0))} on the payout would be the floor. Being busy here is more expensive than waiting.`;
  }

  return {
    kind,
    title,
    text,
    cpm,
    outMiles,
    outMin,
    emptyMiles,
    emptyMin,
    tripHour,
    trueHour,
    tripNet,
    trueNet,
    emptyCost,
    needPayout,
    gap,
  };
}

export function defaultInputs(): Inputs {
  return { ...defaultVehicle, ...presets[0].offer };
}

export function loadInputs(): Inputs | null {
  if (typeof window === "undefined") return null;
  try {
    const own = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<Inputs> | null;
    const fare = JSON.parse(localStorage.getItem("faresense_v1") || "{}") as Partial<Vehicle>;
    const base = defaultInputs();
    const vehicleFromFare: Partial<Vehicle> = {};
    (["fuelPrice", "mpg", "wear", "floor"] as const).forEach((key) => {
      const raw = fare[key];
      const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
      if (Number.isFinite(n)) vehicleFromFare[key] = n;
    });
    if (!own) return { ...base, ...vehicleFromFare };
    return { ...base, ...vehicleFromFare, ...own };
  } catch {
    return null;
  }
}

export function saveInputs(input: Inputs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
}

export type Idea = {
  n: string;
  name: string;
  asks: string;
  missing: string;
};

export const ideas: Idea[] = [
  {
    n: "01",
    name: "WaitTax",
    asks: "The passenger is late. At what minute does the cancel fee beat sitting there?",
    missing:
      "Apps show a countdown. None price your floor against the cancel fee, the rating risk, and the pickup you already burned.",
  },
  {
    n: "02",
    name: "FilterTax",
    asks: "What does destination mode cost per hour in offers you never take?",
    missing:
      "Drivers feel the cone. Nobody turns the declined pile into the hourly wage you gave up to stay pointed home.",
  },
  {
    n: "03",
    name: "TollGhost",
    asks: "Is the toll inside the fare, or are you lending the bridge until Thursday?",
    missing:
      "The card shows one number. Cash leaves tonight. Reimbursement is a different screen, on a delay, and sometimes a no.",
  },
  {
    n: "04",
    name: "QuestPoison",
    asks: "Is the bonus paying you, or paying you to accept trips under your floor?",
    missing:
      "ShiftClose prices a leftover quest. It does not price the bad trips you must swallow to unlock it.",
  },
  {
    n: "05",
    name: "AirportDice",
    asks: "Lot queue, or one more hour on the street, using your fares instead of a city average?",
    missing: "Wait-time boards exist. A personal stay-on-the-street call, from your own airport history, does not.",
  },
  {
    n: "06",
    name: "TipMemory",
    asks: "Which hours and trip types tip you — not riders in your city, you.",
    missing:
      "Public tip maps are folklore. A private one-tap log after the drop (tipped, stiffed, cash) still is not a product.",
  },
  {
    n: "07",
    name: "RatingBudget",
    asks: "How many uncomfortable trips can you absorb before you fall through 4.85?",
    missing: "Drivers do this in their head and get the denominator wrong. The budget should be a number that moves.",
  },
  {
    n: "08",
    name: "TwoCarWeek",
    asks: "Rental week versus your own car, including the dead Saturday the rental already paid for?",
    missing: "Lease calculators ignore the forced Saturday and the per-mile overage that starts Thursday night.",
  },
  {
    n: "09",
    name: "BreakPays",
    asks: "Does a 25-minute meal beat sitting through a dead pocket?",
    missing:
      "Break apps are timers. Missing is whether the break lands you in the next worthwhile window or just burns a quest clock.",
  },
  {
    n: "10",
    name: "ShareCut",
    asks: "A shared add-on looks like more money. What does the second pickup do to the hourly?",
    missing: "The chain arrives mid-trip. The detour minutes were never on the original card.",
  },
  {
    n: "11",
    name: "CashoutDrag",
    asks: "What is instant pay as an hourly rate, not a $1.25 fee?",
    missing: "“It’s only a dollar” hides how expensive it is to be paid tonight instead of Monday.",
  },
  {
    n: "12",
    name: "InsuranceClock",
    asks: "Right now, are you in period 1, 2, or 3 — and what would a crash actually hit?",
    missing: "Explainers exist. A live shift clock that says which coverage you are standing in does not.",
  },
  {
    n: "13",
    name: "ComebackMile",
    asks: "What does the next offer have to pay to repair the last twenty minutes?",
    missing: "Offer graders score the card in front of you. They ignore the hole you are already in.",
  },
  {
    n: "14",
    name: "WeatherFloor",
    asks: "Rain mode that raises your floor and your per-mile wear, instead of worshipping surge.",
    missing: "Surge is a multiplier on a fare that got slower, wetter, and more likely to cancel.",
  },
  {
    n: "15",
    name: "StackClock",
    asks: "The chained offer versus a hard stop — school, a flight, a second job.",
    missing: "Money tools assume the shift is open-ended. Most shifts are not.",
  },
];
