// 管理頁面：新增/列出/刪除單字，並提供自動填入功能（呼叫公開 API）
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
  function readDeck(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  function writeDeck(d){ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }
  function ensureDefaultDeck(){
    const deck = readDeck()
    if(!deck.length){
      writeDeck(DEFAULT_DECK)
    }
  }

  const GAS_ENDPOINT = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
  const form = document.getElementById('word-form')
  const inputWord = document.getElementById('input-word')
  const inputTrans = document.getElementById('input-translation')
  const inputPos = document.getElementById('input-pos')
  const inputEty = document.getElementById('input-etymology')
  const inputExample = document.getElementById('input-example')
  const list = document.getElementById('word-list')
  const statusEl = document.getElementById('status')
  const autofillBtn = document.getElementById('autofill')

  async function sendWordToBackend(payload){
    try{
      const response = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if(!response.ok) throw new Error(`後端回應錯誤：${response.status}`)
      const result = await response.json().catch(()=>null)
      return result
    }catch(err){
      console.error('sendWordToBackend error', err)
      throw err
    }
  }

  function renderList(){
    const deck = readDeck()
    list.innerHTML = ''
    deck.forEach((it, i)=>{
      const li = document.createElement('li')
      li.innerHTML = `<div>
          <div><strong>${escapeHtml(it.word)}</strong></div>
          <div class="meta">${escapeHtml(it.translation || '')} ${escapeHtml(it.pos||'')}</div>
        </div>
        <div>
          <button class="small-btn" data-i="${i}" data-action="edit">編輯</button>
          <button class="small-btn" data-i="${i}" data-action="delete">刪除</button>
        </div>`
      list.appendChild(li)
    })
  }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  form.addEventListener('submit',async (e)=>{
    e.preventDefault()
    const word = inputWord.value.trim()
    if(!word) return alert('請輸入英文單字')
    const payload = {
      word,
      translation: inputTrans.value.trim(),
      pos: inputPos.value.trim(),
      etymology: inputEty.value.trim(),
      example: inputExample.value.trim(),
      createdAt: new Date().toISOString()
    }

    const deck = readDeck()
    deck.push(payload)
    writeDeck(deck)
    form.reset()
    renderList()

    statusEl.textContent = '正在儲存至後端…'
    try{
      await sendWordToBackend(payload)
      statusEl.textContent = '已成功儲存單字並同步至後端。'
    }catch(err){
      statusEl.textContent = '本機已儲存，但同步後端失敗，請檢查 GAS 網址或網路。'
    }
  })

  list.addEventListener('click',(e)=>{
    const btn = e.target.closest('button')
    if(!btn) return
    const i = Number(btn.dataset.i)
    const action = btn.dataset.action
    const deck = readDeck()
    if(action==='delete'){
      if(!confirm('確定刪除？')) return
      deck.splice(i,1); writeDeck(deck); renderList()
      return
    }
    if(action==='edit'){
      const it = deck[i]
      inputWord.value = it.word || ''
      inputTrans.value = it.translation || ''
      inputPos.value = it.pos || ''
      inputEty.value = it.etymology || ''
      inputExample.value = it.example || ''
      deck.splice(i,1); writeDeck(deck); renderList()
      return
    }
  })

  // 自動填入：使用 dictionaryapi.dev 與 MyMemory 翻譯
  autofillBtn.addEventListener('click', async ()=>{
    const word = inputWord.value.trim()
    if(!word) return alert('請先輸入要查詢的英文單字')
    autofillBtn.disabled = true; autofillBtn.textContent='查詢中...'
    try{
      // 查詞性和字根/來源（dictionaryapi.dev）
      const dictResp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
      if(dictResp.ok){
        const data = await dictResp.json()
        // 取第一個解釋與詞性
        if(Array.isArray(data) && data[0]){
          const entry = data[0]
          if(entry.meanings && entry.meanings[0] && entry.meanings[0].partOfSpeech){
            inputPos.value = entry.meanings[0].partOfSpeech
          }
          if(entry.origin) inputEty.value = entry.origin
        }
      }
      // 翻譯（MyMemory）
      const transResp = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-TW`)
      if(transResp.ok){
        const td = await transResp.json()
        if(td && td.responseData && td.responseData.translatedText){
          inputTrans.value = td.responseData.translatedText
        }
      }
    }catch(err){
      console.error(err); alert('自動填入失敗，請檢查網路或稍後再試')
    }finally{
      autofillBtn.disabled = false; autofillBtn.textContent='自動填入'
    }
  })

  // init
  ensureDefaultDeck()
  renderList()
})();
