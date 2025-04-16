"use client";

import { FileText, File, Image, FileArchive } from "lucide-react";

interface DocumentFileIconProps {
  fileName: string;
  className?: string;
}

export function DocumentFileIcon({ fileName, className = "h-6 w-6" }: DocumentFileIconProps) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return <FileText className={`${className} text-red-500`} />;
    case "doc":
    case "docx":
      return <FileText className={`${className} text-blue-500`} />;
    case "xls":
    case "xlsx":
      return <FileText className={`${className} text-green-500`} />;
    case "ppt":
    case "pptx":
      return <FileText className={`${className} text-orange-500`} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return <Image className={`${className} text-purple-500`} />;
    case "zip":
    case "rar":
    case "7z":
      return <FileArchive className={`${className} text-amber-500`} />;
    default:
      return <File className={`${className} text-gray-500`} />;
  }
}
