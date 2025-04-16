import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ConsultantDetailsProps {
  consultant: ConsultantUI | null;
  certificates: Array<{ id: string; name: string }>;
  getCertificateName: (certificateId: string) => string;
  onAssignCompany: () => void; // Function to open the assign company dialog
}

const ConsultantDetails: React.FC<ConsultantDetailsProps> = ({
  consultant,
  certificates,
  getCertificateName,
  onAssignCompany,
}) => {
  if (!consultant) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Select a consultant to view details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">CONSULTANT DETAILS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Consultant's Name */}
        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Name</h3>
          <p className="font-medium">{consultant.name}</p>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-sm text-muted-foreground mb-1">
            Contact Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{consultant.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{consultant.phone}</p>
            </div>
          </div>
        </div>

        {/* Consultant's Certificates */}
        {consultant.certificates.length > 0 && (
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Certificates</h3>
            <div className="flex flex-wrap gap-2">
              {consultant.certificates.map((cert) => (
                <Badge
                  key={cert}
                  variant="outline"
                  className="bg-blue-50 text-blue-800 border-blue-200"
                >
                  {getCertificateName(cert)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Consultant's Status */}
        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Status</h3>
          <Badge
            className={
              consultant.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }
          >
            {consultant.status}
          </Badge>
        </div>

        {/* Assigned Companies Section */}
        <div>
          <h3 className="text-sm text-muted-foreground mb-1">
            Assigned Companies
          </h3>
          {consultant.companies.length > 0 ? (
            <div className="space-y-2">
              {consultant.companies.map((company) => (
                <div key={company.id} className="border rounded-md p-3">
                  <p className="font-medium">{company.name}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {company.certificates.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {getCertificateName(cert)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No companies assigned
            </p>
          )}
        </div>

        {/* Assign Company Button */}
        <div className="pt-4">
          <Button className="w-full" onClick={onAssignCompany}>
            Assign Company
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultantDetails;
