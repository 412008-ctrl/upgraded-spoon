// 簡易 flashcard 應用（純前端，使用 localStorage）
(function(){
  const STORAGE_KEY = 'vocab_deck'
  const DEFAULT_DECK = [
    { word: 'abstract', translation: '摘要；抽象的', pos: 'adjective', etymology: 'ab- (離開) + tract (拉)', notes: '概念或理論上的，不具體的' },
    { word: 'accurate', translation: '準確的', pos: 'adjective', etymology: 'ac- (toward) + curare (照顧)', notes: '精確、無誤差' },
    { word: 'adapt', translation: '適應；改編', pos: 'verb', etymology: 'ad- (向) + aptus (適合)', notes: '改變以符合新環境' },
    { word: 'adequate', translation: '足夠的', pos: 'adjective', etymology: 'ad- (向) + aequus (平等)', notes: '符合需要的程度' },
    { word: 'analysis', translation: '分析', pos: 'noun', etymology: 'ana- (向上) + lysis (分解)', notes: '將事物拆解成部分研究' },
    { word: 'appropriate', translation: '適當的', pos: 'adjective', etymology: 'ad- (向) + proprius (自身)', notes: '符合情境或目的' },
    { word: 'assume', translation: '假設；承擔', pos: 'verb', etymology: 'ad- (向) + sumere (取)', notes: '未經證實地認定' },
    { word: 'capable', translation: '有能力的', pos: 'adjective', etymology: 'capere (拿)', notes: '有做某事的能力或條件' },
    { word: 'category', translation: '類別', pos: 'noun', etymology: 'kata- (向下) + goria (說話)', notes: '把事物分類的方式' },
    { word: 'compare', translation: '比較', pos: 'verb', etymology: 'com- (一起) + parare (準備)', notes: '找出相同與差異' },
    { word: 'concept', translation: '概念', pos: 'noun', etymology: 'con- (一起) + capere (抓取)', notes: '心中理解的抽象想法' },
    { word: 'conclude', translation: '結論；推斷', pos: 'verb', etymology: 'con- (一起) + cludere (關閉)', notes: '根據證據做出判斷' },
    { word: 'consistent', translation: '一致的', pos: 'adjective', etymology: 'con- (一起) + sistere (站立)', notes: '前後不矛盾、穩定' },
    { word: 'contrast', translation: '對比', pos: 'noun', etymology: 'contra- (相反) + stare (站立)', notes: '顯示差異的比較' },
    { word: 'contribute', translation: '貢獻；促成', pos: 'verb', etymology: 'con- (一起) + tribuere (給予)', notes: '幫助某件事發生' },
    { word: 'critical', translation: '批判的；關鍵的', pos: 'adjective', etymology: 'crisis (判斷)', notes: '重要且需謹慎評估' },
    { word: 'define', translation: '定義', pos: 'verb', etymology: 'de- (向下) + finire (界限)', notes: '清楚說明詞義' },
    { word: 'derive', translation: '衍生；取得', pos: 'verb', etymology: 'de- (向下) + rivus (河流)', notes: '從來源得到或推導出' },
    { word: 'determine', translation: '決定；判定', pos: 'verb', etymology: 'de- (向下) + terminus (界限)', notes: '經過分析後下結論' },
    { word: 'evaluate', translation: '評估', pos: 'verb', etymology: 'e- (出) + valere (有價值)', notes: '衡量事物的價值或優缺點' },
    { word: 'evidence', translation: '證據', pos: 'noun', etymology: 'e- (出) + videre (看見)', notes: '用來支持觀點的資料' },
    { word: 'explore', translation: '探索', pos: 'verb', etymology: 'ex- (出) + plorare (呼喊)', notes: '仔細調查或研究' },
    { word: 'factor', translation: '因素', pos: 'noun', etymology: 'facere (做)', notes: '影響結果的條件' },
    { word: 'function', translation: '功能；作用', pos: 'noun', etymology: 'functio (執行)', notes: '事物的用途或工作方式' },
    { word: 'identify', translation: '辨認；確認', pos: 'verb', etymology: 'id- (同一) + facere (做)', notes: '找出並說明是什麼' },
    { word: 'illustrate', translation: '說明；闡明', pos: 'verb', etymology: 'in- (向內) + lustrare (照亮)', notes: '用例子或圖示說明' },
    { word: 'justify', translation: '證明...正當；對齊', pos: 'verb', etymology: 'justus (正義)', notes: '提供理由支持觀點' },
    { word: 'method', translation: '方法', pos: 'noun', etymology: 'meta- (之間) + hodos (道路)', notes: '做事的系統步驟' },
    { word: 'significant', translation: '重要的', pos: 'adjective', etymology: 'signum (記號)', notes: '具有顯著影響或意義' },
    { word: 'theory', translation: '理論', pos: 'noun', etymology: 'theoria (觀察)', notes: '解釋現象的系統觀點' }
  ]
  let deck = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  if(!deck.length){
    deck = DEFAULT_DECK
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deck))
  }
  let index = 0

  const card = document.getElementById('card')
  const front = document.getElementById('card-front')
  const back = document.getElementById('card-back')
  const prevBtn = document.getElementById('prev')
  const nextBtn = document.getElementById('next')
  const shuffleBtn = document.getElementById('shuffle')

  function render(){
    if(deck.length===0){
      front.textContent = '尚無單字，請至 管理單字 新增'
      back.innerHTML = ''
      updateButtons()
      return
    }
    index = (index + deck.length) % deck.length
    const item = deck[index]
    front.textContent = item.word || ''
    back.innerHTML = ''
    if(item.translation) back.innerHTML += `<div><strong>中文：</strong>${item.translation}</div>`
    if(item.pos) back.innerHTML += `<div><strong>詞性：</strong>${item.pos}</div>`
    if(item.etymology) back.innerHTML += `<div><strong>字根/來源：</strong>${item.etymology}</div>`
    if(item.example) back.innerHTML += `<div><strong>例句：</strong>${item.example}</div>`
    if(item.notes) back.innerHTML += `<div><strong>備註：</strong>${item.notes}</div>`
    updateButtons()
  }

  function updateButtons(){
    const disabled = deck.length === 0
    prevBtn.disabled = disabled
    nextBtn.disabled = disabled
    shuffleBtn.disabled = disabled
  }

  card.addEventListener('click',()=>{
    if(deck.length === 0) return
    card.classList.toggle('flipped')
  })

  prevBtn.addEventListener('click',()=>{
    if(deck.length===0) return
    index = (index - 1 + deck.length) % deck.length
    card.classList.remove('flipped')
    render()
  })
  nextBtn.addEventListener('click',()=>{
    if(deck.length===0) return
    index = (index + 1) % deck.length
    card.classList.remove('flipped')
    render()
  })

  shuffleBtn.addEventListener('click',()=>{
    for(let i=deck.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deck))
    index = 0
    card.classList.remove('flipped')
    render()
  })

  // load deck again when page gains focus (so manager changes reflect)
  window.addEventListener('focus',()=>{ deck = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); render() })

  render()
})();
