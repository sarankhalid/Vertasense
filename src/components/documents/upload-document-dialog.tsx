"use client";

import type React from "react";

import { useState, useRef, type ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/store/useDocumentStore";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
// import { useSidebar } from "@/contexts/SidebarContext";
import { formatFileSize, getDocumentTypeFromMime } from "./document-type-utils";
import { DocumentFileIcon } from "./document-file-icon";
import { useCertificateStore } from "@/store/useCertificateStore";

type FileStatus = "pending" | "uploading" | "completed" | "error";

interface FileWithStatus {
  file: File;
  status: FileStatus;
  progress: number;
  id: string;
  error?: string;
  path?: string;
  url?: string;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (files: FileWithStatus[]) => void;
}) {
  const { selectedCertificate } = useCertificateStore();
  const { uploadDocument } = useDocumentStore();
  // console.log("Selected Certificate : ", selectedCertificateId);
  const [selectedFiles, setSelectedFiles] = useState<FileWithStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        status: "pending" as FileStatus,
        progress: 0,
        id: `${file.name}-${Date.now()}`,
      }));
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(selectedFiles.filter((file) => file.id !== id));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    // Process each file one by one
    for (const fileWithStatus of selectedFiles) {
      if (fileWithStatus.status !== "completed") {
        // Update status to uploading
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithStatus.id
              ? { ...f, status: "uploading" as FileStatus, progress: 0 }
              : f
          )
        );

        try {
          // Update progress to show activity
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithStatus.id ? { ...f, progress: 50 } : f
            )
          );

          // Upload file using document store
          const response = await uploadDocument(
            fileWithStatus.file,
            selectedCertificate?.id || ""
          );
          
          if (response.error) {
            throw new Error(response.error);
          }

          // Mark as completed
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithStatus.id
                ? {
                    ...f,
                    status: "completed" as FileStatus,
                    progress: 100,
                    path: response.data?.fileUrl || "",
                    url: response.data?.fileUrl || "",
                  }
                : f
            )
          );
        } catch (error) {
          console.error("Upload error:", error);

          // Mark as error
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithStatus.id
                ? {
                    ...f,
                    status: "error" as FileStatus,
                    progress: 0,
                    error: "Upload failed. Please try again.",
                  }
                : f
            )
          );
        }
      }
    }

    setIsUploading(false);

    // Call onUploadComplete callback with completed files
    const completedFiles = selectedFiles.filter(
      (file) => file.status === "completed"
    );
    if (completedFiles.length > 0 && onUploadComplete) {
      onUploadComplete(completedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        file,
        status: "pending" as FileStatus,
        progress: 0,
        id: `${file.name}-${Date.now()}`,
      }));
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "uploading":
        return null;
      default:
        return null;
    }
  };

  const allCompleted =
    selectedFiles.length > 0 &&
    selectedFiles.every(
      (file) => file.status === "completed" || file.status === "error"
    );
  const hasFiles = selectedFiles.length > 0;
  const pendingFiles = selectedFiles.filter(
    (file) => file.status === "pending"
  ).length;
  const completedFiles = selectedFiles.filter(
    (file) => file.status === "completed"
  ).length;
  const errorFiles = selectedFiles.filter(
    (file) => file.status === "error"
  ).length;
  const uploadingFiles = selectedFiles.filter(
    (file) => file.status === "uploading"
  ).length;

  const resetDialog = () => {
    setSelectedFiles([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!isUploading) {
          onOpenChange(newOpen);
          if (!newOpen) {
            resetDialog();
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Upload area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg transition-all duration-200",
              "flex flex-col items-center justify-center text-center",
              hasFiles ? "py-4" : "py-12",
              isUploading
                ? "bg-muted/30 border-muted"
                : "hover:border-primary/50 hover:bg-muted/10"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!hasFiles ? (
              <>
                <div className="bg-primary/10 rounded-full p-3 mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Drag & Drop Files</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  Drop your files here or click to browse from your computer
                </p>
                <Input
                  id="file"
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="relative overflow-hidden group"
                >
                  <span>Browse Files</span>
                </Button>
              </>
            ) : (
              <div className="w-full px-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">
                    {pendingFiles > 0 && !isUploading ? (
                      <span>
                        {pendingFiles} file{pendingFiles !== 1 ? "s" : ""} ready
                        to upload
                      </span>
                    ) : isUploading ? (
                      <span>
                        Uploading {uploadingFiles} file
                        {uploadingFiles !== 1 ? "s" : ""}...
                      </span>
                    ) : (
                      <span>
                        {completedFiles} uploaded, {errorFiles} failed
                      </span>
                    )}
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs flex items-center gap-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="h-3 w-3" />
                      Add More
                    </Button>
                  )}
                </div>
                <Input
                  id="file"
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  disabled={isUploading}
                />
              </div>
            )}
          </div>

          {/* File list */}
          {hasFiles && (
            <div className="space-y-2">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto divide-y">
                  {selectedFiles.map((fileWithStatus) => (
                    <div
                      key={fileWithStatus.id}
                      className={cn(
                        "p-3 flex items-center gap-3",
                        fileWithStatus.status === "error"
                          ? "bg-red-50"
                          : fileWithStatus.status === "completed"
                          ? "bg-green-50"
                          : ""
                      )}
                    >
                      <div className="shrink-0">
                        <DocumentFileIcon fileName={fileWithStatus.file.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {fileWithStatus.file.name}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            {getStatusIcon(fileWithStatus.status)}
                            {fileWithStatus.status === "pending" &&
                              !isUploading && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    handleRemoveFile(fileWithStatus.id)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(fileWithStatus.file.size)}
                          </p>
                          {fileWithStatus.error && (
                            <p className="text-xs text-red-500">
                              {fileWithStatus.error}
                            </p>
                          )}
                        </div>
                        {fileWithStatus.status === "uploading" && (
                          <Progress
                            value={fileWithStatus.progress}
                            className="h-1 mt-2"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            {hasFiles && (
              <span>
                {selectedFiles.length} file
                {selectedFiles.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              {allCompleted ? "Close" : "Cancel"}
            </Button>
            {hasFiles && !allCompleted && (
              <Button
                onClick={handleUpload}
                disabled={
                  selectedFiles.length === 0 || isUploading || allCompleted
                }
                className="relative"
              >
                {isUploading ? "Uploading..." : "Upload All"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
