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

interface DroppedFile {
  name: string
  type: string
  content: string
  id?: string
  uploadedAt?: string
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
      if (!res.ok) throw new Error("Failed upload")
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
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
    if (!editFile) return

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
    const categoryExtensions = FILE_TYPE_CATEGORIES.find((c) => c.label === category)?.extensions || []
    return categoryExtensions.every((ext) => selectedFileTypes.includes(ext))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedFileTypes([])
    setSortOrder("date")
    setSortDirection("desc")
  }

  // Filter and sort files based on search query and selected file types
  const filteredFiles = useMemo(() => {
    let result = [...droppedFiles]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (file) => file.name.toLowerCase().includes(query) || file.content.toLowerCase().includes(query),
      )
    }

    // Apply file type filter
    if (selectedFileTypes.length > 0) {
      result = result.filter((file) => {
        const extension = getFileExtension(file.name)
        return selectedFileTypes.includes(extension)
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortOrder) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "date":
          comparison = (a.uploadedAt || "").localeCompare(b.uploadedAt || "")
          break
        case "type":
          comparison = getFileExtension(a.name).localeCompare(getFileExtension(b.name))
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [droppedFiles, searchQuery, selectedFileTypes, sortOrder, sortDirection])

  const handleSortChange = (newSortOrder: "name" | "date" | "type") => {
    if (sortOrder === newSortOrder) {
      // Toggle direction if clicking the same sort option
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new sort order and reset direction to default
      setSortOrder(newSortOrder)
      setSortDirection("desc")
    }
  }

  const handleShareFile = (filename: string) => {
    setFileToShare(filename)
    setShareDialogOpen(true)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">File Manager</h2>
          <p className="text-sm text-slate-400">Upload and manage your code files</p>
        </div>
        <Button
          onClick={fetchUploadedFiles}
          variant="outline"
          className="bg-slate-800/50 border-slate-700 text-slate-300"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card
        className={`w-full max-w-2xl min-h-[200px] p-6 border-2 ${
          isDragging ? "border-cyan-500" : "border-dashed border-slate-700"
        } flex flex-col items-center justify-center text-center transition-colors duration-300 bg-slate-800/50 mb-6`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-cyan-500 animate-spin mb-2" />
            <p className="text-slate-300">Uploading files...</p>
          </div>
        ) : (
          <>
            <FileText className="h-12 w-12 text-slate-500 mb-4" />
            <p className="text-lg font-semibold text-slate-100">
              {isDragging ? "Release to upload files" : "Drag and drop code files here"}
            </p>
            <p className="text-sm text-slate-400 mt-2">Supported file types: {SUPPORTED_FILE_TYPES.join(", ")}</p>
          </>
        )}
      </Card>

      {droppedFiles.length > 0 && (
        <div className="mt-2 w-full max-w-2xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-100">
              Uploaded Files ({filteredFiles.length} of {droppedFiles.length})
            </h3>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              {/* Search input */}
              <div className="relative flex-grow">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 pl-9 pr-8"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* File type filter dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {selectedFileTypes.length > 0 && (
                      <Badge className="ml-2 bg-cyan-600">{selectedFileTypes.length}</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-700 text-slate-100">
                  <DropdownMenuLabel>File Types</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />

                  {FILE_TYPE_CATEGORIES.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.label}
                      checked={isCategorySelected(category.label)}
                      onCheckedChange={() => toggleFileTypeFilter(category.label)}
                      className="cursor-pointer"
                    >
                      {category.label}
                      <span className="ml-2 text-xs text-slate-400">({category.extensions.join(", ")})</span>
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />

                  <DropdownMenuCheckboxItem
                    checked={sortOrder === "name"}
                    onCheckedChange={() => handleSortChange("name")}
                    className="cursor-pointer"
                  >
                    Name {sortOrder === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={sortOrder === "date"}
                    onCheckedChange={() => handleSortChange("date")}
                    className="cursor-pointer"
                  >
                    Date {sortOrder === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={sortOrder === "type"}
                    onCheckedChange={() => handleSortChange("type")}
                    className="cursor-pointer"
                  >
                    Type {sortOrder === "type" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator className="bg-slate-700" />
                  <div className="px-2 py-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-700 text-slate-300"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search and filter summary */}
          {(searchQuery || selectedFileTypes.length > 0) && (
            <div className="flex flex-wrap gap-2 items-center text-sm text-slate-400">
              <span>Filters:</span>
              {searchQuery && (
                <Badge
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-slate-300 flex items-center gap-1"
                >
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedFileTypes.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-slate-300 flex items-center gap-1"
                >
                  Types: {selectedFileTypes.length}
                  <button onClick={() => setSelectedFileTypes([])}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="link" className="text-cyan-400 p-0 h-auto text-xs" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}

          {filteredFiles.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-md p-8 text-center">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-300">No files match your search criteria</p>
              <Button variant="link" className="text-cyan-400 mt-2" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            filteredFiles.map((file, idx) => (
              <Card key={idx} className="p-4 bg-slate-800/50 border-slate-700 text-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    {getFileIcon(file.name)}
                    <div className="font-bold ml-2">{file.name}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-400"
                      onClick={() => handleShareFile(file.name)}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-400"
                      onClick={() => handleEditFile(file)}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-400"
                      onClick={() => handleDownloadFile(file)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                      onClick={() => handleDeleteFile(file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                {searchQuery && file.content.toLowerCase().includes(searchQuery.toLowerCase()) && (
                  <div className="mb-2 px-2 py-1 bg-cyan-900/20 border border-cyan-800/30 rounded text-xs">
                    <span className="font-semibold text-cyan-400">Content match:</span> Found "{searchQuery}" in file
                    content
                  </div>
                )}
                <pre className="mt-2 max-h-48 overflow-auto text-sm bg-slate-900/50 p-2 rounded text-slate-300">
                  {file.content}
                </pre>
                {file.uploadedAt && (
                  <div className="mt-2 text-xs text-slate-500">
                    Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit File Dialog */}
      <Dialog open={!!editFile} onOpenChange={(open) => !open && setEditFile(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Edit File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filename">File Name</Label>
              <Input
                id="filename"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                className="w-full h-64 bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFile(null)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-cyan-600 hover:bg-cyan-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share File Dialog */}
      <ShareFileDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} filename={fileToShare} />
    </div>
  )
}
