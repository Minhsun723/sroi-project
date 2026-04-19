import { useState, useEffect } from 'react'
import './SROIForm.css'

const STEPS = [
  { id: 'scope',      label: '範疇定義' },
  { id: 'indicators', label: '成果指標' },
  { id: 'monetary',  label: '貨幣化價值' },
  { id: 'attribution', label: '歸因因子' },
  { id: 'feedback',  label: '回饋資訊' },
  { id: 'preview',   label: '預覽送出' },
]

const defaultForm = {
  // Step 1 — 範疇定義
  activityName: '',
  activityGoal: '',
  targetGroup: '',

  // Step 2 — 成果指標（可多組）
  indicatorResults: [{ stakeholder: '', result: '', explanation: '' }],

  // Step 3 — 貨幣化價值（可多組）
  monetaryValues: [{ stakeholder: '', outcome: '', value: '', explanation: '' }],

  // Step 4 — 歸因因子
  irrelevantFactors: [{ id: '1', stakeholderType: '', outcomeName: '', explanation: '' }],
  attributionFactor: 100,
  alternativesFactor: 100,
  transferFactor: 100,

  // Step 5 — 回饋資訊
  selectedStakeholder: '',
  unexpectedOutcomes: '',
  plannerComments: '',
  stakeholderFeedback: '',
}

const STAKEHOLDER_TYPES = [
  { value: 'supporter',    label: '出資者' },
  { value: 'executor',     label: '執行者' },
  { value: 'beneficiary',  label: '受益者' },
  { value: 'community',    label: '社區' },
  { value: 'government',   label: '政府單位' },
]

export default function SROIForm({ onSubmit }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(defaultForm)

  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // 假設步驟條原本距離頂部約 100px (你可以依據實際情況調整數字)
      // 當下滑超過這個數字時，設定 isSticky 為 true
      if (window.scrollY > 100) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    // 綁定滾動事件
    window.addEventListener('scroll', handleScroll)
    // 元件卸載時清除事件，避免記憶體外洩
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const updateList = (field, index, key, value) => {
    setForm(f => {
      const list = [...f[field]]
      list[index] = { ...list[index], [key]: value }
      return { ...f, [field]: list }
    })
  }

  const addItem = (field, template) =>
    setForm(f => ({ ...f, [field]: [...f[field], template] }))

  const removeItem = (field, index) =>
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))

  // 預估 SROI
  const totalInput = 0  // 此版本無投入金額欄位，保留供後端計算
  const totalOutcome = form.monetaryValues.reduce((s, o) => s + (Number(o.value) || 0), 0)
  const adjustedValue = totalOutcome
    * (form.attributionFactor / 100)
    * (form.alternativesFactor / 100)
    * (form.transferFactor / 100)

  return (
    <div className="form-wrapper">

      {/* ── STEPS NAV ──  {`steps ${isSticky ? 'sticky-mode' : ''}`} */}
      <div className="steps">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`step-btn ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => setStep(i)}
          >
            <span className="step-num">{i < step ? '✓' : i + 1}</span>
            <span className="step-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="form-body">

        {/* ── STEP 0：範疇定義 ── */}
        {step === 0 && (
          <div>
            <div className="section-title">範疇定義 — Scope Definition</div>
            <p className="step-desc">描述本次活動的核心資訊，讓 AI 了解計畫的整體脈絡。</p>

            <div className="field">
              <label>活動名稱 <span className="req">*</span></label>
              <input
                value={form.activityName}
                onChange={e => update('activityName', e.target.value)}
                placeholder="例：青年數位職能培訓計畫"
              />
            </div>

            <div className="field">
              <label>活動目標 <span className="req">*</span></label>
              <textarea
                value={form.activityGoal}
                onChange={e => update('activityGoal', e.target.value)}
                placeholder="請描述活動預期達成的目標，例如：提升弱勢青年就業競爭力，幫助其取得技能認證…"
                rows={4}
              />
            </div>

            <div className="field">
              <label>目標族群 <span className="req">*</span></label>
              <textarea
                value={form.targetGroup}
                onChange={e => update('targetGroup', e.target.value)}
                placeholder="請描述主要受益對象，例如：18–30 歲低收入戶青年，具高中以上學歷…"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1：成果指標 ── */}
        {step === 1 && (
          <div>
            <div className="section-title">成果指標 — Indicator Results</div>
            <p className="step-desc">列出活動為各利害關係人帶來的具體改變與衡量指標，可新增多組。</p>

            {form.indicatorResults.map((item, i) => (
              <div className="card" key={i}>
                <div className="card-header">
                  <span className="card-num">成果指標 #{i + 1}</span>
                  {form.indicatorResults.length > 1 && (
                    <button className="btn btn-danger" onClick={() => removeItem('indicatorResults', i)}>移除</button>
                  )}
                </div>

                <div className="field">
                  <label>利害關係人</label>
                  <input
                    value={item.stakeholder}
                    onChange={e => updateList('indicatorResults', i, 'stakeholder', e.target.value)}
                    placeholder="例：弱勢青年學員"
                  />
                </div>

                <div className="field">
                  <label>指標結果</label>
                  <input
                    value={item.result}
                    onChange={e => updateList('indicatorResults', i, 'result', e.target.value)}
                    placeholder="例：就業率從 30% 提升至 75%"
                  />
                </div>

                <div className="field">
                  <label>結果說明</label>
                  <textarea
                    value={item.explanation}
                    onChange={e => updateList('indicatorResults', i, 'explanation', e.target.value)}
                    placeholder="請說明此指標的測量方法、資料來源及其代表意義…"
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <button
              className="btn btn-add"
              onClick={() => addItem('indicatorResults', { stakeholder: '', result: '', explanation: '' })}
            >
              + 新增成果指標
            </button>
          </div>
        )}

        {/* ── STEP 2：貨幣化價值 ── */}
        {step === 2 && (
          <div>
            <div className="section-title">貨幣化價值 — Monetary Value</div>
            <p className="step-desc">將各項成果轉換為貨幣化數字，作為 SROI 計算的基礎，可新增多組。</p>

            {form.monetaryValues.map((item, i) => (
              <div className="card" key={i}>
                <div className="card-header">
                  <span className="card-num">貨幣化項目 #{i + 1}</span>
                  {form.monetaryValues.length > 1 && (
                    <button className="btn btn-danger" onClick={() => removeItem('monetaryValues', i)}>移除</button>
                  )}
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label>利害關係人</label>
                    <input
                      value={item.stakeholder}
                      onChange={e => updateList('monetaryValues', i, 'stakeholder', e.target.value)}
                      placeholder="例：弱勢青年學員"
                    />
                  </div>
                  <div className="field">
                    <label>成果項目</label>
                    <input
                      value={item.outcome}
                      onChange={e => updateList('monetaryValues', i, 'outcome', e.target.value)}
                      placeholder="例：就業率提升"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>貨幣化價值（元）</label>
                  <input
                    type="number"
                    value={item.value}
                    onChange={e => updateList('monetaryValues', i, 'value', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="field">
                  <label>說明 / 財務代理來源</label>
                  <textarea
                    value={item.explanation}
                    onChange={e => updateList('monetaryValues', i, 'explanation', e.target.value)}
                    placeholder="例：依勞動部薪資統計，就業青年年薪平均增加 NT$ 120,000，乘以受益人數 100 人…"
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <button
              className="btn btn-add"
              onClick={() => addItem('monetaryValues', { stakeholder: '', outcome: '', value: '', explanation: '' })}
            >
              + 新增貨幣化項目
            </button>

            {totalOutcome > 0 && (
              <div className="summary-bar">
                <span>成果總價值（未調整）</span>
                <span className="summary-val">NT$ {totalOutcome.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3：歸因因子 ── */}
        {step === 3 && (
          <div>
            <div className="section-title">歸因因子 — Attribution Factors</div>
            <p className="step-desc">列出影響成果的外部因子，並透過滑桿設定歸因係數，避免高估實際貢獻。</p>

            {/* 無關因子清單 */}
            <div className="sub-section-label">無關因子 Irrelevant Factors</div>

            {form.irrelevantFactors.map((factor, i) => (
              <div className="card" key={factor.id}>
                <div className="card-header">
                  <span className="card-num">無關因子 #{i + 1}</span>
                  {form.irrelevantFactors.length > 1 && (
                    <button
                      className="btn btn-danger"
                      onClick={() => removeItem('irrelevantFactors', i)}
                    >移除</button>
                  )}
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label>利害關係人類別</label>
                    <select
                      value={factor.stakeholderType}
                      onChange={e => updateList('irrelevantFactors', i, 'stakeholderType', e.target.value)}
                    >
                      <option value="">請選擇…</option>
                      {STAKEHOLDER_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>成果項目名稱</label>
                    <input
                      value={factor.outcomeName}
                      onChange={e => updateList('irrelevantFactors', i, 'outcomeName', e.target.value)}
                      placeholder="例：就業率提升"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>說明</label>
                  <textarea
                    value={factor.explanation}
                    onChange={e => updateList('irrelevantFactors', i, 'explanation', e.target.value)}
                    placeholder="請說明此因子為何與本專案無關，或其影響程度…"
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <button
              className="btn btn-add"
              onClick={() => addItem('irrelevantFactors', {
                id: Date.now().toString(),
                stakeholderType: '',
                outcomeName: '',
                explanation: ''
              })}
            >
              + 新增無關因子
            </button>

            {/* 調整滑桿 */}
            <div className="sub-section-label" style={{ marginTop: '28px' }}>調整係數 Adjustment Factors</div>

            {[
              {
                key: 'attributionFactor',
                label: '歸因比例 Attribution',
                desc: '本專案對成果的實際貢獻程度（扣除其他組織共同投入）',
              },
              {
                key: 'alternativesFactor',
                label: '替代方案 Alternatives',
                desc: '若沒有本專案，受益人透過其他管道取得類似成果的可能性',
              },
              {
                key: 'transferFactor',
                label: '轉移效應 Transfer',
                desc: '本專案的正面成果是否排擠或轉移其他地區的負面影響',
              },
            ].map(f => (
              <div className="factor-card" key={f.key}>
                <div className="factor-info">
                  <div className="factor-label">{f.label}</div>
                  <div className="factor-desc">{f.desc}</div>
                </div>
                <div className="factor-input">
                  <input
                    type="range"
                    min="0" max="100" step="1"
                    value={form[f.key]}
                    onChange={e => update(f.key, Number(e.target.value))}
                  />
                  <span className="factor-val">{form[f.key]}%</span>
                </div>
              </div>
            ))}

            {totalOutcome > 0 && (
              <div className="sroi-preview">
                <div className="sroi-preview-label">預估調整後社會價值</div>
                <div className="sroi-preview-val">NT$ {Math.round(adjustedValue).toLocaleString()}</div>
                <div className="sroi-preview-desc">
                  成果總值 NT$ {totalOutcome.toLocaleString()} × 歸因 {form.attributionFactor}% × 替代 {form.alternativesFactor}% × 轉移 {form.transferFactor}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4：回饋資訊 ── */}
        {step === 4 && (
          <div>
            <div className="section-title">回饋資訊 — Feedback</div>
            <p className="step-desc">補充非預期成果、計畫者觀察與利害關係人回饋，讓 AI 生成更完整的報告。</p>

            <div className="field">
              <label>利害關係人統計類別</label>
              <select
                value={form.selectedStakeholder}
                onChange={e => update('selectedStakeholder', e.target.value)}
              >
                <option value="">請選擇…</option>
                {STAKEHOLDER_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <span className="field-hint">選擇後 AI 報告將針對此類別進行深度分析</span>
            </div>

            <div className="field">
              <label>非預期成果</label>
              <textarea
                value={form.unexpectedOutcomes}
                onChange={e => update('unexpectedOutcomes', e.target.value)}
                placeholder="請描述活動過程中出現的非預期正面或負面成果，例如：社區凝聚力意外提升、志工人數超過預期…"
                rows={4}
              />
            </div>

            <div className="field">
              <label>計畫者補充意見</label>
              <textarea
                value={form.plannerComments}
                onChange={e => update('plannerComments', e.target.value)}
                placeholder="請填寫計畫主持人或評估者對本次活動的整體觀察與補充說明…"
                rows={4}
              />
            </div>

            <div className="field">
              <label>利害關係人回饋</label>
              <textarea
                value={form.stakeholderFeedback}
                onChange={e => update('stakeholderFeedback', e.target.value)}
                placeholder="請填寫受益者、出資者或其他利害關係人對活動的評價或意見…"
                rows={4}
              />
            </div>
          </div>
        )}

        {/* ── STEP 5：預覽送出 ── */}
        {step === 5 && (
          <div>
            <div className="section-title">預覽與送出 — Preview & Submit</div>

            <div className="preview-grid">
              <div className="preview-card">
                <div className="preview-card-title">範疇定義</div>
                <div className="preview-item">
                  <span>活動名稱</span>
                  <span>{form.activityName || '—'}</span>
                </div>
                <div className="preview-item">
                  <span>目標族群</span>
                  <span>{form.targetGroup ? form.targetGroup.slice(0, 30) + (form.targetGroup.length > 30 ? '…' : '') : '—'}</span>
                </div>
              </div>

              <div className="preview-card">
                <div className="preview-card-title">數據摘要</div>
                <div className="preview-item">
                  <span>成果指標</span>
                  <span>{form.indicatorResults.filter(r => r.stakeholder).length} 組</span>
                </div>
                <div className="preview-item">
                  <span>貨幣化項目</span>
                  <span>{form.monetaryValues.filter(m => m.value).length} 組</span>
                </div>
                <div className="preview-item">
                  <span>無關因子</span>
                  <span>{form.irrelevantFactors.filter(f => f.outcomeName).length} 項</span>
                </div>
              </div>

              <div className="preview-card">
                <div className="preview-card-title">財務摘要</div>
                <div className="preview-item">
                  <span>成果總價值</span>
                  <span>NT$ {totalOutcome.toLocaleString()}</span>
                </div>
                <div className="preview-item">
                  <span>調整後價值</span>
                  <span>NT$ {Math.round(adjustedValue).toLocaleString()}</span>
                </div>
                <div className="preview-item">
                  <span>歸因 / 替代 / 轉移</span>
                  <span>{form.attributionFactor}% / {form.alternativesFactor}% / {form.transferFactor}%</span>
                </div>
              </div>
            </div>

            <div className="submit-note">
              確認資料無誤後，點擊「生成 SROI 報告」讓 AI 產出完整分析報告
            </div>
          </div>
        )}

        {/* ── NAVIGATION ── */}
        <div className="form-nav">
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
              ← 上一步
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              下一步 →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ background: 'var(--gold)', fontSize: '15px', padding: '13px 36px' }}
              onClick={() => onSubmit(form)}
              disabled={!form.activityName}
            >
              生成 SROI 報告
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
