"use client";

import { useEffect, useState } from "react";
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
import {
  BarChart4,
  Plus,
  Search,
  Mail,
  Phone,
  UserPlus,
  Edit,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddConsultantDialog } from "./add-consultant-dialog";
import { AssignCompanyDialog } from "./assign-company-dialog";
import { useAuthStore } from "@/store/useAuthStore";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useConsultantStore } from "@/store/useConsultantStore";
import { useCertificateStore } from "@/store/useCertificateStore";
import ConsultantDetails from "./consultant-details";

// Define interfaces for our component
interface ConsultantUI {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  companies: Array<{ id: string; name: string; certificates: string[] }>;
  certificates: string[];
  status: string;
}

export default function ConsultantManagement() {
  const { selectedOrganization } = useAuthStore();
  const { companies } = useCompanyStore();
  const {
    consultants,
    selectedConsultant,
    setSelectedConsultant,
    fetchConsultants,
    createConsultant,
    updateConsultant,
    assignCompanyandCertificationsToConsultant,
    deleteConsultant,
  } = useConsultantStore();
  
  const { certifications, fetchAllCertifications } = useCertificateStore();

  // State for UI consultants
  const [consultantsUI, setConsultantsUI] = useState<ConsultantUI[]>([]);
  const [selectedConsultantUI, setSelectedConsultantUI] = useState<ConsultantUI | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [consultantToEdit, setConsultantToEdit] = useState<ConsultantUI | null>(
    null
  );

  // Fetch consultants and certifications when the component mounts or organization changes
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchConsultants(selectedOrganization.id);
      fetchAllCertifications();
    }
  }, [selectedOrganization, fetchConsultants, fetchAllCertifications]);

  // Convert API consultants to UI format
  useEffect(() => {
    if (consultants.length > 0) {
      const mappedConsultants: ConsultantUI[] = consultants.map(
        (consultant) => ({
          id: consultant.id,
          user_id: consultant.user_id,
          name: consultant.user.name,
          email: consultant.user.email,
          phone: consultant.user.phone || "",
          specialization: "",
          companies: [],
          certificates: [],
          status: consultant.user.is_active ? "Active" : "Inactive",
        })
      );

      setConsultantsUI(mappedConsultants);

      // Set the first consultant as selected if none is selected
      if (!selectedConsultantUI && mappedConsultants.length > 0) {
        setSelectedConsultantUI(mappedConsultants[0]);
      }
    }
  }, [consultants]);

  // Filter consultants based on search term
  const filteredConsultants = consultantsUI.filter((consultant) => {
    return (
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consultant.specialization &&
        consultant.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
    );
  });

  const handleAddConsultant = async (newConsultant: {
    name: string;
    email: string;
    phone: string;
  }) => {
    if (isEditMode && consultantToEdit) {
      // Update existing consultant
      if (consultantToEdit.user_id && selectedOrganization?.id) {
        await updateConsultant(consultantToEdit.user_id, {
          name: newConsultant.name,
          email: newConsultant.email,
          phone: newConsultant.phone,
        });

        // Update UI state
        setConsultantsUI(
          consultantsUI.map((c) =>
            c.id === consultantToEdit.id ? { ...c, ...newConsultant } : c
          )
        );

        if (selectedConsultantUI?.id === consultantToEdit.id) {
          setSelectedConsultantUI({
            ...selectedConsultantUI,
            ...newConsultant,
          });
        }
      }
    } else {
      // Add new consultant
      if (selectedOrganization?.id) {
        const result = await createConsultant({
          ...newConsultant,
          organization_id: selectedOrganization.id,
        });

        if (result.data) {
          // Refresh consultants from API
          await fetchConsultants(selectedOrganization.id);
        }
      }
    }

    setIsEditMode(false);
    setConsultantToEdit(null);
    setIsAddDialogOpen(false);
  };

  const handleEditConsultant = (consultant: ConsultantUI) => {
    setIsEditMode(true);
    setConsultantToEdit(consultant);
    setIsAddDialogOpen(true);
  };

  const handleDeleteConsultant = async (consultant: ConsultantUI) => {
    if (consultant.user_id) {
      await deleteConsultant(consultant.user_id, consultant.id);

      // Update UI state
      const updatedConsultants = consultantsUI.filter(
        (c) => c.id !== consultant.id
      );
      setConsultantsUI(updatedConsultants);

      if (selectedConsultantUI?.id === consultant.id) {
        setSelectedConsultantUI(
          updatedConsultants.length > 0 ? updatedConsultants[0] : null
        );
      }
    }
  };

  // const handleAssignCompany = async (
  //   consultantId: string,
  //   companyId: string,
  //   certificateIds: string[]
  // ) => {
  //   const result = await assignCompanyandCertificationsToConsultant(
  //     consultantId,
  //     companyId,
  //     certificateIds
  //   );
  //   if (result.success) {
  //     // Update local state after the assignment
  //     const updatedConsultant = consultantsUI.map((consultant) => {
  //       if (consultant.id === consultantId) {
  //         return {
  //           ...consultant,
  //           companies: [
  //             ...consultant.companies,
  //             { id: companyId, certificates: certificateIds },
  //           ],
  //         };
  //       }
  //       return consultant;
  //     });
  //     setConsultantsUI(updatedConsultant);
  //   } else {
  //     console.error(result.error);
  //   }
  // };

  const handleAssignCompany = async (
    consultantId: string,
    companyId: string,
    certificateIds: string[]
  ) => {
    const result = await assignCompanyandCertificationsToConsultant(
      consultantId,
      companyId,
      certificateIds
    );
    if (result.success) {
      // Find the company name from the companies list
      const companyName =
        companies.find((company) => company.id === companyId)?.name ||
        "Unknown Company";

      // Update local state after the assignment
      const updatedConsultant = consultantsUI.map((consultant) => {
        if (consultant.id === consultantId) {
          return {
            ...consultant,
            companies: [
              ...consultant.companies,
              {
                id: companyId,
                name: companyName,
                certificates: certificateIds,
              },
            ],
          };
        }
        return consultant;
      });
      setConsultantsUI(updatedConsultant);
    } else {
      console.error(result.error);
    }
  };

  const getCertificateName = (certificateId: string) => {
    const certification = certifications.find((c) => c.id === certificateId);
    return certification ? certification.name.split(" - ")[0] : certificateId;
  };

  return (
    <div className="container mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-md p-2 text-primary-foreground">
            <BarChart4 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Consultant Management</h1>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setIsEditMode(false);
            setConsultantToEdit(null);
            setIsAddDialogOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4" />
          Add Consultant
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsAssignDialogOpen(true)}
          disabled={!selectedConsultantUI}
        >
          <Plus className="h-4 w-4" />
          Assign Company
        </Button>
        <div className="flex-1 flex items-center">
          <div className="relative w-full max-w-sm ml-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search consultants..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consultant List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">CONSULTANTS</CardTitle>
              <CardDescription>Manage your ISO consultants</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultants.map((consultant) => (
                    <TableRow
                      key={consultant.id}
                      className={`cursor-pointer ${
                        selectedConsultantUI?.id === consultant.id
                          ? "bg-muted/50"
                          : ""
                      }`}
                      onClick={() => setSelectedConsultantUI(consultant)}
                    >
                      <TableCell className="font-medium">
                        {consultant.name}
                      </TableCell>
                      <TableCell>{consultant.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            consultant.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {consultant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditConsultant(consultant);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConsultant(consultant);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Consultant Details */}
        <div className="lg:col-span-1">
          {selectedConsultantUI ? (
            <ConsultantDetails
              consultant={selectedConsultantUI}
              certificates={certifications}
              getCertificateName={getCertificateName}
              onAssignCompany={() => setIsAssignDialogOpen(true)}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>Select a consultant to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Consultant Dialog */}
      <AddConsultantDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddConsultant}
        certificates={certifications}
        consultant={isEditMode ? consultantToEdit : undefined}
        mode={isEditMode ? "edit" : "add"}
      />

      {/* Assign Company Dialog */}
      {selectedConsultantUI && (
        <AssignCompanyDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          consultant={selectedConsultantUI}
          companies={companies as any}
          certificates={certifications}
          onAssign={(companyId, certificateIds) =>
            handleAssignCompany(
              selectedConsultantUI?.user_id || "",
              companyId,
              certificateIds
            )
          }
        />
      )}
    </div>
  );
}
