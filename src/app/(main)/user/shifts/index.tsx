import React from "react";
import { UserShiftList } from "../../../../modules/user-view/shift-ui/shift-ui-components/shiftList/ShiftListView";
import Header from "@/common/common-ui/ui-layout/LayoutHeader";

export default function UserShiftsScreen() {
  return (
    <>
      <Header title="シフト一覧" />
      <UserShiftList />
    </>
  );
}

export const screenOptions = {
  title: "シフト一覧",
};
