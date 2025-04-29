"use client"

import { useState } from "react"
import { Download, FileJson, FileSpreadsheet, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  useSystemMetrics,
  useProcesses,
  useStorage,
  useAlerts,
  useMessages,
  usePerformanceData,
} from "@/hooks/use-data"
import {
  exportSystemMetrics,
  exportProcesses,
  exportStorage,
  exportAlerts,
  exportMessages,
  exportPerformanceData,
  exportAllData,
} from "@/lib/export"

export function DataExport() {
  const [open, setOpen] = useState(false)
  const [exportType, setExportType] = useState<string>("all")
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("json")

  const { metrics } = useSystemMetrics()
  const { processes } = useProcesses()
  const { storage } = useStorage()
  const { alerts } = useAlerts()
  const { messages } = useMessages()
  const { performanceData } = usePerformanceData()

  const handleExport = () => {
    if (!metrics || !processes || !storage || !alerts || !messages || !performanceData) {
      alert("Some data is not available for export")
      return
    }

    switch (exportType) {
      case "metrics":
        exportSystemMetrics(metrics, exportFormat)
        break
      case "processes":
        exportProcesses(processes, exportFormat)
        break
      case "storage":
        exportStorage(storage, exportFormat)
        break
      case "alerts":
        exportAlerts(alerts, exportFormat)
        break
      case "messages":
        exportMessages(messages, exportFormat)
        break
      case "performance":
        exportPerformanceData(performanceData, exportFormat)
        break
      case "all":
        exportAllData(metrics, processes, storage, alerts, messages, performanceData, exportFormat)
        break
      default:
        alert("Invalid export type")
    }

    setOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50">
            <Download className="h-4 w-4 mr-2" />
            Export Data
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-900 border-slate-700 text-slate-100">
          <DropdownMenuLabel>Quick Export</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem
            className="flex items-center cursor-pointer hover:bg-slate-800"
            onClick={() => {
              if (metrics) exportSystemMetrics(metrics, "json")
            }}
          >
            <FileJson className="h-4 w-4 mr-2 text-cyan-500" />
            System Metrics (JSON)
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center cursor-pointer hover:bg-slate-800"
            onClick={() => {
              if (processes) exportProcesses(processes, "csv")
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
            Processes (CSV)
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem
            className="flex items-center cursor-pointer hover:bg-slate-800"
            onClick={() => setOpen(true)}
          >
            <Download className="h-4 w-4 mr-2 text-blue-500" />
            Advanced Export...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Export Dashboard Data</DialogTitle>
            <DialogDescription className="text-slate-400">
              Choose what data you want to export and in which format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Data to Export</h4>
              <RadioGroup value={exportType} onValueChange={setExportType} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" className="border-slate-700 text-cyan-500" />
                  <Label htmlFor="all" className="text-slate-300">
                    All Dashboard Data
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metrics" id="metrics" className="border-slate-700 text-cyan-500" />
                  <Label htmlFor="metrics" className="text-slate-300">
                    System Metrics
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="processes" id="processes" className="border-slate-700 text-cyan-500" />
                  <Label htmlFor="processes" className="text-slate-300">
                    Processes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="storage" id="storage" className="border-slate-700 text-cyan-500" />
                  <Label htmlFor="storage" className="text-slate-300">
                    Storage
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alerts" id="alerts" className="border-slate-700 text-cyan-500" />
                  <Label htmlFor="alerts" className="text-slate-300">
                    Alerts
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="messages" id="messages" className="border-slate-700 text-cyan-500" />
                  <Label htmlFor="messages" className="text-slate-300">
                    Messages
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="performance" id="performance" className="border-slate-700 text-cyan-500" />
                  <Label htmlFor="performance" className="text-slate-300">
                    Performance Data
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Export Format</h4>
              <RadioGroup
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as "csv" | "json")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" className="border-slate-700 text-cyan-500" />
                  <Label htmlFor="json" className="text-slate-300">
                    JSON
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" className="border-slate-700 text-cyan-500" />
                  <Label htmlFor="csv" className="text-slate-300">
                    CSV
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleExport} className="bg-cyan-600 hover:bg-cyan-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
