import { create } from 'zustand';

// Solar data types
interface SolarData {
  activityIndex: number;
  solarWind: {
    speed: number;
    density: number;
    magneticField: number;
    trend: 'rising' | 'falling' | 'stable';
  };
  flares: Array<{
    id: string;
    class: 'C' | 'M' | 'X';
    time: string;
    severity: 'low' | 'moderate' | 'high' | 'extreme';
    region: string;
  }>;
  cme: {
    earthDirected: boolean;
    angle: number;
    timeToImpact: string;
    severity: 'low' | 'moderate' | 'high' | 'extreme';
    speed: number;
  };
  impactZones: {
    gps: 'normal' | 'degraded' | 'severe';
    aviation: 'normal' | 'elevated' | 'high';
    powerGrids: 'normal' | 'watch' | 'warning' | 'emergency';
  };
  weeklyActivity: Array<{ day: string; value: number }>;
  // NEW: Alert levels and prediction
  alertLevel: 'normal' | 'watch' | 'severe';
  predictionWindow: {
    nextFlare: string;
    confidence: number;
    expectedClass: string;
  };
  activeRegions: Array<{
    id: string;
    name: string;
    activity: number;
    risk: 'low' | 'moderate' | 'high' | 'extreme';
    position: { x: number; y: number };
  }>;
  dataSource: string;
  lastUpdate: string;
  kpIndex: number;
  protonFlux: number;
  xrayFlux: string;
}

// Earth hazard data types
interface HazardData {
  floods: Array<{ state: string; level: number; lat: number; lng: number }>;
  heatwaves: Array<{ state: string; level: number; lat: number; lng: number }>;
  wildfires: Array<{ state: string; level: number; lat: number; lng: number }>;
  rainfall: Array<{ state: string; anomaly: number; lat: number; lng: number }>;
  topStates: Array<{ name: string; risk: number; type: string }>;
  liveMetrics: {
    tempAnomaly: number;
    humidity: number;
    aqi: number;
    precipProbability: number;
  };
  alerts: Array<{
    id: string;
    type: string;
    title: string;
    source: string;
    time: string;
    severity: 'low' | 'moderate' | 'high' | 'extreme';
  }>;
  hotspots: Array<{
    location: string;
    type: string;
    level: string;
    description: string;
  }>;
  weeklyHazards: Array<{ day: string; flood: number; heat: number; fire: number }>;
  // NEW: Sector impact and storm simulation
  sectorImpact: {
    aviation: { status: string; details: string; risk: number };
    telecom: { status: string; details: string; risk: number };
    power: { status: string; details: string; risk: number };
    defense: { status: string; details: string; risk: number };
  };
  geomagneticStorm: {
    active: boolean;
    kpIndex: number;
    expectedDuration: string;
    impactZones: Array<{ region: string; risk: number }>;
  };
  historicalStorms: Array<{
    id: string;
    name: string;
    date: string;
    kpIndex: number;
    description: string;
  }>;
}

// Space data types
interface SpaceData {
  satellites: Array<{
    id: string;
    name: string;
    type: 'active' | 'debris';
    orbit: 'LEO' | 'MEO' | 'GEO';
    position: { x: number; y: number; z: number };
    status: 'operational' | 'degraded' | 'critical';
    signalStrength: number;
    vulnerabilityScore?: number;
    dragAlert?: boolean;
  }>;
  conjunctions: Array<{
    id: string;
    objectA: string;
    objectB: string;
    timeToApproach: string;
    severity: 'low' | 'moderate' | 'high';
    distance: number;
  }>;
  debrisDensity: {
    leo: number;
    meo: number;
    geo: number;
  };
  spaceWeatherImpact: {
    navigation: 'normal' | 'degraded' | 'severe';
    electronics: 'normal' | 'elevated' | 'high';
    communications: 'normal' | 'disrupted' | 'critical';
  };
  // NEW: Enhanced orbital data
  orbitalDecayAlerts: Array<{
    id: string;
    object: string;
    currentOrbit: string;
    decayRate: number;
    reentryEta: string;
    dragAlert: boolean;
  }>;
  debrisHotspots: Array<{
    id: string;
    region: string;
    altitude: string;
    density: number;
    objectCount: number;
  }>;
  operatorAlerts: Array<{
    id: string;
    type: 'maneuver' | 'collision' | 'decay' | 'solar';
    operator: string;
    message: string;
    severity: 'low' | 'moderate' | 'high';
    timestamp: string;
  }>;
  totalTrackedObjects: number;
  activeManeuvers: number;
}

interface DataState {
  solarData: SolarData;
  hazardData: HazardData;
  spaceData: SpaceData;
  unifiedThreatScore: number;
  updateSolarData: (data: Partial<SolarData>) => void;
  updateHazardData: (data: Partial<HazardData>) => void;
  updateSpaceData: (data: Partial<SpaceData>) => void;
  calculateUnifiedScore: () => void;
}

const initialSolarData: SolarData = {
  activityIndex: 65,
  solarWind: { speed: 450, density: 5.2, magneticField: 8.5, trend: 'rising' },
  flares: [
    { id: '1', class: 'M', time: '2 hours ago', severity: 'moderate', region: 'AR3664' },
    { id: '2', class: 'C', time: '6 hours ago', severity: 'low', region: 'AR3663' },
    { id: '3', class: 'X', time: '1 day ago', severity: 'extreme', region: 'AR3664' },
  ],
  cme: { earthDirected: true, angle: 15, timeToImpact: '48 hours', severity: 'moderate', speed: 1200 },
  impactZones: { gps: 'degraded', aviation: 'elevated', powerGrids: 'watch' },
  weeklyActivity: [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 52 },
    { day: 'Wed', value: 78 },
    { day: 'Thu', value: 65 },
    { day: 'Fri', value: 55 },
    { day: 'Sat', value: 70 },
    { day: 'Sun', value: 65 },
  ],
  alertLevel: 'watch',
  predictionWindow: {
    nextFlare: '6-12 hours',
    confidence: 72,
    expectedClass: 'M-Class',
  },
  activeRegions: [
    { id: 'AR3664', name: 'Region 3664', activity: 85, risk: 'high', position: { x: 30, y: 20 } },
    { id: 'AR3663', name: 'Region 3663', activity: 45, risk: 'moderate', position: { x: -20, y: 10 } },
    { id: 'AR3665', name: 'Region 3665', activity: 25, risk: 'low', position: { x: 50, y: -15 } },
    { id: 'AR3666', name: 'Region 3666', activity: 65, risk: 'moderate', position: { x: -40, y: -25 } },
  ],
  dataSource: 'ISRO Aditya-L1 Mission',
  lastUpdate: '2 minutes ago',
  kpIndex: 5,
  protonFlux: 3.2,
  xrayFlux: 'M2.5',
};

const initialHazardData: HazardData = {
  floods: [
    { state: 'Kerala', level: 85, lat: 10.8505, lng: 76.2711 },
    { state: 'Assam', level: 78, lat: 26.2006, lng: 92.9376 },
    { state: 'Bihar', level: 65, lat: 25.0961, lng: 85.3131 },
  ],
  heatwaves: [
    { state: 'Rajasthan', level: 92, lat: 27.0238, lng: 74.2179 },
    { state: 'Gujarat', level: 85, lat: 22.2587, lng: 71.1924 },
    { state: 'Maharashtra', level: 72, lat: 19.7515, lng: 75.7139 },
  ],
  wildfires: [
    { state: 'Uttarakhand', level: 68, lat: 30.0668, lng: 79.0193 },
    { state: 'Himachal Pradesh', level: 55, lat: 31.1048, lng: 77.1734 },
  ],
  rainfall: [
    { state: 'Mumbai', anomaly: 35, lat: 19.076, lng: 72.8777 },
    { state: 'Chennai', anomaly: -25, lat: 13.0827, lng: 80.2707 },
  ],
  topStates: [
    { name: 'Rajasthan', risk: 92, type: 'Heatwave' },
    { name: 'Kerala', risk: 85, type: 'Flood' },
    { name: 'Assam', risk: 78, type: 'Flood' },
    { name: 'Maharashtra', risk: 72, type: 'Heatwave' },
    { name: 'Uttarakhand', risk: 68, type: 'Wildfire' },
  ],
  liveMetrics: { tempAnomaly: 2.5, humidity: 65, aqi: 156, precipProbability: 45 },
  alerts: [
    { id: '1', type: 'cyclone', title: 'Cyclone Alert: Bay of Bengal', source: 'IMD', time: '1 hour ago', severity: 'high' },
    { id: '2', type: 'flood', title: 'Flood Warning: Assam', source: 'NDMA', time: '3 hours ago', severity: 'moderate' },
    { id: '3', type: 'heat', title: 'Heatwave Advisory: Rajasthan', source: 'IMD', time: '6 hours ago', severity: 'extreme' },
  ],
  hotspots: [
    { location: 'Mumbai', type: 'Urban Flood', level: 'High', description: 'Heavy rainfall expected' },
    { location: 'Rajasthan', type: 'Heatwave', level: 'Extreme', description: 'Temperature exceeding 45°C' },
    { location: 'Kerala', type: 'Landslide', level: 'Moderate', description: 'Saturated soil conditions' },
  ],
  weeklyHazards: [
    { day: 'Mon', flood: 30, heat: 60, fire: 20 },
    { day: 'Tue', flood: 45, heat: 65, fire: 25 },
    { day: 'Wed', flood: 60, heat: 70, fire: 30 },
    { day: 'Thu', flood: 55, heat: 80, fire: 35 },
    { day: 'Fri', flood: 70, heat: 85, fire: 40 },
    { day: 'Sat', flood: 65, heat: 75, fire: 35 },
    { day: 'Sun', flood: 50, heat: 70, fire: 30 },
  ],
  sectorImpact: {
    aviation: { status: 'Elevated', details: 'HF radio disruption possible over polar routes', risk: 65 },
    telecom: { status: 'Watch', details: 'Minor signal degradation expected', risk: 45 },
    power: { status: 'Alert', details: 'GIC risk elevated in northern grids', risk: 72 },
    defense: { status: 'Normal', details: 'All systems operational', risk: 25 },
  },
  geomagneticStorm: {
    active: true,
    kpIndex: 5,
    expectedDuration: '18-24 hours',
    impactZones: [
      { region: 'North India', risk: 75 },
      { region: 'Northeast', risk: 68 },
      { region: 'South India', risk: 45 },
      { region: 'West India', risk: 55 },
    ],
  },
  historicalStorms: [
    { id: '1', name: 'Halloween Storm', date: 'Oct 2003', kpIndex: 9, description: 'Caused widespread power outages in Sweden' },
    { id: '2', name: 'Bastille Day Event', date: 'Jul 2000', kpIndex: 9, description: 'One of the most powerful solar storms recorded' },
    { id: '3', name: 'Quebec Blackout', date: 'Mar 1989', kpIndex: 8, description: 'Collapsed Hydro-Quebec power grid' },
  ],
};

const initialSpaceData: SpaceData = {
  satellites: [
    { id: '1', name: 'INSAT-3D', type: 'active', orbit: 'GEO', position: { x: 0, y: 0, z: 42164 }, status: 'operational', signalStrength: 95, vulnerabilityScore: 25, dragAlert: false },
    { id: '2', name: 'Cartosat-3', type: 'active', orbit: 'LEO', position: { x: 0, y: 0, z: 509 }, status: 'operational', signalStrength: 88, vulnerabilityScore: 45, dragAlert: true },
    { id: '3', name: 'RISAT-2B', type: 'active', orbit: 'LEO', position: { x: 0, y: 0, z: 555 }, status: 'degraded', signalStrength: 72, vulnerabilityScore: 68, dragAlert: true },
    { id: '4', name: 'GSAT-30', type: 'active', orbit: 'GEO', position: { x: 0, y: 0, z: 35786 }, status: 'operational', signalStrength: 92, vulnerabilityScore: 20, dragAlert: false },
    { id: '5', name: 'NavIC-1', type: 'active', orbit: 'GEO', position: { x: 0, y: 0, z: 35786 }, status: 'operational', signalStrength: 98, vulnerabilityScore: 15, dragAlert: false },
    { id: '6', name: 'Debris-4521', type: 'debris', orbit: 'LEO', position: { x: 0, y: 0, z: 800 }, status: 'critical', signalStrength: 0 },
    { id: '7', name: 'Debris-7892', type: 'debris', orbit: 'MEO', position: { x: 0, y: 0, z: 20200 }, status: 'critical', signalStrength: 0 },
  ],
  conjunctions: [
    { id: '1', objectA: 'INSAT-3D', objectB: 'Debris-4521', timeToApproach: '12 hours', severity: 'moderate', distance: 2.5 },
    { id: '2', objectA: 'Cartosat-3', objectB: 'Cosmos Debris', timeToApproach: '36 hours', severity: 'low', distance: 8.2 },
    { id: '3', objectA: 'RISAT-2B', objectB: 'Unknown Object', timeToApproach: '6 hours', severity: 'high', distance: 0.8 },
  ],
  debrisDensity: { leo: 78, meo: 45, geo: 32 },
  spaceWeatherImpact: { navigation: 'degraded', electronics: 'elevated', communications: 'normal' },
  orbitalDecayAlerts: [
    { id: '1', object: 'Cartosat-3', currentOrbit: 'LEO 509km', decayRate: 2.5, reentryEta: '180 days', dragAlert: false },
    { id: '2', object: 'RISAT-2B', currentOrbit: 'LEO 555km', decayRate: 4.2, reentryEta: '95 days', dragAlert: true },
    { id: '3', object: 'Debris-4521', currentOrbit: 'LEO 380km', decayRate: 8.5, reentryEta: '45 days', dragAlert: true },
  ],
  debrisHotspots: [
    { id: '1', region: 'Sun-Synchronous Belt', altitude: '600-800 km', density: 85, objectCount: 4250 },
    { id: '2', region: 'ISS Corridor', altitude: '400-450 km', density: 72, objectCount: 2180 },
    { id: '3', region: 'Polar LEO', altitude: '750-900 km', density: 92, objectCount: 5640 },
    { id: '4', region: 'GEO Ring', altitude: '35786 km', density: 32, objectCount: 890 },
  ],
  operatorAlerts: [
    { id: '1', type: 'collision', operator: 'ISRO', message: 'RISAT-2B collision probability elevated - maneuver window in 6h', severity: 'high', timestamp: '15 min ago' },
    { id: '2', type: 'solar', operator: 'NOAA', message: 'G2 Storm Warning - satellite shielding protocols advised', severity: 'high', timestamp: '30 min ago' },
    { id: '3', type: 'maneuver', operator: 'ISRO', message: 'INSAT-3D station-keeping burn scheduled T+4h', severity: 'moderate', timestamp: '2 hours ago' },
    { id: '4', type: 'decay', operator: 'ESA', message: 'CryoSat-2 altitude maintenance required within 72h', severity: 'low', timestamp: '4 hours ago' },
  ],
  totalTrackedObjects: 28500,
  activeManeuvers: 3,
};

export const useDataStore = create<DataState>((set, get) => ({
  solarData: initialSolarData,
  hazardData: initialHazardData,
  spaceData: initialSpaceData,
  unifiedThreatScore: 58,
  updateSolarData: (data) =>
    set((state) => ({ solarData: { ...state.solarData, ...data } })),
  updateHazardData: (data) =>
    set((state) => ({ hazardData: { ...state.hazardData, ...data } })),
  updateSpaceData: (data) =>
    set((state) => ({ spaceData: { ...state.spaceData, ...data } })),
  calculateUnifiedScore: () => {
    const { solarData, hazardData, spaceData } = get();
    const solarScore = solarData.activityIndex * 0.3;
    const hazardScore = Math.max(...hazardData.topStates.map((s) => s.risk)) * 0.4;
    const spaceScore = ((spaceData.debrisDensity.leo + spaceData.debrisDensity.meo + spaceData.debrisDensity.geo) / 3) * 0.3;
    set({ unifiedThreatScore: Math.round(solarScore + hazardScore * 0.4 + spaceScore) });
  },
}));
