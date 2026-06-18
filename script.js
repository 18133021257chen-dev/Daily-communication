const sourceText = document.querySelector('#source-text');
const audience = document.querySelector('#audience');
const generateBtn = document.querySelector('#generate-btn');
const results = document.querySelector('#results');
const charCount = document.querySelector('#char-count');
const toast = document.querySelector('#toast');

const outputs = {
  optimized: document.querySelector('#optimized-output'),
  concise: document.querySelector('#concise-output'),
  english: document.querySelector('#english-output'),
};

const audienceConfig = {
  subordinate: {
    label: '下属',
    greeting: '辛苦了',
    tone: '清晰友好、便于执行',
    prefix: '请你协助处理以下事项：',
    closing: '如过程中有问题，请及时和我同步。谢谢。',
    concisePrefix: '请协助：',
    englishGreeting: 'Hi, thank you for your support.',
    englishClosing: 'Please keep me updated if you run into any questions. Thank you.',
  },
  colleague: {
    label: '同事',
    greeting: '你好',
    tone: '协作礼貌、信息明确',
    prefix: '想和你同步并请你协助确认：',
    closing: '方便时请反馈你的想法，我们再一起推进。谢谢。',
    concisePrefix: '麻烦确认：',
    englishGreeting: 'Hi, I would like to align with you on this.',
    englishClosing: 'Please share your thoughts when convenient, and we can move this forward together. Thank you.',
  },
  superior: {
    label: '上级',
    greeting: '您好',
    tone: '尊重简洁、突出重点',
    prefix: '向您汇报并请您确认：',
    closing: '请您指示是否需要调整，我会根据您的意见继续推进。谢谢。',
    concisePrefix: '请您确认：',
    englishGreeting: 'Hello, I would like to report and ask for your confirmation.',
    englishClosing: 'Please advise if any adjustments are needed. I will proceed based on your guidance. Thank you.',
  },
};

const phraseMap = [
  [/你/g, '您'],
  [/马上/g, '尽快'],
  [/赶紧/g, '尽快'],
  [/弄/g, '处理'],
  [/搞/g, '处理'],
  [/给我/g, '发给我'],
  [/不行/g, '可能不太合适'],
  [/错了/g, '需要调整'],
  [/必须/g, '需要'],
];

const englishTerms = [
  ['会议', 'meeting'],
  ['表格', 'spreadsheet'],
  ['文件', 'document'],
  ['报告', 'report'],
  ['方案', 'proposal'],
  ['数据', 'data'],
  ['客户', 'client'],
  ['项目', 'project'],
  ['进度', 'progress'],
  ['反馈', 'feedback'],
  ['确认', 'confirm'],
  ['整理', 'organize'],
  ['发送', 'send'],
  ['修改', 'revise'],
  ['今天', 'today'],
  ['明天', 'tomorrow'],
];

function normalizeText(text) {
  return text.trim().replace(/\s+/g, ' ').replace(/[。；;]+/g, '。');
}

function polishChinese(text, config) {
  let polished = normalizeText(text);
  phraseMap.forEach(([pattern, replacement]) => {
    if (config.label !== '下属' || pattern.source !== '你') {
      polished = polished.replace(pattern, replacement);
    }
  });
  polished = polished.replace(/。?$/, '。');
  return `${config.greeting}，\n${config.prefix}\n${polished}\n\n建议语气：${config.tone}。\n${config.closing}`;
}

function makeConcise(text, config) {
  const concise = normalizeText(text)
    .replace(/麻烦|请问|不好意思|如果可以的话|有空的话/g, '')
    .replace(/。+/g, '；')
    .replace(/；$/, '。');
  return `${config.concisePrefix}${concise}`;
}

function translateReference(text) {
  let translated = normalizeText(text);
  englishTerms.forEach(([zh, en]) => {
    translated = translated.replaceAll(zh, en);
  });
  return translated;
}

function makeEnglish(text, config) {
  return `${config.englishGreeting}\nMain message: ${translateReference(text)}\n${config.englishClosing}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function generateOutputs() {
  const text = sourceText.value.trim();
  if (!text) {
    showToast('请先输入需要优化的中文内容');
    sourceText.focus();
    return;
  }

  const config = audienceConfig[audience.value];
  outputs.optimized.textContent = polishChinese(text, config);
  outputs.concise.textContent = makeConcise(text, config);
  outputs.english.textContent = makeEnglish(text, config);
  results.hidden = false;
}

async function copyOutput(targetId, button) {
  const target = document.querySelector(`#${targetId}`);
  const text = target.textContent.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }

  const original = button.textContent;
  button.textContent = '已复制';
  showToast('内容已复制');
  window.setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

sourceText.addEventListener('input', () => {
  charCount.textContent = `${sourceText.value.trim().length} 字`;
});

generateBtn.addEventListener('click', generateOutputs);

document.querySelectorAll('.copy-btn').forEach((button) => {
  button.addEventListener('click', () => copyOutput(button.dataset.target, button));
});
