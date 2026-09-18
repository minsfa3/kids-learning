import { useState } from 'react'

const QUIZZES = [
  { id: 'math5', emoji: '🔢', label: '초5 수학 퀴즈' },
  { id: 'proverb1', emoji: '📖', label: '초1 속담 퀴즈' },
]

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const shuffle = (items) => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = randomInt(0, index)
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

const gcd = (first, second) => {
  let a = Math.abs(first)
  let b = Math.abs(second)
  while (b) [a, b] = [b, a % b]
  return a
}

const lcm = (first, second) => (first * second) / gcd(first, second)

const fractionText = (numerator, denominator) => {
  const divisor = gcd(numerator, denominator)
  const reducedNumerator = numerator / divisor
  const reducedDenominator = denominator / divisor
  return reducedDenominator === 1
    ? String(reducedNumerator)
    : `${reducedNumerator}/${reducedDenominator}`
}

const makeOptions = (answer, candidates) => {
  const unique = [String(answer)]
  candidates.forEach((candidate) => {
    const value = String(candidate)
    if (!unique.includes(value)) unique.push(value)
  })
  let offset = 1
  while (unique.length < 4) {
    const numericAnswer = Number(answer)
    const fallback = Number.isNaN(numericAnswer)
      ? `${answer} ${offset}`
      : String(numericAnswer + offset)
    if (!unique.includes(fallback)) unique.push(fallback)
    offset += 1
  }
  return shuffle(unique.slice(0, 4))
}

const createMixedQuestion = () => {
  const first = randomInt(8, 30)
  const second = randomInt(2, 9)
  const third = randomInt(2, 9)
  const useParentheses = Math.random() < 0.5
  const answer = useParentheses ? (first + second) * third : first + second * third
  return {
    category: '자연수 혼합 계산',
    prompt: useParentheses
      ? `(${first} + ${second}) × ${third} = ?`
      : `${first} + ${second} × ${third} = ?`,
    answer: String(answer),
    options: makeOptions(answer, [(first + second) * third, answer + third, answer - second]),
    explanation: useParentheses
      ? `괄호 안을 먼저 계산하면 ${first + second} × ${third} = ${answer}예요.`
      : `곱셈을 먼저 계산하면 ${first} + ${second * third} = ${answer}예요.`,
  }
}

const createDivisorQuestion = () => {
  const common = randomInt(2, 8)
  const firstFactor = randomInt(2, 5)
  let secondFactor = randomInt(2, 5)
  while (secondFactor === firstFactor) secondFactor = randomInt(2, 5)
  const first = common * firstFactor
  const second = common * secondFactor
  const askGcd = Math.random() < 0.5
  const answer = askGcd ? gcd(first, second) : lcm(first, second)
  return {
    category: '약수와 배수',
    prompt: `${first}와 ${second}의 ${askGcd ? '최대공약수' : '최소공배수'}는?`,
    answer: String(answer),
    options: makeOptions(answer, [common, first * second, answer + common, answer / 2]),
    explanation: askGcd
      ? `두 수를 모두 나눌 수 있는 가장 큰 수는 ${answer}예요.`
      : `두 수에 공통으로 나타나는 가장 작은 배수는 ${answer}예요.`,
  }
}

const createFractionQuestion = () => {
  const firstDenominator = randomInt(3, 9)
  const secondDenominator = randomInt(3, 9)
  const firstNumerator = randomInt(1, firstDenominator - 1)
  const secondNumerator = randomInt(1, secondDenominator - 1)
  const commonDenominator = lcm(firstDenominator, secondDenominator)
  const convertedFirst = firstNumerator * (commonDenominator / firstDenominator)
  const convertedSecond = secondNumerator * (commonDenominator / secondDenominator)
  const subtract = convertedFirst > convertedSecond && Math.random() < 0.5
  const resultNumerator = subtract
    ? convertedFirst - convertedSecond
    : convertedFirst + convertedSecond
  const answer = fractionText(resultNumerator, commonDenominator)
  const candidates = [
    fractionText(resultNumerator + 1, commonDenominator),
    fractionText(Math.max(1, resultNumerator - 1), commonDenominator),
    fractionText(
      subtract ? Math.abs(firstNumerator - secondNumerator) || 1 : firstNumerator + secondNumerator,
      firstDenominator + secondDenominator,
    ),
    fractionText(resultNumerator + 2, commonDenominator),
    fractionText(resultNumerator + 3, commonDenominator),
    fractionText(resultNumerator + 4, commonDenominator),
  ]
  return {
    category: '분수 덧셈·뺄셈',
    prompt: `${fractionText(firstNumerator, firstDenominator)} ${subtract ? '−' : '+'} ${fractionText(secondNumerator, secondDenominator)} = ?`,
    answer,
    options: makeOptions(answer, candidates),
    explanation: `분모를 ${commonDenominator}(으)로 통분해 계산한 뒤 약분하면 ${answer}예요.`,
  }
}

const formatDecimal = (value) => (Math.round(value * 100) / 100).toString()

const createDecimalQuestion = () => {
  const decimalTenths = randomInt(12, 89)
  const multiplier = randomInt(2, 9)
  const decimal = decimalTenths / 10
  const answer = formatDecimal(decimal * multiplier)
  return {
    category: '소수 곱셈',
    prompt: `${decimal.toFixed(1)} × ${multiplier} = ?`,
    answer,
    options: makeOptions(answer, [
      formatDecimal((decimalTenths * multiplier) / 100),
      formatDecimal(decimal * multiplier + 0.1),
      formatDecimal(decimal * multiplier - 1),
      formatDecimal(decimal + multiplier),
    ]),
    explanation: `${decimalTenths} × ${multiplier} = ${decimalTenths * multiplier}에서 소수점을 한 자리 옮기면 ${answer}예요.`,
  }
}

const createAreaQuestion = () => {
  const triangle = Math.random() < 0.5
  const width = triangle ? randomInt(3, 9) * 2 : randomInt(4, 12)
  const height = randomInt(3, 10)
  const answer = triangle ? (width * height) / 2 : width * height
  return {
    category: '도형 넓이',
    prompt: `${triangle ? '밑변' : '가로'} ${width}cm, ${triangle ? '높이' : '세로'} ${height}cm인 ${triangle ? '삼각형' : '직사각형'}의 넓이는?`,
    answer: `${answer}㎠`,
    options: makeOptions(`${answer}㎠`, [
      `${width * height}㎠`, `${width + height}㎠`, `${(width + height) * 2}㎠`, `${answer + height}㎠`,
    ]),
    explanation: triangle
      ? `${width} × ${height} ÷ 2 = ${answer}이므로 넓이는 ${answer}㎠예요.`
      : `${width} × ${height} = ${answer}이므로 넓이는 ${answer}㎠예요.`,
  }
}

const createQuiz = () => shuffle([
  createMixedQuestion(), createMixedQuestion(),
  createDivisorQuestion(), createDivisorQuestion(),
  createFractionQuestion(), createFractionQuestion(),
  createDecimalQuestion(), createDecimalQuestion(),
  createAreaQuestion(), createAreaQuestion(),
])

function App() {
  const [screen, setScreen] = useState('home')
  const [notice, setNotice] = useState('')
  const [questions, setQuestions] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const startQuiz = () => {
    setQuestions(createQuiz())
    setQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setNotice('')
    setScreen('quiz')
  }

  const goHome = () => {
    setScreen('home')
    setNotice('')
  }

  const selectQuiz = (quiz) => {
    if (quiz.id === 'math5') return startQuiz()
    setNotice(`'${quiz.label}'는 준비 중이에요.`)
  }

  const chooseAnswer = (option) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(option)
    if (option === questions[questionIndex].answer) setScore((current) => current + 1)
  }

  const nextQuestion = () => {
    if (questionIndex === questions.length - 1) return setScreen('result')
    setQuestionIndex((current) => current + 1)
    setSelectedAnswer(null)
  }

  if (screen === 'quiz') {
    const question = questions[questionIndex]
    const isCorrect = selectedAnswer === question.answer
    return (
      <div className="app quiz-page">
        <main className="quiz-card">
          <div className="quiz-status">
            <span>{questionIndex + 1} / {questions.length} 문제</span>
            <span>점수 {score}점</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <p className="category">{question.category}</p>
          <h2 className="question-text">{question.prompt}</h2>
          <div className="answer-grid">
            {question.options.map((option, index) => {
              let stateClass = ''
              if (selectedAnswer !== null) {
                if (option === question.answer) stateClass = ' correct'
                else if (option === selectedAnswer) stateClass = ' incorrect'
              }
              return (
                <button key={option} className={`answer-button${stateClass}`}
                  onClick={() => chooseAnswer(option)} disabled={selectedAnswer !== null}>
                  <span>{index + 1}</span>{option}
                </button>
              )
            })}
          </div>
          {selectedAnswer !== null && (
            <section className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`} aria-live="polite">
              <strong>{isCorrect ? '정답이에요! 🎉' : `아쉬워요. 정답은 ${question.answer}예요.`}</strong>
              <p>{question.explanation}</p>
              <button className="next-button" onClick={nextQuestion}>
                {questionIndex === questions.length - 1 ? '결과 보기' : '다음 문제'}
              </button>
            </section>
          )}
        </main>
      </div>
    )
  }

  if (screen === 'result') {
    return (
      <div className="app result-page">
        <main className="result-card">
          <span className="result-emoji">🏆</span>
          <p>퀴즈 완료!</p>
          <h1>{questions.length}문제 중 {score}문제 정답</h1>
          <div className="total-score">총점 <strong>{score * 10}점</strong></div>
          <div className="result-actions">
            <button className="primary-action" onClick={startQuiz}>다시 풀기</button>
            <button className="secondary-action" onClick={goHome}>홈으로</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>우리집 퀴즈</h1>
        <p>풀고 싶은 퀴즈를 골라보세요!</p>
      </header>
      <main className="quiz-select">
        {QUIZZES.map((quiz) => (
          <button key={quiz.id} className="quiz-button" onClick={() => selectQuiz(quiz)}>
            <span className="quiz-emoji">{quiz.emoji}</span>
            <span>{quiz.label}</span>
          </button>
        ))}
      </main>
      {notice && <p className="quiz-notice">{notice}</p>}
    </div>
  )
}

export default App
