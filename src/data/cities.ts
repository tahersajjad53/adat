export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const CITIES: City[] = [
  // Holy Cities
  { id: 'mecca', name: 'Mecca', country: 'Saudi Arabia', countryCode: 'SA', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  { id: 'medina', name: 'Medina', country: 'Saudi Arabia', countryCode: 'SA', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
  
  // India
  { id: 'mumbai', name: 'Mumbai', country: 'India', countryCode: 'IN', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { id: 'surat', name: 'Surat', country: 'India', countryCode: 'IN', latitude: 21.1702, longitude: 72.8311, timezone: 'Asia/Kolkata' },
  { id: 'ahmedabad', name: 'Ahmedabad', country: 'India', countryCode: 'IN', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata' },
  { id: 'vadodara', name: 'Vadodara', country: 'India', countryCode: 'IN', latitude: 22.3072, longitude: 73.1812, timezone: 'Asia/Kolkata' },
  { id: 'udaipur', name: 'Udaipur', country: 'India', countryCode: 'IN', latitude: 24.5854, longitude: 73.7125, timezone: 'Asia/Kolkata' },
  { id: 'ujjain', name: 'Ujjain', country: 'India', countryCode: 'IN', latitude: 23.1765, longitude: 75.7885, timezone: 'Asia/Kolkata' },
  { id: 'indore', name: 'Indore', country: 'India', countryCode: 'IN', latitude: 22.7196, longitude: 75.8577, timezone: 'Asia/Kolkata' },
  { id: 'delhi', name: 'Delhi', country: 'India', countryCode: 'IN', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata' },
  { id: 'bangalore', name: 'Bangalore', country: 'India', countryCode: 'IN', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
  { id: 'chennai', name: 'Chennai', country: 'India', countryCode: 'IN', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
  { id: 'hyderabad', name: 'Hyderabad', country: 'India', countryCode: 'IN', latitude: 17.3850, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { id: 'kolkata', name: 'Kolkata', country: 'India', countryCode: 'IN', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata' },
  { id: 'pune', name: 'Pune', country: 'India', countryCode: 'IN', latitude: 18.5204, longitude: 73.8567, timezone: 'Asia/Kolkata' },
  
  // Pakistan
  { id: 'karachi', name: 'Karachi', country: 'Pakistan', countryCode: 'PK', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  
  // Sri Lanka
  { id: 'colombo', name: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', latitude: 6.9271, longitude: 79.8612, timezone: 'Asia/Colombo' },
  { id: 'kandy', name: 'Kandy', country: 'Sri Lanka', countryCode: 'LK', latitude: 7.2906, longitude: 80.6337, timezone: 'Asia/Colombo' },
  
  // Middle East
  { id: 'dubai', name: 'Dubai', country: 'UAE', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { id: 'abu-dhabi', name: 'Abu Dhabi', country: 'UAE', countryCode: 'AE', latitude: 24.4539, longitude: 54.3773, timezone: 'Asia/Dubai' },
  { id: 'sharjah', name: 'Sharjah', country: 'UAE', countryCode: 'AE', latitude: 25.3463, longitude: 55.4209, timezone: 'Asia/Dubai' },
  { id: 'muscat', name: 'Muscat', country: 'Oman', countryCode: 'OM', latitude: 23.5880, longitude: 58.3829, timezone: 'Asia/Muscat' },
  { id: 'manama', name: 'Manama', country: 'Bahrain', countryCode: 'BH', latitude: 26.2285, longitude: 50.5860, timezone: 'Asia/Bahrain' },
  { id: 'kuwait-city', name: 'Kuwait City', country: 'Kuwait', countryCode: 'KW', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait' },
  { id: 'doha', name: 'Doha', country: 'Qatar', countryCode: 'QA', latitude: 25.2854, longitude: 51.5310, timezone: 'Asia/Qatar' },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
  { id: 'jeddah', name: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', latitude: 21.5433, longitude: 39.1728, timezone: 'Asia/Riyadh' },
  
  // Africa
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', countryCode: 'KE', latitude: -1.2921, longitude: 36.8219, timezone: 'Africa/Nairobi' },
  { id: 'mombasa', name: 'Mombasa', country: 'Kenya', countryCode: 'KE', latitude: -4.0435, longitude: 39.6682, timezone: 'Africa/Nairobi' },
  { id: 'dar-es-salaam', name: 'Dar es Salaam', country: 'Tanzania', countryCode: 'TZ', latitude: -6.7924, longitude: 39.2083, timezone: 'Africa/Dar_es_Salaam' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', countryCode: 'EG', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  
  // UK/Europe
  { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 'manchester', name: 'Manchester', country: 'United Kingdom', countryCode: 'GB', latitude: 53.4808, longitude: -2.2426, timezone: 'Europe/London' },
  { id: 'birmingham', name: 'Birmingham', country: 'United Kingdom', countryCode: 'GB', latitude: 52.4862, longitude: -1.8904, timezone: 'Europe/London' },
  { id: 'paris', name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  
  // North America
  { id: 'new-york', name: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { id: 'chicago', name: 'Chicago', country: 'United States', countryCode: 'US', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { id: 'los-angeles', name: 'Los Angeles', country: 'United States', countryCode: 'US', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { id: 'houston', name: 'Houston', country: 'United States', countryCode: 'US', latitude: 29.7604, longitude: -95.3698, timezone: 'America/Chicago' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', countryCode: 'CA', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', countryCode: 'CA', latitude: 49.2827, longitude: -123.1207, timezone: 'America/Vancouver' },
  
  // Asia Pacific
  { id: 'singapore', name: 'Singapore', country: 'Singapore', countryCode: 'SG', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { id: 'hong-kong', name: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', latitude: 22.3193, longitude: 114.1694, timezone: 'Asia/Hong_Kong' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', countryCode: 'AU', latitude: -37.8136, longitude: 144.9631, timezone: 'Australia/Melbourne' },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', latitude: -36.8485, longitude: 174.7633, timezone: 'Pacific/Auckland' },
  { id: 'wellington', name: 'Wellington', country: 'New Zealand', countryCode: 'NZ', latitude: -41.2865, longitude: 174.7762, timezone: 'Pacific/Auckland' },
  { id: 'christchurch', name: 'Christchurch', country: 'New Zealand', countryCode: 'NZ', latitude: -43.5321, longitude: 172.6362, timezone: 'Pacific/Auckland' },
];

// Country flag emojis
export const COUNTRY_FLAGS: Record<string, string> = {
  SA: '🇸🇦',
  IN: '🇮🇳',
  PK: '🇵🇰',
  LK: '🇱🇰',
  AE: '🇦🇪',
  OM: '🇴🇲',
  BH: '🇧🇭',
  KW: '🇰🇼',
  QA: '🇶🇦',
  KE: '🇰🇪',
  TZ: '🇹🇿',
  EG: '🇪🇬',
  GB: '🇬🇧',
  FR: '🇫🇷',
  US: '🇺🇸',
  CA: '🇨🇦',
  SG: '🇸🇬',
  HK: '🇭🇰',
  AU: '🇦🇺',
  NZ: '🇳🇿',
};

// Group cities by country for display
export const getCitiesByCountry = (): Record<string, City[]> => {
  return CITIES.reduce((acc, city) => {
    if (!acc[city.country]) {
      acc[city.country] = [];
    }
    acc[city.country].push(city);
    return acc;
  }, {} as Record<string, City[]>);
};

export const findCityById = (id: string): City | undefined => {
  return CITIES.find(city => city.id === id);
};

export const findCityByCoords = (lat: number, lon: number): City | undefined => {
  // Find nearest city within ~50km
  const threshold = 0.5; // roughly 50km
  return CITIES.find(city => 
    Math.abs(city.latitude - lat) < threshold && 
    Math.abs(city.longitude - lon) < threshold
  );
};
