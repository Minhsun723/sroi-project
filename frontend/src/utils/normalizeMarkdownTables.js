/**
 * 修正 LLM 常見的「pipe 表格全擠在同一行」寫法，讓 GFM 能正確辨識列邊界。
 * 例：`| 欄A | 欄B | | :--- | :--- | | 資料…` → 各列獨立一行。
 */
export function normalizeMarkdownPipeTables(md) {
  if (!md || typeof md !== 'string') return md

  let s = md
  // 表頭列與對齊列之間少了換行
  s = s.replace(/\|\s+\|(\s*:?-{3,})/g, '|\n|$1')

  let prev
  let guard = 0
  do {
    prev = s
    // 對齊列或資料列緊貼下一列（下一格常以中文、英文、數字或括號開頭）
    s = s.replace(
      /\|\s+\|(\s*[\u4e00-\u9fffA-Za-z0-9（「【『(])/g,
      '|\n|$1'
    )
    guard++
  } while (s !== prev && guard < 64)

  return s
}
