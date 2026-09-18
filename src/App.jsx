import { useEffect, useState } from 'react'
import { getTopic } from './quizData.js'
import {
  PHASE_LABELS,
  STORAGE_KEY,
  advanceQuestion,
  answerQuestion,
  getCurrentQuestion,
  getProgress,
  loadStudyState,
  openCurrentLearning,
  startNextTopic,
} from './studyState.js'

function Fraction({ whole, numerator, denominator }) {
  const spoken = `${whole ? `${whole}와 ` : ''}${denominator}분의 ${numerator}`
  return (
    <span className="mixed-fraction" role="img" aria-label={spoken}>
      {whole && <span className="whole-number">{whole}</span>}
      <span className="vertical-fraction" aria-hidden="true">
        <span>{numerator}</span>
        <span>{denominator}</span>
      </span>
    </span>
  )
}

function RichText({ children }) {
  const text = String(children)
  const pattern = /\[\[(?:(\d+)\s+)?(\d+)\/(\d+)\]\]/g
  const parts = []
  let cursor = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index))
    parts.push(
      <Fraction key={`${match.index}-${match[0]}`} whole={match[1] || ''} numerator={match[2]} denominator={match[3]} />,
    )
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts
}

const learningButtonText = (state) => {
  if (state.phase === 'application_ready') return '2회차 응용 학습 시작'
  if (state.phase === 'concept_review' || state.phase === 'application_review') return '오답 풀이 이어서'
  const stage = state.phase.startsWith('application') ? state.application : state.concept
  return stage.initialIndex > 0 || state.selectedAnswer !== null ? '이어서 학습하기' : '학습 시작'
}

function Home({ state, updateState }) {
  const topic = getTopic(state.topicId)
  const conceptDone = state.phase !== 'concept_initial' && state.phase !== 'concept_review'
  const applicationStarted = state.phase.startsWith('application') || state.phase === 'complete'

  return (
    <div className="app home-page">
      <header className="app-header compact-header">
        <h1>우리집 퀴즈</h1>
        <p>요일과 관계없이 현재 단계부터 이어서 학습해요.</p>
      </header>
      <main className="dashboard-card">
        <p className="eyebrow">현재 학습 주제</p>
        <h2>{topic.name}</h2>
        <span className={`status-badge ${state.phase}`}>{PHASE_LABELS[state.phase]}</span>

        <div className="learning-route" aria-label="학습 진행 단계">
          <div className={conceptDone ? 'route-step done' : 'route-step active'}>
            <strong>1회차</strong>
            <span>개념 학습</span>
            <small>{state.concept.initialScore} / 10 최초 정답</small>
          </div>
          <span className="route-arrow" aria-hidden="true">→</span>
          <div className={applicationStarted ? 'route-step active' : 'route-step locked'}>
            <strong>2회차</strong>
            <span>응용 학습</span>
            <small>{applicationStarted ? `${state.application.initialScore} / 10 최초 정답` : '개념 완료 후 열림'}</small>
          </div>
        </div>

        {state.phase === 'complete' ? (
          <button className="primary-action wide-action" onClick={() => updateState({ ...state, view: 'complete' })}>
            완료 결과 보기
          </button>
        ) : (
          <button className="primary-action wide-action" onClick={() => updateState(openCurrentLearning(state))}>
            {learningButtonText(state)}
          </button>
        )}
        <button className="text-action" onClick={() => updateState({ ...state, view: 'notebook' })}>
          지난 오답 노트 보기 ({state.history.length})
        </button>
      </main>
    </div>
  )
}

function Quiz({ state, updateState }) {
  const question = getCurrentQuestion(state)
  const progress = getProgress(state)
  const stageName = state.phase.startsWith('application') ? '2회차 응용 학습' : '1회차 개념 학습'
  const reviewing = state.phase.endsWith('review')
  const isCorrect = state.selectedAnswer === question?.answer

  if (!question) return null

  return (
    <div className="app quiz-page">
      <main className="quiz-card">
        <div className="quiz-topline">
          <button className="back-button" onClick={() => updateState({ ...state, view: 'home' })}>← 홈</button>
          <span>{getTopic(state.topicId).name} · {stageName}</span>
        </div>
        <div className="quiz-status">
          <span>{reviewing ? `남은 오답 ${state[state.phase.startsWith('application') ? 'application' : 'concept'].wrongIds.length}개` : `${progress.current + (state.selectedAnswer === null ? 1 : 0)} / ${progress.total} 문제`}</span>
          <span>최초 점수 {state[state.phase.startsWith('application') ? 'application' : 'concept'].initialScore}점</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${(progress.current / progress.total) * 100}%` }} />
        </div>
        {reviewing && <p className="review-label">틀린 문제를 맞힐 때까지 다시 풀어요</p>}
        <p className="category">{question.category}</p>
        <h2 className="question-text"><RichText>{question.prompt}</RichText></h2>
        <div className="answer-grid">
          {question.options.map((option, index) => {
            let stateClass = ''
            if (state.selectedAnswer !== null) {
              if (option === question.answer) stateClass = ' correct'
              else if (option === state.selectedAnswer) stateClass = ' incorrect'
            }
            return (
              <button key={option} className={`answer-button${stateClass}`}
                onClick={() => updateState(answerQuestion(state, option))} disabled={state.selectedAnswer !== null}>
                <span className="answer-number">{index + 1}</span><RichText>{option}</RichText>
              </button>
            )
          })}
        </div>
        {state.selectedAnswer !== null && (
          <section className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`} aria-live="polite">
            <strong>
              {isCorrect ? '정답이에요! 🎉' : <><span>아쉬워요. 정답은 </span><RichText>{question.answer}</RichText><span>입니다.</span></>}
            </strong>
            <div className="solution-steps">
              {question.steps.map((step) => <p key={step}><RichText>{step}</RichText></p>)}
            </div>
            <button className="next-button" onClick={() => updateState(advanceQuestion(state))}>
              {reviewing && !isCorrect ? '이 문제 다시 풀기' : '다음으로'}
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

function Completion({ state, updateState }) {
  const topic = getTopic(state.topicId)
  const totalReviews = state.concept.reviewAttempts + state.application.reviewAttempts
  return (
    <div className="app result-page">
      <main className="result-card completion-card">
        <span className="result-emoji">🏆</span>
        <p>이번 주제 학습 완료</p>
        <h1>{topic.name}</h1>
        <div className="score-summary">
          <div><span>개념 최초 점수</span><strong>{state.concept.initialScore}점</strong></div>
          <div><span>응용 최초 점수</span><strong>{state.application.initialScore}점</strong></div>
          <div><span>오답 해결 횟수</span><strong>{totalReviews}회</strong></div>
        </div>
        <button className="primary-action wide-action" onClick={() => updateState(startNextTopic(state))}>다음 주제 시작</button>
        <button className="text-action" onClick={() => updateState({ ...state, view: 'notebook' })}>지난 오답 노트 보기</button>
      </main>
    </div>
  )
}

function Notebook({ state, updateState }) {
  const history = [...state.history].reverse()
  const backView = state.phase === 'complete' ? 'complete' : 'home'
  return (
    <div className="app notebook-page">
      <main className="notebook-card">
        <div className="notebook-header">
          <div>
            <p className="eyebrow">학습 기록</p>
            <h1>오답 노트</h1>
          </div>
          <button className="back-button" onClick={() => updateState({ ...state, view: backView })}>← 돌아가기</button>
        </div>
        {history.length === 0 ? (
          <p className="empty-note">아직 저장된 오답이 없습니다.</p>
        ) : (
          <div className="mistake-list">
            {history.map((item) => (
              <article className="mistake-card" key={item.id}>
                <div className="mistake-meta">
                  <span>{item.topicName} · {item.stage === 'concept' ? '개념' : '응용'}</span>
                  <span className={item.resolved ? 'resolved' : 'unresolved'}>{item.resolved ? '해결 완료' : '복습 중'}</span>
                </div>
                <h2><RichText>{item.question}</RichText></h2>
                <dl>
                  <div><dt>처음 선택</dt><dd><RichText>{item.firstSelectedAnswer}</RichText></dd></div>
                  <div><dt>정답</dt><dd><RichText>{item.correctAnswer}</RichText></dd></div>
                  <div><dt>재도전</dt><dd>{item.retryCount}회</dd></div>
                </dl>
                <div className="note-solution">
                  {item.explanation.map((step) => <p key={step}><RichText>{step}</RichText></p>)}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  const [state, setState] = useState(loadStudyState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  if (state.view === 'quiz') return <Quiz state={state} updateState={setState} />
  if (state.view === 'complete') return <Completion state={state} updateState={setState} />
  if (state.view === 'notebook') return <Notebook state={state} updateState={setState} />
  return <Home state={state} updateState={setState} />
}

export default App
