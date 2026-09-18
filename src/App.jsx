import { useState } from 'react'

const QUIZZES = [
  { id: 'math5', emoji: '🔢', label: '초5 수학 퀴즈' },
  { id: 'proverb1', emoji: '📖', label: '초1 속담 퀴즈' },
]

function App() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="app">
      <header className="app-header">
        <h1>우리집 퀴즈</h1>
        <p>풀고 싶은 퀴즈를 골라보세요!</p>
      </header>

      <main className="quiz-select">
        {QUIZZES.map((quiz) => (
          <button
            key={quiz.id}
            className="quiz-button"
            onClick={() => setSelected(quiz.id)}
          >
            <span className="quiz-emoji">{quiz.emoji}</span>
            <span>{quiz.label}</span>
          </button>
        ))}
      </main>

      {selected && (
        <p className="quiz-notice">
          '{QUIZZES.find((q) => q.id === selected)?.label}'는 준비 중이에요.
        </p>
      )}
    </div>
  )
}

export default App
