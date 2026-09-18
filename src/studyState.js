import { chooseTopic, createTopicQuestions, getTopic } from './quizData.js'

export const STORAGE_KEY = 'kids-learning-study-v2'

export const PHASE_LABELS = {
  concept_initial: '개념 학습 전',
  concept_review: '개념 오답 풀이 중',
  application_ready: '응용 학습 가능',
  application_initial: '응용 학습 가능',
  application_review: '응용 오답 풀이 중',
  complete: '주제 완료',
}

const createStage = (questions) => ({
  questions,
  initialIndex: 0,
  initialScore: 0,
  wrongIds: [],
  reviewAttempts: 0,
})

export const createStudyState = (previousTopicId = null, history = []) => {
  const topic = chooseTopic(previousTopicId)
  const questions = createTopicQuestions(topic)
  return {
    version: 2,
    sessionId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    topicId: topic.id,
    phase: 'concept_initial',
    concept: createStage(questions.concept),
    application: createStage(questions.application),
    history,
    view: 'home',
    selectedAnswer: null,
  }
}

export const loadStudyState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.version === 2 && getTopic(saved.topicId) && saved.concept && saved.application) return saved
  } catch {
    // 손상된 저장 데이터가 있으면 새 학습을 안전하게 시작합니다.
  }
  return createStudyState()
}

const phaseDetails = (phase) => {
  const stageKey = phase.startsWith('application') ? 'application' : 'concept'
  const review = phase.endsWith('review')
  return { stageKey, review }
}

export const getCurrentQuestion = (state) => {
  if (!state.phase.includes('initial') && !state.phase.includes('review')) return null
  const { stageKey, review } = phaseDetails(state.phase)
  const stage = state[stageKey]
  const questionId = review ? stage.wrongIds[0] : stage.questions[stage.initialIndex]?.id
  return stage.questions.find((item) => item.id === questionId) || null
}

const historyId = (state, stageKey, question) => `${state.sessionId}:${stageKey}:${question.id}`

const recordInitialMistake = (state, stageKey, question, selectedAnswer) => [
  ...state.history,
  {
    id: historyId(state, stageKey, question),
    topicId: state.topicId,
    topicName: getTopic(state.topicId).name,
    stage: stageKey,
    question: question.prompt,
    firstSelectedAnswer: selectedAnswer,
    selectedAnswers: [selectedAnswer],
    correctAnswer: question.answer,
    explanation: question.steps,
    retryCount: 0,
    resolved: false,
    createdAt: new Date().toISOString(),
  },
]

const recordReview = (state, stageKey, question, selectedAnswer, correct) => {
  const targetId = historyId(state, stageKey, question)
  const existing = state.history.some((item) => item.id === targetId)
  if (!existing) return recordInitialMistake(state, stageKey, question, selectedAnswer).map((item) => (
    item.id === targetId ? { ...item, retryCount: 1, resolved: correct } : item
  ))
  return state.history.map((item) => item.id === targetId ? {
    ...item,
    selectedAnswers: [...item.selectedAnswers, selectedAnswer],
    retryCount: item.retryCount + 1,
    resolved: correct,
  } : item)
}

export const answerQuestion = (state, selectedAnswer) => {
  if (state.selectedAnswer !== null) return state
  const question = getCurrentQuestion(state)
  if (!question) return state
  const correct = selectedAnswer === question.answer
  const { stageKey, review } = phaseDetails(state.phase)
  const stage = state[stageKey]
  const nextStage = { ...stage }
  let history = state.history

  if (review) {
    nextStage.reviewAttempts += 1
    history = recordReview(state, stageKey, question, selectedAnswer, correct)
  } else if (correct) {
    nextStage.initialScore += 1
  } else {
    nextStage.wrongIds = [...stage.wrongIds, question.id]
    history = recordInitialMistake(state, stageKey, question, selectedAnswer)
  }

  return {
    ...state,
    [stageKey]: nextStage,
    history,
    selectedAnswer,
  }
}

export const advanceQuestion = (state) => {
  if (state.selectedAnswer === null) return state
  const question = getCurrentQuestion(state)
  if (!question) return state
  const correct = state.selectedAnswer === question.answer
  const { stageKey, review } = phaseDetails(state.phase)
  const stage = state[stageKey]
  const nextStage = { ...stage }

  if (!review && stage.initialIndex < stage.questions.length - 1) {
    nextStage.initialIndex += 1
    return { ...state, [stageKey]: nextStage, selectedAnswer: null }
  }

  if (review) {
    nextStage.wrongIds = correct
      ? stage.wrongIds.slice(1)
      : [...stage.wrongIds.slice(1), stage.wrongIds[0]]
    if (nextStage.wrongIds.length > 0) {
      return { ...state, [stageKey]: nextStage, selectedAnswer: null }
    }
  } else if (nextStage.wrongIds.length > 0) {
    return {
      ...state,
      [stageKey]: nextStage,
      phase: `${stageKey}_review`,
      selectedAnswer: null,
    }
  }

  if (stageKey === 'concept') {
    return {
      ...state,
      concept: nextStage,
      phase: 'application_ready',
      view: 'home',
      selectedAnswer: null,
    }
  }

  return {
    ...state,
    application: nextStage,
    phase: 'complete',
    view: 'complete',
    selectedAnswer: null,
  }
}

export const openCurrentLearning = (state) => {
  if (state.phase === 'complete') return { ...state, view: 'complete' }
  if (state.phase === 'application_ready') {
    return { ...state, phase: 'application_initial', view: 'quiz', selectedAnswer: null }
  }
  return { ...state, view: 'quiz' }
}

export const startNextTopic = (state) => createStudyState(state.topicId, state.history)

export const getProgress = (state) => {
  const { stageKey, review } = phaseDetails(state.phase)
  const stage = state[stageKey]
  if (review) {
    const solved = stage.questions.length - stage.wrongIds.length
    return { current: solved, total: stage.questions.length, review: true }
  }
  return {
    current: Math.min(stage.initialIndex + (state.selectedAnswer === null ? 0 : 1), stage.questions.length),
    total: stage.questions.length,
    review: false,
  }
}
