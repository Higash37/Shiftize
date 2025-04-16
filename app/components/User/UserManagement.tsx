import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const UserManagement = () => {
  const [hashedPassword, setHashedPassword] = useState("");

  useEffect(() => {
    const fetchHashedPassword = async () => {
      const db = getFirestore();
      const docRef = doc(db, "users", "userId"); // ユーザーIDを指定
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setHashedPassword(docSnap.data().hashedPassword); // ハッシュ化されたパスワードを取得
      } else {
        console.log("No such document!");
      }
    };

    fetchHashedPassword();
  }, []);

  return (
    <View style={styles.container}>
      <Text>ハッシュ化されたパスワード: {hashedPassword}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default UserManagement;
