import { get5DayForecast, getUserLatestLocation } from "../services/weatherService.js";

export const getWeatherForecast = async (req, res) => {
  try {
    let location = req.query.location;
    
    // If no location provided, fetch the user's latest soil report location
    if (!location) {
      location = await getUserLatestLocation(req.user._id);
    }

    console.log(`Fetching 5-day weather forecast for: ${location}`);
    const weatherData = await get5DayForecast(location);

    return res.status(200).json({
      message: "Weather forecast fetched successfully",
      data: weatherData,
    });
  } catch (error) {
    console.error("Error in getWeatherForecast controller:", error.message);
    return res.status(500).json({
      message: "Failed to fetch weather forecast",
      error: error.message,
    });
  }
};
