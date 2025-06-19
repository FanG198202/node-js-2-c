# node-js-2-c

嘗試將在 Node.js 上開發的 JavaScript 腳本完全移植到 C/C++ 語言環境，並生成可獨立執行的 exe 檔案。

---

## 目標

本專案旨在探索如何將 JavaScript 應用程式（特別是在 Node.js 上運行的腳本），轉換並編譯為原生的 C 或 C++ 可執行檔案，實現無需 Node.js 執行環境即可運行的獨立 exe。

---

## 面臨的挑戰

1. **語言差異與語法轉換**
   - JavaScript 為動態語言，C/C++ 為靜態強型別語言，兩者在語法、標準庫、記憶體管理等方面有顯著差異。
   - JavaScript 的高階結構（如 Promise、async/await、原型繼承）需手動在 C/C++ 重構或尋找等價實現。

2. **Node.js API 依賴**
   - JavaScript 腳本常依賴 Node.js 的眾多內建模組（如 fs、http、events 等），這些需在 C/C++ 中重寫或找相對應的第三方函式庫。

3. **第三方套件支援**
   - npm 生態系的龐大第三方套件無法直接在 C/C++ 使用，需自行移植、替換或重構。

4. **動態特性與反射能力**
   - C/C++ 缺乏 JavaScript 的動態執行、Eval、反射等能力，相關部分需以靜態方式重新設計。

5. **跨平台相容性**
   - 不同作業系統（Windows/MacOS/Linux）在系統調用、編譯工具鏈、依賴庫等方面有差異，需分別處理。

---

## 環境設置

本專案建議於下列環境進行：

### Windows

- 安裝 [Visual Studio](https://visualstudio.microsoft.com/zh-hant/)（含 C++ 工具集）或 [MinGW](https://www.mingw-w64.org/)
- 可選擇 [Cygwin](https://www.cygwin.com/) 以獲得類 Unix 開發體驗
- 安裝 [Node.js](https://nodejs.org/)（用於原始 JS 腳本測試）

### macOS

- 安裝 [Xcode](https://developer.apple.com/xcode/) 及 Command Line Tools
- 使用 [Homebrew](https://brew.sh/) 安裝 GCC 或 Clang
- 安裝 Node.js

### Linux (Ubuntu/Debian 為例)

```bash
sudo apt update
sudo apt install build-essential gcc g++ clang nodejs npm
```

---

## 操作步驟

### 1. 準備 JavaScript 原始碼

- 確保 JS 腳本可於 Node.js 環境下正常運行
- 盡量避免大量依賴動態語法或第三方 npm 套件

### 2. 進行語法與架構分析

- 釐清所有 Node.js API、第三方庫的用法
- 記錄各模組間的邏輯關係與數據流

### 3. 設定 C/C++ 開發環境

- 建立專案資料夾，初始化 Makefile 或 CMake 專案
- 決定主要使用 C 還是 C++，根據原始 JS 程式的需求選擇

### 4. 手動重寫或自動轉譯

#### 手動重寫

- 依據功能模組，將 JS 程式碼用 C/C++ 重新實現
    - 變數型態轉換
    - 控制流程（if/for/while/函數）映射
    - 事件/回呼機制重構

#### 自動轉譯（進階）

- 可研究 [QuickJS](https://bellard.org/quickjs/)、[duktape](https://duktape.org/) 這類嵌入式 JS 引擎，將 JS 腳本包進 C 程式，再編譯為 exe
  - 缺點為產生的 exe 仍需內嵌 JS 引擎，效能與體積會受影響

- 另有開源工具如 [js2c](https://github.com/clehner/js2c) 或 [emscripten](https://emscripten.org/)（雖主要為 js->wasm/c）

### 5. 編譯生成可執行檔

- 使用 gcc、g++ 或 clang 進行編譯
- 根據各平台調整參數，例如：
    - Windows: `g++ main.cpp -o app.exe`
    - macOS: `clang++ main.cpp -o app`
    - Linux: `g++ main.cpp -o app`

### 6. 測試與除錯

- 在目標平台上測試 exe 檔功能是否與原 JS 腳本一致
- 針對錯誤訊息進行修正，重複上述步驟

---

## 參考工具與資源

- [QuickJS](https://bellard.org/quickjs/) - 輕量級 JS 引擎，可嵌入 C 程式
- [Duktape](https://duktape.org/) - 嵌入式 JS 引擎
- [js2c](https://github.com/clehner/js2c) - JS 轉 C 工具
- [Emscripten](https://emscripten.org/) - JS/C/C++ 互轉與 WebAssembly 生成工具
- [N-API (Node.js C/C++ Addons)](https://nodejs.org/api/n-api.html) - 可參考其原理

---

## 小結

將 Node.js JavaScript 腳本完全轉換為 C/C++ exe 屬於較高難度的工程，需面對語言、執行環境、API 相容性等多重挑戰。建議分階段進行、逐步替換，並善用現有工具與開源資源，以提高效率並確保最終成果的穩定性與可維護性。
