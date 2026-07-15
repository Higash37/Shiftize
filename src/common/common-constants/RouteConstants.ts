

export const Routes = {

  auth: {
    login: "/(auth)/login",
  },

  main: {
    master: {
      home: "/(main)/master/home",
      ganttView: "/(main)/master/gantt-view",
      ganttEdit: "/(main)/master/gantt-edit",
      info: "/(main)/master/info",
      users: "/(main)/master/users",
    },
    user: {
      home: "/(main)/user/home",
      shifts: "/(main)/user/shifts",
      shiftsCreate: "/(main)/user/shifts/create",
      changePassword: "/(main)/user/change-password",
    },
  },

} as const;

import type { UserRole } from "@/common/common-models/model-user/UserModel";

export const getDefaultHomeRoute = (role: UserRole | null): string => {
  if (role === "master") {
    return Routes.main.master.home;
  }
  if (role === "user") {
    return Routes.main.user.home;
  }
  return Routes.auth.login;
};

export const RouteGroups = {
  isAuthGroup: (segments: string[]): boolean => segments[0] === "(auth)",
  isMainGroup: (segments: string[]): boolean => {
    return (
      segments[0] === "(main)" ||
      segments[0] === "user" ||
      segments[0] === "master" ||
      segments.includes("user") ||
      segments.includes("master")
    );
  },
  isAtRoot: (segments: string[]): boolean => segments.length < 1,
} as const;

