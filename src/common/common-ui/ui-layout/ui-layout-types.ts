
import { ReactNode } from "react";

export interface HeaderBaseProps {

  title: string;

  showBackButton?: boolean;

  onBack?: () => void;
}

export interface TabItem {

  name: string;

  label: string;

  path: string;

  icon: (active: boolean) => ReactNode;

  isUnderDevelopment?: boolean;
}
