import axios from "axios";
import SoilReport from "../models/SoilReport.js";

// Cache for geocoding and forecasts to optimize weather API limit hits (rate limiting)
const geocodeCache = new Map();
export const forecastCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Detects regional language details based on Indian district and state name.
 * Defaults to Hindi if no strong match is found.
 */
export const getLanguageFromLocation = (districtName, stateName) => {
  const dist = (districtName || "").trim().toLowerCase();
  const state = (stateName || "").trim().toLowerCase();

  const districtLanguageMap = {
    "ahmednagar": { name: "Marathi", code: "mr", flag: "MH" },
    "satara": { name: "Marathi", code: "mr", flag: "MH" },
    "kolhapur": { name: "Marathi", code: "mr", flag: "MH" },
    "nanded": { name: "Marathi", code: "mr", flag: "MH" },
    "solapur": { name: "Marathi", code: "mr", flag: "MH" },
    "sangli": { name: "Marathi", code: "mr", flag: "MH" },
    "pune": { name: "Marathi", code: "mr", flag: "MH" },
    "mumbai": { name: "Marathi", code: "mr", flag: "MH" },
    "thane": { name: "Marathi", code: "mr", flag: "MH" },
    "nayagarh": { name: "Odia", code: "or", flag: "OR" },
    "khordha": { name: "Odia", code: "or", flag: "OR" },
    "bhubaneswar": { name: "Odia", code: "or", flag: "OR" },
    "himatnagar": { name: "Gujarati", code: "gu", flag: "GJ" },
    "sabarkantha": { name: "Gujarati", code: "gu", flag: "GJ" },
    "ahmedabad": { name: "Gujarati", code: "gu", flag: "GJ" },
    "surat": { name: "Gujarati", code: "gu", flag: "GJ" },
    "rajkot": { name: "Gujarati", code: "gu", flag: "GJ" },
  };

  const stateLanguageMap = {
    "maharashtra": { name: "Marathi", code: "mr" },
    "gujarat": { name: "Gujarati", code: "gu" },
    "punjab": { name: "Punjabi", code: "pa" },
    "karnataka": { name: "Kannada", code: "kn" },
    "tamil nadu": { name: "Tamil", code: "ta" },
    "andhra pradesh": { name: "Telugu", code: "te" },
    "telangana": { name: "Telugu", code: "te" },
    "west bengal": { name: "Bengali", code: "bn" },
    "odisha": { name: "Odia", code: "or" },
    "kerala": { name: "Malayalam", code: "ml" },
    "uttar pradesh": { name: "Hindi", code: "hi" },
    "bihar": { name: "Hindi", code: "hi" },
    "madhya pradesh": { name: "Hindi", code: "hi" },
    "rajasthan": { name: "Hindi", code: "hi" },
    "haryana": { name: "Hindi", code: "hi" },
    "himachal pradesh": { name: "Hindi", code: "hi" },
    "uttarakhand": { name: "Hindi", code: "hi" },
    "delhi": { name: "Hindi", code: "hi" },
  };

  // 1. Check district matches first
  if (dist && districtLanguageMap[dist]) {
    return districtLanguageMap[dist];
  }

  // 2. Check state matches next
  if (state && stateLanguageMap[state]) {
    return stateLanguageMap[state];
  }

  // 3. Check substring of state or district for matching keywords
  for (const [sName, langInfo] of Object.entries(stateLanguageMap)) {
    if (state.includes(sName) || dist.includes(sName)) {
      return langInfo;
    }
  }

  // Default to Hindi
  return { name: "Hindi", code: "hi" };
};

/**
 * Geocodes a city/district name to latitude and longitude using Open-Meteo's free geocoding API.
 */
export const geocodeLocation = async (locationName) => {
  const cacheKey = (locationName || "").trim().toLowerCase();
  
  // Return cached result if fresh to prevent API rate limiting
  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[Geocode Cache Hit] Using cached coords for: ${locationName}`);
      return cached.data;
    }
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      locationName
    )}&count=1&language=en&format=json`;
    const response = await axios.get(url);
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const geoResult = {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name,
        country: result.country,
        admin1: result.admin1, // state/region
      };
      
      // Store in memory cache
      geocodeCache.set(cacheKey, { timestamp: Date.now(), data: geoResult });
      return geoResult;
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
};

/**
 * Maps Open-Meteo weather codes to human-readable weather descriptions and icons.
 */
export const getWeatherDesc = (code) => {
  const mapping = {
    0: { desc: "Clear sky", icon: "☀️" },
    1: { desc: "Mainly clear", icon: "🌤️" },
    2: { desc: "Partly cloudy", icon: "⛅" },
    3: { desc: "Overcast", icon: "☁️" },
    45: { desc: "Fog", icon: "🌫️" },
    48: { desc: "Depositing rime fog", icon: "🌫️" },
    51: { desc: "Light drizzle", icon: "🌦️" },
    53: { desc: "Moderate drizzle", icon: "🌦️" },
    55: { desc: "Dense drizzle", icon: "🌦️" },
    61: { desc: "Slight rain", icon: "🌧️" },
    63: { desc: "Moderate rain", icon: "🌧️" },
    65: { desc: "Heavy rain", icon: "🌧️" },
    80: { desc: "Slight rain showers", icon: "🌧️" },
    81: { desc: "Moderate rain showers", icon: "🌧️" },
    82: { desc: "Violent rain showers", icon: "⛈️" },
    95: { desc: "Thunderstorm", icon: "⛈️" },
    96: { desc: "Thunderstorm with slight hail", icon: "⛈️" },
    99: { desc: "Thunderstorm with heavy hail", icon: "⛈️" },
  };
  return mapping[code] || { desc: "Cloudy", icon: "☁️" };
};

/**
 * Suggests precautions based on weather forecasts.
 */
export const getWeatherPrecautions = (forecastDays) => {
  const precautions = [];
  let heavyRain = false;
  let highWind = false;
  let extremeHeat = false;
  let lowTemp = false;

  forecastDays.forEach((day) => {
    if (day.rainSum > 10 || [65, 82, 95, 96, 99].includes(day.weatherCode)) {
      heavyRain = true;
    }
    if (day.windSpeed > 25) {
      highWind = true;
    }
    if (day.tempMax > 38) {
      extremeHeat = true;
    }
    if (day.tempMin < 10) {
      lowTemp = true;
    }
  });

  if (heavyRain) {
    precautions.push("Heavy rainfall is expected. Ensure proper drainage in your fields to prevent waterlogging and root rot. Avoid applying fertilizers or pesticides just before it rains as they might wash away.");
  }
  if (highWind) {
    precautions.push("Strong winds forecasted. Provide mechanical support to tall crops/young saplings. Postpone any spraying activities to prevent drift.");
  }
  if (extremeHeat) {
    precautions.push("Extreme high temperatures predicted. Increase irrigation frequency, preferably in the early morning or late evening, to reduce evapotranspiration. Consider mulching to retain soil moisture.");
  }
  if (lowTemp) {
    precautions.push("Cooler temperatures forecasted. Monitor sensitive crops for frost damage. Light evening irrigation can help keep soil temperature slightly higher.");
  }

  if (precautions.length === 0) {
    precautions.push("Weather conditions look stable and favorable for general farming activities. Keep up with standard crop monitoring and optimal watering schedules.");
  }

  return precautions;
};

/**
 * Fetches 5-day weather forecast using Open-Meteo.
 */
export const get5DayForecast = async (locationName) => {
  const cacheKey = (locationName || "").trim().toLowerCase();

  // Return cached result if fresh to prevent API rate limiting
  if (forecastCache.has(cacheKey)) {
    const cached = forecastCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[Forecast Cache Hit] Using cached forecast for: ${locationName}`);
      return cached.data;
    }
  }

  const geo = await geocodeLocation(locationName);
  if (!geo) {
    throw new Error(`Could not find coordinates for location: ${locationName}`);
  }

  const { lat, lon, name, country, admin1 } = geo;
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max,weathercode&timezone=auto`;

  const response = await axios.get(forecastUrl);
  const daily = response.data.daily;

  if (!daily || !daily.time) {
    throw new Error("Invalid forecast data received from Open-Meteo");
  }

  const forecastDays = [];
  // Build a 5-day forecast
  for (let i = 0; i < 5; i++) {
    const code = daily.weathercode[i];
    const { desc, icon } = getWeatherDesc(code);
    forecastDays.push({
      date: daily.time[i],
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      rainSum: daily.rain_sum[i],
      windSpeed: daily.wind_speed_10m_max[i],
      weatherCode: code,
      description: desc,
      icon: icon,
    });
  }

  const precautions = getWeatherPrecautions(forecastDays);

  const result = {
    location: {
      name,
      state: admin1,
      country,
      lat,
      lon,
    },
    forecast: forecastDays,
    precautions,
  };

  // Store in memory cache
  forecastCache.set(cacheKey, { timestamp: Date.now(), data: result });

  return result;
};

/**
 * Resolves the location of the user's latest soil report.
 * Defaults to "Mumbai" if none is found.
 */
export const getUserLatestLocation = async (userId) => {
  try {
    const latestReport = await SoilReport.findOne({ userId }).sort({ createdAt: -1 });
    if (latestReport && latestReport.extracted_input_data && latestReport.extracted_input_data.district) {
      return latestReport.extracted_input_data.district;
    }
    return "Mumbai"; // Default fallback
  } catch (error) {
    console.error("Error retrieving user location:", error.message);
    return "Mumbai";
  }
};
