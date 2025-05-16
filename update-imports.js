const fs = require("fs");
const path = require("path");

// マッピング定義
const importPathMap = {
  "@/providers/AuthContext": "@/core/auth/AuthContext",
  "@/hooks/useAuth": "@/core/auth/useAuth",
  "@/types/auth": "@/core/auth/auth",
  "@/services/firebase": "@/core/firebase/firebase",

  "@/components/Shift": "@/features/shift/components/Shift",
  "@/hooks/useShift": "@/features/shift/hooks/useShift",
  "@/hooks/useShifts": "@/features/shift/hooks/useShifts",
  "@/types/shift": "@/features/shift/types/shift",

  "@/components/User": "@/features/user/components/User",
  "@/hooks/useUser": "@/features/user/hooks/useUser",
  "@/hooks/useUsers": "@/features/user/hooks/useUsers",
  "@/types/user": "@/features/user/types/user",

  "@/components/calendar": "@/features/calendar/components/calendar",
  "@/types/Calendar": "@/features/calendar/types/Calendar",

  "@/components/Common": "@/shared/components/Common",
  "@/components/Layout": "@/shared/components/Layout",
  "@/components/Stepper": "@/shared/components/Stepper",
  "@/components/TimePicker": "@/shared/components/TimePicker",
  "@/components/ColorPicker": "@/shared/components/ColorPicker",
  "@/components/CustomScrollView": "@/shared/components/CustomScrollView",

  "@/constants": "@/shared/constants",
  "@/theme": "@/shared/theme",
  "@/types/theme": "@/shared/types/theme",
  "@/utils": "@/shared/utils",
};

// 再帰的にディレクトリを探索する関数
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// ファイル内のインポートパスを更新する関数
function updateImportPaths(filePath) {
  // TS, TSX, JSファイルのみ処理
  if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) return;

  let content = fs.readFileSync(filePath, "utf8");
  let updated = false;

  // 各マッピングを適用
  for (const [oldPath, newPath] of Object.entries(importPathMap)) {
    const importRegex = new RegExp(`from\\s+['"]${oldPath}['"]`, "g");
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `from '${newPath}'`);
      updated = true;
    }

    // import構文だけでなく、requireにも対応
    const requireRegex = new RegExp(`require\\(['"]${oldPath}['"]\\)`, "g");
    if (requireRegex.test(content)) {
      content = content.replace(requireRegex, `require('${newPath}')`);
      updated = true;
    }
  }

  // 変更があった場合のみファイルを上書き
  if (updated) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated: ${filePath}`);
  }
}

// srcディレクトリ配下のファイルを処理
const srcDir = path.resolve("src");
walkDir(srcDir, updateImportPaths);

console.log("Import paths updated successfully!");
