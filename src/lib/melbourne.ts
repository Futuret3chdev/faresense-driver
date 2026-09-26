export type GroupId =
  | "cbd"
  | "north"
  | "east"
  | "south"
  | "bayside"
  | "west"
  | "airport"
  | "outerEast"
  | "southEast";

export type Suburb = {
  id: string;
  name: string;
  group: GroupId;
  lat: number;
  lng: number;
};

export type Fence = {
  startId: string;
  radiusKm: number;
  groups: Record<GroupId, boolean>;
};

export const groups: { id: GroupId; name: string; hint: string }[] = [
  { id: "cbd", name: "CBD", hint: "City, Docklands, Carlton" },
  { id: "north", name: "Inner north", hint: "Fitzroy through Preston" },
  { id: "east", name: "Inner east", hint: "Richmond through Camberwell" },
  { id: "south", name: "Inner south", hint: "South Yarra through St Kilda" },
  { id: "bayside", name: "Bayside", hint: "Elwood through Mentone" },
  { id: "west", name: "Inner west", hint: "Footscray, Yarraville, Williamstown" },
  { id: "airport", name: "Airport & west", hint: "Tullamarine, Sunshine, Werribee" },
  { id: "outerEast", name: "Outer east", hint: "Box Hill, Doncaster, Ringwood" },
  { id: "southEast", name: "South-east", hint: "Clayton through Frankston" },
];

export const suburbs: Suburb[] = [
  { id: "melbourne", name: "Melbourne CBD", group: "cbd", lat: -37.8136, lng: 144.9631 },
  { id: "docklands", name: "Docklands", group: "cbd", lat: -37.815, lng: 144.946 },
  { id: "southbank", name: "Southbank", group: "cbd", lat: -37.823, lng: 144.964 },
  { id: "carlton", name: "Carlton", group: "cbd", lat: -37.8004, lng: 144.9672 },
  { id: "east-melbourne", name: "East Melbourne", group: "cbd", lat: -37.813, lng: 144.985 },
  { id: "north-melbourne", name: "North Melbourne", group: "cbd", lat: -37.802, lng: 144.948 },
  { id: "fitzroy", name: "Fitzroy", group: "north", lat: -37.798, lng: 144.978 },
  { id: "collingwood", name: "Collingwood", group: "north", lat: -37.802, lng: 144.988 },
  { id: "brunswick", name: "Brunswick", group: "north", lat: -37.766, lng: 144.96 },
  { id: "coburg", name: "Coburg", group: "north", lat: -37.744, lng: 144.964 },
  { id: "northcote", name: "Northcote", group: "north", lat: -37.772, lng: 144.998 },
  { id: "thornbury", name: "Thornbury", group: "north", lat: -37.758, lng: 144.998 },
  { id: "preston", name: "Preston", group: "north", lat: -37.742, lng: 145.007 },
  { id: "reservoir", name: "Reservoir", group: "north", lat: -37.716, lng: 145.007 },
  { id: "richmond", name: "Richmond", group: "east", lat: -37.823, lng: 144.998 },
  { id: "cremorne", name: "Cremorne", group: "east", lat: -37.828, lng: 144.993 },
  { id: "hawthorn", name: "Hawthorn", group: "east", lat: -37.822, lng: 145.032 },
  { id: "kew", name: "Kew", group: "east", lat: -37.807, lng: 145.031 },
  { id: "camberwell", name: "Camberwell", group: "east", lat: -37.83, lng: 145.069 },
  { id: "balwyn", name: "Balwyn", group: "east", lat: -37.809, lng: 145.067 },
  { id: "glen-iris", name: "Glen Iris", group: "east", lat: -37.859, lng: 145.058 },
  { id: "south-yarra", name: "South Yarra", group: "south", lat: -37.838, lng: 144.992 },
  { id: "prahran", name: "Prahran", group: "south", lat: -37.851, lng: 144.993 },
  { id: "windsor", name: "Windsor", group: "south", lat: -37.854, lng: 144.992 },
  { id: "st-kilda", name: "St Kilda", group: "south", lat: -37.864, lng: 144.982 },
  { id: "st-kilda-east", name: "St Kilda East", group: "south", lat: -37.863, lng: 145.001 },
  { id: "armadale", name: "Armadale", group: "south", lat: -37.855, lng: 145.019 },
  { id: "toorak", name: "Toorak", group: "south", lat: -37.841, lng: 145.018 },
  { id: "malvern", name: "Malvern", group: "south", lat: -37.862, lng: 145.028 },
  { id: "caulfield", name: "Caulfield", group: "south", lat: -37.877, lng: 145.023 },
  { id: "elwood", name: "Elwood", group: "bayside", lat: -37.882, lng: 144.986 },
  { id: "elsternwick", name: "Elsternwick", group: "bayside", lat: -37.884, lng: 145.001 },
  { id: "brighton", name: "Brighton", group: "bayside", lat: -37.906, lng: 144.999 },
  { id: "hampton", name: "Hampton", group: "bayside", lat: -37.938, lng: 145.001 },
  { id: "sandringham", name: "Sandringham", group: "bayside", lat: -37.953, lng: 145.004 },
  { id: "black-rock", name: "Black Rock", group: "bayside", lat: -37.971, lng: 145.017 },
  { id: "cheltenham", name: "Cheltenham", group: "bayside", lat: -37.967, lng: 145.054 },
  { id: "mentone", name: "Mentone", group: "bayside", lat: -37.982, lng: 145.065 },
  { id: "footscray", name: "Footscray", group: "west", lat: -37.8, lng: 144.9 },
  { id: "yarraville", name: "Yarraville", group: "west", lat: -37.816, lng: 144.89 },
  { id: "seddon", name: "Seddon", group: "west", lat: -37.808, lng: 144.891 },
  { id: "williamstown", name: "Williamstown", group: "west", lat: -37.86, lng: 144.898 },
  { id: "newport", name: "Newport", group: "west", lat: -37.844, lng: 144.883 },
  { id: "ascot-vale", name: "Ascot Vale", group: "west", lat: -37.775, lng: 144.922 },
  { id: "moonee-ponds", name: "Moonee Ponds", group: "west", lat: -37.766, lng: 144.922 },
  { id: "essendon", name: "Essendon", group: "west", lat: -37.755, lng: 144.916 },
  { id: "airport", name: "Melbourne Airport", group: "airport", lat: -37.669, lng: 144.851 },
  { id: "tullamarine", name: "Tullamarine", group: "airport", lat: -37.701, lng: 144.882 },
  { id: "keilor", name: "Keilor", group: "airport", lat: -37.716, lng: 144.83 },
  { id: "sunshine", name: "Sunshine", group: "airport", lat: -37.788, lng: 144.832 },
  { id: "st-albans", name: "St Albans", group: "airport", lat: -37.745, lng: 144.8 },
  { id: "deer-park", name: "Deer Park", group: "airport", lat: -37.767, lng: 144.77 },
  { id: "werribee", name: "Werribee", group: "airport", lat: -37.9, lng: 144.662 },
  { id: "hoppers", name: "Hoppers Crossing", group: "airport", lat: -37.883, lng: 144.7 },
  { id: "point-cook", name: "Point Cook", group: "airport", lat: -37.915, lng: 144.747 },
  { id: "tarneit", name: "Tarneit", group: "airport", lat: -37.836, lng: 144.668 },
  { id: "box-hill", name: "Box Hill", group: "outerEast", lat: -37.819, lng: 145.122 },
  { id: "doncaster", name: "Doncaster", group: "outerEast", lat: -37.785, lng: 145.124 },
  { id: "heidelberg", name: "Heidelberg", group: "outerEast", lat: -37.757, lng: 145.068 },
  { id: "ivanhoe", name: "Ivanhoe", group: "outerEast", lat: -37.769, lng: 145.041 },
  { id: "blackburn", name: "Blackburn", group: "outerEast", lat: -37.819, lng: 145.151 },
  { id: "ringwood", name: "Ringwood", group: "outerEast", lat: -37.815, lng: 145.229 },
  { id: "glen-waverley", name: "Glen Waverley", group: "outerEast", lat: -37.88, lng: 145.164 },
  { id: "mount-waverley", name: "Mount Waverley", group: "outerEast", lat: -37.877, lng: 145.129 },
  { id: "burwood", name: "Burwood", group: "outerEast", lat: -37.85, lng: 145.109 },
  { id: "clayton", name: "Clayton", group: "southEast", lat: -37.915, lng: 145.12 },
  { id: "oakleigh", name: "Oakleigh", group: "southEast", lat: -37.9, lng: 145.088 },
  { id: "springvale", name: "Springvale", group: "southEast", lat: -37.949, lng: 145.153 },
  { id: "noble-park", name: "Noble Park", group: "southEast", lat: -37.967, lng: 145.176 },
  { id: "dandenong", name: "Dandenong", group: "southEast", lat: -37.987, lng: 145.215 },
  { id: "keysborough", name: "Keysborough", group: "southEast", lat: -38.005, lng: 145.174 },
  { id: "cranbourne", name: "Cranbourne", group: "southEast", lat: -38.1, lng: 145.283 },
  { id: "narre-warren", name: "Narre Warren", group: "southEast", lat: -38.028, lng: 145.304 },
  { id: "mordialloc", name: "Mordialloc", group: "southEast", lat: -38.006, lng: 145.087 },
  { id: "chelsea", name: "Chelsea", group: "southEast", lat: -38.052, lng: 145.116 },
  { id: "frankston", name: "Frankston", group: "southEast", lat: -38.142, lng: 145.123 },
];

const suburbById = new Map(suburbs.map((suburb) => [suburb.id, suburb]));

export const BOUNDS = { west: 144.6, east: 145.4, north: -37.6, south: -38.18 };

export const defaultGroups = (): Record<GroupId, boolean> => ({
  cbd: true,
  north: true,
  east: true,
  south: true,
  bayside: true,
  west: true,
  airport: false,
  outerEast: false,
  southEast: false,
});

export const defaultFence: Fence = {
  startId: "richmond",
  radiusKm: 10,
  groups: defaultGroups(),
};

export const fencePresets: { id: string; name: string; blurb: string; fence: Fence }[] = [
  {
    id: "inner",
    name: "Inner",
    blurb: "10 km around Richmond. Airport, outer east, and the south-east stay off.",
    fence: defaultFence,
  },
  {
    id: "south",
    name: "South side",
    blurb: "Bayside and inner south, 14 km from Brighton. No west, no airport.",
    fence: {
      startId: "brighton",
      radiusKm: 14,
      groups: {
        cbd: true,
        north: false,
        east: true,
        south: true,
        bayside: true,
        west: false,
        airport: false,
        outerEast: false,
        southEast: false,
      },
    },
  },
  {
    id: "open",
    name: "All of Melbourne",
    blurb: "The shift the app wants. 40 km and every group, including Werribee.",
    fence: {
      startId: "richmond",
      radiusKm: 40,
      groups: {
        cbd: true,
        north: true,
        east: true,
        south: true,
        bayside: true,
        west: true,
        airport: true,
        outerEast: true,
        southEast: true,
      },
    },
  },
];

const FENCE_KEY = "deadhead_fence_v1";

export function suburbNamed(id: string) {
  return suburbById.get(id) ?? suburbs[0];
}

export function kmBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 100;
  const y = ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * 100;
  return { x, y };
}

export function radiusEllipse(km: number) {
  const midLat = (((BOUNDS.north + BOUNDS.south) / 2) * Math.PI) / 180;
  const widthKm = (BOUNDS.east - BOUNDS.west) * 111.32 * Math.cos(midLat);
  const heightKm = (BOUNDS.north - BOUNDS.south) * 110.574;
  return { rx: (km / widthKm) * 100, ry: (km / heightKm) * 100 };
}

export type FenceRow = { suburb: Suburb; km: number; in: boolean };

export function resolveFence(fence: Fence): FenceRow[] {
  const start = suburbNamed(fence.startId);
  return suburbs.map((suburb) => {
    const km = kmBetween(start, suburb);
    const groupOn = fence.groups[suburb.group] !== false;
    const inside = suburb.id === start.id || (groupOn && km <= fence.radiusKm + 0.05);
    return { suburb, km, in: inside };
  });
}

export type DropRead = {
  drop: Suburb;
  in: boolean;
  fromKm: number;
  backKm: number;
  backMin: number;
  via: string;
};

export function assessDrop(fence: Fence, dropId: string): DropRead {
  const rows = resolveFence(fence);
  const dropRow = rows.find((row) => row.suburb.id === dropId) ?? rows[0];
  if (dropRow.in) {
    return {
      drop: dropRow.suburb,
      in: true,
      fromKm: dropRow.km,
      backKm: 0,
      backMin: 0,
      via: dropRow.suburb.name,
    };
  }
  const inside = rows.filter((row) => row.in);
  let via = suburbNamed(fence.startId).name;
  let backKm = dropRow.km;
  for (const row of inside) {
    const km = kmBetween(dropRow.suburb, row.suburb);
    if (km < backKm) {
      backKm = km;
      via = row.suburb.name;
    }
  }
  return {
    drop: dropRow.suburb,
    in: false,
    fromKm: dropRow.km,
    backKm,
    backMin: Math.max(1, Math.round(backKm * 2.2)),
    via,
  };
}

export function loadFence(): Fence {
  if (typeof window === "undefined") return defaultFence;
  try {
    const raw = JSON.parse(localStorage.getItem(FENCE_KEY) || "null") as Partial<Fence> | null;
    if (!raw || !suburbById.has(String(raw.startId))) return defaultFence;
    const groupsOn = defaultGroups();
    for (const group of groups) {
      const value = raw.groups?.[group.id];
      if (typeof value === "boolean") groupsOn[group.id] = value;
    }
    const radius = Number(raw.radiusKm);
    return {
      startId: String(raw.startId),
      radiusKm: Number.isFinite(radius) ? Math.min(40, Math.max(4, radius)) : 10,
      groups: groupsOn,
    };
  } catch {
    return defaultFence;
  }
}

export function saveFence(fence: Fence) {
  localStorage.setItem(FENCE_KEY, JSON.stringify(fence));
}

export const KM_PER_MILE = 1.60934;
