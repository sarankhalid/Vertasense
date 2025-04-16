"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart4,
  Plus,
  Search,
  FileText,
  FolderOpen,
  Clock,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadDocumentDialog } from "@/components/upload-document-dialog";

const documents = [
  {
    id: "QM-001",
    title: "Quality Manual",
    type: "Policy",
    isAiClassified: true,
    clauses: ["4.3", "5.3"],
    certificate: "iso9001",
    status: "Approved",
    version: "1.2",
    lastUpdated: "2023-12-15",
    owner: "Quality Manager",
  },
  {
    id: "PRO-002",
    title: "Procedure: Handling Returns",
    type: "Procedure",
    isAiClassified: false,
    clauses: ["8.5.6"],
    certificate: "iso9001",
    status: "Under Review",
    version: "2.0",
    lastUpdated: "2024-01-20",
    owner: "Operations Director",
  },
  {
    id: "REC-010",
    title: "Customer Complaint Log",
    type: "Record",
    isAiClassified: false,
    clauses: ["10.2"],
    certificate: "iso9001",
    status: "Approved",
    version: "1.0",
    lastUpdated: "2023-11-05",
    owner: "Customer Service Manager",
  },
  {
    id: "WI-005",
    title: "Work Instruction: Calibration",
    type: "Work Instruction",
    isAiClassified: true,
    clauses: ["7.1.5"],
    certificate: "iso9001",
    status: "Approved",
    version: "1.1",
    lastUpdated: "2024-02-10",
    owner: "Production Manager",
  },
  {
    id: "FRM-023",
    title: "Supplier Evaluation Form",
    type: "Form",
    isAiClassified: true,
    clauses: ["8.4.1"],
    certificate: "iso9001",
    status: "Approved",
    version: "1.3",
    lastUpdated: "2024-03-01",
    owner: "Procurement Manager",
  },
];

// Mock data for document statistics
const documentStats = {
  total: 42,
  approved: 38,
  underReview: 3,
  draft: 1,
  byType: {
    procedures: 12,
    workInstructions: 18,
    forms: 8,
    manuals: 4,
  },
};

export default function Documents() {
  const params = useParams();
  const certificateId = params.id as string;
  
  const [selectedDocument, setSelectedDocument] = useState(documents[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [documentType, setDocumentType] = useState("all");
  const [selectedCertificate, setSelectedCertificate] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Filter documents based on search term, document type, and certificate
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      documentType === "all" ||
      doc.type.toLowerCase() === documentType.toLowerCase();
    const matchesCertificate =
      selectedCertificate === "all" || doc.certificate === selectedCertificate;
    return matchesSearch && matchesType && matchesCertificate;
  });

  const getCertificateName = (certificateId: string) => {
    switch (certificateId) {
      case "iso9001":
        return "ISO 9001:2015";
      case "iso14001":
        return "ISO 14001:2015";
      case "iso45001":
        return "ISO 45001:2018";
      default:
        return certificateId;
    }
  };

  return (
    <div className="container mx-auto max-w-7xl">
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
          onClick={() => setIsUploadDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Browse Folders
        </Button>
        <div className="flex-1 flex items-center">
          <div className="relative w-full max-w-sm ml-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Document Statistics */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">DOCUMENT STATISTICS</CardTitle>
          <CardDescription>
            Overview of document management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Total Documents
              </span>
              <div className="flex items-center mt-1">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <span className="text-2xl font-bold">
                  {documentStats.total}
                </span>
              </div>
            </div>

            <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Approved</span>
              <div className="flex items-center mt-1">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">
                  {documentStats.approved}
                </span>
              </div>
            </div>

            <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Under Review
              </span>
              <div className="flex items-center mt-1">
                <Clock className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-2xl font-bold">
                  {documentStats.underReview}
                </span>
              </div>
            </div>

            <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Draft</span>
              <div className="flex items-center mt-1">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">
                  {documentStats.draft}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">DOCUMENT TABLE</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Doc ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[120px]">Type (AI)</TableHead>
                    <TableHead className="w-[120px]">ISO Clause</TableHead>
                  </TableRow>
                </TableHeader>
                {/* <TableBody>
                  {documents.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className={`cursor-pointer ${
                        selectedDoc.id === doc.id ? "bg-muted/50" : ""
                      }`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <TableCell className="font-medium">{doc.id}</TableCell>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>
                        {doc.type}
                        {doc.isAiClassified && (
                          <Badge
                            variant="outline"
                            className="ml-1 bg-blue-50 text-blue-700 text-xs"
                          >
                            AI
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{doc.clauses.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody> */}
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className={`cursor-pointer ${
                        selectedDocument.id === doc.id ? "bg-muted/50" : ""
                      }`}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <TableCell className="font-medium">{doc.id}</TableCell>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>
                        {doc.type}
                        {doc.isAiClassified && (
                          <Badge
                            variant="outline"
                            className="ml-1 bg-blue-50 text-blue-700 text-xs"
                          >
                            AI
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{doc.clauses.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Document Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">DOCUMENT DETAILS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Title</h3>
                <p className="font-medium">{selectedDocument.title}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">
                  Certificate
                </h3>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-800 border-blue-200"
                >
                  {getCertificateName(selectedDocument?.certificate)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">
                    Document ID
                  </h3>
                  <p className="text-sm">{selectedDocument.id}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">
                    Version
                  </h3>
                  <p className="text-sm">{selectedDocument.version}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Type</h3>
                <Badge variant="outline">{selectedDocument.type}</Badge>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Status</h3>
                <Badge
                  className={
                    selectedDocument.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {selectedDocument.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">
                  Last Updated
                </h3>
                <p className="text-sm">{selectedDocument.lastUpdated}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Owner</h3>
                <p className="text-sm">{selectedDocument.owner}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-1">
                  Related ISO Clauses
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.clauses.map((clause) => (
                    <Badge key={clause} variant="outline">
                      {clause === "All" ? "All Clauses" : `Clause ${clause}`}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full">View Document</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ISO 9001-Specific Notes */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">ISO 9001-Specific Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <span className="font-medium">Documented Information (7.5):</span>{" "}
              ISO 9001:2015 requires organizations to maintain and control
              documented information required by the standard and by the
              organization's QMS.
            </li>
            <li>
              <span className="font-medium">
                Creating and Updating (7.5.2):
              </span>{" "}
              When creating and updating documented information, the
              organization must ensure appropriate identification, format,
              review, and approval.
            </li>
            <li>
              <span className="font-medium">
                Control of Documented Information (7.5.3):
              </span>{" "}
              Documented information must be controlled to ensure it is
              available where and when needed, adequately protected, and
              properly managed.
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Upload Document Dialog */}
      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        certificationId={certificateId}
      />
    </div>
  );
}
