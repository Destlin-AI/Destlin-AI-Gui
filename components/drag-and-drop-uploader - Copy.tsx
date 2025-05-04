"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw, FileText, Download, Edit2, Search, X, Filter, Share2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShareFileDialog } from "./share-file-dialog"
import { pathlib } from "path-browserify"

interface DroppedFile {
  name: string
  type: string
  content: string
  id?: string
  uploadedAt?: string
  fixed?: boolean
  originalContent?: string
}

// Supported file types
const SUPPORTED_FILE_TYPES = [
  ".ts",
  ".js",
  ".py",
  ".json",
  ".yaml",
  ".yml",
  ".txt",
  ".md",
  ".jsx",
  ".tsx",
  ".css",
  ".scss",
  ".html",
  ".xml",
  ".csv",
]

// Script Fixer integration for the UI
class ScriptFixerIntegration {
  cache: Map<string, string>
  
  constructor() {
    this.cache = new Map()
  }

  async fixScript(content: any, fileType: any) {
    // Hash the content for caching
    const contentHash = await this.hashString(content)
    const cacheKey = `${contentHash}_${fileType}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    // Apply fixes based on file type
    let fixed = content
    
    if (fileType === '.py') {
      fixed = this.normalizePathsInPython(content)
      fixed = this.addPortableHeader(fixed)
      fixed = this.fixDependencies(fixed)
    } else if (['.js', '.ts', '.jsx', '.tsx'].includes(fileType)) {
      fixed = this.normalizePathsInJS(content)
    }
    
    // Cache the result
    this.cache.set(cacheKey, fixed)
    return fixed
  }
  
  normalizePathsInPython(content: any) {
    // Simple regex-based path normalization for Python
    return content.replace(
      /(["'])(\/[^"'\n]+|[A-Z]:\\[^"'\n]+)(["'])/g, 
      "Path(__file__).parent / $1${pathlib.basename('$2')}$3"
    )
  }
  
  normalizePathsInJS(content: any) {
    // Path normalization for JS files
    return content.replace(
      /(["'])(\/[^"'\n]+|[A-Z]:\\[^"'\n]+)(["'])/g, 
      "path.join(__dirname, $1${path.basename('$2')}$3)"
    )
  }
  
  addPortableHeader(content: any) {
    const header = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import sys

__file__ = Path(__file__).resolve()
`
    return header + content
  }
  
  fixDependencies(content: any) {
    // Add auto-import capability
    const autoImportHeader = `
# Auto-dependency resolver
try:
    import importlib.util
    import subprocess
    import sys
    
    def ensure_import(package):
        try:
            return __import__(package)
        except ImportError:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            return __import__(package)
            
`
    
    // Simple regex to find imports
    const importMatches = content.match(/import\s+([a-zA-Z0-9_]+)/g) || []
    const fromImportMatches = content.match(/from\s+([a-zA-Z0-9_]+)\s+import/g) || []
    
    let allPackages: string[] = []
    
    importMatches.forEach((match: any) => {
      const pkg = match.replace('import', '').trim()
      if (!['sys', 'os', 'pathlib', 'Path'].includes(pkg)) {
        allPackages.push(pkg)
      }
    })
    
    fromImportMatches.forEach((match: any) => {
      const pkg = match.replace('from', '').replace('import', '').trim()
      if (!['sys', 'os', 'pathlib', 'Path'].includes(pkg)) {
        allPackages.push(pkg)
      }
    })
    
    if (allPackages.length > 0) {
      let autoImports = autoImportHeader
      allPackages.forEach(pkg => {
        autoImports += `${pkg} = ensure_import('${pkg}')\n`
      })
      autoImports += '\n# End auto-dependency resolver\n\n'
      
      return autoImports + content
    }
    
    return content
  }
  
  async hashString(str: string) {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
    def ensure_import(package):
        try:
            return __import__(package)
        except ImportError:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            return __import__(package)
            
`
    
    // Simple regex to find imports
    const importMatches = content.match(/import\s+([a-zA-Z0-9_]+)/g) || []
    const fromImportMatches = content.match(/from\s+([a-zA-Z0-9_]+)\s+import/g) || []
    
    let allPackages: string[] = []
    
    importMatches.forEach((match: any) => {
      const pkg = match.replace('import', '').trim()
      if (!['sys', 'os', 'pathlib', 'Path'].includes(pkg)) {
        allPackages.push(pkg)
      }
    })
    
    fromImportMatches.forEach((match: any) => {
      const pkg = match.replace('from', '').replace('import', '').trim()
      if (!['sys', 'os', 'pathlib', 'Path'].includes(pkg)) {
        allPackages.push(pkg)
      }
    })
    
    if (allPackages.length > 0) {
      let autoImports = autoImportHeader
      allPackages.forEach(pkg => {
        autoImports += `${pkg} = ensure_import('${pkg}')\n`
      })
      autoImports += '\n# End auto-dependency resolver\n\n'
      
      return autoImports + content
    }
    
    return content
  }
  
  async hashString(str: string) {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async hashString(str: string) {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

// File type categories for filtering
const FILE_TYPE_CATEGORIES = [
  { label: "JavaScript/TypeScript", extensions: [".js", ".jsx", ".ts", ".tsx"] },
  { label: "Python", extensions: [".py"] },
  { label: "Markup", extensions: [".html", ".xml", ".md"] },
  { label: "Styles", extensions: [".css", ".scss"] },
  { label: "Data", extensions: [".json", ".yaml", ".yml", ".csv"] },
  { label: "Text", extensions: [".txt"] },
]

export default function DragAndDropUploader() {
  const { toast } = useToast()
  const [droppedFiles, setDroppedFiles] = useState<DroppedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editFile, setEditFile] = useState<DroppedFile | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [newFileContent, setNewFileContent] = useState("")

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<"name" | "date" | "type">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [fileToShare, setFileToShare] = useState<string>("")

  // Fetch existing files on component mount
  useEffect(() => {
    fetchUploadedFiles()
  }, [])

  const fetchUploadedFiles = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch("/api/files")
      if (res.ok) {
        const files = await res.json()
        setDroppedFiles(files)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch uploaded files",
        })
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        title: "Error",
        description: "Failed to fetch uploaded files",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setIsLoading(true)

    const files = Array.from(e.dataTransfer.files)
    const uploads: DroppedFile[] = []
    let hasInvalidFile = false

    for (const file of files) {
      // Check if file type is supported
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
      if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
        toast({
          title: "Unsupported File Type",
          description: `${file.name} is not a supported file type`,
        })
        hasInvalidFile = true
        continue
      }

      try {
        const text = await file.text()
        uploads.push({ name: file.name, type: file.type, content: text })

        await uploadFile(file.name, text)
      } catch (error) {
        console.error("Error reading/uploading file:", error)
        toast({
          title: "Upload Error",
          description: `Failed for ${file.name}`,
        })
      }
    }

    if (uploads.length > 0) {
      setDroppedFiles((prev) => [...prev, ...uploads])
      toast({
        title: "Files Uploaded",
        description: `Successfully uploaded ${uploads.length} file(s)`,
      })
    } else if (!hasInvalidFile) {
      toast({
        title: "Upload Failed",
        description: "No files were uploaded",
      })
    }

    setIsLoading(false)
  }

  const uploadFile = async (filename: string, content: string) => {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, content }),
      })
      if (!res.ok) {
        throw new Error("Failed upload")
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDeleteFile = async (filename: string) => {
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setDroppedFiles((prev) => prev.filter((file) => file.name !== filename))
        toast({
          title: "File Deleted",
          description: `${filename} has been deleted`,
        })
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete the file",
        })
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the file",
      })
    }
  }

  const handleDownloadFile = (file: DroppedFile) => {
    const blob = new Blob([file.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleEditFile = (file: DroppedFile) => {
    setEditFile(file)
    setNewFileName(file.name)
    setNewFileContent(file.content)
  }

  const handleSaveEdit = async () => {
    if (!editFile) {
      return
    }

    try {
      // Delete the old file
      await fetch(`/api/files/${encodeURIComponent(editFile.name)}`, {
        method: "DELETE",
      })

      // Upload the new file
      await uploadFile(newFileName, newFileContent)

      // Update the UI
      setDroppedFiles((prev) =>
        prev.map((file) =>
          file.name === editFile.name ? { ...file, name: newFileName, content: newFileContent } : file,
        ),
      )

      toast({
        title: "File Updated",
        description: `${editFile.name} has been updated`,
      })

      // Close the dialog
      setEditFile(null)
    } catch (error) {
      console.error("Error updating file:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update the file",
      })
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return <Badge className="bg-yellow-600 text-white">JS/TS</Badge>
      case "py":
        return <Badge className="bg-blue-600 text-white">Python</Badge>
      case "json":
        return <Badge className="bg-orange-600 text-white">JSON</Badge>
      case "yaml":
      case "yml":
        return <Badge className="bg-green-600 text-white">YAML</Badge>
      case "md":
        return <Badge className="bg-purple-600 text-white">MD</Badge>
      case "html":
        return <Badge className="bg-red-600 text-white">HTML</Badge>
      case "css":
      case "scss":
        return <Badge className="bg-blue-400 text-white">CSS</Badge>
      default:
        return <Badge className="bg-slate-600 text-white">TXT</Badge>
    }
  }

  const getFileExtension = (fileName: string): string => {
    return `.${fileName.split(".").pop()?.toLowerCase() || ""}`
  }

  const toggleFileTypeFilter = (category: string) => {
    const categoryExtensions = FILE_TYPE_CATEGORIES.find((c) => c.label === category)?.extensions || []

    // Check if all extensions in this category are already selected
    const allSelected = categoryExtensions.every((ext) => selectedFileTypes.includes(ext))

    if (allSelected) {
      // Remove all extensions in this category
      setSelectedFileTypes((prev) => prev.filter((ext) => !categoryExtensions.includes(ext)))
    } else {
      // Add all extensions in this category that aren't already selected
      setSelectedFileTypes((prev) => [...prev, ...categoryExtensions.filter((ext) => !prev.includes(ext))])
    }
  }

  const isCategorySelected = (category: string): boolean => {
    const categoryExtensions = FILE_TYPE_CATEGORIES.find((c) => c.label === category)