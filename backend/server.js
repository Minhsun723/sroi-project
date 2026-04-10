import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = 'sk-0332347c01ea4a68bee0a39dd07420a7bee14da632e14718a5ab01f16ca3a';
const API_ENDPOINT = 'https://codgenx.infinirc.com/api/v1';

app.post('/api/generate-sroi', async (req, res) => {
  const { formData: d } = req.body;

  const totalOutcome = (d.monetaryValues || []).reduce((s, o) => s + (Number(o.value) || 0), 0);
  const adjustedValue = totalOutcome
    * ((d.attributionFactor || 100) / 100)
    * ((d.alternativesFactor || 100) / 100)
    * ((d.transferFactor || 100) / 100);

  const prompt = `你是一位專業的社會影響力評估（SROI）分析師，請根據以下資料生成一份完整、專業的繁體中文 SROI 報告。

## 一、範疇定義
- 活動名稱：${d.activityName || '（未填）'}
- 活動目標：${d.activityGoal || '（未填）'}
- 目標族群：${d.targetGroup || '（未填）'}

## 二、成果指標
${(d.indicatorResults || []).map((r, i) =>
  `${i + 1}. 利害關係人：${r.stakeholder}\n   指標結果：${r.result}\n   說明：${r.explanation}`
).join('\n')}

## 三、貨幣化價值
${(d.monetaryValues || []).map((m, i) =>
  `${i + 1}. 利害關係人：${m.stakeholder} ／ 成果：${m.outcome}\n   價值：NT$ ${Number(m.value || 0).toLocaleString()}\n   說明：${m.explanation}`
).join('\n')}
成果總價值（未調整）：NT$ ${totalOutcome.toLocaleString()}

## 四、歸因因子
- 歸因比例（Attribution）：${d.attributionFactor || 100}%
- 替代方案（Alternatives）：${d.alternativesFactor || 100}%
- 轉移效應（Transfer）：${d.transferFactor || 100}%
- 調整後社會價值：NT$ ${Math.round(adjustedValue).toLocaleString()}

無關因子說明：
${(d.irrelevantFactors || []).filter(f => f.outcomeName).map((f, i) =>
  `${i + 1}. 類別：${f.stakeholderType} ／ 成果項目：${f.outcomeName}\n   說明：${f.explanation}`
).join('\n')}

## 五、回饋資訊
- 主要分析利害關係人類別：${d.selectedStakeholder || '（未指定）'}
- 非預期成果：${d.unexpectedOutcomes || '（無）'}
- 計畫者補充意見：${d.plannerComments || '（無）'}
- 利害關係人回饋：${d.stakeholderFeedback || '（無）'}

---

請產出包含以下章節的完整 SROI 報告：

1. **執行摘要** — 活動概述、核心發現、SROI 比率（請根據資料合理計算，若缺少總投入金額請說明假設）
2. **活動背景與目的** — 脈絡分析與計畫邏輯
3. **利害關係人分析** — 各群體的角色與受影響程度
4. **成果地圖** — 投入→活動→產出→成果→影響的因果鏈
5. **影響力衡量** — 各成果貨幣化分析與歸因調整計算過程
6. **SROI 計算** — 詳細計算步驟與最終 SROI 比率（格式：**SROI 比率：1：X.XX**）
7. **敏感度分析** — 關鍵假設變動 ±10% 下的結果範圍
8. **非預期成果與回饋整合**
9. **結論與改善建議**

語氣專業客觀，使用繁體中文，數字計算過程請明確列示，對缺少的資料請標注假設說明。`;

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'codgenx-3.5',
        messages: [
          { role: 'system', content: '你是一位專業的社會影響力評估（SROI）分析師，擅長生成詳細、專業的 SROI 報告。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`API 錯誤 ${response.status}:`, err);
      return res.status(response.status).json({ error: `API 呼叫失敗: ${err}` });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body;
    reader.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
          } catch (e) {
            console.error('JSON 解析錯誤:', e);
          }
        }
      }
    });

    reader.on('end', () => {
      if (!res.headersSent) {
        res.write('data: [DONE]\n\n');
      }
      res.end();
    });

    reader.on('error', (err) => {
      console.error('串流錯誤:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: '串流發生錯誤' });
      } else {
        res.end();
      }
    });

  } catch (error) {
    console.error('伺服器錯誤:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end();
    }
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
