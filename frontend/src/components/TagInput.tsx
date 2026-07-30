import { useState, type KeyboardEvent } from 'react'
import './TagInput.css'

interface TagInputProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

export function TagInput({ label, values, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function commit() {
    const cleaned = draft.trim()
    if (cleaned && !values.some((v) => v.toLowerCase() === cleaned.toLowerCase())) {
      onChange([...values, cleaned])
    }
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  function remove(value: string) {
    onChange(values.filter((v) => v !== value))
  }

  return (
    <div className="tag-input">
      <label>{label}</label>
      <div className="tag-input-box">
        {values.map((value) => (
          <span key={value} className="tag-chip">
            {value}
            <button type="button" aria-label={`Remove ${value}`} onClick={() => remove(value)}>
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  )
}
