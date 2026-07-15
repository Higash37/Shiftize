
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import { useAuth } from "@/services/auth/useAuth";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { createInfoDashboardStyles } from "./InfoDashboard.styles";
import { useTimeSegmentTypes } from "./useTimeSegmentTypes";
import { getSupabase } from "@/services/supabase/supabase-client";
import { Picker } from "@react-native-picker/picker";
import Button from "@/common/common-ui/ui-forms/FormButton";
import type { WageMode } from "@/common/common-models/model-shift/shiftTypes";

interface StaffData {
  id: string;
  name: string;
  furigana: string;
  color: string;
  workedHours: number;
  efficiency: number;
  totalEarnings: number;
  hourlyWage: number;
  approvedShiftCount: number;
  monthsSinceJoin: number;
  createdAt: string;
}

export const InfoDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading || !user?.storeId) {
    return null;
  }

  return <InfoDashboardContent storeId={user.storeId} />;
};

import { COLOR_GRID } from "@/common/common-ui/ui-forms/FormColorPicker.constants";

const ICON_OPTIONS = [

  "🍳", "🍕", "🍜", "🍣", "🍰", "☕", "🍺", "🥗", "🍔", "🧁",
  "🍱", "🍩", "🧇", "🥘", "🍝", "🥐", "🍞", "🥩", "🍖", "🥟",
  "🍤", "🧆", "🥪", "🫕", "🍿", "🧃", "🍷", "🥂", "🫖", "🍵",

  "🧹", "🧽", "🪣", "🧴", "🗑️", "♻️", "🧼", "🪥", "🧺", "✨",

  "🤝", "💁", "📞", "🛎️", "💬", "👋", "😊", "🙇", "💳", "🧾",
  "🎁", "💝", "🪧", "📢", "📣",

  "📋", "📊", "💰", "🗂️", "📝", "✅", "📌", "📎", "🗃️", "💼",
  "🧮", "📐", "📏", "🖊️", "🖋️", "📑", "🗓️", "📅", "🏷️", "📄",

  "📦", "🚚", "🛒", "🏗️", "🚛", "🛻", "📬", "📮", "🧳", "🪜",

  "📚", "🎓", "✏️", "🧑‍🏫", "📖", "🔬", "🔭", "🧪", "🧠", "💡",
  "📓", "📒", "🎒", "🖍️", "🗒️",

  "🏥", "🩺", "⛑️", "🔒", "💊", "🩹", "🏨", "🧑‍⚕️", "♿", "🛡️",
  "🚑", "🦺", "⚠️", "🚨", "🔑",

  "⏸", "🕐", "🔔", "⏰", "💤", "🛏️", "🪑", "🚬", "⏱️", "⌛",
  "🕑", "🕒", "🕓", "🕔", "🕕",

  "🔧", "💻", "🖥️", "⚙️", "🔌", "🔩", "🪛", "🪚", "🔨", "⛏️",
  "🖨️", "📱", "📡", "🔋", "💾", "🌐", "📷", "🎥", "🎙️",

  "👤", "👥", "🧑‍💼", "👷", "🧑‍🔧", "🧑‍🍳", "🧑‍💻", "🧑‍🎨", "🧑‍🔬", "🧑‍🚒",
  "🧑‍✈️", "🧑‍🌾", "💂", "🕵️", "👮",

  "🏪", "🏭", "🏢", "🏠", "🏫", "🏬", "🏣", "🏤", "🏰", "⛪",
  "🏟️", "🅿️", "🚪", "🛗",

  "🚗", "🚌", "🚲", "🏍️", "✈️", "🚄", "🚢", "⛵", "🛵",

  "⚽", "🏀", "🎾", "🏊", "🏃", "🧘", "🎳", "🎮", "🎲", "🏋️",

  "🌸", "🌻", "🍀", "🌈", "☀️", "🌙", "❄️", "🌊", "🔥", "🌿",

  "🐶", "🐱", "🐟", "🐔", "🐴", "🦁", "🐰", "🐻", "🦊", "🐧",

  "🎵", "🎶", "🎨", "🎭", "🎪", "🎬", "🎤", "🎹", "🥁", "🎻",

  "⭐", "🎯", "🌟", "❤️", "💎", "🏆", "🥇", "🎖️", "👑", "💫",
  "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚪", "⚫", "🟤", "🩷",
  "❌", "⭕", "✖️", "➕", "➖", "❓", "❗", "💯", "🔺", "🔻",
  "▶️", "⏩", "⏪", "🔄", "🔁", "↗️", "↘️", "↩️", "🔀",
];

type DashboardTab = "staff" | "breaks";
type StaffDetailTab = "info";
type StaffSortKey = "name" | "wage" | "shifts" | "joined";

const SORT_OPTIONS: { key: StaffSortKey; label: string }[] = [
  { key: "name", label: "名前順" },
  { key: "wage", label: "金額順" },
  { key: "shifts", label: "稼働回数順" },
  { key: "joined", label: "登録順" },
];

const TAB_CONFIG: { key: DashboardTab; label: string; icon: string }[] = [
  { key: "staff", label: "スタッフ", icon: "people" },
  { key: "breaks", label: "途中時間", icon: "timer" },
];

const getMonthsDiff = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const created = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
};

const InfoDashboardContent: React.FC<{ storeId: string }> = ({ storeId }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("staff");
  const [minimumWage, setMinimumWage] = useState<number>(1100);
  const [staffSortKey, setStaffSortKey] = useState<StaffSortKey>("name");

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("settings")
        .select("settings_key, data")
        .eq("store_id", storeId)
        .in("settings_key", ["minimum_wage"]);
      if (!data) return;
      for (const row of data) {
        if (row.settings_key === "minimum_wage" && row.data?.value) setMinimumWage(row.data.value);
      }
    })();
  }, [storeId]);

  const saveSetting = useCallback(async (key: string, value: number) => {
    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("store_id", storeId)
      .eq("settings_key", key)
      .maybeSingle();
    if (existing) {
      await supabase.from("settings").update({ data: { value } }).eq("id", existing.id);
    } else {
      await supabase.from("settings").insert({ store_id: storeId, settings_key: key, data: { value } });
    }
  }, [storeId]);

  const [showTypeIconPicker, setShowTypeIconPicker] = useState(false);

  const {
    types: timeSegmentTypes,
    addType: addSegmentType,
    updateType: updateSegmentType,
    deleteType: deleteSegmentType,
  } = useTimeSegmentTypes(storeId);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [newTypeIcon, setNewTypeIcon] = useState("⏸");
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeColor, setNewTypeColor] = useState("#9e9e9e");
  const [showTypeColorPicker, setShowTypeColorPicker] = useState(false);
  const [newTypeWageMode, setNewTypeWageMode] = useState<WageMode>("exclude");
  const [newTypeCustomRate, setNewTypeCustomRate] = useState("");

  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);
  const [staffDetailTab, setStaffDetailTab] = useState<StaffDetailTab>("info");
  const [editingWage, setEditingWage] = useState(false);
  const [wageInput, setWageInput] = useState("");
  const [furiganaInput, setFuriganaInput] = useState("");

  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(
    () => createInfoDashboardStyles(theme, bp),
    [theme, bp]
  );

  const { isTablet, isDesktop } = bp;
  const { width: windowWidth } = useWindowDimensions();

  const numColumns = isDesktop ? 5 : isTablet ? 3 : 1;
  const roleColumns = isDesktop ? 5 : isTablet ? 3 : windowWidth >= 400 ? 2 : 1;

  const { shifts, loading: shiftsLoading } = useShiftsRealtime(storeId);
  const { users, loading: usersLoading, refetchUsers } = useUsers(storeId);

  const currentMonthShifts = useMemo(() => {
    const now = new Date();
    return shifts.filter((shift) => {
      const d = new Date(shift.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        (shift.status === "approved" ||
          shift.status === "completed")
      );
    });
  }, [shifts]);

  const staffData = useMemo<StaffData[]>(() => {
    if (users.length === 0) return [];

    return users.map((u) => {
      const userShifts = currentMonthShifts.filter(
        (s) => s.userId === u.uid
      );
      let totalWorkedMinutes = 0;
      let totalEarnings = 0;
      const hourlyWage = u.hourlyWage || minimumWage;

      userShifts.forEach((shift) => {
        const { totalMinutes, totalWage } = calculateTotalWage(
          {
            startTime: shift.startTime,
            endTime: shift.endTime,
            classes: shift.classes || [],
          },
          hourlyWage
        );
        totalWorkedMinutes += totalMinutes;
        totalEarnings += totalWage;
      });

      const workedHours = Math.round((totalWorkedMinutes / 60) * 10) / 10;
      const targetHours = 100;
      const efficiency = Math.round(((workedHours / targetHours) * 100) * 10) / 10;

      const approvedShiftCount = shifts.filter(
        (s) => s.userId === u.uid && (s.status === "approved" || s.status === "completed")
      ).length;

      return {
        id: u.uid,
        name: u.nickname || "名前未設定",
        furigana: u.furigana || "",
        color: u.color || "",
        workedHours,
        efficiency,
        totalEarnings: Math.round(totalEarnings),
        hourlyWage,
        approvedShiftCount,
        monthsSinceJoin: getMonthsDiff(u.createdAt),
        createdAt: u.createdAt || "",
      };
    });
  }, [users, currentMonthShifts, shifts, minimumWage]);

  const sortedStaffData = useMemo(() => {
    const sorted = [...staffData];
    switch (staffSortKey) {
      case "wage":
        sorted.sort((a, b) => b.totalEarnings - a.totalEarnings);
        break;
      case "shifts":
        sorted.sort((a, b) => b.approvedShiftCount - a.approvedShiftCount);
        break;
      case "joined":
        sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      default:
        sorted.sort((a, b) => (a.furigana || a.name).localeCompare(b.furigana || b.name, "ja"));
        break;
    }
    return sorted;
  }, [staffData, staffSortKey]);

  const getEfficiencyColor = useCallback(
    (efficiency: number) => {
      if (efficiency >= 100) return theme.colorScheme.success;
      if (efficiency >= 80) return theme.colorScheme.warning;
      return theme.colorScheme.error;
    },
    [theme]
  );

  const handleSaveType = useCallback(async () => {
    if (!newTypeIcon.trim() || !newTypeName.trim()) {
      Alert.alert("エラー", "アイコンと名前を入力してください");
      return;
    }
    const icon = [...newTypeIcon.trim()][0] || "";
    const customRate = newTypeWageMode === "custom_rate" ? (Number.parseInt(newTypeCustomRate, 10) || 0) : 0;
    if (editingTypeId) {
      await updateSegmentType(editingTypeId, { icon, name: newTypeName.trim(), color: newTypeColor, wageMode: newTypeWageMode, customRate });
    } else {
      await addSegmentType(newTypeName.trim(), icon, newTypeColor, newTypeWageMode, customRate);
    }
    setShowTypeModal(false);
    setEditingTypeId(null);
    setNewTypeIcon("⏸"); setNewTypeName(""); setNewTypeColor("#9e9e9e"); setNewTypeWageMode("exclude"); setNewTypeCustomRate("");
  }, [newTypeIcon, newTypeName, newTypeColor, newTypeWageMode, newTypeCustomRate, editingTypeId, addSegmentType, updateSegmentType]);

  const openEditType = useCallback((t: { id: string; icon: string; name: string; color: string; wageMode: WageMode; customRate: number }) => {
    setEditingTypeId(t.id);
    setNewTypeIcon(t.icon);
    setNewTypeName(t.name);
    setNewTypeColor(t.color);
    setNewTypeWageMode(t.wageMode);
    setNewTypeCustomRate(t.wageMode === "custom_rate" ? String(t.customRate) : "");
    setShowTypeColorPicker(false);
    setShowTypeModal(true);
  }, []);

  const openStaffDetail = useCallback((staff: StaffData) => {
    setSelectedStaff(staff);
    setStaffDetailTab("info");
    setEditingWage(false);
    setFuriganaInput(staff.furigana);
  }, []);

  const handleCloseStaffDetail = useCallback(() => {
    if (!selectedStaff) return;
    const trimmed = furiganaInput.trim();
    if (trimmed && !/^[\u3040-\u309F\s\u3000]*$/.test(trimmed)) {
      Alert.alert("エラー", "ふりがなはひらがなのみで入力してください");
      return;
    }
    const staffId = selectedStaff.id;
    setSelectedStaff(null);
    const supabase = getSupabase();
    supabase.from("users").update({ furigana: trimmed }).eq("uid", staffId).then(() => refetchUsers());
  }, [selectedStaff, furiganaInput, refetchUsers]);

  const handleSaveWage = useCallback(() => {
    if (!selectedStaff) return;
    const newWage = Number.parseInt(wageInput.replace(/,/g, ""), 10);
    if (Number.isNaN(newWage) || newWage < 0) return;
    const staffId = selectedStaff.id;
    setSelectedStaff(null);
    const supabase = getSupabase();
    supabase.from("users").update({ hourly_wage: newWage }).eq("uid", staffId).then(() => refetchUsers());
  }, [selectedStaff, wageInput, refetchUsers]);

  const renderStaffCard = useCallback(
    ({ item }: { item: StaffData }) => {
      const effColor = getEfficiencyColor(item.efficiency);
      return (
        <TouchableOpacity style={styles.staffCard} onPress={() => openStaffDetail(item)} activeOpacity={0.7}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.xs }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: (item.color || theme.colorScheme.primary) + "22", justifyContent: "center", alignItems: "center", marginRight: theme.spacing.xs }}>
              <MaterialIcons name="person" size={16} color={item.color || theme.colorScheme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.staffName} numberOfLines={1}>
                {item.name}{item.furigana ? <Text style={{ ...theme.typography.bodySmall, color: theme.colorScheme.onSurfaceVariant }}>（{item.furigana}）</Text> : null}
              </Text>
              <Text style={{ fontSize: 10, color: theme.colorScheme.onSurfaceVariant }}>
                {item.monthsSinceJoin}ヶ月 / 稼働{item.approvedShiftCount}回
              </Text>
            </View>
          </View>
          <Text style={styles.staffHours}>{item.workedHours}h</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(item.efficiency, 100)}%`,
                    backgroundColor: effColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {item.efficiency.toFixed(0)}%
            </Text>
          </View>
          <Text style={styles.staffWage}>
            ¥{item.totalEarnings.toLocaleString()}
          </Text>
        </TouchableOpacity>
      );
    },
    [styles, theme, getEfficiencyColor, openStaffDetail]
  );

  if (shiftsLoading || usersLoading) {
    return null;
  }

  if (shifts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <MaterialIcons
            name="info"
            size={48}
            color={theme.colorScheme.outline}
          />
          <Text style={styles.noDataTitle}>シフトデータがありません</Text>
          <Text style={styles.noDataDescription}>
            シフトを登録すると、ここに分析データが表示されます。
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {}
        <View style={styles.tabBar}>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialIcons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {}
          {activeTab === "staff" && (
            <View style={styles.staffSection}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.lg, flexWrap: "wrap", gap: theme.spacing.sm }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>スタッフ一覧</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ borderWidth: 1, borderColor: theme.colorScheme.outline + "44", borderRadius: theme.shape.small, overflow: "hidden" }}>
                      <Picker
                        selectedValue={staffSortKey}
                        onValueChange={(v) => setStaffSortKey(v as StaffSortKey)}
                        style={{ height: 32, width: 130, fontSize: 12, color: theme.colorScheme.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <Picker.Item key={opt.key} label={opt.label} value={opt.key} style={{ fontSize: 13 }} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
                    <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontSize: 12 }}>最低時給 ¥</Text>
                    <TextInput
                      style={[styles.taskInput, { width: 64, paddingVertical: 4, paddingHorizontal: theme.spacing.sm, textAlign: "right", fontSize: 13 }]}
                      value={minimumWage.toString()}
                      onChangeText={(t) => {
                        const n = Number.parseInt(t.replace(/[^0-9]/g, ""), 10);
                        if (!Number.isNaN(n)) setMinimumWage(n);
                        else if (t === "") setMinimumWage(0);
                      }}
                      keyboardType="numeric"
                      onBlur={async () => {
                        if (minimumWage <= 0) return;
                        await saveSetting("minimum_wage", minimumWage);
                        const belowMin = users.filter((u) => (u.hourlyWage || 0) < minimumWage);
                        if (belowMin.length === 0) return;
                        const supabase = getSupabase();
                        const uids = belowMin.map((u) => u.uid);
                        await supabase.from("users").update({ hourly_wage: minimumWage }).in("uid", uids);
                        await refetchUsers();
                        Alert.alert("更新完了", `${belowMin.length}名の時給を¥${minimumWage.toLocaleString()}に更新しました`);
                      }}
                    />
                  </View>
                </View>
              </View>
              <FlatList
                data={sortedStaffData}
                renderItem={renderStaffCard}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                key={numColumns}
                columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
                scrollEnabled={false}
                contentContainerStyle={{ gap: theme.spacing.md }}
              />
            </View>
          )}

          {}
          {activeTab === "breaks" && (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.lg }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>途中時間タイプ管理</Text>
                <TouchableOpacity
                  style={[styles.taskActionBtn, { backgroundColor: theme.colorScheme.primary }]}
                  onPress={() => { setEditingTypeId(null); setNewTypeIcon("⏸"); setNewTypeName(""); setNewTypeColor("#9e9e9e"); setNewTypeWageMode("exclude"); setNewTypeCustomRate(""); setShowTypeColorPicker(false); setShowTypeIconPicker(false); setShowTypeModal(true); }}
                >
                  <Ionicons name="add" size={18} color={theme.colorScheme.onPrimary} />
                  <Text style={{ color: theme.colorScheme.onPrimary, fontSize: 13, fontWeight: "600", marginLeft: 2 }}>タイプ追加</Text>
                </TouchableOpacity>
              </View>

              {timeSegmentTypes.length === 0 ? (
                <View style={styles.summaryCard}>
                  <Text style={{ color: theme.colorScheme.onSurfaceVariant, textAlign: "center", paddingVertical: theme.spacing.lg }}>
                    途中時間タイプを追加して、シフト内の時間区分を管理しましょう
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
                  {timeSegmentTypes.map((segType) => {
                    const cardWidth = roleColumns > 1 ? `${(100 - (roleColumns - 1) * 1.5) / roleColumns}%` as any : "100%";
                    const wageModeLabel = segType.wageMode === "exclude" ? "給与除外"
                      : segType.wageMode === "include" ? "通常単価で含む"
                      : `別単価 ¥${segType.customRate}/時`;
                    return (
                      <TouchableOpacity key={segType.id} style={[styles.staffCard, { padding: theme.spacing.sm, width: cardWidth, marginBottom: 0 }]} onPress={() => openEditType(segType)} activeOpacity={0.6}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={[styles.taskBadgeLg, { backgroundColor: segType.color + "22" }]}>
                            <Text style={{ fontSize: 18, color: segType.color }}>{segType.icon}</Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                            <Text style={{ color: theme.colorScheme.onSurface, fontWeight: "700", fontSize: 14 }} numberOfLines={1}>{segType.name}</Text>
                            <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontSize: 11, marginTop: 2 }}>{wageModeLabel}</Text>
                          </View>
                          <TouchableOpacity onPress={() => deleteSegmentType(segType.id)} hitSlop={8}>
                            <Ionicons name="trash-outline" size={16} color={theme.colorScheme.error} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}

        </ScrollView>

        {}
        <Modal
          visible={!!selectedStaff}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseStaffDetail}
        >
          <Pressable style={styles.modalOverlay} onPress={handleCloseStaffDetail}>
            <Pressable style={[styles.modalContent, { maxWidth: 480, maxHeight: "85%" }]} onPress={(e) => e.stopPropagation()}>
              {selectedStaff && (
                <>
                  {}
                  <View style={styles.modalHeader}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: (selectedStaff.color || theme.colorScheme.primary) + "22", justifyContent: "center", alignItems: "center" }}>
                      <MaterialIcons name="person" size={24} color={selectedStaff.color || theme.colorScheme.primary} />
                    </View>
                    <Text style={styles.modalTitle}>{selectedStaff.name}</Text>
                    <TouchableOpacity onPress={handleCloseStaffDetail} style={styles.closeButton}>
                      <MaterialIcons name="close" size={24} color={theme.colorScheme.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>

                  {}
                  <View style={[styles.tabBar, { marginBottom: theme.spacing.lg }]}>
                    {([
                      { key: "info" as StaffDetailTab, label: "講師情報", icon: "info" },
                    ]).map((tab) => {
                      const isActive = staffDetailTab === tab.key;
                      return (
                        <TouchableOpacity
                          key={tab.key}
                          style={[styles.tabItem, isActive && styles.tabItemActive]}
                          onPress={() => setStaffDetailTab(tab.key)}
                        >
                          <MaterialIcons name={tab.icon as any} size={16} color={isActive ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant} />
                          <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {staffDetailTab === "info" && (
                      <View style={{ gap: theme.spacing.lg }}>
                        {}
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <MaterialIcons name="translate" size={20} color={theme.colorScheme.primary} />
                          <Text style={{ flex: 1, marginLeft: theme.spacing.md, color: theme.colorScheme.onSurfaceVariant, fontSize: 14 }}>ふりがな</Text>
                          <TextInput
                            style={[styles.taskInput, { width: 140, paddingVertical: 4, paddingHorizontal: theme.spacing.sm, fontSize: 14 }]}
                            value={furiganaInput}
                            onChangeText={setFuriganaInput}
                            placeholder="ひらがな"
                            placeholderTextColor={theme.colorScheme.outline}
                          />
                        </View>

                        {}
                        <TouchableOpacity
                          style={{ flexDirection: "row", alignItems: "center" }}
                          onPress={() => { setEditingWage(true); setWageInput(selectedStaff.hourlyWage.toString()); }}
                        >
                          <MaterialIcons name="badge" size={20} color={theme.colorScheme.primary} />
                          <Text style={{ flex: 1, marginLeft: theme.spacing.md, color: theme.colorScheme.onSurfaceVariant, fontSize: 14 }}>時給</Text>
                          {editingWage ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
                              <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontSize: 14 }}>¥</Text>
                              <TextInput
                                style={[styles.taskInput, { width: 80, paddingVertical: 4, textAlign: "right", fontSize: 14 }]}
                                value={wageInput}
                                onChangeText={setWageInput}
                                keyboardType="numeric"
                                autoFocus
                                onSubmitEditing={handleSaveWage}
                              />
                              <TouchableOpacity onPress={handleSaveWage} hitSlop={8}>
                                <Ionicons name="checkmark-circle" size={22} color={theme.colorScheme.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => setEditingWage(false)} hitSlop={8}>
                                <Ionicons name="close-circle" size={22} color={theme.colorScheme.outline} />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
                              <Text style={{ color: theme.colorScheme.onSurface, fontSize: 14, fontWeight: "600" }}>¥{selectedStaff.hourlyWage.toLocaleString()}</Text>
                              <MaterialIcons name="edit" size={14} color={theme.colorScheme.outline} />
                            </View>
                          )}
                        </TouchableOpacity>

                        {}
                        {([
                          { icon: "calendar-today" as const, label: "登録", value: selectedStaff.createdAt ? new Date(selectedStaff.createdAt).toLocaleDateString("ja-JP") : "-" },
                          { icon: "history" as const, label: "在籍期間", value: `${selectedStaff.monthsSinceJoin}ヶ月` },
                          { icon: "check-circle" as const, label: "承認済みシフト", value: `${selectedStaff.approvedShiftCount}件` },
                          { icon: "schedule" as const, label: "今月稼働", value: `${selectedStaff.workedHours}h` },
                          { icon: "attach-money" as const, label: "今月給与", value: `¥${selectedStaff.totalEarnings.toLocaleString()}` },
                          { icon: "trending-up" as const, label: "稼働率", value: `${selectedStaff.efficiency.toFixed(1)}%` },
                        ]).map((row) => (
                          <View key={row.label} style={{ flexDirection: "row", alignItems: "center" }}>
                            <MaterialIcons name={row.icon} size={20} color={theme.colorScheme.primary} />
                            <Text style={{ flex: 1, marginLeft: theme.spacing.md, color: theme.colorScheme.onSurfaceVariant, fontSize: 14 }}>{row.label}</Text>
                            <Text style={{ color: theme.colorScheme.onSurface, fontSize: 14, fontWeight: "600" }}>{row.value}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </ScrollView>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        {}
        <Modal visible={showTypeModal} transparent animationType="fade" onRequestClose={() => { setShowTypeModal(false); setEditingTypeId(null); }}>
          <Pressable style={styles.modalOverlay} onPress={() => { setShowTypeModal(false); setEditingTypeId(null); }}>
            <Pressable style={[styles.modalContent, { maxWidth: 400 }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <MaterialIcons name="timer" size={20} color={theme.colorScheme.primary} />
                <Text style={styles.modalTitle}>{editingTypeId ? "タイプ編集" : "タイプ追加"}</Text>
                <TouchableOpacity onPress={() => { setShowTypeModal(false); setEditingTypeId(null); }} hitSlop={8}>
                  <Ionicons name="close" size={22} color={theme.colorScheme.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: theme.spacing.md }}>
                {}
                <View>
                  <Text style={styles.taskInputLabel}>アイコン</Text>
                  <TouchableOpacity
                    style={[styles.taskInput, { justifyContent: "center", alignItems: "center", backgroundColor: newTypeColor + "22", borderColor: newTypeColor + "44", width: 60 }]}
                    onPress={() => setShowTypeIconPicker(true)}
                  >
                    <Text style={{ fontSize: 20, color: newTypeColor }}>{newTypeIcon || "+"}</Text>
                  </TouchableOpacity>
                </View>

                {}
                <View>
                  <Text style={styles.taskInputLabel}>名前</Text>
                  <TextInput style={styles.taskInput} value={newTypeName} onChangeText={setNewTypeName} placeholder="例: 休憩、授業" placeholderTextColor={theme.colorScheme.outline} />
                </View>

                {}
                <View>
                  <Text style={styles.taskInputLabel}>カラー</Text>
                  <TouchableOpacity
                    onPress={() => setShowTypeColorPicker(true)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: theme.colorScheme.outlineVariant, backgroundColor: theme.colorScheme.surface }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: newTypeColor }} />
                    <Text style={{ flex: 1, fontSize: 13, color: theme.colorScheme.onSurface }}>{newTypeColor}</Text>
                    <MaterialIcons name="palette" size={18} color={theme.colorScheme.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>

                {}
                <View>
                  <Text style={styles.taskInputLabel}>給与モード</Text>
                  <View style={{ borderWidth: 1, borderColor: theme.colorScheme.outlineVariant, borderRadius: theme.shape.small, overflow: "hidden" }}>
                    <Picker
                      selectedValue={newTypeWageMode}
                      onValueChange={(v) => setNewTypeWageMode(v as WageMode)}
                      style={{ height: 40, color: theme.colorScheme.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}
                    >
                      <Picker.Item label="給与除外" value="exclude" />
                      <Picker.Item label="通常単価で含む" value="include" />
                      <Picker.Item label="別単価" value="custom_rate" />
                    </Picker>
                  </View>
                </View>

                {}
                {newTypeWageMode === "custom_rate" && (
                  <View>
                    <Text style={styles.taskInputLabel}>時給（円）</Text>
                    <TextInput
                      style={styles.taskInput}
                      value={newTypeCustomRate}
                      onChangeText={setNewTypeCustomRate}
                      placeholder="例: 800"
                      placeholderTextColor={theme.colorScheme.outline}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </View>

              <View style={styles.modalButtonContainer}>
                <Button title="キャンセル" onPress={() => { setShowTypeModal(false); setEditingTypeId(null); }} variant="outline" size="medium" style={styles.modalButton} />
                <Button title={editingTypeId ? "保存" : "追加"} onPress={handleSaveType} variant="primary" size="medium" style={styles.modalButton} />
              </View>
            </Pressable>
          </Pressable>
        </Modal>

      </View>

      {}
      <Modal
        visible={showTypeColorPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeColorPicker(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}
          onPress={() => setShowTypeColorPicker(false)}
        >
          <Pressable style={{ backgroundColor: theme.colorScheme.surface, borderRadius: 16, padding: 20, width: "85%", maxWidth: 360 }} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.colorScheme.onSurface }}>カラー選択</Text>
              <TouchableOpacity onPress={() => setShowTypeColorPicker(false)} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={theme.colorScheme.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: newTypeColor, borderWidth: 2, borderColor: theme.colorScheme.outlineVariant }} />
            </View>
            <View style={{ gap: 3 }}>
              {COLOR_GRID.map((row, ri) => (
                <View key={ri} style={{ flexDirection: "row", gap: 3, justifyContent: "center" }}>
                  {row.map((c) => {
                    const isSelected = newTypeColor === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setNewTypeColor(c)}
                        style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: c, borderWidth: isSelected ? 2.5 : 0, borderColor: theme.colorScheme.onSurface }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowTypeColorPicker(false)}
              style={{ marginTop: 20, alignSelf: "stretch", paddingVertical: 10, borderRadius: 8, backgroundColor: theme.colorScheme.primary, alignItems: "center" }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colorScheme.onPrimary }}>決定</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {}
      <Modal
        visible={showTypeIconPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeIconPicker(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}
          onPress={() => setShowTypeIconPicker(false)}
        >
          <Pressable style={{ backgroundColor: theme.colorScheme.surface, borderRadius: 16, padding: 20, width: "85%", maxWidth: 400 }} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.colorScheme.onSurface }}>アイコン選択</Text>
              <TouchableOpacity onPress={() => setShowTypeIconPicker(false)} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={theme.colorScheme.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{
                width: 52, height: 52, borderRadius: 12,
                backgroundColor: newTypeColor + "22",
                borderWidth: 2, borderColor: newTypeColor + "44",
                justifyContent: "center", alignItems: "center",
              }}>
                <Text style={{ fontSize: 28, color: newTypeColor }}>
                  {newTypeIcon || "?"}
                </Text>
              </View>
            </View>
            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {ICON_OPTIONS.map((icon) => {
                  const isSelected = newTypeIcon === icon;
                  return (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => setNewTypeIcon(icon)}
                      style={{
                        width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center",
                        backgroundColor: isSelected ? newTypeColor + "22" : theme.colorScheme.surfaceVariant + "44",
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: newTypeColor,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{icon}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowTypeIconPicker(false)}
              style={{ marginTop: 20, alignSelf: "stretch", paddingVertical: 10, borderRadius: 8, backgroundColor: theme.colorScheme.primary, alignItems: "center" }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colorScheme.onPrimary }}>決定</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
};
