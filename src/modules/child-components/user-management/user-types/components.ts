import { User } from "@/common/common-models/model-user/UserModel";

/**
 * ユーザー関連コンポーネントの型定義
 */

/**
 * ベースとなるユーザープロパティ
 */
export interface BaseUserProps {
  loading?: boolean;
}

/**
 * ユーザーリストコンポーネントのプロパティ
 */
export interface UserListProps extends BaseUserProps {
  userList: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onAdd: () => void;
  userPasswords?: Record<string, string>;
}

/**
 * ユーザーフォームコンポーネントのプロパティ
 */
export interface UserFormProps extends BaseUserProps {
  onSubmit: (data: {
    email: string;
    password?: string;
    nickname: string;
    role: "master" | "user";
    color?: string;
    storeId?: string;
    hourlyWage?: number;
  }) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
  initialData?: User | null;
  mode?: "add" | "edit";
  currentPassword?: string;
  color?: string;
  onColorChange?: (color: string) => void;
}

/**
 * パスワード変更コンポーネントのプロパティ
 */
export interface ChangePasswordProps {
  userId?: string;
  onComplete?: () => void;
}

/**
 * ユーザー管理コンポーネントのプロパティ
 */
export interface UserManagementProps {
  userId?: string;
}

/**
 * パスワード情報を含む拡張ユーザー型（フック内部で使用）
 */
export interface ExtendedUser extends User {
  currentPassword?: string;
}
