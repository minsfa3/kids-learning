const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export const shuffle = (items) => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = randomInt(0, index)
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

const gcdNumber = (first, second) => {
  let a = Math.abs(first)
  let b = Math.abs(second)
  while (b) [a, b] = [b, a % b]
  return a
}

const lcmNumber = (first, second) => (first * second) / gcdNumber(first, second)

export const fraction = (numerator, denominator = 1) => {
  const divisor = gcdNumber(numerator, denominator)
  const sign = denominator < 0 ? -1 : 1
  return { n: (numerator / divisor) * sign, d: Math.abs(denominator / divisor) }
}

const add = (...values) => values.reduce(
  (total, value) => fraction(total.n * value.d + value.n * total.d, total.d * value.d),
  fraction(0),
)
const subtract = (first, second) => fraction(first.n * second.d - second.n * first.d, first.d * second.d)
const multiply = (first, second) => fraction(first.n * second.n, first.d * second.d)

export const fractionText = (value) => {
  const reduced = fraction(value.n, value.d)
  if (reduced.d === 1) return String(reduced.n)
  const whole = Math.floor(reduced.n / reduced.d)
  const remainder = reduced.n % reduced.d
  return whole > 0 ? `${whole} [[${remainder}/${reduced.d}]]` : `[[${reduced.n}/${reduced.d}]]`
}

const cleanDecimal = (value) => Number(value.toFixed(2)).toString()

const uniqueOptions = (answer, candidates) => {
  const options = [String(answer), ...candidates.map(String)].filter(
    (value, index, values) => values.indexOf(value) === index,
  )
  let offset = 1
  while (options.length < 4) {
    const numeric = Number(answer)
    const fallback = Number.isNaN(numeric) ? `${answer} ${offset}` : cleanDecimal(numeric + offset)
    if (!options.includes(fallback)) options.push(fallback)
    offset += 1
  }
  return shuffle(options.slice(0, 4))
}

const question = (category, prompt, answer, candidates, steps) => ({
  category,
  prompt,
  answer: String(answer),
  options: uniqueOptions(answer, candidates),
  steps,
})

const numericQuestion = (category, prompt, answer, unit, candidates, steps) => question(
  category,
  prompt,
  `${cleanDecimal(answer)}${unit}`,
  candidates.map((value) => `${cleanDecimal(value)}${unit}`),
  steps,
)

const fractionQuestion = (category, prompt, answer, unit, candidates, steps) => question(
  category,
  prompt,
  `${fractionText(answer)}${unit}`,
  candidates.filter((value) => value.n > 0).map((value) => `${fractionText(value)}${unit}`),
  steps,
)

const createNaturalConcept = () => Array.from({ length: 10 }, (_, index) => {
  const a = 18 + index * 2
  const b = 3 + (index % 5)
  const c = 2 + (index % 4)
  if (index % 4 === 0) {
    const answer = a + b * c
    return numericQuestion('혼합 계산 개념', `${a} + ${b} × ${c} = ?`, answer, '', [(a + b) * c, answer + b, answer - c], [
      `곱셈을 덧셈보다 먼저 계산하여 ${b} × ${c} = ${b * c}을 구합니다.`,
      `${a} + ${b * c} = ${answer}입니다.`,
    ])
  }
  if (index % 4 === 1) {
    const answer = (a - b) * c
    return numericQuestion('괄호가 있는 식', `(${a} - ${b}) × ${c} = ?`, answer, '', [a - b * c, answer + c, answer - b], [
      `괄호 안을 먼저 계산하면 ${a} - ${b} = ${a - b}입니다.`,
      `${a - b} × ${c} = ${answer}입니다.`,
    ])
  }
  if (index % 4 === 2) {
    const first = b * 6
    const second = b * 9
    const answer = gcdNumber(first, second)
    return numericQuestion('최대공약수', `${first}과 ${second}의 최대공약수는?`, answer, '', [b, first, lcmNumber(first, second)], [
      `두 수의 공약수 중 가장 큰 수를 찾습니다. 최대공약수는 ${answer}입니다.`,
    ])
  }
  const first = b * 2
  const second = b * 3
  const answer = lcmNumber(first, second)
  return numericQuestion('최소공배수', `${first}과 ${second}의 최소공배수는?`, answer, '', [b, first * second, gcdNumber(first, second)], [
    `두 수의 공배수 중 가장 작은 수를 찾습니다. 최소공배수는 ${answer}입니다.`,
  ])
})

const createNaturalApplication = () => Array.from({ length: 10 }, (_, index) => {
  const mode = index % 3
  if (mode === 0) {
    const boxes = 7 + index
    const each = 12 + index
    const used = 25 + index * 2
    const total = boxes * each
    const answer = total - used
    return numericQuestion('물건을 사용하고 남은 수', `색연필이 한 상자에 ${each}자루씩 ${boxes}상자 있습니다. 미술 시간에 ${used}자루를 사용했다면 남은 색연필은 몇 자루일까요?`, answer, '자루', [total, answer + each, answer - boxes], [
      `1단계: 처음 색연필은 ${each} × ${boxes} = ${total}자루입니다.`,
      `2단계: 남은 색연필은 ${total} - ${used} = ${answer}자루입니다.`,
    ])
  }
  if (mode === 1) {
    const adultCount = 3 + (index % 4)
    const childCount = 5 + (index % 3)
    const adultPrice = 8000
    const childPrice = 5000
    const adultTotal = adultCount * adultPrice
    const childTotal = childCount * childPrice
    const answer = adultTotal + childTotal
    return numericQuestion('입장료 합계', `박물관에 어른 ${adultCount}명과 어린이 ${childCount}명이 갔습니다. 입장료가 어른은 8000원, 어린이는 5000원일 때 모두 얼마를 내야 할까요?`, answer, '원', [adultTotal, childTotal, answer - childPrice], [
      `1단계: 어른 입장료는 8000 × ${adultCount} = ${adultTotal}원입니다.`,
      `2단계: 어린이 입장료는 5000 × ${childCount} = ${childTotal}원입니다.`,
      `3단계: 전체 입장료는 ${adultTotal} + ${childTotal} = ${answer}원입니다.`,
    ])
  }
  const goal = 500 + index * 30
  const days = 4 + (index % 3)
  const daily = 45 + index
  const read = days * daily
  const answer = goal - read
  return numericQuestion('목표까지 남은 양', `책이 모두 ${goal}쪽입니다. 하루에 ${daily}쪽씩 ${days}일 동안 읽었다면 남은 쪽수는 몇 쪽일까요?`, answer, '쪽', [read, goal - daily, answer + daily], [
    `1단계: 읽은 쪽수는 ${daily} × ${days} = ${read}쪽입니다.`,
    `2단계: 남은 쪽수는 ${goal} - ${read} = ${answer}쪽입니다.`,
  ])
})

const createDivisorConcept = () => Array.from({ length: 10 }, (_, index) => {
  const common = 2 + (index % 5)
  const first = common * (3 + (index % 3))
  const second = common * (5 + (index % 4))
  if (index % 2 === 0) {
    const answer = gcdNumber(first, second)
    return numericQuestion('약수와 배수 개념', `${first}과 ${second}의 최대공약수는?`, answer, '', [common, Math.min(first, second), lcmNumber(first, second)], [
      `각 수를 나누어떨어지게 하는 수를 비교하면 최대공약수는 ${answer}입니다.`,
    ])
  }
  const answer = lcmNumber(first, second)
  return numericQuestion('약수와 배수 개념', `${first}과 ${second}의 최소공배수는?`, answer, '', [common, first * second, gcdNumber(first, second)], [
    `두 수의 배수를 차례로 비교하면 가장 작은 공배수는 ${answer}입니다.`,
  ])
})

const createDivisorApplication = () => Array.from({ length: 10 }, (_, index) => {
  if (index % 2 === 0) {
    const factor = 2 + (index % 4)
    const red = factor * (6 + index)
    const blue = factor * (9 + index)
    const groups = gcdNumber(red, blue)
    const redEach = red / groups
    const blueEach = blue / groups
    const answer = redEach + blueEach
    return numericQuestion('같은 구성으로 묶기', `빨간 구슬 ${red}개와 파란 구슬 ${blue}개를 남김없이 똑같이 최대한 많은 꾸러미로 나누려고 합니다. 한 꾸러미에 들어가는 구슬은 모두 몇 개일까요?`, answer, '개', [groups, redEach, blueEach], [
      `1단계: 만들 수 있는 최대 꾸러미 수는 ${red}과 ${blue}의 최대공약수인 ${groups}개입니다.`,
      `2단계: 한 꾸러미에는 빨간 구슬 ${red} ÷ ${groups} = ${redEach}개, 파란 구슬 ${blue} ÷ ${groups} = ${blueEach}개가 들어갑니다.`,
      `3단계: 한 꾸러미의 구슬은 ${redEach} + ${blueEach} = ${answer}개입니다.`,
    ])
  }
  const firstCycle = 4 + (index % 3)
  const secondCycle = 6 + (index % 4)
  const together = lcmNumber(firstCycle, secondCycle)
  const duration = together * (4 + (index % 3))
  const answer = duration / together + 1
  return numericQuestion('주기적으로 동시에 일어나는 일', `두 전등이 지금 동시에 켜졌습니다. 한 전등은 ${firstCycle}초마다, 다른 전등은 ${secondCycle}초마다 켜집니다. 지금을 포함하여 ${duration}초 동안 두 전등이 동시에 켜지는 때는 모두 몇 번일까요?`, answer, '번', [duration / together, together, answer + 1], [
    `1단계: 두 전등이 함께 켜지는 간격은 ${firstCycle}과 ${secondCycle}의 최소공배수인 ${together}초입니다.`,
    `2단계: ${duration} ÷ ${together} = ${duration / together}이고, 처음 동시에 켜진 때도 포함하므로 ${duration / together} + 1 = ${answer}번입니다.`,
  ])
})

const createFractionConcept = () => Array.from({ length: 10 }, (_, index) => {
  const mode = index % 4
  const first = fraction(2 + (index % 3), 5 + (index % 4))
  const second = fraction(1 + (index % 2), 3 + (index % 3))
  if (mode === 0) {
    const answer = add(first, second)
    return fractionQuestion('분수 덧셈', `${fractionText(first)} + ${fractionText(second)} = ?`, answer, '', [fraction(first.n + second.n, first.d + second.d), subtract(answer, fraction(1, answer.d)), add(answer, fraction(1, answer.d))], [
      `분모의 최소공배수로 통분한 뒤 분자끼리 더하면 ${fractionText(answer)}입니다.`,
    ])
  }
  if (mode === 1) {
    const larger = add(first, second)
    const answer = subtract(larger, second)
    return fractionQuestion('분수 뺄셈', `${fractionText(larger)} - ${fractionText(second)} = ?`, answer, '', [subtract(larger, first), add(larger, second), fraction(larger.n - second.n, larger.d + second.d)], [
      `두 분수를 통분하여 분자끼리 빼고 약분하면 ${fractionText(answer)}입니다.`,
    ])
  }
  if (mode === 2) {
    const improper = fraction(9 + index, 4 + (index % 3))
    const answer = fractionText(improper)
    return question('대분수와 가분수', `${improper.d}분의 ${improper.n}을 대분수로 나타낸 것은?`, answer, [`${Math.floor(improper.n / improper.d)} [[1/${improper.d}]]`, `[[${improper.d}/${improper.n}]]`, `${Math.ceil(improper.n / improper.d)} [[${improper.n % improper.d}/${improper.d}]]`], [
      `${improper.n}을 ${improper.d}(으)로 나눈 몫은 자연수 부분, 나머지는 분자가 됩니다. 답은 ${answer}입니다.`,
    ])
  }
  const whole = 24 + index * 2
  const rate = fraction(3, 4)
  const answer = whole * rate.n / rate.d
  return numericQuestion('전체의 분수만큼', `${whole}의 ${fractionText(rate)}은 얼마일까요?`, answer, '', [whole / rate.d, whole * rate.n, answer + rate.d], [
    `${whole} ÷ ${rate.d} × ${rate.n} = ${answer}입니다.`,
  ])
})

const fractionApplicationBuilders = [
  (index) => {
    const total = fraction(7 + index, 2)
    const first = fraction(5, 6)
    const second = fraction(3, 4)
    const used = add(first, second)
    const answer = subtract(total, used)
    return fractionQuestion('두 번 사용하고 남은 길이', `리본이 ${fractionText(total)}m 있습니다. 첫 번째 선물에 ${fractionText(first)}m, 두 번째 선물에 ${fractionText(second)}m를 사용했습니다. 남은 리본은 몇 m일까요?`, answer, 'm', [subtract(total, first), subtract(total, second), subtract(total, fraction(first.n + second.n, first.d + second.d))], [
      `1단계: 사용한 길이는 ${fractionText(first)} + ${fractionText(second)} = ${fractionText(used)}m입니다.`,
      `2단계: 남은 길이는 ${fractionText(total)} - ${fractionText(used)} = ${fractionText(answer)}m입니다.`,
    ])
  },
  (index) => {
    const total = fraction(9 + index, 2)
    const morning = fraction(2, 9)
    const afternoon = fraction(1, 6)
    const usedRate = add(morning, afternoon)
    const remainingRate = subtract(fraction(1), usedRate)
    const answer = multiply(total, remainingRate)
    return fractionQuestion('전체의 일부를 사용하고 남은 양', `물통에 물이 ${fractionText(total)}L 있습니다. 오전에 전체의 ${fractionText(morning)}, 오후에 전체의 ${fractionText(afternoon)}을 사용했습니다. 남은 물은 몇 L일까요?`, answer, 'L', [multiply(total, usedRate), multiply(total, subtract(fraction(1), morning)), subtract(total, usedRate)], [
      `1단계: 사용한 비율은 ${fractionText(morning)} + ${fractionText(afternoon)} = ${fractionText(usedRate)}입니다.`,
      `2단계: 남은 비율은 1 - ${fractionText(usedRate)} = ${fractionText(remainingRate)}입니다.`,
      `3단계: 남은 물은 ${fractionText(total)} × ${fractionText(remainingRate)} = ${fractionText(answer)}L입니다.`,
    ])
  },
  (index) => {
    const first = fraction(7 + index, 6)
    const second = fraction(3, 4)
    const other = fraction(5, 6)
    const onePerson = add(first, second)
    const answer = subtract(onePerson, other)
    return fractionQuestion('두 사람이 사용한 양 비교', `민수는 찰흙을 오전에 ${fractionText(first)}kg, 오후에 ${fractionText(second)}kg 사용했습니다. 지우는 ${fractionText(other)}kg 사용했습니다. 민수가 몇 kg 더 많이 사용했을까요?`, answer, 'kg', [onePerson, add(onePerson, other), subtract(first, other)], [
      `1단계: 민수가 사용한 양은 ${fractionText(first)} + ${fractionText(second)} = ${fractionText(onePerson)}kg입니다.`,
      `2단계: 차이는 ${fractionText(onePerson)} - ${fractionText(other)} = ${fractionText(answer)}kg입니다.`,
    ])
  },
  (index) => {
    const total = fraction(35 + index, 6)
    const parts = [fraction(5, 4), fraction(7, 6), fraction(3, 4)]
    const firstTwo = add(parts[0], parts[1])
    const moved = add(firstTwo, parts[2])
    const answer = subtract(total, moved)
    return fractionQuestion('여러 구간을 이동하고 남은 거리', `전체 등산로는 ${fractionText(total)}km입니다. ${fractionText(parts[0])}km, ${fractionText(parts[1])}km, ${fractionText(parts[2])}km를 차례로 걸었습니다. 남은 거리는 몇 km일까요?`, answer, 'km', [subtract(total, firstTwo), subtract(total, add(parts[0], parts[2])), moved], [
      `1단계: 앞의 두 구간은 ${fractionText(parts[0])} + ${fractionText(parts[1])} = ${fractionText(firstTwo)}km입니다.`,
      `2단계: 걸은 거리는 ${fractionText(firstTwo)} + ${fractionText(parts[2])} = ${fractionText(moved)}km입니다.`,
      `3단계: 남은 거리는 ${fractionText(total)} - ${fractionText(moved)} = ${fractionText(answer)}km입니다.`,
    ])
  },
  (index) => {
    const width = fraction(3 + (index % 2), 2)
    const difference = fraction(5, 6)
    const height = add(width, difference)
    const answer = multiply(width, height)
    return fractionQuestion('분수 길이 직사각형', `직사각형의 가로는 ${fractionText(width)}cm이고 세로는 가로보다 ${fractionText(difference)}cm 더 깁니다. 넓이는 몇 cm²일까요?`, answer, 'cm²', [height, add(width, height), multiply(width, difference)], [
      `1단계: 세로는 ${fractionText(width)} + ${fractionText(difference)} = ${fractionText(height)}cm입니다.`,
      `2단계: 넓이는 ${fractionText(width)} × ${fractionText(height)} = ${fractionText(answer)}cm²입니다.`,
    ])
  },
  (index) => {
    const needed = fraction(41 + index, 4)
    const stocks = [fraction(7, 3), fraction(5, 4), fraction(11, 6)]
    const firstTwo = add(stocks[0], stocks[1])
    const current = add(firstTwo, stocks[2])
    const answer = subtract(needed, current)
    return fractionQuestion('필요한 양과 현재 양의 차이', `밀가루가 ${fractionText(needed)}kg 필요합니다. ${fractionText(stocks[0])}kg, ${fractionText(stocks[1])}kg, ${fractionText(stocks[2])}kg짜리 봉지가 있다면 몇 kg 더 필요할까요?`, answer, 'kg', [subtract(needed, firstTwo), subtract(needed, stocks[0]), current], [
      `1단계: 앞의 두 봉지는 ${fractionText(stocks[0])} + ${fractionText(stocks[1])} = ${fractionText(firstTwo)}kg입니다.`,
      `2단계: 현재 양은 ${fractionText(firstTwo)} + ${fractionText(stocks[2])} = ${fractionText(current)}kg입니다.`,
      `3단계: 더 필요한 양은 ${fractionText(needed)} - ${fractionText(current)} = ${fractionText(answer)}kg입니다.`,
    ])
  },
]

const createFractionApplication = () => Array.from(
  { length: 10 },
  (_, index) => fractionApplicationBuilders[index % fractionApplicationBuilders.length](index),
)

const createDecimalConcept = () => Array.from({ length: 10 }, (_, index) => {
  const first = 1.2 + index * 0.3
  const second = 0.4 + (index % 4) * 0.2
  if (index % 3 === 0) {
    const answer = first + second
    return numericQuestion('소수 덧셈', `${cleanDecimal(first)} + ${cleanDecimal(second)} = ?`, answer, '', [first + second / 10, first - second, answer + 0.1], [`소수점을 맞추어 더하면 ${cleanDecimal(answer)}입니다.`])
  }
  if (index % 3 === 1) {
    const answer = first * (2 + (index % 4))
    return numericQuestion('소수 곱셈', `${cleanDecimal(first)} × ${2 + (index % 4)} = ?`, answer, '', [answer / 10, answer + first, answer - 0.1], [`자연수처럼 곱한 뒤 소수점 자리를 맞추면 ${cleanDecimal(answer)}입니다.`])
  }
  const larger = first + second + 1
  const answer = larger - second
  return numericQuestion('소수 뺄셈', `${cleanDecimal(larger)} - ${cleanDecimal(second)} = ?`, answer, '', [larger - second / 10, larger + second, answer - 0.1], [`소수점을 맞추어 빼면 ${cleanDecimal(answer)}입니다.`])
})

const createDecimalApplication = () => Array.from({ length: 10 }, (_, index) => {
  if (index % 2 === 0) {
    const total = 12.5 + index
    const cup = 0.35 + (index % 3) * 0.1
    const count = 4 + (index % 4)
    const used = cup * count
    const answer = total - used
    return numericQuestion('나누어 담고 남은 양', `주스 ${cleanDecimal(total)}L에서 한 병에 ${cleanDecimal(cup)}L씩 ${count}병을 담았습니다. 남은 주스는 몇 L일까요?`, answer, 'L', [used, total - cup, answer + cup], [
      `1단계: 병에 담은 주스는 ${cleanDecimal(cup)} × ${count} = ${cleanDecimal(used)}L입니다.`,
      `2단계: 남은 주스는 ${cleanDecimal(total)} - ${cleanDecimal(used)} = ${cleanDecimal(answer)}L입니다.`,
    ])
  }
  const firstPrice = 2.4 + index * 0.1
  const firstCount = 3
  const secondPrice = 1.75
  const firstCost = firstPrice * firstCount
  const totalCost = firstCost + secondPrice
  const paid = 15
  const answer = paid - totalCost
  return numericQuestion('물건을 사고 남은 돈', `한 개에 ${cleanDecimal(firstPrice)}천 원인 공책 ${firstCount}권과 ${cleanDecimal(secondPrice)}천 원인 펜 1자루를 사고 15천 원을 냈습니다. 거스름돈은 얼마일까요?`, answer, '천 원', [paid - firstCost, totalCost, answer + secondPrice], [
    `1단계: 공책 값은 ${cleanDecimal(firstPrice)} × ${firstCount} = ${cleanDecimal(firstCost)}천 원입니다.`,
    `2단계: 전체 물건값은 ${cleanDecimal(firstCost)} + ${cleanDecimal(secondPrice)} = ${cleanDecimal(totalCost)}천 원입니다.`,
    `3단계: 거스름돈은 15 - ${cleanDecimal(totalCost)} = ${cleanDecimal(answer)}천 원입니다.`,
  ])
})

const createAreaConcept = () => Array.from({ length: 10 }, (_, index) => {
  const width = 4 + index
  const height = 3 + (index % 5)
  if (index % 3 === 0) {
    const answer = width * height
    return numericQuestion('직사각형의 넓이', `가로 ${width}cm, 세로 ${height}cm인 직사각형의 넓이는?`, answer, 'cm²', [width + height, (width + height) * 2, answer / 2], [`직사각형의 넓이는 가로 × 세로이므로 ${width} × ${height} = ${answer}cm²입니다.`])
  }
  if (index % 3 === 1) {
    const base = width * 2
    const answer = base * height / 2
    return numericQuestion('삼각형의 넓이', `밑변 ${base}cm, 높이 ${height}cm인 삼각형의 넓이는?`, answer, 'cm²', [base * height, base + height, answer + height], [`삼각형의 넓이는 밑변 × 높이 ÷ 2이므로 ${base} × ${height} ÷ 2 = ${answer}cm²입니다.`])
  }
  const answer = (width + height) * 2
  return numericQuestion('직사각형의 둘레', `가로 ${width}cm, 세로 ${height}cm인 직사각형의 둘레는?`, answer, 'cm', [width + height, width * height, answer - height], [`직사각형의 둘레는 (가로 + 세로) × 2이므로 (${width} + ${height}) × 2 = ${answer}cm입니다.`])
})

const createAreaApplication = () => Array.from({ length: 10 }, (_, index) => {
  if (index % 2 === 0) {
    const width = 8 + index
    const difference = 3 + (index % 4)
    const height = width + difference
    const answer = width * height
    return numericQuestion('조건을 이용한 직사각형 넓이', `직사각형 화단의 가로는 ${width}m이고 세로는 가로보다 ${difference}m 더 깁니다. 화단의 넓이는 몇 m²일까요?`, answer, 'm²', [height, (width + height) * 2, width * difference], [
      `1단계: 세로는 ${width} + ${difference} = ${height}m입니다.`,
      `2단계: 넓이는 ${width} × ${height} = ${answer}m²입니다.`,
    ])
  }
  const roomWidth = 10 + index
  const roomHeight = 7 + (index % 3)
  const matWidth = 3 + (index % 2)
  const matHeight = 2 + (index % 3)
  const roomArea = roomWidth * roomHeight
  const matArea = matWidth * matHeight
  const answer = roomArea - matArea
  return numericQuestion('전체 넓이에서 일부 빼기', `가로 ${roomWidth}m, 세로 ${roomHeight}m인 바닥에 가로 ${matWidth}m, 세로 ${matHeight}m인 매트를 놓았습니다. 매트가 덮지 않은 바닥의 넓이는 몇 m²일까요?`, answer, 'm²', [roomArea, matArea, roomArea - matWidth], [
    `1단계: 바닥 넓이는 ${roomWidth} × ${roomHeight} = ${roomArea}m²입니다.`,
    `2단계: 매트 넓이는 ${matWidth} × ${matHeight} = ${matArea}m²입니다.`,
    `3단계: 덮이지 않은 넓이는 ${roomArea} - ${matArea} = ${answer}m²입니다.`,
  ])
})

export const TOPICS = [
  { id: 'mixed', name: '자연수 혼합 계산', concept: createNaturalConcept, application: createNaturalApplication },
  { id: 'divisors', name: '약수와 배수', concept: createDivisorConcept, application: createDivisorApplication },
  { id: 'fractions', name: '분수', concept: createFractionConcept, application: createFractionApplication },
  { id: 'decimals', name: '소수', concept: createDecimalConcept, application: createDecimalApplication },
  { id: 'area', name: '도형의 넓이', concept: createAreaConcept, application: createAreaApplication },
]

export const getTopic = (topicId) => TOPICS.find((topic) => topic.id === topicId) || TOPICS[0]

export const chooseTopic = (previousTopicId = null) => {
  const candidates = TOPICS.filter((topic) => topic.id !== previousTopicId)
  return candidates[randomInt(0, candidates.length - 1)]
}

export const createTopicQuestions = (topic) => ({
  concept: topic.concept().map((item, index) => ({ ...item, id: `${topic.id}-concept-${index}` })),
  application: topic.application().map((item, index) => ({ ...item, id: `${topic.id}-application-${index}` })),
})
