export interface User {
  uid: string;
  role: "master" | "user";
  nickname: string;
}
