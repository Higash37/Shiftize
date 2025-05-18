# ガントチャート表示仕様書

## 1. 共通仕様

### 1.1 デザイン
- 両方とも同じデザイン
- 月単位の表示
- スタッフ一覧表示
- カレンダー表示
- スタイルの一貫性

### 1.2 編集機能
- 両方とも編集可能
- ドラッグ＆ドロップ
- シフトの追加
- シフトの削除
- シフトの編集

## 2. 差異仕様

### 2.1 今月シフト表示
- シフトの重なり表示
- 部分的に重複しないシフトは1行に詰める
- 例：
  ```
  [15:00~17:00][17:00~19:00]  // 1行に詰める
  ```
- 部分的に重複する場合は分ける
- 例：
  ```
  [17:00~18:00]
  [17:30~19:00]      // 部分的に重複するため分ける
  ```

### 2.2 来月シフト表示
- シフトの1行表示
- 同じ日でも全てのシフトを1行ずつ表示
- 例：
  ```
  [15:00~17:00]
  [17:00~19:00]      // 同じ日でも1行ずつ表示
  ```
- 重複チェックは行わない
- すべてのシフトを独立して表示

## 3. 表示ロジック

### 3.1 シフトの重なり判定
```typescript
function isShiftOverlap(shift1: Shift, shift2: Shift): boolean {
  const start1 = new Date(`2000-01-01T${shift1.startTime}`);
  const end1 = new Date(`2000-01-01T${shift1.endTime}`);
  const start2 = new Date(`2000-01-01T${shift2.startTime}`);
  const end2 = new Date(`2000-01-01T${shift2.endTime}`);

  return !(end1 <= start2 || start1 >= end2);
}
```

### 3.2 シフトのグループ化
```typescript
interface ShiftGroup {
  date: string;
  shifts: Shift[];
  isGrouped: boolean;  // 今月シフトのみ使用
}

function groupShifts(shifts: Shift[]): ShiftGroup[] {
  const groups: ShiftGroup[] = [];
  
  // 日付ごとにグループ化
  const dailyShifts = groupBy(shifts, 'date');
  
  for (const [date, shiftsOfDay] of Object.entries(dailyShifts)) {
    const group: ShiftGroup = {
      date,
      shifts: [],
      isGrouped: false
    };
    
    // 今月シフトの場合は重なりをチェック
    if (isCurrentMonth) {
      // 重なりがないシフトを1行に詰める
      const nonOverlappingShifts = shiftsOfDay.filter((shift, i) => {
        return !shiftsOfDay.some((otherShift, j) => {
          return j !== i && isShiftOverlap(shift, otherShift);
        });
      });
      
      if (nonOverlappingShifts.length > 1) {
        group.isGrouped = true;
        group.shifts = nonOverlappingShifts;
      }
    }
    
    // 来月シフトの場合は全て1行ずつ
    if (!isCurrentMonth) {
      group.shifts = shiftsOfDay;
    }
    
    groups.push(group);
  }
  
  return groups;
}
```

## 4. UI/UX

### 4.1 今月シフト
- シフトの重なりを視覚的に表示
- 重複シフトは色で区別
- グループ化されたシフトは特別な表示

### 4.2 来月シフト
- シンプルな1行表示
- 重複チェックなし
- 編集に最適化

## 5. エラーハンドリング

### 5.1 重複チェック
- 今月シフト：
  - 重複シフトの検出
  - グループ化の失敗
  - 表示のエラー

- 来月シフト：
  - シフトの追加エラー
  - シフトの削除エラー
  - シフトの編集エラー

## 6. 今後の拡張性

### 6.1 新機能
- シフトの自動調整
- カレンダー連携
- テンプレート機能

### 6.2 表示改善
- レスポンシブデザイン
- タッチ操作の最適化
- パフォーマンス改善
