# API 設計書

## 概要

Shiftize アプリケーションの API 設計書です。Firebase Firestore を基盤とするリアルタイムデータベースアクセスとクライアント側のサービス層について記述します。

## 1. サービス層アーキテクチャ

### 1.1 サービス設計原則

- **単一責任原則**: 各サービスは特定のデータドメインに対してのみ責任を持つ
- **依存関係の注入**: Firebase インスタンスの外部注入
- **エラーハンドリング**: 統一されたエラー処理パターン
- **型安全性**: TypeScript による厳密な型定義

### 1.2 サービス一覧

```typescript
// サービス層の全体構成
export interface ServiceLayer {
  auth: AuthService;
  normalTask: NormalTaskService;
  taskMemo: TaskMemoService;
  shift: ShiftService;
  user: UserService;
  store: StoreService;
  notification: NotificationService;
  audit: AuditService;
}
```

## 2. 認証サービス (AuthService)

### 2.1 基本機能

```typescript
export interface AuthService {
  // 認証状態の取得
  getCurrentUser(): Promise<User | null>;

  // ログイン
  login(email: string, password: string): Promise<UserCredential>;

  // ログアウト
  logout(): Promise<void>;

  // 認証状態の監視
  onAuthStateChanged(callback: (user: User | null) => void): () => void;

  // パスワードリセット
  resetPassword(email: string): Promise<void>;

  // 権限チェック
  checkPermission(action: string, resource: string): Promise<boolean>;
}
```

### 2.2 実装例

```typescript
class AuthServiceImpl implements AuthService {
  constructor(private auth: Auth, private db: Firestore) {}

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // 監査ログの記録
      await this.logUserAction("login", userCredential.user.uid);

      return userCredential;
    } catch (error) {
      throw new AuthError("Login failed", error);
    }
  }

  async logout(): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      await this.logUserAction("logout", user.uid);
    }

    await signOut(this.auth);
  }

  private async logUserAction(action: string, userId: string): Promise<void> {
    await addDoc(collection(this.db, "auditLogs"), {
      action,
      userId,
      timestamp: Timestamp.now(),
      ip: await this.getClientIP(),
      userAgent: navigator.userAgent,
    });
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch {
      return "unknown";
    }
  }
}
```

## 3. タスク管理サービス (NormalTaskService)

### 3.1 基本機能

```typescript
export interface NormalTaskService {
  // タスク一覧取得
  getTasks(storeId: string, options?: TaskQueryOptions): Promise<NormalTask[]>;

  // タスクの作成
  createTask(taskData: TaskFormData, storeId: string): Promise<string>;

  // タスクの更新
  updateTask(taskId: string, updates: Partial<NormalTask>): Promise<void>;

  // タスクの削除
  deleteTask(taskId: string): Promise<void>;

  // タスクの監視
  watchTasks(
    storeId: string,
    callback: (tasks: NormalTask[]) => void
  ): () => void;

  // タスクの検索
  searchTasks(storeId: string, query: TaskSearchQuery): Promise<NormalTask[]>;

  // タスクの一括操作
  bulkUpdateTasks(
    updates: Array<{ id: string; updates: Partial<NormalTask> }>
  ): Promise<void>;
}

// クエリオプション
export interface TaskQueryOptions {
  status?: TaskStatus[];
  assignedTo?: string[];
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  orderBy?: TaskOrderBy;
}

// 検索クエリ
export interface TaskSearchQuery {
  text?: string;
  status?: TaskStatus[];
  tags?: string[];
  priority?: TaskPriority[];
}
```

### 3.2 実装例

```typescript
class NormalTaskServiceImpl implements NormalTaskService {
  constructor(private db: Firestore, private auth: Auth) {}

  async getTasks(
    storeId: string,
    options: TaskQueryOptions = {}
  ): Promise<NormalTask[]> {
    try {
      // 基本クエリの構築
      let q = query(
        collection(this.db, "NormalTasks"),
        where("storeId", "==", storeId)
      );

      // フィルタリング
      if (options.status?.length) {
        q = query(q, where("status", "in", options.status));
      }

      if (options.assignedTo?.length) {
        q = query(
          q,
          where("assignedTo", "array-contains-any", options.assignedTo)
        );
      }

      if (options.createdBy) {
        q = query(q, where("createdBy", "==", options.createdBy));
      }

      if (options.dateRange) {
        q = query(
          q,
          where("createdAt", ">=", Timestamp.fromDate(options.dateRange.start)),
          where("createdAt", "<=", Timestamp.fromDate(options.dateRange.end))
        );
      }

      // ソート
      if (options.orderBy) {
        q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
      } else {
        q = query(q, orderBy("lastActionAt", "desc"));
      }

      // 制限
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as NormalTask)
      );
    } catch (error) {
      throw new TaskServiceError("Failed to fetch tasks", error);
    }
  }

  async createTask(taskData: TaskFormData, storeId: string): Promise<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new AuthError("User not authenticated");
    }

    try {
      const taskDoc: Omit<NormalTask, "id"> = {
        ...taskData,
        storeId,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        lastActionAt: Timestamp.now(),
        lastActionBy: currentUser.uid,
        version: 1,
      };

      const docRef = await addDoc(collection(this.db, "NormalTasks"), taskDoc);

      // 監査ログの記録
      await this.logTaskAction("create", docRef.id, currentUser.uid);

      return docRef.id;
    } catch (error) {
      throw new TaskServiceError("Failed to create task", error);
    }
  }

  async updateTask(
    taskId: string,
    updates: Partial<NormalTask>
  ): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new AuthError("User not authenticated");
    }

    try {
      const taskRef = doc(this.db, "NormalTasks", taskId);
      const taskDoc = await getDoc(taskRef);

      if (!taskDoc.exists()) {
        throw new TaskServiceError("Task not found");
      }

      const currentTask = taskDoc.data() as NormalTask;

      // 楽観的ロック
      const updatedData = {
        ...updates,
        lastActionAt: Timestamp.now(),
        lastActionBy: currentUser.uid,
        version: currentTask.version + 1,
      };

      await updateDoc(taskRef, updatedData);

      // 監査ログの記録
      await this.logTaskAction("update", taskId, currentUser.uid, updates);
    } catch (error) {
      throw new TaskServiceError("Failed to update task", error);
    }
  }

  watchTasks(
    storeId: string,
    callback: (tasks: NormalTask[]) => void
  ): () => void {
    const q = query(
      collection(this.db, "NormalTasks"),
      where("storeId", "==", storeId),
      orderBy("lastActionAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as NormalTask)
      );

      callback(tasks);
    });
  }

  async searchTasks(
    storeId: string,
    query: TaskSearchQuery
  ): Promise<NormalTask[]> {
    try {
      let q = query(
        collection(this.db, "NormalTasks"),
        where("storeId", "==", storeId)
      );

      if (query.status?.length) {
        q = query(q, where("status", "in", query.status));
      }

      if (query.tags?.length) {
        q = query(q, where("tags", "array-contains-any", query.tags));
      }

      if (query.priority?.length) {
        q = query(q, where("priority", "in", query.priority));
      }

      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as NormalTask)
      );

      // テキスト検索（クライアント側フィルタリング）
      if (query.text) {
        const searchTerm = query.text.toLowerCase();
        results = results.filter(
          (task) =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description?.toLowerCase().includes(searchTerm)
        );
      }

      return results;
    } catch (error) {
      throw new TaskServiceError("Failed to search tasks", error);
    }
  }

  private async logTaskAction(
    action: string,
    taskId: string,
    userId: string,
    metadata?: any
  ): Promise<void> {
    await addDoc(collection(this.db, "auditLogs"), {
      action: `task_${action}`,
      resourceId: taskId,
      resourceType: "task",
      userId,
      metadata,
      timestamp: Timestamp.now(),
    });
  }
}
```

## 4. メモサービス (TaskMemoService)

### 4.1 基本機能

```typescript
export interface TaskMemoService {
  // メモ一覧取得
  getMemos(taskId: string): Promise<TaskMemo[]>;

  // メモの作成
  createMemo(taskId: string, content: string): Promise<string>;

  // メモの更新
  updateMemo(memoId: string, content: string): Promise<void>;

  // メモの削除
  deleteMemo(memoId: string): Promise<void>;

  // メモの監視
  watchMemos(taskId: string, callback: (memos: TaskMemo[]) => void): () => void;

  // メモの検索
  searchMemos(taskId: string, query: string): Promise<TaskMemo[]>;
}
```

### 4.2 実装例

```typescript
class TaskMemoServiceImpl implements TaskMemoService {
  constructor(private db: Firestore, private auth: Auth) {}

  async createMemo(taskId: string, content: string): Promise<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new AuthError("User not authenticated");
    }

    try {
      const memoData: Omit<TaskMemo, "id"> = {
        taskId,
        content,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false,
      };

      const docRef = await addDoc(collection(this.db, "TaskMemos"), memoData);

      // タスクの最終更新時間を更新
      await this.updateTaskLastAction(taskId);

      return docRef.id;
    } catch (error) {
      throw new TaskMemoServiceError("Failed to create memo", error);
    }
  }

  watchMemos(
    taskId: string,
    callback: (memos: TaskMemo[]) => void
  ): () => void {
    const q = query(
      collection(this.db, "TaskMemos"),
      where("taskId", "==", taskId),
      where("isDeleted", "==", false),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const memos = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as TaskMemo)
      );

      callback(memos);
    });
  }

  private async updateTaskLastAction(taskId: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    const taskRef = doc(this.db, "NormalTasks", taskId);
    await updateDoc(taskRef, {
      lastActionAt: Timestamp.now(),
      lastActionBy: currentUser.uid,
    });
  }
}
```

## 5. シフトサービス (ShiftService)

### 5.1 基本機能

```typescript
export interface ShiftService {
  // シフト一覧取得
  getShifts(storeId: string, options?: ShiftQueryOptions): Promise<Shift[]>;

  // 月別シフト取得
  getShiftsByMonth(
    storeId: string,
    year: number,
    month: number
  ): Promise<Shift[]>;

  // シフトの作成
  createShift(shiftData: ShiftFormData): Promise<string>;

  // シフトの更新
  updateShift(shiftId: string, updates: Partial<Shift>): Promise<void>;

  // シフトの削除
  deleteShift(shiftId: string): Promise<void>;

  // シフトの監視
  watchShifts(storeId: string, callback: (shifts: Shift[]) => void): () => void;

  // シフトの一括作成
  bulkCreateShifts(shifts: ShiftFormData[]): Promise<string[]>;
}
```

## 6. エラーハンドリング

### 6.1 カスタムエラークラス

```typescript
// 基底エラークラス
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// 各サービス固有のエラー
export class AuthError extends ServiceError {
  constructor(message: string, originalError?: any) {
    super(message, "AUTH_ERROR", originalError);
  }
}

export class TaskServiceError extends ServiceError {
  constructor(message: string, originalError?: any) {
    super(message, "TASK_SERVICE_ERROR", originalError);
  }
}

export class TaskMemoServiceError extends ServiceError {
  constructor(message: string, originalError?: any) {
    super(message, "TASK_MEMO_SERVICE_ERROR", originalError);
  }
}

export class ShiftServiceError extends ServiceError {
  constructor(message: string, originalError?: any) {
    super(message, "SHIFT_SERVICE_ERROR", originalError);
  }
}
```

### 6.2 エラーハンドリングパターン

```typescript
// サービス層でのエラーハンドリング
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      // Firebase エラーの変換
      if (error.code?.startsWith("auth/")) {
        throw new AuthError(error.message, error);
      }

      if (error.code?.startsWith("firestore/")) {
        throw new TaskServiceError(error.message, error);
      }

      // その他のエラー
      throw new ServiceError("Unknown error occurred", "UNKNOWN_ERROR", error);
    }
  };
};

// 使用例
const createTaskWithErrorHandling = withErrorHandling(
  async (taskData: TaskFormData, storeId: string) => {
    // 実際の処理
    return await normalTaskService.createTask(taskData, storeId);
  }
);
```

## 7. キャッシュ戦略

### 7.1 React Query 統合

```typescript
// タスク取得のキャッシュ
export const useTasksQuery = (storeId: string, options?: TaskQueryOptions) => {
  return useQuery({
    queryKey: ["tasks", storeId, options],
    queryFn: () => normalTaskService.getTasks(storeId, options),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5分
    cacheTime: 10 * 60 * 1000, // 10分
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// タスク作成のミューテーション
export const useCreateTaskMutation = (storeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: TaskFormData) =>
      normalTaskService.createTask(taskData, storeId),
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries(["tasks", storeId]);
    },
    onError: (error) => {
      // エラーハンドリング
      console.error("Task creation failed:", error);
    },
  });
};
```

### 7.2 リアルタイム更新との統合

```typescript
// リアルタイム更新とキャッシュの同期
export const useRealtimeTasksSync = (storeId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!storeId) return;

    const unsubscribe = normalTaskService.watchTasks(storeId, (tasks) => {
      // React Query キャッシュを更新
      queryClient.setQueryData(["tasks", storeId], tasks);
    });

    return unsubscribe;
  }, [storeId, queryClient]);
};
```

## 8. 型定義

### 8.1 基本型定義

```typescript
// タスク関連
export interface NormalTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string[];
  createdBy: string;
  createdAt: Timestamp;
  lastActionAt: Timestamp;
  lastActionBy: string;
  storeId: string;
  tags: string[];
  version: number;
}

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string[];
  tags: string[];
}

// メモ関連
export interface TaskMemo {
  id: string;
  taskId: string;
  content: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted: boolean;
}

// シフト関連
export interface Shift {
  id: string;
  storeId: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  date: Timestamp;
  position: string;
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ShiftFormData {
  storeId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  position: string;
  notes?: string;
}
```

### 8.2 クエリ・応答型定義

```typescript
// API応答型
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// ページネーション
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 検索結果
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters: Record<string, any>;
}
```

## 9. パフォーマンス最適化

### 9.1 クエリ最適化

```typescript
// 複合インデックスの活用
export const createOptimizedQuery = (
  storeId: string,
  options: TaskQueryOptions
) => {
  // 最も選択的なフィルタを最初に適用
  let q = query(collection(db, "NormalTasks"), where("storeId", "==", storeId));

  // インデックスを考慮した順序でフィルタを適用
  if (options.status?.length === 1) {
    q = query(q, where("status", "==", options.status[0]));
  }

  if (options.assignedTo?.length === 1) {
    q = query(q, where("assignedTo", "array-contains", options.assignedTo[0]));
  }

  return q;
};
```

### 9.2 バッチ処理

```typescript
// バッチ書き込みの実装
export const batchUpdateTasks = async (
  updates: Array<{ id: string; updates: Partial<NormalTask> }>
) => {
  const batch = writeBatch(db);

  updates.forEach(({ id, updates }) => {
    const taskRef = doc(db, "NormalTasks", id);
    batch.update(taskRef, {
      ...updates,
      lastActionAt: Timestamp.now(),
      version: increment(1),
    });
  });

  await batch.commit();
};
```

## 10. セキュリティ対策

### 10.1 入力検証

```typescript
// 入力検証スキーマ
export const taskValidationSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedTo: z.array(z.string().uuid()),
  tags: z.array(z.string().max(50)),
});

// 検証付きサービス
export const createTaskWithValidation = async (
  taskData: unknown,
  storeId: string
) => {
  const validatedData = taskValidationSchema.parse(taskData);
  return await normalTaskService.createTask(validatedData, storeId);
};
```

### 10.2 認可チェック

```typescript
// 認可チェック関数
export const checkTaskPermission = async (
  taskId: string,
  action: "read" | "write" | "delete"
): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  const taskDoc = await getDoc(doc(db, "NormalTasks", taskId));
  if (!taskDoc.exists()) return false;

  const task = taskDoc.data() as NormalTask;
  const storeId = task.storeId;

  // 店舗アクセス権限をチェック
  const hasStoreAccess = await checkStoreAccess(currentUser.uid, storeId);
  if (!hasStoreAccess) return false;

  // アクション別の権限チェック
  switch (action) {
    case "read":
      return true; // 店舗アクセス権限があれば読み取り可能
    case "write":
      return (
        task.assignedTo.includes(currentUser.uid) ||
        (await isMaster(currentUser.uid, storeId))
      );
    case "delete":
      return (
        task.createdBy === currentUser.uid ||
        (await isMaster(currentUser.uid, storeId))
      );
    default:
      return false;
  }
};
```

この API 設計書により、型安全で保守性の高い、スケーラブルなサービス層を実現できます。Firebase Firestore の特性を活かしながら、リアルタイム更新とキャッシュ戦略を組み合わせた効率的なデータアクセス層を提供します。
