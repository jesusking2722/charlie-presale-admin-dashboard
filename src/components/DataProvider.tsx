import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ITransaction, IUser } from "@/types";
import { fetchAllUsers } from "@/lib/scripts/users.scripts";
import { fetchAllTransactions } from "@/lib/scripts/transactions.scripts";

interface DataContextType {
  users: IUser[];
  transactions: ITransaction[];
  setUsers: (users: IUser[]) => void;
  setTransactions: (transactions: ITransaction[]) => void;
  updateUserById: (userId: string, updatingData: Partial<IUser>) => void;
  updateTransactionById: (
    txId: string,
    updatingData: Partial<ITransaction>
  ) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be within UsersProvider");
  }

  return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  const updateUserById = (userId: string, updatingData: Partial<IUser>) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, ...updatingData } : user
      )
    );
  };

  const updateTransactionById = (
    txId: string,
    updatingData: Partial<ITransaction>
  ) => {
    setUsers((prevTransactions) =>
      prevTransactions.map((tx) =>
        tx._id === txId ? { ...tx, ...updatingData } : tx
      )
    );
  };

  const getAllUsers = useCallback(async () => {
    try {
      const response = await fetchAllUsers();
      const usersList = response?.data?.users || [];

      setUsers(usersList);
    } catch (error) {
      console.error("get all users error: ", error);
    }
  }, []);

  const getAllTransactions = useCallback(async () => {
    try {
      const response = await fetchAllTransactions();
      const txList = response?.data?.transactions || [];

      setTransactions(txList);
    } catch (error) {
      console.error("get all transactions error: ", error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await getAllUsers();
      await getAllTransactions();
    })();
  }, []);

  return (
    <DataContext.Provider
      value={{
        users,
        transactions,
        setUsers,
        setTransactions,
        updateUserById,
        updateTransactionById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
