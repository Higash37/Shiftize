import { User } from "@/features/user/types/user";

export interface BaseUserProps {
  loading?: boolean;
}

export interface UserListProps extends BaseUserProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onAdd: () => void;
  userPasswords?: Record<string, string>;
}

export interface UserFormProps extends BaseUserProps {
  onSubmit: (data: {
    email: string;
    password?: string;
    nickname: string;
    role: "master" | "user";
  }) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
  initialData?: User | null;
  mode?: "add" | "edit";
  currentPassword?: string;
}

export interface ChangePasswordProps {
  userId?: string;
  onComplete?: () => void;
}

export interface UserManagementProps {
  userId?: string;
}
