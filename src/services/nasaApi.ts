// NASA API Service for ASTRA-NET Dashboard
// APIs: DONKI (Space Weather), NEO (Near Earth Objects), APOD

const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'fARmnpKihXKQDPEsQPYofg8YDnEVU8JAMIoMZdH6';
const BASE_URL = 'https://api.nasa.gov';

// ============ DONKI API - Space Weather ============

export interface CMEData {
  activityID: string;
  startTime: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  link: string;
  note: string;
  instruments: Array<{ displayName: string }>;
  cmeAnalyses?: Array<{
    speed: number;
    type: string;
    latitude: number;
    longitude: number;
    halfAngle: number;
    isMostAccurate: boolean;
  }>;
}

export interface SolarFlareData {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string;
  classType: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  linkedEvents: Array<{ activityID: string }> | null;
}

export interface GeomagneticStormData {
  gstID: string;
  startTime: string;
  allKpIndex: Array<{
    observedTime: string;
    kpIndex: number;
    source: string;
  }>;
  linkedEvents: Array<{ activityID: string }> | null;
}

export interface SolarEnergeticParticle {
  sepID: string;
  eventTime: string;
  instruments: Array<{ displayName: string }>;
  linkedEvents: Array<{ activityID: string }> | null;
}

// ============ NEO API - Near Earth Objects ============

export interface NeoObject {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    close_approach_date_full: string;
    epoch_date_close_approach: number;
    relative_velocity: {
      kilometers_per_second: string;
      kilometers_per_hour: string;
    };
    miss_distance: {
      astronomical: string;
      lunar: string;
      kilometers: string;
    };
    orbiting_body: string;
  }>;
  is_sentry_object: boolean;
}

export interface NeoFeed {
  element_count: number;
  near_earth_objects: {
    [date: string]: NeoObject[];
  };
}

// ============ APOD API ============

export interface APODData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

// ============ API Functions ============

// Get date range for API calls (last N days)
const getDateRange = (days: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

// Fetch Coronal Mass Ejections (CME)
export const fetchCME = async (days: number = 30): Promise<CMEData[]> => {
  try {
    const { startDate, endDate } = getDateRange(days);
    const response = await fetch(
      `${BASE_URL}/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`
    );
    if (!response.ok) throw new Error('CME API failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching CME data:', error);
    return [];
  }
};

// Fetch Solar Flares
export const fetchSolarFlares = async (days: number = 30): Promise<SolarFlareData[]> => {
  try {
    const { startDate, endDate } = getDateRange(days);
    const response = await fetch(
      `${BASE_URL}/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`
    );
    if (!response.ok) throw new Error('Solar Flare API failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching solar flare data:', error);
    return [];
  }
};

// Fetch Geomagnetic Storms
export const fetchGeomagneticStorms = async (days: number = 30): Promise<GeomagneticStormData[]> => {
  try {
    const { startDate, endDate } = getDateRange(days);
    const response = await fetch(
      `${BASE_URL}/DONKI/GST?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`
    );
    if (!response.ok) throw new Error('GST API failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching geomagnetic storm data:', error);
    return [];
  }
};

// Fetch Solar Energetic Particles
export const fetchSolarParticles = async (days: number = 30): Promise<SolarEnergeticParticle[]> => {
  try {
    const { startDate, endDate } = getDateRange(days);
    const response = await fetch(
      `${BASE_URL}/DONKI/SEP?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`
    );
    if (!response.ok) throw new Error('SEP API failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching solar particle data:', error);
    return [];
  }
};

// Fetch Near Earth Objects for today and next 7 days
export const fetchNEO = async (): Promise<NeoFeed | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const response = await fetch(
      `${BASE_URL}/neo/rest/v1/feed?start_date=${today}&end_date=${weekAhead}&api_key=${NASA_API_KEY}`
    );
    if (!response.ok) throw new Error('NEO API failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    return null;
  }
};

// Fetch Astronomy Picture of the Day
export const fetchAPOD = async (): Promise<APODData | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}`
    );
    if (!response.ok) throw new Error('APOD API failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching APOD:', error);
    return null;
  }
};

// ============ Data Processing Functions ============

// Process CME data for dashboard display
export const processCMEData = (cmeData: CMEData[]) => {
  if (!cmeData || cmeData.length === 0) return null;
  
  const latestCME = cmeData[cmeData.length - 1];
  const analysis = latestCME.cmeAnalyses?.find(a => a.isMostAccurate) || latestCME.cmeAnalyses?.[0];
  
  return {
    earthDirected: latestCME.sourceLocation?.includes('00') || Math.abs(analysis?.longitude || 0) < 30,
    angle: analysis?.halfAngle || 0,
    speed: analysis?.speed || 0,
    startTime: latestCME.startTime,
    sourceLocation: latestCME.sourceLocation,
    activeRegion: latestCME.activeRegionNum,
    totalCMEs: cmeData.length,
  };
};

// Process Solar Flare data
export const processSolarFlares = (flareData: SolarFlareData[]) => {
  if (!flareData || flareData.length === 0) return [];
  
  // Get recent flares sorted by time
  const recentFlares = flareData
    .slice(-10)
    .reverse()
    .map(flare => ({
      id: flare.flrID,
      class: flare.classType.charAt(0) as 'C' | 'M' | 'X',
      fullClass: flare.classType,
      time: formatTimeAgo(flare.peakTime),
      severity: getFlareserverity(flare.classType),
      region: flare.activeRegionNum ? `AR${flare.activeRegionNum}` : 'Unknown',
      sourceLocation: flare.sourceLocation,
    }));
  
  return recentFlares;
};

// Process NEO data for dashboard
export const processNEOData = (neoData: NeoFeed | null) => {
  if (!neoData) return { asteroids: [], hazardousCount: 0, totalCount: 0 };
  
  const allAsteroids: NeoObject[] = [];
  Object.values(neoData.near_earth_objects).forEach(dayAsteroids => {
    allAsteroids.push(...dayAsteroids);
  });
  
  const hazardous = allAsteroids.filter(a => a.is_potentially_hazardous_asteroid);
  
  const processed = allAsteroids
    .sort((a, b) => {
      const distA = parseFloat(a.close_approach_data[0]?.miss_distance.kilometers || '999999999');
      const distB = parseFloat(b.close_approach_data[0]?.miss_distance.kilometers || '999999999');
      return distA - distB;
    })
    .slice(0, 10)
    .map(asteroid => ({
      id: asteroid.id,
      name: asteroid.name.replace(/[()]/g, ''),
      diameter: Math.round((asteroid.estimated_diameter.meters.estimated_diameter_min + 
                           asteroid.estimated_diameter.meters.estimated_diameter_max) / 2),
      velocity: Math.round(parseFloat(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_hour || '0')),
      distance: Math.round(parseFloat(asteroid.close_approach_data[0]?.miss_distance.kilometers || '0')),
      distanceLunar: parseFloat(asteroid.close_approach_data[0]?.miss_distance.lunar || '0').toFixed(2),
      isHazardous: asteroid.is_potentially_hazardous_asteroid,
      approachDate: asteroid.close_approach_data[0]?.close_approach_date,
    }));
  
  return {
    asteroids: processed,
    hazardousCount: hazardous.length,
    totalCount: neoData.element_count,
  };
};

// Process Geomagnetic Storm data
export const processGSTData = (gstData: GeomagneticStormData[]) => {
  if (!gstData || gstData.length === 0) return null;
  
  const latestStorm = gstData[gstData.length - 1];
  const maxKp = Math.max(...(latestStorm.allKpIndex?.map(k => k.kpIndex) || [0]));
  
  return {
    active: true,
    kpIndex: maxKp,
    startTime: latestStorm.startTime,
    id: latestStorm.gstID,
  };
};

// Helper: Format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// Helper: Get flare severity
const getFlareserverity = (classType: string): 'low' | 'moderate' | 'high' | 'extreme' => {
  const classLetter = classType.charAt(0);
  const magnitude = parseFloat(classType.substring(1)) || 1;
  
  if (classLetter === 'X') return magnitude >= 5 ? 'extreme' : 'high';
  if (classLetter === 'M') return magnitude >= 5 ? 'high' : 'moderate';
  return 'low';
};

// ============ Combined Data Fetch ============

export interface NASASpaceWeatherData {
  cme: ReturnType<typeof processCMEData>;
  flares: ReturnType<typeof processSolarFlares>;
  gst: ReturnType<typeof processGSTData>;
  neo: ReturnType<typeof processNEOData>;
  apod: APODData | null;
  lastUpdated: string;
  isLive: boolean;
}

export const fetchAllNASAData = async (): Promise<NASASpaceWeatherData> => {
  try {
    const [cmeData, flareData, gstData, neoData, apodData] = await Promise.all([
      fetchCME(30),
      fetchSolarFlares(30),
      fetchGeomagneticStorms(30),
      fetchNEO(),
      fetchAPOD(),
    ]);
    
    return {
      cme: processCMEData(cmeData),
      flares: processSolarFlares(flareData),
      gst: processGSTData(gstData),
      neo: processNEOData(neoData),
      apod: apodData,
      lastUpdated: new Date().toISOString(),
      isLive: true,
    };
  } catch (error) {
    console.error('Error fetching NASA data:', error);
    return {
      cme: null,
      flares: [],
      gst: null,
      neo: { asteroids: [], hazardousCount: 0, totalCount: 0 },
      apod: null,
      lastUpdated: new Date().toISOString(),
      isLive: false,
    };
  }
};

const nasaApiService = {
  fetchCME,
  fetchSolarFlares,
  fetchGeomagneticStorms,
  fetchSolarParticles,
  fetchNEO,
  fetchAPOD,
  fetchAllNASAData,
};

export default nasaApiService;
