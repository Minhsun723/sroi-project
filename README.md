# SROI 報告產生器 — Impact Copilot

用 AI 自動生成專業的社會投資報酬率（SROI）報告。

## 快速開始

### 安裝套件
```bash
# 安裝根目錄套件
npm install

# 安裝前後端套件
npm run install:all
```

### 開發模式（前後端同時啟動）
```bash
npm run dev
```

- 前端：http://localhost:5173
- 後端：http://localhost:3001

### 生產模式
```bash
# 先 build 前端
npm run build

# 啟動後端（會同時提供前端靜態檔案）
npm start
```

### 環境變數設定
```bash
API_KEY=YOUR-API-KEY
MODEL_NAME=gemma-4-26b # 模型名稱可能會更新，需手動更新
PORT=8080 # Port 有占用時導致無法執行修改此項

```

- 開啟：http://localhost:3001

## 專案結構

```
sroi-app/
├── backend/
│   ├── server.js      # Express 後端，串接 AI API
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # 主應用
│   │   └── components/
│   │       ├── SROIForm.jsx     # 6 步驟表單
│   │       └── SROIReport.jsx   # 報告顯示
│   ├── index.html
│   └── vite.config.js
└── package.json       # 整合腳本
```

## 表單步驟

1. **範疇定義** - 專案名稱、組織、評估期間、描述
2. **利害關係人** - 新增受益者、出資者等
3. **投入資源** - 各項成本與金額
4. **活動產出** - 服務人次、場次等
5. **成果指標** - 成果描述與貨幣化價值
6. **歸因因子** - 無謂損失、歸因比例、替代效應、衰退率
7. **預覽送出** - 確認資料後生成報告

## 功能

- ✅ 6 步驟引導式 SROI 表單
- ✅ 即時 SROI 比率預覽
- ✅ AI 串流生成報告（打字機效果）
- ✅ 下載 Markdown 格式報告
- ✅ 列印 / 存成 PDF
- ✅ 響應式設計
