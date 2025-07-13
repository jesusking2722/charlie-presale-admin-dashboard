import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin } from "@/lib/scripts/auth.scripts";
import { setAuthToken } from "@/lib/fetchInstance";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin(email, password);

      if (response.ok) {
        const { user, token } = response.data;
        setAuthToken(token);
        setUser(user);

        localStorage.setItem("user", JSON.stringify(user));

        return true;
      } else {
        toast({
          title: "Authenticatino failed",
          description: response.message,
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Something went wrong",
      });
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
