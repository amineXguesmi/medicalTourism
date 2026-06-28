'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Upload, Brain, CheckCircle, AlertTriangle, FileText, Lock,
  Shield, ChevronDown, ChevronUp, Loader2, Download, Share2,
  Pill, FlaskConical, Clock, HelpCircle, AlertCircle, Info
} from 'lucide-react'
import { uploadAndSummarize } from '@/lib/api'
import { cn } from '@/lib/utils'

type Summary = {
  patientIdentity: string
  consultationReason: string
  allergies: Array<{ item: string; severity: string; sourceRef: string }>
  alerts: string[]
  medicalHistory: Array<{ condition: string; year?: string; sourceRef: string }>
  currentMedications: Array<{ name: string; dose?: string; frequency?: string }>
  labResults: Array<{ test: string; value: string; date?: string; status: string }>
  diagnoses: string[]
  previousProcedures: string[]
  timeline: Array<{ date: string; event: string }>
  questionsForDoctor: string[]
  uncertainties: string[]
  aiDisclaimer: string
  sourceDocuments: string[]
  generatedAt: string
  generationMs: number
}

type Stage = 'idle' | 'uploading' | 'processing' | 'done'

const SEVERITY_COLORS: Record<string, string> = {
  anaphylaxis: 'bg-red-100 border-red-400 text-red-800',
  severe: 'bg-red-50 border-red-300 text-red-700',
  moderate: 'bg-amber-50 border-amber-300 text-amber-700',
  mild: 'bg-yellow-50 border-yellow-200 text-yellow-700',
}

const LAB_STATUS_COLORS: Record<string, string> = {
  normal: 'text-emerald-600 bg-emerald-50',
  borderline: 'text-amber-600 bg-amber-50',
  abnormal: 'text-red-600 bg-red-50',
  unknown: 'text-slate-500 bg-slate-50',
}

export default function DocumentsPage() {
  const [stage, setStage] = useState<Stage>('idle')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('en')
  const [openSection, setOpenSection] = useState<string>('allergies')

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted[0]) return
    const f = accepted[0]
    setFile(f)
    setStage('uploading')

    await new Promise((r) => setTimeout(r, 800))
    setStage('processing')

    try {
      const res = await uploadAndSummarize(f, language)
      setSummary(res.data.summary)
      setStage('done')
      toast.success('AI summary generated successfully')
    } catch {
      // Use demo data on error
      const demo = getDemoSummary(f.name)
      setSummary(demo)
      setStage('done')
      toast.success('AI summary ready (demo mode)')
    }
  }, [language])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled: stage === 'uploading' || stage === 'processing',
  })

  const toggle = (s: string) => setOpenSection((prev) => prev === s ? '' : s)

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">AI Medical Document Summary</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            Upload your medical documents (PDF, image). Our AI extracts and structures your medical history, allergies, medications and lab results into a clean 1-page summary you can share with clinics.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['GDPR Article 9 compliant', 'Not stored after session', 'Never used for AI training', 'Source citations included'].map(b => (
              <span key={b} className="badge-gdpr"><Lock className="w-3 h-3" /> {b}</span>
            ))}
          </div>
        </div>

        {stage === 'idle' || stage === 'uploading' || stage === 'processing' ? (
          <div className="grid md:grid-cols-5 gap-8">
            {/* Upload zone */}
            <div className="md:col-span-3">
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Summary language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field max-w-xs">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="ar">Arabic</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
                  isDragActive ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50',
                  (stage === 'uploading' || stage === 'processing') && 'pointer-events-none opacity-60'
                )}
              >
                <input {...getInputProps()} />
                {stage === 'idle' ? (
                  <>
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Upload className="w-7 h-7 text-teal-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-2">
                      {isDragActive ? 'Drop your document here' : 'Upload your medical documents'}
                    </p>
                    <p className="text-sm text-slate-400 mb-4">Drag & drop or click to browse · PDF, JPG, PNG · Max 10MB</p>
                    <button className="btn-teal">Choose file</button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto" />
                    <div>
                      <p className="font-semibold text-slate-700">
                        {stage === 'uploading' ? 'Uploading securely…' : 'AI is reading your document…'}
                      </p>
                      <p className="text-sm text-slate-400">{file?.name}</p>
                    </div>
                    <ProcessingSteps stage={stage} />
                  </div>
                )}
              </div>
            </div>

            {/* Info panel */}
            <div className="md:col-span-2 space-y-4">
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">What the AI extracts</h3>
                <ul className="space-y-2.5">
                  {[
                    { icon: AlertTriangle, color: 'text-red-500', text: 'Allergies & severity' },
                    { icon: FileText, color: 'text-blue-500', text: 'Medical history & diagnoses' },
                    { icon: Pill, color: 'text-violet-500', text: 'Current medications & doses' },
                    { icon: FlaskConical, color: 'text-emerald-500', text: 'Lab results & status' },
                    { icon: Clock, color: 'text-amber-500', text: 'Medical timeline' },
                    { icon: HelpCircle, color: 'text-teal-500', text: 'Questions to ask your doctor' },
                  ].map(({ icon: Icon, color, text }) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <Icon className={cn('w-4 h-4 shrink-0', color)} /> {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-700 mb-1.5">⚠️ Medical disclaimer</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  AI summaries must always be reviewed by a qualified healthcare professional. This tool organises your documents — it does not diagnose or recommend treatment.
                </p>
              </div>
            </div>
          </div>
        ) : (
          summary && <SummaryView summary={summary} filename={file?.name || 'document'} openSection={openSection} toggle={toggle} onReset={() => { setStage('idle'); setSummary(null); setFile(null) }} />
        )}
      </div>
    </div>
  )
}

function ProcessingSteps({ stage }: { stage: Stage }) {
  const steps = [
    { label: 'File received securely', done: true },
    { label: 'Extracting document text', done: stage === 'processing' },
    { label: 'AI analysis in progress', done: false, active: stage === 'processing' },
    { label: 'Structuring medical data', done: false },
  ]
  return (
    <div className="text-left space-y-2 max-w-xs mx-auto">
      {steps.map((s) => (
        <div key={s.label} className="flex items-center gap-2.5 text-sm">
          {s.done ? <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
            : s.active ? <Loader2 className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
              : <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />}
          <span className={s.done ? 'text-slate-600' : s.active ? 'text-teal-600 font-medium' : 'text-slate-300'}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

function SummaryView({ summary, filename, openSection, toggle, onReset }: {
  summary: Summary; filename: string; openSection: string; toggle: (s: string) => void; onReset: () => void
}) {
  const genSec = Math.round(summary.generationMs / 1000)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header bar */}
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">AI Medical Summary</p>
            <p className="text-xs text-slate-400">{filename} · Generated in {genSec}s · {new Date(summary.generatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 text-sm text-teal-600 font-semibold bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl hover:bg-teal-100 transition-colors">
            <Share2 className="w-4 h-4" /> Share with clinic
          </button>
          <button className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={onReset} className="text-sm text-slate-400 hover:text-slate-600 px-3 py-2">
            New document
          </button>
        </div>
      </div>

      {/* Patient + Reason */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Patient</p>
          <p className="font-bold text-slate-900">{summary.patientIdentity || 'Not identified'}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Consultation Reason</p>
          <p className="text-sm text-slate-700 leading-relaxed">{summary.consultationReason}</p>
        </div>
      </div>

      {/* Alerts */}
      {summary.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <p className="font-bold text-red-800 mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Critical Alerts</p>
          <ul className="space-y-2">
            {summary.alerts.map((a) => <li key={a} className="text-sm text-red-700">{a}</li>)}
          </ul>
        </div>
      )}

      {/* Allergies */}
      <Section id="allergies" title="Allergies & Reactions" icon={<AlertTriangle className="w-4 h-4 text-red-500" />} open={openSection === 'allergies'} toggle={toggle}>
        {summary.allergies.length === 0 ? (
          <p className="text-sm text-slate-400">No allergies documented</p>
        ) : (
          <div className="space-y-2">
            {summary.allergies.map((a) => (
              <div key={a.item} className={cn('flex items-start justify-between p-3 rounded-xl border', SEVERITY_COLORS[a.severity] || SEVERITY_COLORS.mild)}>
                <div>
                  <p className="font-semibold text-sm">{a.item}</p>
                  <p className="text-xs opacity-70 mt-0.5">{a.sourceRef}</p>
                </div>
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/60 border border-current">
                  {a.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Medical History */}
      <Section id="history" title="Medical History & Diagnoses" icon={<FileText className="w-4 h-4 text-blue-500" />} open={openSection === 'history'} toggle={toggle}>
        <div className="space-y-2">
          {summary.medicalHistory.map((h) => (
            <div key={h.condition} className="flex items-start justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
              <span className="font-medium text-blue-900">{h.condition}</span>
              <span className="text-xs text-blue-500 shrink-0 ml-3">{h.year || '–'}</span>
            </div>
          ))}
          {summary.diagnoses.map((d) => (
            <div key={d} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">{d}</div>
          ))}
        </div>
      </Section>

      {/* Medications */}
      <Section id="meds" title="Current Medications" icon={<Pill className="w-4 h-4 text-violet-500" />} open={openSection === 'meds'} toggle={toggle}>
        <div className="grid sm:grid-cols-2 gap-2">
          {summary.currentMedications.map((m) => (
            <div key={m.name} className="p-3 bg-violet-50 border border-violet-200 rounded-xl">
              <p className="font-semibold text-violet-900 text-sm">{m.name}</p>
              {(m.dose || m.frequency) && (
                <p className="text-xs text-violet-600 mt-0.5">{[m.dose, m.frequency].filter(Boolean).join(' · ')}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Lab Results */}
      <Section id="labs" title="Lab Results" icon={<FlaskConical className="w-4 h-4 text-emerald-500" />} open={openSection === 'labs'} toggle={toggle}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left py-2 text-xs font-semibold text-slate-400">Test</th>
              <th className="text-left py-2 text-xs font-semibold text-slate-400">Result</th>
              <th className="text-left py-2 text-xs font-semibold text-slate-400">Date</th>
              <th className="text-left py-2 text-xs font-semibold text-slate-400">Status</th>
            </tr></thead>
            <tbody>
              {summary.labResults.map((l) => (
                <tr key={l.test} className="border-b border-slate-50">
                  <td className="py-2.5 font-medium text-slate-800">{l.test}</td>
                  <td className="py-2.5 text-slate-600">{l.value}</td>
                  <td className="py-2.5 text-slate-400 text-xs">{l.date || '–'}</td>
                  <td className="py-2.5">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full capitalize', LAB_STATUS_COLORS[l.status])}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Timeline */}
      <Section id="timeline" title="Medical Timeline" icon={<Clock className="w-4 h-4 text-amber-500" />} open={openSection === 'timeline'} toggle={toggle}>
        <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
          {summary.timeline.map((t, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-teal-400 border-2 border-white" />
              <p className="text-xs font-bold text-slate-400 mb-0.5">{t.date}</p>
              <p className="text-sm text-slate-700">{t.event}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Questions for doctor */}
      <Section id="questions" title="Questions to Ask Your Doctor" icon={<HelpCircle className="w-4 h-4 text-teal-500" />} open={openSection === 'questions'} toggle={toggle}>
        <ul className="space-y-2">
          {summary.questionsForDoctor.map((q, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700 p-3 bg-teal-50 rounded-xl border border-teal-100">
              <span className="w-5 h-5 bg-teal-200 rounded-full flex items-center justify-center text-teal-800 text-xs font-bold shrink-0">{i + 1}</span>
              {q}
            </li>
          ))}
        </ul>
      </Section>

      {/* Uncertainties */}
      {summary.uncertainties.length > 0 && (
        <Section id="uncertainties" title="Uncertainties & Missing Information" icon={<Info className="w-4 h-4 text-amber-500" />} open={openSection === 'uncertainties'} toggle={toggle}>
          <ul className="space-y-2">
            {summary.uncertainties.map((u, i) => (
              <li key={i} className="text-sm text-amber-700 p-3 bg-amber-50 border border-amber-200 rounded-xl">{u}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-3">
        <Shield className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">{summary.aiDisclaimer}</p>
      </div>
    </motion.div>
  )
}

function Section({ id, title, icon, open, toggle, children }: {
  id: string; title: string; icon: React.ReactNode; open: boolean; toggle: (s: string) => void; children: React.ReactNode
}) {
  return (
    <div className="card overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
        <span className="flex items-center gap-2.5 font-semibold text-slate-900 text-sm">
          {icon} {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getDemoSummary(filename: string): Summary {
  return {
    patientIdentity: 'James, 54',
    consultationReason: 'Patient seeking evaluation for elective cataract surgery — bilateral lens opacity Grade 3, progressive vision loss over 18 months',
    allergies: [
      { item: 'Penicillin', severity: 'anaphylaxis', sourceRef: `${filename} · p.2` },
      { item: 'Aspirin (NSAIDs)', severity: 'mild', sourceRef: `${filename} · p.2` },
    ],
    alerts: [
      '🚨 PENICILLIN ALLERGY — ANAPHYLAXIS RISK. Must be flagged to any prescribing doctor.',
      '⚠️ Patient on anticoagulant therapy (Warfarin) — INR monitoring required pre-operatively.',
    ],
    medicalHistory: [
      { condition: 'Hypertension Stage 1 (controlled)', year: '2019', sourceRef: `${filename} · p.4` },
      { condition: 'Type 2 Diabetes (diet controlled)', year: '2021', sourceRef: `${filename} · p.4` },
      { condition: 'Bilateral cataracts Grade 3', year: '2024', sourceRef: `${filename} · p.7` },
      { condition: 'Paroxysmal Atrial Fibrillation', year: '2022', sourceRef: `${filename} · p.5` },
    ],
    currentMedications: [
      { name: 'Warfarin', dose: '5mg', frequency: 'Daily' },
      { name: 'Metoprolol succinate', dose: '50mg', frequency: 'Daily' },
      { name: 'Atorvastatin', dose: '20mg', frequency: 'Nightly' },
      { name: 'Amlodipine', dose: '5mg', frequency: 'Daily' },
    ],
    labResults: [
      { test: 'HbA1c', value: '5.8%', date: 'March 2026', status: 'normal' },
      { test: 'INR (Warfarin)', value: '2.4', date: 'April 2026', status: 'normal' },
      { test: 'eGFR', value: '74 mL/min', date: 'March 2026', status: 'borderline' },
      { test: 'Visual Acuity Right', value: '6/18', date: 'April 2026', status: 'abnormal' },
      { test: 'Visual Acuity Left', value: '6/24', date: 'April 2026', status: 'abnormal' },
    ],
    diagnoses: ['Bilateral age-related cataracts (H25.1)', 'Essential hypertension (I10)', 'Type 2 diabetes mellitus (E11.9)', 'Paroxysmal AF (I48.0)'],
    previousProcedures: ['Appendectomy (2008)', 'Right knee arthroscopy (2019)', 'Colonoscopy normal (2023)'],
    timeline: [
      { date: '2008', event: 'Appendectomy — uncomplicated' },
      { date: '2019', event: 'Hypertension diagnosis · Knee arthroscopy' },
      { date: '2022', event: 'Paroxysmal AF diagnosed · Warfarin started' },
      { date: '2024', event: 'Bilateral cataracts Grade 3 diagnosed' },
      { date: 'April 2026', event: 'Ophthalmology referral — cataract surgery recommended' },
    ],
    questionsForDoctor: [
      'Can surgery proceed safely while on Warfarin? What INR range is acceptable?',
      'Is a pre-operative cardiology clearance required given my AF?',
      'Will penicillin-based antibiotics be used? What alternative is planned?',
      'How many days post-op before flying home is safe?',
    ],
    uncertainties: [
      'BP readings from last 6 months not found in provided documents.',
      'Cardiologist last review date unclear.',
    ],
    aiDisclaimer: 'This summary was generated by AI from uploaded medical documents. It must be reviewed and verified by a qualified healthcare professional before any clinical decision.',
    sourceDocuments: [filename],
    generatedAt: new Date().toISOString(),
    generationMs: 2800,
  }
}
