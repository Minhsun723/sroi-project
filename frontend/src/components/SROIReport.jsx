import { useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { normalizeMarkdownPipeTables } from '../utils/normalizeMarkdownTables'
import { normalizeLatexFracNumbers } from '../utils/normalizeMarkdownMath'
import 'katex/dist/katex.min.css'
import './SROIReport.css'

export default function SROIReport({ report, formData, onBack }) {
  const reportRef = useRef(null)

  // 安全地处理 formData
  if (!formData) {
    return (
      <div className="report-wrapper">
        <div className="report-topbar">
          <button className="btn btn-secondary" onClick={onBack}>← 返回編輯</button>
        </div>
        <div className="report-error">無法取得表單資料，請返回重新填寫。</div>
      </div>
    )
  }

  const totalOutcome = (formData.monetaryValues || []).reduce((s, o) => s + (Number(o.value) || 0), 0)
  const adjustedValue = totalOutcome
    * ((formData.attributionFactor || 100) / 100)
    * ((formData.alternativesFactor || 100) / 100)
    * ((formData.transferFactor || 100) / 100)
  const sroi = totalOutcome > 0 ? (adjustedValue).toFixed(0) : 0

  const handlePrint = () => window.print()

  const reportForDisplay = useMemo(() => {
    const raw = typeof report === 'string' ? report : ''
    const piped = normalizeMarkdownPipeTables(raw)
    return normalizeLatexFracNumbers(piped)
  }, [report])

  const handleDownload = () => {
    const blob = new Blob([reportForDisplay], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SROI報告_${formData.activityName || '報告'}_${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isStreaming = report && !report.includes('##') ? false : true

  return (
    <div className="report-wrapper">
      {/* Top bar */}
      <div className="report-topbar">
        <button className="btn btn-secondary" onClick={onBack}>
          ← 返回修改
        </button>
        <div className="report-title-area">
          <span className="report-badge">SROI 報告</span>
          <h1 className="report-project-name">{formData.activityName || '社會影響力評估報告'}</h1>
        </div>
        <div className="report-actions">
          <button className="btn btn-secondary" onClick={handleDownload}>
            ↓ 下載 Markdown
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            ⎙ 列印 / 存 PDF
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat">
          <div className="stat-label">成果總價值</div>
          <div className="stat-val">NT$ {totalOutcome.toLocaleString()}</div>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <div className="stat-label">調整後社會價值</div>
          <div className="stat-val">NT$ {Math.round(adjustedValue).toLocaleString()}</div>
        </div>
        <div className="stat-divider" />
        <div className="stat highlight">
          <div className="stat-label">調整倍數</div>
          <div className="stat-val">
            {((formData.attributionFactor || 100) / 100 * 
              (formData.alternativesFactor || 100) / 100 * 
              (formData.transferFactor || 100) / 100).toFixed(2)}x
          </div>
        </div>
      </div>

      {/* Report content */}
      <div className="report-content" ref={reportRef}>
        {!report ? (
          <div className="report-loading">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <p>AI 正在撰寫報告中...</p>
          </div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                [remarkMath, { singleDollarTextMath: false }],
              ]}
              rehypePlugins={[
                [
                  rehypeKatex,
                  {
                    strict: false,
                    throwOnError: false,
                    errorColor: '#b42318',
                    trust: false,
                  },
                ],
              ]}
            >
              {reportForDisplay}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Factor breakdown */}
      {formData && (
        <div className="factor-breakdown">
          <div className="section-title">調整因子說明</div>
          <div className="factor-row">
            <span>成果總價值</span>
            <span>NT$ {totalOutcome.toLocaleString()}</span>
          </div>
          <div className="factor-row">
            <span>歸因比例（Attribution）</span>
            <span>{formData.attributionFactor || 100}%</span>
          </div>
          <div className="factor-row">
            <span>替代方案（Alternatives）</span>
            <span>{formData.alternativesFactor || 100}%</span>
          </div>
          <div className="factor-row">
            <span>轉移效應（Transfer）</span>
            <span>{formData.transferFactor || 100}%</span>
          </div>
          <div className="factor-row total">
            <span>調整後社會价值</span>
            <span>NT$ {Math.round(adjustedValue).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
