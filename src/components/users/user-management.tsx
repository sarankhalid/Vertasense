"use client";

import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, UserPlus } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useCertificateStore } from "@/store/useCertificateStore";
import UserTable from "./user-table";
import UserDetails from "./user-details";
import { AddUserDialog } from "./user-add-dialog";

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

// Real user store that fetches data from the API
const useUserStore = () => {
  const [users, setUsers] = useState<UserUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async (organizationId: string, companyId?: string, certificateId?: string) => {
    if (!organizationId) {
      console.log("Missing organization ID for fetching users");
      return;
    }
    
    console.log("Fetching users with params:", { organizationId, companyId, certificateId });
    
    setIsLoading(true);
    try {
      // For debugging purposes, let's use mock data instead of querying Supabase
      // This will help us determine if the issue is with Supabase or elsewhere
      console.log("Using mock data instead of Supabase query");
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData = [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
          role: "ADMIN",
          organization: "Acme Inc",
          status: "Active",
          lastLogin: "2023-04-15 14:30",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "+1 (555) 987-6543",
          role: "MANAGER",
          organization: "Acme Inc",
          status: "Active",
          lastLogin: "2023-04-14 09:15",
        }
      ];
      
      setUsers(mockData);
      console.log("Users set to mock data:", mockData);
      setIsLoading(false);
      return;
      
      // Original Supabase query code (commented out for now)
      /*
      let query = supabaseBrowserClient
        .from('users')
        .select(`
          id,
          name,
          email,
          phone,
          role,
          status,
          last_login,
          organizations (name)
        `)
        .eq('organization_id', organizationId);
      
      // Add company filter if provided
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      // Add certificate filter if provided
      if (certificateId) {
        query = query.eq('certificate_id', certificateId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      */
      
      // This code is now unreachable due to the early return above
      // Keeping it commented out for reference
      /*
      // Transform the data to match our UserUI interface
      const transformedUsers: UserUI[] = data ? data.map((user: any) => ({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'USER',
        organization: user.organizations?.name || '',
        status: user.status || 'Inactive',
        lastLogin: user.last_login || '',
      })) : [];
      
      setUsers(transformedUsers);
      */
    } catch (error) {
      console.error("Error fetching users from Supabase:", error);
      // Fallback to empty array in case of error
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData: any): Promise<{data: UserUI, success: boolean}> => {
    setIsLoading(true);
    try {
      // Call the create-user API endpoint
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      
      const result = await response.json();
      
      // Create a UserUI object from the API response
      const newUser: UserUI = {
        id: result.userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        organization: userData.organization || '',
        status: userData.status,
        lastLogin: '',
      };
      
      // Update the local state
      setUsers((prevUsers) => [...prevUsers, newUser]);
      
      return { data: newUser, success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      return { data: {} as UserUI, success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: any) => {
    setIsLoading(true);
    // In a real app, this would be an API call
    // Simulating API call with timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone || "",
                  role: userData.role,
                  status: userData.status,
                }
              : user
          )
        );
        setIsLoading(false);
        resolve({ success: true });
      }, 1000);
    });
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    // In a real app, this would be an API call
    // Simulating API call with timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setIsLoading(false);
        resolve({ success: true });
      }, 1000);
    });
  };

  return {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};

export default function UserManagement() {
  const { selectedOrganization } = useAuthStore();
  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser } =
    useUserStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserUI | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserUI | null>(null);

  const { selectedCompany } = useCompanyStore();
  const { selectedCertificate } = useCertificateStore();

  // Fetch users when the component mounts or when organization, company, or certificate changes
  useEffect(() => {
    if (selectedOrganization?.id && selectedCompany?.id && selectedCertificate?.id) {
      fetchUsers(selectedOrganization.id, selectedCompany.id, selectedCertificate.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrganization?.id, selectedCompany?.id, selectedCertificate?.id]);

  // Set the first user as selected if none is selected
  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddUser = async (newUser: any) => {
    if (isEditMode && userToEdit) {
      // Update existing user
      await updateUser(userToEdit.id, newUser);

      // Update selected user if it was the one edited
      if (selectedUser?.id === userToEdit.id) {
        setSelectedUser({
          ...selectedUser,
          ...newUser,
        });
      }
    } else {
      // Add new user
      const result = await createUser(newUser);
      if (result.success && !selectedUser) {
        setSelectedUser(result.data);
      }
    }

    setIsEditMode(false);
    setUserToEdit(null);
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (user: UserUI) => {
    setIsEditMode(true);
    setUserToEdit(user);
    setIsAddDialogOpen(true);
  };

  const handleDeleteUser = async (user: UserUI) => {
    await deleteUser(user.id);

    // Update selected user if it was the one deleted
    if (selectedUser?.id === user.id) {
      setSelectedUser(users.length > 0 ? users[0] : null);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-md p-2 text-primary-foreground">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setIsEditMode(false);
            setUserToEdit(null);
            setIsAddDialogOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
        <div className="flex-1 flex items-center">
          <div className="relative w-full max-w-sm ml-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* User List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">USERS</CardTitle>
              <CardDescription>Manage your system users</CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users}
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                filteredUsers={filteredUsers}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        {/* <div className="lg:col-span-1">
          <UserDetails
            user={selectedUser}
            onEditUser={() => {
              if (selectedUser) {
                handleEditUser(selectedUser);
              }
            }}
          />
        </div> */}
      </div>

      {/* Add/Edit User Dialog */}
      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddUser}
        user={isEditMode && userToEdit ? userToEdit : undefined}
        mode={isEditMode ? "edit" : "add"}
      />
    </div>
  );
}
