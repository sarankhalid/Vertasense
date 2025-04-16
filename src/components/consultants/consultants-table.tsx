// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Edit, Trash2 } from "lucide-react";

// interface ConsultantTableProps {
//   consultants: ConsultantUI[];
//   selectedConsultant: ConsultantUI | null;
//   onSelectConsultant: (consultant: ConsultantUI) => void;
//   onEditConsultant: (consultant: ConsultantUI) => void;
//   onDeleteConsultant: (consultant: ConsultantUI) => void;
//   filteredConsultants: ConsultantUI[];
// }

// const ConsultantTable: React.FC<ConsultantTableProps> = ({
//   consultants,
//   selectedConsultant,
//   onSelectConsultant,
//   onEditConsultant,
//   onDeleteConsultant,
//   filteredConsultants,
// }) => {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead className="w-[180px]">Name</TableHead>
//           <TableHead>Email</TableHead>
//           <TableHead className="w-[100px]">Status</TableHead>
//           <TableHead className="w-[100px]">Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {filteredConsultants.map((consultant) => (
//           <TableRow
//             key={consultant.id}
//             className={`cursor-pointer ${
//               selectedConsultant?.id === consultant.id ? "bg-muted/50" : ""
//             }`}
//             onClick={() => onSelectConsultant(consultant)}
//           >
//             <TableCell className="font-medium">{consultant.name}</TableCell>
//             <TableCell>{consultant.email}</TableCell>
//             <TableCell>
//               <Badge
//                 className={
//                   consultant.status === "Active"
//                     ? "bg-green-100 text-green-800"
//                     : "bg-amber-100 text-amber-800"
//                 }
//               >
//                 {consultant.status}
//               </Badge>
//             </TableCell>
//             <TableCell>
//               <div className="flex items-center gap-1">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-8 w-8"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onEditConsultant(consultant);
//                   }}
//                 >
//                   <Edit className="h-4 w-4" />
//                   <span className="sr-only">Edit</span>
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onDeleteConsultant(consultant);
//                   }}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                   <span className="sr-only">Delete</span>
//                 </Button>
//               </div>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );
// };

// export default ConsultantTable;

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

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

interface ConsultantTableProps {
  consultants: ConsultantUI[];
  selectedConsultant: ConsultantUI | null;
  onSelectConsultant: (consultant: ConsultantUI) => void;
  onEditConsultant: (consultant: ConsultantUI) => void;
  onDeleteConsultant: (consultant: ConsultantUI) => void;
  filteredConsultants: ConsultantUI[];
  isLoading?: boolean;
}

const ConsultantTable: React.FC<ConsultantTableProps> = ({
  consultants,
  selectedConsultant,
  onSelectConsultant,
  onEditConsultant,
  onDeleteConsultant,
  filteredConsultants,
  isLoading = false,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );

  // Handle empty state
  if (!isLoading && filteredConsultants.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {consultants.length === 0 ? (
          <p>No consultants found. Add your first consultant to get started.</p>
        ) : (
          <p>No consultants match your search criteria.</p>
        )}
      </div>
    );
  }

  // Handle deletion confirmation
  const handleDeleteClick = (e: React.MouseEvent, consultant: ConsultantUI) => {
    e.stopPropagation();

    if (deleteConfirmation === consultant.id) {
      // Confirm delete action
      onDeleteConsultant(consultant);
      setDeleteConfirmation(null);
    } else {
      // Set confirmation state
      setDeleteConfirmation(consultant.id);

      // Auto-clear confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirmation(null);
      }, 3000);
    }
  };

  // Handle selection action
  const handleRowClick = (consultant: ConsultantUI) => {
    onSelectConsultant(consultant);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}

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
                selectedConsultant?.id === consultant.id ? "bg-muted/50" : ""
              }`}
              onClick={() => handleRowClick(consultant)}
            >
              <TableCell className="font-medium">
                {consultant.name || "Unnamed Consultant"}
              </TableCell>
              <TableCell>{consultant.email || "No email provided"}</TableCell>
              <TableCell>
                <Badge
                  className={
                    consultant.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {consultant.status || "Unknown"}
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
                      onEditConsultant(consultant);
                    }}
                    title="Edit consultant"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      deleteConfirmation === consultant.id
                        ? "bg-red-100 text-red-700"
                        : "text-red-500 hover:text-red-600 hover:bg-red-50"
                    }`}
                    onClick={(e) => handleDeleteClick(e, consultant)}
                    title={
                      deleteConfirmation === consultant.id
                        ? "Click again to confirm"
                        : "Delete consultant"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">
                      {deleteConfirmation === consultant.id
                        ? "Confirm delete"
                        : "Delete"}
                    </span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ConsultantTable;
