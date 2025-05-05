"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/types";
import { getUsers } from "@/lib/api";
import { toast } from "sonner";

interface UserContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  setCurrentUser: (user: User) => void;
  fetchUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);

      // Set first user as current if no current user
      if (!currentUser && response.data.length > 0) {
        setCurrentUser(response.data[0]);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        loading,
        error,
        setCurrentUser,
        fetchUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
