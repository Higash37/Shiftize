/**
 * @file AppVersion.ts
 * @description アプリのバージョン情報を管理するユーティリティクラス。
 *              package.json からバージョン番号を直接読み込み、アプリ内に表示する。
 *
 * 【このファイルの位置づけ】
 * - 設定画面やフッター等でバージョン表示に使用される
 * - package.json を直接インポートしてバージョン番号を取得する
 * - npm run release:patch/minor/major で package.json のバージョンが更新されると、
 *   このクラスの出力も自動的に変わる
 * - 関連ファイル: package.json（バージョン番号の管理元）
 *
 * 【セマンティックバージョニング（SemVer）】
 * バージョン番号は major.minor.patch の形式（例: 1.2.3）
 * - major: 破壊的変更（互換性のない変更）時にインクリメント
 * - minor: 後方互換性のある新機能追加時にインクリメント
 * - patch: バグ修正時にインクリメント
 *
 * 【@ts-ignore の解説】
 * TypeScriptはデフォルトでJSONファイルのインポートに型チェックを行う。
 * package.json にはモジュール型宣言がないため、@ts-ignore で
 * 型チェックエラーを意図的に無視している。
 * resolveJsonModule が tsconfig.json で有効な場合は不要になる。
 */

// @ts-ignore → 次の行のTypeScriptエラーを無視する指示

import packageJson from "../../../../package.json";

export class AppVersion {

  static getVersion(): string {

    return packageJson.version;
  }

  static getFormattedVersion(): string {
    return `Version ${packageJson.version}`;
  }

  static getAppName(): string {
    return "Shiftize -シフタイズ-";
  }

  static getAppInfo() {
    return {
      name: this.getAppName(),
      version: this.getVersion(),
      formattedVersion: this.getFormattedVersion(),
    };
  }
}
