"use client"

import type React from "react"

import { useState } from "react"
import { useWeather } from "@/hooks/use-weather"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Wind,
} from "lucide-react"

export function WeatherWidget() {
  const [location, setLocation] = useState("New York")
  const [searchInput, setSearchInput] = useState("")
  const { weather, isLoading, isError, mutate } = useWeather(location)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setLocation(searchInput.trim())
    }
  }

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sun":
        return <Sun className="h-10 w-10 text-amber-500" />
      case "cloud-sun":
        return <Cloud className="h-10 w-10 text-blue-400" />
      case "cloud":
        return <Cloud className="h-10 w-10 text-slate-400" />
      case "cloud-rain":
        return <CloudRain className="h-10 w-10 text-blue-500" />
      case "cloud-lightning":
        return <CloudLightning className="h-10 w-10 text-amber-500" />
      case "cloud-snow":
        return <CloudSnow className="h-10 w-10 text-blue-200" />
      case "cloud-fog":
        return <CloudFog className="h-10 w-10 text-slate-300" />
      default:
        return <Cloud className="h-10 w-10 text-slate-400" />
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-slate-100 flex items-center text-base">
          <CloudDrizzle className="mr-2 h-5 w-5 text-blue-500" />
          Weather Integration
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400"
          onClick={() => mutate()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
          <Input
            placeholder="Enter location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-slate-800/50 border-slate-700 text-slate-100"
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="text-center py-4 text-red-400">Failed to load weather data. Please try again.</div>
        ) : weather ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-cyan-500 mr-1" />
              <span className="text-slate-300">{weather.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getWeatherIcon(weather.icon)}
                <div className="ml-3">
                  <div className="text-3xl font-bold text-slate-100">{weather.temperature}°C</div>
                  <div className="text-slate-400">{weather.condition}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
              <div className="flex items-center">
                <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-slate-400">Humidity: {weather.humidity}%</span>
              </div>
              <div className="flex items-center">
                <Wind className="h-4 w-4 text-cyan-500 mr-2" />
                <span className="text-sm text-slate-400">Wind: {weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
