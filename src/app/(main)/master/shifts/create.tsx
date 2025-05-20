import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  query,
  where,
  getDocs,
  setDoc,
  getFirestore,
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import TimeSelect from "@/modules/shift-ui/shift-ui-components/TimeSelect";
import { CalendarModal } from "@/modules";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import type { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";
import { useAuth } from "@/services/auth/useAuth";
import type { ExtendedUser } from "@/modules/user-management/user-types/components";
import { Header } from "@/common/common-ui/ui-layout";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getUserData, type UserData } from "@/services/firebase/firebase";
import { Picker } from "@react-native-picker/picker";
import { useUsers } from "@/modules/user-management/user-hooks/useUserList";

interface ShiftData {
  startTime: string;
  endTime: string;
  dates: string[];
  hasClass: boolean;
  classes: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export default function MasterShiftCreateScreen() {
  const router = useRouter();
  const { markShiftAsDeleted, createShift } = useShift();
  const { mode, shiftId, date, startTime, endTime, classes } =
    useLocalSearchParams();
  const isEditMode = mode === "edit";
  const { user, role } = useAuth();
  const { users, loading: usersLoading } = useUsers();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [existingShift, setExistingShift] = useState<Shift | null>(null);
  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: (startTime as string) || "",
    endTime: (endTime as string) || "",
    dates: date ? [date as string] : [],
    hasClass: classes ? JSON.parse(classes as string).length > 0 : false,
    classes: classes ? JSON.parse(classes as string) : [],
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserNickname, setSelectedUserNickname] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<ShiftStatus>("approved");

  const [selectedDate, setSelectedDate] = useState(date || "");
  const [selectedStartTime, setSelectedStartTime] = useState(startTime || "");
  const [selectedEndTime, setSelectedEndTime] = useState(endTime || "");
  const [selectedClasses, setSelectedClasses] = useState<any[]>(() => {
    if (classes) {
      try {
        return JSON.parse(classes as string);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // ユーザーデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // 編集モードの場合、既存のシフト情報を取得
  useEffect(() => {
    const fetchExistingShift = async () => {
      if (!isEditMode || !shiftId) return;

      try {
        setIsLoading(true);
        const shiftDoc = await getDoc(doc(db, "shifts", shiftId as string));
        if (shiftDoc.exists()) {
          const shiftData = shiftDoc.data() as Shift;
          setExistingShift({
            ...shiftData,
            id: shiftDoc.id,
          });

          // 既存のシフトのユーザーを選択
          setSelectedUserId(shiftData.userId || "");
          setSelectedUserNickname(shiftData.nickname || "");
          setSelectedStatus(shiftData.status);

          setShiftData({
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            dates: [shiftData.date],
            hasClass: shiftData.type === "class",
            classes: shiftData.classes || [],
          });
        }
      } catch (error) {
        console.error("Error fetching existing shift:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingShift();
  }, [isEditMode, shiftId]);

  // 日付確認ハンドラ
  const handleDatesConfirm = (dates: string[]) => {
    setShiftData({
      ...shiftData,
      dates,
    });
    setShowCalendar(false);
  };

  // シフト作成ハンドラ
  const handleCreateShift = async () => {
    // 必須項目チェック
    if (!selectedUserId) {
      setErrorMessage("ユーザーを選択してください");
      return;
    }

    if (shiftData.dates.length === 0) {
      setErrorMessage("日付を選択してください");
      return;
    }

    if (!shiftData.startTime || !shiftData.endTime) {
      setErrorMessage("時間を入力してください");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // ユーザーのニックネーム取得
      let nickname = selectedUserNickname;
      if (!nickname) {
        const selectedUser = users.find((u) => u.uid === selectedUserId);
        if (selectedUser) {
          nickname = selectedUser.nickname;
          setSelectedUserNickname(nickname);
        }
      }

      // シフトを各日付に登録
      const createPromises = shiftData.dates.map(async (date) => {
        const newShift = {
          userId: selectedUserId,
          nickname: nickname,
          date,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          type: shiftData.hasClass ? "class" : "staff",
          classes: shiftData.classes,
          status: selectedStatus, // マスターが選択したステータス
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const shiftsRef = collection(db, "shifts");
        await addDoc(shiftsRef, newShift);
      });

      await Promise.all(createPromises);

      // 成功通知を表示
      setShowSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 2秒後に通知を消す
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccess(false);
        });
      }, 2000);

      // 入力内容をリセット
      setShiftData({
        startTime: "",
        endTime: "",
        dates: [],
        hasClass: false,
        classes: [],
      });
    } catch (error) {
      console.error("Error creating shift:", error);
      setErrorMessage("シフトの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // シフト更新ハンドラ
  const handleUpdateShift = async () => {
    if (!existingShift) return;

    if (shiftData.dates.length === 0) {
      setErrorMessage("日付を選択してください");
      return;
    }

    if (!shiftData.startTime || !shiftData.endTime) {
      setErrorMessage("時間を入力してください");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const updatedShift = {
        userId: selectedUserId || existingShift.userId,
        nickname: selectedUserNickname || existingShift.nickname,
        date: shiftData.dates[0], // 編集では最初の日付のみ使用
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        type: shiftData.hasClass ? "class" : "staff",
        classes: shiftData.classes,
        status: selectedStatus,
        updatedAt: new Date(),
      };

      const shiftRef = doc(db, "shifts", existingShift.id);
      await updateDoc(shiftRef, updatedShift);

      Alert.alert("更新完了", "シフトを更新しました", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating shift:", error);
      setErrorMessage("シフトの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // シフト削除ハンドラ
  const handleDelete = () => {
    if (!existingShift) return;

    Alert.alert("シフトを削除", "このシフトを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            await markShiftAsDeleted(existingShift.id);
            Alert.alert("削除完了", "シフトを削除しました", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (error) {
            console.error("Error deleting shift:", error);
            setErrorMessage("シフトの削除に失敗しました");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  // 日付選択画面を表示
  const handleOpenCalendar = () => {
    setShowCalendar(true);
  };

  // フィルタリングされたユーザーリスト
  const filteredUsers = users.filter((user) =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || usersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={isEditMode ? "シフト編集" : "シフト追加"} showBackButton />
      <ScrollView style={styles.scrollView}>
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* ユーザー選択セクション（マスター用） */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ユーザー選択</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="ユーザー検索..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.userListContainer}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.uid}
                  style={[
                    styles.userItem,
                    selectedUserId === user.uid && styles.selectedUserItem,
                  ]}
                  onPress={() => {
                    setSelectedUserId(user.uid);
                    setSelectedUserNickname(user.nickname);
                  }}
                >
                  <Text
                    style={[
                      styles.userItemText,
                      selectedUserId === user.uid &&
                        styles.selectedUserItemText,
                    ]}
                  >
                    {user.nickname} (
                    {user.role === "master" ? "管理者" : "ユーザー"})
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noResultsText}>ユーザーが見つかりません</Text>
            )}
          </View>
        </View>

        {/* ステータス設定セクション（マスター用） */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ステータス設定</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue) =>
                setSelectedStatus(itemValue as ShiftStatus)
              }
              style={styles.picker}
            >
              <Picker.Item label="承認済み" value="approved" />
              <Picker.Item label="保留中" value="pending" />
              <Picker.Item label="下書き" value="draft" />
            </Picker>
          </View>
        </View>

        {/* 日付選択セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日付</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={handleOpenCalendar}
          >
            {shiftData.dates.length > 0 ? (
              <Text style={styles.dateText}>
                {shiftData.dates.length > 1
                  ? `${shiftData.dates.length}日選択済み`
                  : format(new Date(shiftData.dates[0]), "yyyy年MM月dd日", {
                      locale: ja,
                    })}
              </Text>
            ) : (
              <Text style={styles.placeholderText}>日付を選択</Text>
            )}
            <AntDesign name="calendar" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 時間選択セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>時間</Text>
          <View style={styles.timeContainer}>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>開始時間</Text>{" "}
              <TimeSelect
                value={shiftData.startTime}
                onChange={(time: string) =>
                  setShiftData({ ...shiftData, startTime: time })
                }
              />
            </View>
            <View style={styles.separator}>
              <Text style={styles.separatorText}>〜</Text>
            </View>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>終了時間</Text>{" "}
              <TimeSelect
                value={shiftData.endTime}
                onChange={(time: string) =>
                  setShiftData({ ...shiftData, endTime: time })
                }
              />
            </View>
          </View>
        </View>

        {/* シフトタイプセクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>シフトタイプ</Text>
          <View style={styles.shiftTypeContainer}>
            <TouchableOpacity
              style={[
                styles.shiftTypeButton,
                !shiftData.hasClass && styles.activeShiftTypeButton,
              ]}
              onPress={() => setShiftData({ ...shiftData, hasClass: false })}
            >
              <Text
                style={[
                  styles.shiftTypeText,
                  !shiftData.hasClass && styles.activeShiftTypeText,
                ]}
              >
                スタッフ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.shiftTypeButton,
                shiftData.hasClass && styles.activeShiftTypeButton,
              ]}
              onPress={() => setShiftData({ ...shiftData, hasClass: true })}
            >
              <Text
                style={[
                  styles.shiftTypeText,
                  shiftData.hasClass && styles.activeShiftTypeText,
                ]}
              >
                授業
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ボタン */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={isEditMode ? handleUpdateShift : handleCreateShift}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isEditMode ? "更新する" : "保存する"}
          </Text>
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>シフトを削除</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={handleDatesConfirm}
        initialDates={shiftData.dates}
      />

      {showSuccess && (
        <Animated.View
          style={[
            styles.successMessage,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.successText}>シフトを追加しました！</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  scrollView: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.text.primary,
  },
  datePickerButton: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeField: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: colors.text.primary,
  },
  separator: {
    width: 30,
    alignItems: "center",
  },
  separatorText: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  shiftTypeContainer: {
    flexDirection: "row",
  },
  shiftTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeShiftTypeButton: {
    backgroundColor: colors.primary,
  },
  shiftTypeText: {
    color: colors.text.secondary,
  },
  activeShiftTypeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  deleteButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  successMessage: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 200, 0, 0.8)",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  successText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  userListContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectedUserItem: {
    backgroundColor: colors.primary,
  },
  userItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedUserItemText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noResultsText: {
    padding: 10,
    textAlign: "center",
    color: colors.text.secondary,
  },
  pickerContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
});
