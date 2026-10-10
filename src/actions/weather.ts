"use server";

import { prisma } from "@/lib/prisma";

export interface WeatherData {
  temp: number;
  code: number;
  windSpeed: number;
  city: string | null;
}

// Local weather via Open-Meteo (no API key). Lat/lon configurable via settings.
export async function getWeather(): Promise<WeatherData | null> {
  let lat = "35.0128"; // Protaras
  let lon = "34.0553";
  try {
    const [latS, lonS] = await Promise.all([
      prisma.setting.findFirst({ where: { key: "weather_lat" } }),
      prisma.setting.findFirst({ where: { key: "weather_lon" } }),
    ]);
    if (latS?.value) lat = latS.value;
    if (lonS?.value) lon = lonS.value;
  } catch {
    // fall through to defaults on DB error
  }

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
        lat
      )}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,weather_code,wind_speed_10m`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const j = await res.json();
    const c = j?.current;
    if (!c) return null;
    return {
      temp: c.temperature_2m,
      code: c.weather_code,
      windSpeed: c.wind_speed_10m,
      city: null,
    };
  } catch {
    return null;
  }
}