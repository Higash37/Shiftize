export interface LoginFormProps {
  onLogin?: (
    username: string,
    password: string,
    storeId: string
  ) => Promise<void>;
  loading?: boolean;
}
