"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define interfaces for our component
interface UserUI {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organization?: string;
  status: string;
  lastLogin?: string;
}

interface UserDetailsProps {
  user: UserUI | null;
  onEditUser: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onEditUser }) => {
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Select a user to view details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">USER DETAILS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User's Name */}
        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Name</h3>
          <p className="font-medium">{user.name}</p>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-sm text-muted-foreground mb-1">
            Contact Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{user.phone || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* User's Role */}
        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Role</h3>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">{user.role}</p>
          </div>
        </div>

        {/* User's Organization */}
        {user.organization && (
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Organization</h3>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{user.organization}</p>
            </div>
          </div>
        )}

        {/* User's Status */}
        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Status</h3>
          <Badge
            className={
              user.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }
          >
            {user.status}
          </Badge>
        </div>

        {/* Last Login */}
        {user.lastLogin && (
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Last Login</h3>
            <p className="text-sm">{user.lastLogin}</p>
          </div>
        )}

        {/* Edit User Button */}
        <div className="pt-4">
          <Button className="w-full" onClick={onEditUser}>
            Edit User
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
