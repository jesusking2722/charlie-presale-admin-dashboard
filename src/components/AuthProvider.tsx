import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, fetchMe } from "@/lib/scripts/auth.scripts";
import { setAuthToken } from "@/lib/fetchInstance";
import { jwtDecode } from "jwt-decode";

interface User {
  _id: string;
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
    const validateAuth = async () => {
      const token = localStorage.getItem("Authorization");
      if (token) {
        const payload = jwtDecode(token) as any;

        if (payload && payload.exp * 1000 < Date.now()) {
          logout();
          window.location.href = "/login";
          return;
        }

        setAuthToken(token);
        const response = await fetchMe(payload.id as string);

        if (response.ok) {
          const { user } = response.data;
          setUser(user);
        } else {
          logout();
          window.location.href = "/login";
        }
      }
    };

    validateAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin(email, password);

      if (response.ok) {
        const { user, token } = response.data;
        setAuthToken(token);
        setUser(user);
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
