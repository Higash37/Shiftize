/**
 * 特定店舗の全講師にconnectedStores配列を追加するスクリプト
 * 使用方法: node scripts/add-connected-stores-to-users.js
 */

const admin = require("firebase-admin");

// Firebase Admin SDKの初期化
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addConnectedStoresToUsers() {
  try {
    // 設定：連携する店舗ID
    const storeId1 = "1456"; // トライ川崎駅前校
    const storeId2 = "0000"; // 連携先店舗ID

    console.log(
      `Adding connected stores between ${storeId1} and ${storeId2}...`
    );

    // store1の全講師を取得
    const store1UsersQuery = await db
      .collection("users")
      .where("storeId", "==", storeId1)
      .get();

    // store2の全講師を取得
    const store2UsersQuery = await db
      .collection("users")
      .where("storeId", "==", storeId2)
      .get();

    const batch = db.batch();
    let updateCount = 0;

    // store1の講師にstore2を追加
    store1UsersQuery.forEach((doc) => {
      const userData = doc.data();
      const currentConnected = userData.connectedStores || [];

      if (!currentConnected.includes(storeId2)) {
        const newConnectedStores = [...currentConnected, storeId2];
        batch.update(doc.ref, {
          connectedStores: newConnectedStores,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        updateCount++;
        console.log(
          `Will update user ${
            userData.nickname || doc.id
          } (${storeId1}) - adding ${storeId2}`
        );
      }
    });

    // store2の講師にstore1を追加
    store2UsersQuery.forEach((doc) => {
      const userData = doc.data();
      const currentConnected = userData.connectedStores || [];

      if (!currentConnected.includes(storeId1)) {
        const newConnectedStores = [...currentConnected, storeId1];
        batch.update(doc.ref, {
          connectedStores: newConnectedStores,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        updateCount++;
        console.log(
          `Will update user ${
            userData.nickname || doc.id
          } (${storeId2}) - adding ${storeId1}`
        );
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(
        `✅ Successfully updated ${updateCount} users with connected stores.`
      );
    } else {
      console.log(
        "ℹ️  No updates needed - all users already have correct connected stores."
      );
    }

    // 結果確認
    console.log("\nVerification:");
    const updatedStore1Users = await db
      .collection("users")
      .where("storeId", "==", storeId1)
      .get();
    updatedStore1Users.forEach((doc) => {
      const userData = doc.data();
      console.log(
        `${
          userData.nickname || doc.id
        } (${storeId1}): connectedStores = ${JSON.stringify(
          userData.connectedStores || []
        )}`
      );
    });

    const updatedStore2Users = await db
      .collection("users")
      .where("storeId", "==", storeId2)
      .get();
    updatedStore2Users.forEach((doc) => {
      const userData = doc.data();
      console.log(
        `${
          userData.nickname || doc.id
        } (${storeId2}): connectedStores = ${JSON.stringify(
          userData.connectedStores || []
        )}`
      );
    });
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    process.exit();
  }
}

addConnectedStoresToUsers();
