"use client";

import type React from "react";

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
import { Edit, Trash2, Shield } from "lucide-react";
import { useState } from "react";

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

interface UserTableProps {
  users: UserUI[];
  selectedUser: UserUI | null;
  onSelectUser: (user: UserUI) => void;
  onEditUser: (user: UserUI) => void;
  onDeleteUser: (user: UserUI) => void;
  filteredUsers: UserUI[];
  isLoading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUser,
  onSelectUser,
  onEditUser,
  onDeleteUser,
  filteredUsers,
  isLoading = false,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );

  // Handle empty state
  if (!isLoading && filteredUsers.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {users.length === 0 ? (
          <p>No users found. Add your first user to get started.</p>
        ) : (
          <p>No users match your search criteria.</p>
        )}
      </div>
    );
  }

  // Handle deletion confirmation
  const handleDeleteClick = (e: React.MouseEvent, user: UserUI) => {
    e.stopPropagation();

    if (deleteConfirmation === user.id) {
      // Confirm delete action
      onDeleteUser(user);
      setDeleteConfirmation(null);
    } else {
      // Set confirmation state
      setDeleteConfirmation(user.id);

      // Auto-clear confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirmation(null);
      }, 3000);
    }
  };

  // Handle selection action
  const handleRowClick = (user: UserUI) => {
    onSelectUser(user);
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
            <TableHead className="w-[100px]">Role</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow
              key={user.id}
              className={`cursor-pointer ${
                selectedUser?.id === user.id ? "bg-muted/50" : ""
              }`}
              onClick={() => handleRowClick(user)}
            >
              <TableCell className="font-medium">
                {user.name || "Unnamed User"}
              </TableCell>
              <TableCell>{user.email || "No email provided"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{user.role}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    user.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {user.status || "Unknown"}
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
                      onEditUser(user);
                    }}
                    title="Edit user"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      deleteConfirmation === user.id
                        ? "bg-red-100 text-red-700"
                        : "text-red-500 hover:text-red-600 hover:bg-red-50"
                    }`}
                    onClick={(e) => handleDeleteClick(e, user)}
                    title={
                      deleteConfirmation === user.id
                        ? "Click again to confirm"
                        : "Delete user"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">
                      {deleteConfirmation === user.id
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

export default UserTable;
