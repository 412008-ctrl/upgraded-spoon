# Google Apps Script 單字後端整合

這份文件說明如何讓管理者在 `manager.html` 的表單輸入單字資料，並將資料傳送到 Google Apps Script 後端，再寫入 Google 試算表。

## 1. 前端：管理者表單欄位

管理頁面 `manager.html` 已更新為以下欄位：

- 英文單字
- 中文翻譯
- 詞性
- 字根/來源
- 例句

前端提交後，`manager.js` 會：

1. 將輸入資料寫入 localStorage（保留現有背單字功能）
2. 使用 `fetch` 將 JSON 資料 POST 到 Google Apps Script Web App
3. 顯示同步狀態訊息

### 1.1 目前前端送出設定

在 `manager.js` 中，請找到並修改以下常數為你自己的 GAS Web App URL：

```js
const GAS_ENDPOINT = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
```

請將 `YOUR_SCRIPT_ID` 換成你部署後的實際 Script ID 或完整 Web App URL。

## 2. Google 試算表準備

1. 開啟 Google 試算表
2. 建立一個新工作表，例如 `word_data`
3. 在第一列加入標題欄位：
   - `word`
   - `translation`
   - `pos`
   - `etymology`
   - `example`
   - `createdAt`

例如：

| word | translation | pos | etymology | example | createdAt |
|------|-------------|-----|-----------|---------|-----------|

## 3. 建立 Google Apps Script

1. 在 Google 試算表的功能表選擇：`擴充功能` -> `Apps Script`
2. 建立一個新專案
3. 將 `Code.gs` 內容改成以下程式碼：

```js
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
    const row = [
      params.word || '',
      params.translation || '',
      params.pos || '',
      params.etymology || '',
      params.example || '',
      params.createdAt || new Date().toISOString()
    ]
    sheet.appendRow(row)

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '寫入成功' }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
```

### 3.1 欄位對應

- `word` → 試算表 `word`
- `translation` → 試算表 `translation`
- `pos` → 試算表 `pos`
- `etymology` → 試算表 `etymology`
- `example` → 試算表 `example`
- `createdAt` → 試算表 `createdAt`

## 4. 部署 Web App

1. 點選右上角的 `部署` -> `新增部署`
2. 選擇 `Web 應用程式`
3. 設定：
   - `描述`：例如 `Word Form Backend`
   - `執行應用程式的身分`：選擇自己
   - `對象使用者`：`任何人，包括匿名使用者` （若希望讓公開網頁能夠提交資料）
4. 點選 `部署`
5. 複製 `Web 應用程式網址`
6. 將前端 `manager.js` 中的 `GAS_ENDPOINT` 更新為這個網址

## 5. 測試流程

1. 開啟 `manager.html`
2. 填入單字、翻譯、詞性、字根/來源、例句
3. 按下 `儲存單字`
4. 若前端顯示「已成功儲存單字並同步至後端。」表示提交成功
5. 打開 Google 試算表，確認新資料已寫入新的一列

## 6. 常見問題

### 6.1 無法送出資料

- 檢查 `GAS_ENDPOINT` 是否為正確的 Web App URL
- 確認 Google Apps Script 已部署為最新版本
- 確認 Web App 權限設定為 `任何人，包括匿名使用者`

### 6.2 後端回傳錯誤

- 檢查 Google Apps Script `doPost` 是否有語法錯誤
- 確認 `Content-Type` 為 `application/json`
- 可以在 Apps Script 編輯器中查看執行紀錄與錯誤訊息

## 7. 進一步擴充建議

如果你想讓 `index.html` 讀取 Google 試算表資料，而不是 localStorage，可以：

1. 在 Apps Script 新增 `doGet` 接口
2. 讓前端以 `fetch` 讀取 JSON
3. 將 `app.js` 的資料來源改成 Web API

---

### 補充：目前專案已更新的檔案

- `manager.html`
- `manager.js`
- `app.js`
- `GAS-Word-Form-Integration.md`
