// サンプルスケジュールデータ（リファクタリング後）
// 旧: app/(main)/scheduleSample.ts
// 新: modules/home-view/scheduleSample.ts
export const sampleSchedule = [
  {
    position: "Aレジ",
    slots: [
      { time: "5:30", name: "石黒", task: "FF/補充/前準備" },
      { time: "6:00", name: "石黒", task: "レジ/補充/前準備" },
      { time: "6:30", name: "ウエノ", task: "レジ/補充/前準備" },
      { time: "7:00", name: "ウエノ", task: "レジ/補充/前準備" },
      { time: "7:30", name: "ウエノ", task: "レジ/補充/前準備" },
    ],
  },
  {
    position: "Bレジ",
    slots: [
      { time: "5:30", name: "里田", task: "レジ/補充/前準備" },
      { time: "6:00", name: "里田", task: "レジ/補充/前準備" },
      { time: "6:30", name: "作安", task: "レジ/補充/前準備" },
      { time: "7:00", name: "作安", task: "レジ/補充/前準備" },
      { time: "7:30", name: "作安", task: "レジ/補充/前準備" },
    ],
  },
  // ...他のポジションも同様に追加
];

export const timeSlots = ["5:30", "6:00", "6:30", "7:00", "7:30"];
