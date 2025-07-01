import React from "react";
import { Header } from "@/common/common-ui/ui-layout";
import HomeCommonScreen from "../../../modules/home-view/home-screens/HomeCommonScreen";
import { Modal } from "react-native";
import ChangePassword from "@/modules/child-components/user-management/user-props/ChangePassword";

export const screenOptions = {
  title: "ホーム",
  headerBackVisible: false,
};

export default function UserHomeScreen() {
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  return (
    <>
      <Header
        title="ホーム"
        onPressSettings={() => setShowPasswordModal(true)}
      />
      <HomeCommonScreen />
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
      </Modal>
    </>
  );
}
