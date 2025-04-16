"use client";

import { BarChart4, Plus, Upload, FolderOpen, Search, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DocumentHeaderProps {
  onAddDocument: () => void;
  onBulkUpload?: () => void;
  onBrowseFolders?: () => void;
  onAiClassification?: () => void;
  isClassifying?: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function DocumentHeader({
  onAddDocument,
  onBulkUpload,
  onBrowseFolders,
  onAiClassification,
  isClassifying = false,
  searchTerm,
  onSearchChange,
}: DocumentHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-md p-2 text-primary-foreground">
            <BarChart4 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Document Management</h1>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          className="flex items-center gap-2"
          onClick={onAddDocument}
        >
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
        {onBulkUpload && (
          <Button variant="outline" className="flex items-center gap-2" onClick={onBulkUpload}>
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
        )}
        {onBrowseFolders && (
          <Button variant="outline" className="flex items-center gap-2" onClick={onBrowseFolders}>
            <FolderOpen className="h-4 w-4" />
            Browse Folders
          </Button>
        )}
        {onAiClassification && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={onAiClassification}
            disabled={isClassifying}
          >
            <Brain className="h-4 w-4" />
            {isClassifying ? "Classifying..." : "AI Classification"}
          </Button>
        )}
        <div className="flex-1 flex items-center">
          <div className="relative w-full max-w-sm ml-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
