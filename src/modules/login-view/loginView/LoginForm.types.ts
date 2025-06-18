export interface LoginFormProps {
  onLogin?: (
    username: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  loading?: boolean;
}
