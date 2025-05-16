import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  updatePassword,
  updateEmail,
  signOut,
  User as FirebaseUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
  getDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Shift, ShiftStatus } from "@/features/shift/types/shift";
import { User } from "@/features/user/types/user";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// シフト関連の関数
export const getShifts = async (): Promise<Shift[]> => {
  try {
    const shiftsRef = collection(db, "shifts");
    const q = query(
      shiftsRef,
      orderBy("date", "asc"),
      orderBy("startTime", "asc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId || "",
        nickname: data.nickname || "",
        date: data.date || "",
        startTime: data.startTime || "",
        endTime: data.endTime || "",
        type: data.type || "staff",
        subject: data.subject || "",
        isCompleted: data.isCompleted || false,
        status: data.status || "draft",
        duration: data.duration || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        classes: data.classes || [],
        requestedChanges: data.requestedChanges || undefined,
      };
    });
  } catch (error) {
    console.error("シフトの取得に失敗しました:", error);
    throw error;
  }
};

export const addShift = async (shift: Omit<Shift, "id">): Promise<string> => {
  try {
    const shiftsRef = collection(db, "shifts");
    const docRef = await addDoc(shiftsRef, {
      ...shift,
      type: shift.type || "staff",
      status: "draft",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("シフトの追加に失敗しました:", error);
    throw error;
  }
};

export const updateShift = async (
  id: string,
  shift: Partial<Shift>
): Promise<void> => {
  try {
    const shiftRef = doc(db, "shifts", id);
    await updateDoc(shiftRef, {
      ...shift,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("シフトの更新に失敗しました:", error);
    throw error;
  }
};

export const markShiftAsDeleted = async (id: string): Promise<void> => {
  try {
    const shiftRef = doc(db, "shifts", id);
    await deleteDoc(shiftRef);
  } catch (error) {
    console.error("シフトの削除に失敗しました:", error);
    throw error;
  }
};

export const approveShiftChanges = async (id: string): Promise<void> => {
  try {
    const shiftRef = doc(db, "shifts", id);
    const shiftDoc = await getDoc(shiftRef);
    const shiftData = shiftDoc.data();

    if (shiftData?.requestedChanges) {
      await updateDoc(shiftRef, {
        ...shiftData.requestedChanges,
        status: "approved",
        requestedChanges: null,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("シフトの変更承認に失敗しました:", error);
    throw error;
  }
};

export const markShiftAsCompleted = async (id: string): Promise<void> => {
  try {
    const shiftRef = doc(db, "shifts", id);
    await updateDoc(shiftRef, {
      status: "completed",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("シフトの完了状態への更新に失敗しました:", error);
    throw error;
  }
};

// ユーザー関連の関数
export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;
    return {
      uid: firebaseUser.uid,
      nickname: firebaseUser.displayName || email.split("@")[0],
      role: email.startsWith("master@") ? "master" : "user",
    };
  } catch (error) {
    console.error("サインインエラー:", error);
    throw error;
  }
};

// ユーザーのロールを判定
export const getUserRole = async (user: any) => {
  const email = user.email;
  return email.startsWith("master@") ? "master" : "user";
};

// 新しいユーザーを作成
export const createUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    console.log("Creating user with email:", email);

    // 1. まずFirebase Authenticationでユーザーを作成
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    ).catch((error) => {
      console.error("Firebase Authentication error:", error);
      throw error;
    });

    const firebaseUser = userCredential.user;
    console.log("Firebase user created:", firebaseUser.uid);

    // 2. ユーザープロファイルを更新
    await updateProfile(firebaseUser, {
      displayName: email.split("@")[0],
    }).catch((error) => {
      console.error("Update profile error:", error);
      throw error;
    });

    // 3. Firestoreにユーザー情報を保存
    const userRef = doc(db, "users", firebaseUser.uid);
    const userData = {
      nickname: email.split("@")[0],
      role: email.startsWith("master@") ? "master" : "user",
      currentPassword: password,
      email: email,
      createdAt: new Date(),
    };

    await setDoc(userRef, userData).catch((error) => {
      console.error("Firestore save error:", error);
      throw error;
    });

    console.log("User data saved to Firestore");

    // 4. 作成されたユーザー情報を返す
    return {
      uid: firebaseUser.uid,
      nickname: email.split("@")[0],
      role: email.startsWith("master@") ? "master" : "user",
    };
  } catch (error) {
    console.error("ユーザー作成エラー:", error);
    throw error;
  }
};

// 既存ユーザーを更新
export const updateUser = async (
  user: User,
  updates: {
    nickname?: string;
    password?: string;
    role?: "master" | "user";
  }
): Promise<User | undefined> => {
  try {
    const userRef = doc(db, "users", user.uid);
    const updateData: { [key: string]: any } = {};

    if (updates.nickname) {
      updateData.nickname = updates.nickname;
      updateData.displayName = updates.nickname;
    }
    if (updates.role) updateData.role = updates.role;
    if (updates.password) updateData.currentPassword = updates.password;

    await updateDoc(userRef, updateData);

    // Firebase Authenticationの更新
    const currentUser = auth.currentUser;
    if (currentUser) {
      if (updates.nickname) {
        await updateProfile(currentUser, {
          displayName: updates.nickname,
        });
      }

      if (updates.password) {
        // 現在のパスワードで再認証
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        if (userData?.currentPassword) {
          try {
            const credential = EmailAuthProvider.credential(
              currentUser.email!,
              userData.currentPassword
            );
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, updates.password);
            // 新しいパスワードで更新
            await updateDoc(userRef, {
              currentPassword: updates.password,
            });
          } catch (error) {
            console.error("パスワード更新エラー:", error);
            throw new Error("パスワードの更新に失敗しました");
          }
        }
      }
    }

    const updatedDoc = await getDoc(userRef);
    if (updatedDoc.exists()) {
      const data = updatedDoc.data();
      return {
        uid: updatedDoc.id,
        role: data.role as "master" | "user",
        nickname: data.nickname || "",
      };
    }
    return undefined;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// 初期マスターユーザーの作成（必要な場合のみ使用）
export const createInitialMasterUser = async () => {
  try {
    await createUser("master@example.com", "123456");
    console.log("初期マスターユーザーを作成しました");
  } catch (error: any) {
    // すでにユーザーが存在する場合は無視
    if (error.code === "auth/email-already-in-use") {
      console.log("マスターユーザーは既に存在します");
      return;
    }
    console.error("初期マスターユーザーの作成に失敗しました:", error);
  }
};

export const getUsers = async (): Promise<
  (User & { currentPassword?: string })[]
> => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      role: data.role || "user",
      nickname: data.nickname || "",
      currentPassword: data.currentPassword,
    };
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  const userRef = doc(db, "users", id);
  await deleteDoc(userRef);
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("サインアウトエラー:", error);
    throw error;
  }
};

// ユーザーデータの型定義
export interface UserData {
  nickname: string;
  role: "master" | "user";
  email: string;
  currentPassword?: string;
  createdAt: Date;
}

// ユーザーデータを取得する関数
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        nickname: data.nickname,
        role: data.role,
        email: data.email,
        currentPassword: data.currentPassword,
        createdAt: data.createdAt.toDate(),
      };
    }
    return null;
  } catch (error) {
    console.error("ユーザーデータの取得に失敗しました:", error);
    throw error;
  }
};

export type { User };
