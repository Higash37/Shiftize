
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ServiceProvider } from "@/services/ServiceProvider";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import TimeSelect from "@/modules/user-view/user-shift-forms/TimeSelect";
import CalendarModal from "@/modules/reusable-widgets/calendar/modals/CalendarModal";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { calculateDurationHours } from "@/common/common-utils/util-shift/wageCalculator";
import type { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";
import { useAuth } from "@/services/auth/useAuth";
import { MasterHeader } from "@/common/common-ui/ui-layout";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { UserData } from "@/common/common-models/model-user/UserModel";
import { Picker } from "@react-native-picker/picker";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { createMasterShiftCreateStyles } from "./MasterShiftCreate.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
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
  const styles = useThemedStyles(createMasterShiftCreateStyles);
  const { markShiftAsDeleted, createShift } = useShift();
  const isEditMode = mode === "edit";
  const { user } = useAuth();
  const { users } = useUsers(user?.storeId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserNickname, setSelectedUserNickname] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<ShiftStatus>("approved");
  const [showUserPicker, setShowUserPicker] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    setUserData({
      uid: user.uid,
      nickname: user.nickname || "",
      email: user.email || "",
      role: user.role || "",
      storeId: user.storeId,
    } as unknown as UserData);

    ServiceProvider.users.getUserData(user.uid)
      .then((fetchedUserData) => {
        if (fetchedUserData) {
          setUserData(fetchedUserData as unknown as UserData);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const fetchExistingShift = async () => {
      if (!isEditMode || !shiftId) return;

      try {
        setIsLoading(true);
        const shiftData = await ServiceProvider.shifts.getShift(shiftId);
        if (shiftData) {
          setExistingShift(shiftData);

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

      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingShift();
  }, [isEditMode, shiftId]);

  const handleDatesConfirm = (dates: string[]) => {
    setShiftData({
      ...shiftData,
      dates,
    });
    setShowCalendar(false);
  };

  const handleCreateShift = async () => {

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

      let nickname = selectedUserNickname;
      if (!nickname) {
        const selectedUser = users.find((u) => u.uid === selectedUserId);
        if (selectedUser) {
          nickname = selectedUser.nickname;
          setSelectedUserNickname(nickname);
        }
      }

      {
        const createPromises = shiftData.dates.map(async (date) => {
          const durationHours = calculateDurationHours(shiftData.startTime, shiftData.endTime);

          const newShift = {
            userId: selectedUserId,
            storeId: user?.storeId || "",
            nickname: nickname,
            date,
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            type: shiftData.hasClass ? ("class" as const) : ("user" as const),
            subject: "",
            isCompleted: false,
            duration: durationHours,
            classes: shiftData.classes,
            status: selectedStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await createShift(newShift);

        });

        await Promise.all(createPromises);
      }

      setIsLoading(false);

      setShowSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccess(false);
        });
      }, 800);

      setShiftData({
        startTime: "",
        endTime: "",
        dates: [],
        hasClass: false,
        classes: [],
      });
    } catch (error) {
      setErrorMessage("シフトの作成に失敗しました");
      setIsLoading(false);
    }
  };

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

      const durationHours = calculateDurationHours(shiftData.startTime, shiftData.endTime);

      const updatedShift = {
        userId: selectedUserId || existingShift.userId,
        storeId: user?.storeId || existingShift.storeId || "",
        nickname: selectedUserNickname || existingShift.nickname,
        date: shiftData.dates[0],
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        type: shiftData.hasClass ? ("class" as const) : ("user" as const),
        subject: existingShift.subject || "",
        isCompleted: existingShift.isCompleted || false,
        duration: durationHours,
        classes: shiftData.classes,
        status: selectedStatus,
        updatedAt: new Date(),
      };

      await ServiceProvider.shifts.updateShift(existingShift.id, updatedShift as Partial<Shift>);

      Alert.alert("更新完了", "シフトを更新しました", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      setErrorMessage("シフトの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

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
            setErrorMessage("シフトの削除に失敗しました");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleOpenCalendar = () => {
    setShowCalendar(true);
  };

  useEffect(() => {
    const selectedUser = users.find((u) => u.uid === selectedUserId);
    if (selectedUser) {
      setSelectedUserNickname(selectedUser.nickname);
    }
  }, [selectedUserId, users]);

  if (isLoading) {
    return null;
  }

  const { width: screenWidth } = Dimensions.get("window");
  const isPC = screenWidth >= 768;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MasterHeader title={isEditMode ? "シフト編集" : "シフト追加"} />
      <View style={{
        flex: 1,
        alignSelf: 'center',
        width: isPC ? '60%' : '100%',
        maxWidth: isPC ? 800 : undefined
      }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ユーザー選択</Text>
            <TouchableOpacity
              style={styles.userPickerButton}
              onPress={() => setShowUserPicker(true)}
            >
              <Text style={[
                styles.userPickerText,
                !selectedUserNickname && styles.placeholderText
              ]}>
                {selectedUserNickname || "ユーザーを選択してください"}
              </Text>
              <AntDesign name="down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {}
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
                <Picker.Item label="申請中" value="pending" />
              </Picker>
            </View>
          </View>

          {}
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

          {}
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

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>途中時間</Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() =>
                setShiftData((prev) => ({ ...prev, hasClass: !prev.hasClass }))
              }
            >
              <Text style={styles.toggleButtonText}>
                {shiftData.hasClass ? "途中時間あり" : "途中時間なし"}
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
                  <AntDesign name="plus-circle" size={22} color="#fff" />
                  <Text style={styles.addButtonText}>途中時間を追加</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {}
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
      </ScrollView>
      </View>

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

      {}
      {showUserPicker && (
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowUserPicker(false)}
          >
            <View style={[
              styles.dropdownContainer,
              {
                width: isPC ? '60%' : '90%',
                maxWidth: isPC ? 800 : undefined,
                alignSelf: 'center'
              }
            ]}>
              <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
                {}
                {users.length === 0 ? (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.noResultsText}>
                      ユーザーが見つかりません
                    </Text>
                  </View>
                ) : (
                  users.map((user) => (
                    <TouchableOpacity
                      key={user.uid}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedUserId(user.uid);
                        setSelectedUserNickname(user.nickname);
                        setShowUserPicker(false);
                      }}
                    >
                      <AntDesign name="user" size={16} color="#666" />
                      <View style={styles.dropdownUserInfo}>
                        <Text style={styles.dropdownItemText}>
                          {user.nickname}
                        </Text>
                        <Text style={styles.dropdownUserRole}>
                          {user.role === "master" ? "管理者" : "ユーザー"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        )}
    </View>
  );
};
