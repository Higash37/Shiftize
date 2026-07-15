
import { User, UserRole } from "@/common/common-models/model-user/UserModel";

export interface BaseUserProps {
  loading?: boolean;
}

export interface UserListProps extends BaseUserProps {
  userList: User[];
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
    role: UserRole;
    color?: string;
    storeId?: string;
    hourlyWage?: number;
  }) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
  initialData?: User | null;
  mode?: "add" | "edit";
  currentPassword: string;
  color?: string;
  onColorChange?: (color: string) => void;
}

export interface ChangePasswordProps {
  userId?: string;
  onComplete?: () => void;
}

export interface UserManagementProps {
  userId?: string;
}

export interface ExtendedUser extends User {
  currentPassword?: string;
}
