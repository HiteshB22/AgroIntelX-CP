import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cloud, CloudRain, CloudLightning, Sun, CloudDrizzle, 
  Wind, Droplets, Thermometer, Search, AlertTriangle, 
  CheckCircle, MapPin, Loader2, Info
} from "lucide-react";
import api from "../services/api";

const WeatherWidget = ({ defaultLocation = "" }) => {
  const [locationInput, setLocationInput] = useState("");
  const [currentLocation, setCurrentLocation] = useState(defaultLocation);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (loc = "") => {
    setLoading(true);
    setError("");
    try {
      const url = loc ? `/weather/forecast?location=${encodeURIComponent(loc)}` : "/weather/forecast";
      const response = await api.get(url);
      if (response.data && response.data.data) {
        setWeatherData(response.data.data);
        setCurrentLocation(response.data.data.location.name);
      } else {
        setError("Invalid weather data received.");
      }
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError(err.response?.data?.message || "Failed to fetch weather forecast.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(defaultLocation);
  }, [defaultLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (locationInput.trim()) {
      fetchWeather(locationInput);
    }
  };

  // Map Open-Meteo weather codes to dynamic React Lucide icons
  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="text-amber-500 w-10 h-10 animate-spin-slow" />;
    if ([1, 2, 3].includes(code)) return <Cloud className="text-sky-400 w-10 h-10" />;
    if ([45, 48].includes(code)) return <Cloud className="text-gray-400 w-10 h-10" />;
    if ([51, 53, 55].includes(code)) return <CloudDrizzle className="text-cyan-400 w-10 h-10" />;
    if ([61, 63, 65, 80, 81].includes(code)) return <CloudRain className="text-blue-500 w-10 h-10" />;
    if ([82, 95, 96, 99].includes(code)) return <CloudLightning className="text-purple-500 w-10 h-10 animate-bounce" />;
    return <Sun className="text-amber-500 w-10 h-10" />;
  };

  // Day formatter
  const formatDay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="glass rounded-[2rem] p-6 sm:p-8 shadow-xl border border-white/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-brand-500/10 to-blue-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-100/50 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            🌤️ Live weather & Forecast
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Dynamic 5-day weather-based farming planning & precautions
          </p>
        </div>

        {/* Dynamic Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search district/city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-500 bg-white/60 focus:bg-white text-sm font-medium transition-all shadow-sm"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <button type="submit" className="hidden" />
        </form>
      </div>

      {/* Loading & Error states */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader2 className="animate-spin text-brand-600 w-10 h-10 mb-4" />
            <p className="text-gray-500 font-semibold">Updating weather forecasts...</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-center gap-3"
          >
            <AlertTriangle size={20} className="shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {weatherData && !loading && (
          <motion.div 
            key="content" 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Current Weather Card */}
            <div className="grid lg:grid-cols-3 gap-6 bg-gradient-to-br from-brand-900/5 to-blue-900/5 rounded-2xl p-6 border border-brand-500/10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-md flex items-center justify-center shrink-0">
                  {getWeatherIcon(weatherData.forecast[0].weatherCode)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-brand-800 font-bold">
                    <MapPin size={16} />
                    <span>{weatherData.location.name}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {weatherData.forecast[0].tempMax}°C
                  </p>
                  <p className="text-sm font-bold text-gray-500">
                    {weatherData.forecast[0].description} (Today)
                  </p>
                </div>
              </div>

              {/* Stats column 1 */}
              <div className="flex flex-col justify-center gap-3 md:border-l border-gray-200/50 md:pl-6">
                <div className="flex items-center gap-3">
                  <Thermometer className="text-orange-500" size={18} />
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase">Temp Range</span>
                    <p className="text-sm font-bold text-gray-800">
                      {weatherData.forecast[0].tempMin}°C - {weatherData.forecast[0].tempMax}°C
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats column 2 */}
              <div className="flex flex-col justify-center gap-3 md:border-l border-gray-200/50 md:pl-6">
                <div className="flex items-center gap-3">
                  <Droplets className="text-blue-500" size={18} />
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase">Precipitation</span>
                    <p className="text-sm font-bold text-gray-800">
                      {weatherData.forecast[0].rainSum} mm
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wind className="text-teal-500" size={18} />
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase">Wind Speed</span>
                    <p className="text-sm font-bold text-gray-800">
                      {weatherData.forecast[0].windSpeed} km/h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast Grid */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                📅 5-Day Forecast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {weatherData.forecast.map((day, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 hover:shadow-md transition duration-300 flex flex-col items-center text-center shadow-sm"
                  >
                    <span className="text-xs font-extrabold text-gray-400 uppercase">
                      {formatDay(day.date)}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 mt-0.5">
                      {day.date.split("-").slice(1).reverse().join("/")}
                    </span>
                    <div className="my-3">{getWeatherIcon(day.weatherCode)}</div>
                    <span className="text-xs font-bold text-gray-700 block truncate w-full">
                      {day.description}
                    </span>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <span className="text-sm font-extrabold text-gray-800">{Math.round(day.tempMax)}°</span>
                      <span className="text-xs font-bold text-gray-400">/ {Math.round(day.tempMin)}°</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Agricultural Precautions */}
            <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-500/20">
              <div className="flex items-center gap-2.5 text-amber-800 font-bold mb-4">
                <AlertTriangle className="text-amber-600 animate-pulse" size={20} />
                <h3 className="text-base font-extrabold">Farming Precautions & Alerts</h3>
              </div>
              <div className="space-y-3">
                {weatherData.precautions.map((precaution, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                      {precaution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WeatherWidget;
