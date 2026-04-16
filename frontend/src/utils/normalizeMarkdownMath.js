/**
 * 修正 `$$ ... $$` 區塊內「純數字 + 千分位逗號」的 \\frac{}{}，避免逗號在數學模式被誤判。
 * 僅處理兩個參數皆為 [數字、逗號、空白] 的情況，不碰 \\frac{\\text{...}}{...} 等。
 */
export function normalizeLatexFracNumbers(md) {
  if (!md || typeof md !== 'string') return md

  return md.replace(/\$\$([\s\S]*?)\$\$/g, (full, inner) => {
    const fixed = inner.replace(
      /\\frac\{([\d,\s]+)\}\{([\d,\s]+)\}/g,
      (_, a, b) => {
        const na = a.replace(/[\s,]/g, '')
        const nb = b.replace(/[\s,]/g, '')
        return `\\frac{${na}}{${nb}}`
      }
    )
    return `$$${fixed}$$`
  })
}
