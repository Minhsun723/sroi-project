import { useState } from 'react'
import SROIForm from './components/SROIForm'
import SROIReport from './components/SROIReport'
import './App.css'

export default function App() {
  const [step, setStep] = useState('form') // 'form' | 'generating' | 'report'
  const [formData, setFormData] = useState(null)
  const [report, setReport] = useState('')

  const handleSubmit = async (data) => {
    setFormData(data)
    setStep('generating')
    setReport('')

    try {
      const res = await fetch('/api/generate-sroi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: data }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`API 請求失敗: ${res.status} - ${errText}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      setStep('report')

      let isDone = false
      while (!isDone) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            isDone = true
            break
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              setReport(prev => prev + parsed.content)
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error('生成報告錯誤:', err)
      setReport(`生成報告時發生錯誤：${err.message}`)
      setStep('report')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-text">Impact Copilot</span>
          </div>
        </div>
      </header>

      <main className="main">
        {step === 'form' && (
          <SROIForm onSubmit={handleSubmit} />
        )}
        {step === 'generating' && (
          <div className="generating">
            <div className="generating-icon"></div>
            <h2>正在分析並生成 SROI 報告</h2>
            <p>AI 正在根據您填寫的資料進行深度分析…</p>
            <div className="dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        {step === 'report' && (
          <SROIReport
            report={report}
            formData={formData}
            onBack={() => { setStep('form'); setReport('') }}
          />
        )}
      </main>
    </div>
  )
}
