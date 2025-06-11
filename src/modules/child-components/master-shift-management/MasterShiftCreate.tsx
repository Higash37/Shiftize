import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
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
import TimeSelect from "@/modules/user-view/shift-ui/shift-ui-components/TimeSelect";
import CalendarModal from "@/modules/child-components/calendar/calendar-components/calendar-modal/calendarModal/CalendarModal";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import type { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";
import { useAuth } from "@/services/auth/useAuth";
import type { ExtendedUser } from "@/modules/child-components/user-management/user-types/components";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getUserData, type UserData } from "@/services/firebase/firebase";
import { Picker } from "@react-native-picker/picker";
import { useUsers } from "@/modules/child-components/user-management/user-hooks/useUserList";
import { styles } from "./MasterShiftCreate.styles";
import { ShiftData, MasterShiftCreateProps } from "./MasterShiftCreate.types";

export const MasterShiftCreate: React.FC<MasterShiftCreateProps> = ({
  mode,
  shiftId,
  date,
  startTime,
  endTime,
  classes,
}) => {
  const router = useRouter();
  const { markShiftAsDeleted, createShift } = useShift();
  const isEditMode = mode === "edit";
  const { user, role } = useAuth();
  const { users, loading: usersLoading } = useUsers();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [existingShift, setExistingShift] = useState<Shift | null>(null);
  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: startTime || "",
    endTime: endTime || "",
    dates: date ? [date] : [],
    hasClass: classes ? JSON.parse(classes).length > 0 : false,
    classes: classes ? JSON.parse(classes) : [],
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
        return JSON.parse(classes);
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
        const shiftDoc = await getDoc(doc(db, "shifts", shiftId));
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
          type: shiftData.hasClass ? "class" : "user",
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
        type: shiftData.hasClass ? "class" : "user",
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

  useEffect(() => {
    const selectedUser = users.find((u) => u.uid === selectedUserId);
    if (selectedUser) {
      setSelectedUserNickname(selectedUser.nickname);
    }
  }, [selectedUserId, users]);

  if (isLoading || usersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MasterHeader title={isEditMode ? "シフト編集" : "シフト追加"} />
      <View style={styles.container}>
        <CustomScrollView style={styles.scrollView}>
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
              {searchQuery.trim() === "" ? (
                <Text style={styles.noResultsText}>
                  ユーザー名で検索してください
                </Text>
              ) : filteredUsers.length > 0 ? (
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
                <Text style={styles.noResultsText}>
                  ユーザーが見つかりません
                </Text>
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

          {/* スタッフ時間セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>スタッフ時間</Text>
            <TimeSelect
              startTime={shiftData.startTime}
              endTime={shiftData.endTime}
              onStartTimeChange={(time: string) =>
                setShiftData((prev) => ({ ...prev, startTime: time }))
              }
              onEndTimeChange={(time: string) =>
                setShiftData((prev) => ({ ...prev, endTime: time }))
              }
            />
          </View>

          {/* 日付選択セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>日付選択</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={handleOpenCalendar}
            >
              <Text style={styles.dateText}>
                {shiftData.dates.length > 0
                  ? `${shiftData.dates.length}日選択中`
                  : "日付を選択"}
              </Text>
            </TouchableOpacity>
            {shiftData.dates.length > 0 && (
              <View style={styles.selectedDatesContainer}>
                {shiftData.dates.sort().map((date) => (
                  <View key={date} style={styles.selectedDateCard}>
                    <Text style={styles.selectedDateText}>{`${format(
                      new Date(date),
                      "yyyy年M月d日(E)",
                      {
                        locale: ja,
                      }
                    )}`}</Text>
                    <TouchableOpacity
                      style={styles.removeDateButton}
                      onPress={() =>
                        setShiftData((prev) => ({
                          ...prev,
                          dates: prev.dates.filter((d) => d !== date),
                        }))
                      }
                    >
                      <Text style={styles.removeDateText}>削除</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 授業時間セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>授業時間</Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() =>
                setShiftData((prev) => ({ ...prev, hasClass: !prev.hasClass }))
              }
            >
              <Text style={styles.toggleButtonText}>
                {shiftData.hasClass ? "授業あり" : "授業なし"}
              </Text>
            </TouchableOpacity>
            {shiftData.hasClass && (
              <View style={styles.classesContainer}>
                {shiftData.classes.map((classTime, index) => (
                  <View key={index} style={styles.classTimeContainer}>
                    <TimeSelect
                      startTime={classTime.startTime}
                      endTime={classTime.endTime}
                      onStartTimeChange={(time: string) => {
                        setShiftData((prev) => ({
                          ...prev,
                          classes: prev.classes.map((c, i) =>
                            i === index ? { ...c, startTime: time } : c
                          ),
                        }));
                      }}
                      onEndTimeChange={(time: string) => {
                        setShiftData((prev) => ({
                          ...prev,
                          classes: prev.classes.map((c, i) =>
                            i === index ? { ...c, endTime: time } : c
                          ),
                        }));
                      }}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        setShiftData((prev) => ({
                          ...prev,
                          classes: prev.classes.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <AntDesign
                        name="close"
                        size={20}
                        color={colors.text.primary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() =>
                    setShiftData((prev) => ({
                      ...prev,
                      classes: [
                        ...prev.classes,
                        { startTime: "", endTime: "" },
                      ],
                    }))
                  }
                >
                  <AntDesign name="pluscircle" size={22} color="#fff" />
                  <Text style={styles.addButtonText}>授業を追加</Text>
                </TouchableOpacity>
              </View>
            )}
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
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>シフトを削除</Text>
            </TouchableOpacity>
          )}
        </CustomScrollView>

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
    </View>
  );
};
