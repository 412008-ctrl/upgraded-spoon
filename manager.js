// 管理頁面：新增/列出/刪除單字，並提供自動填入功能（呼叫公開 API）
(function(){
  const STORAGE_KEY = 'vocab_deck'
  function readDeck(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  function writeDeck(d){ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }

  const form = document.getElementById('word-form')
  const inputWord = document.getElementById('input-word')
  const inputTrans = document.getElementById('input-translation')
  const inputPos = document.getElementById('input-pos')
  const inputEty = document.getElementById('input-etymology')
  const inputNotes = document.getElementById('input-notes')
  const list = document.getElementById('word-list')
  const autofillBtn = document.getElementById('autofill')

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

  form.addEventListener('submit',(e)=>{
    e.preventDefault()
    const word = inputWord.value.trim()
    if(!word) return alert('請輸入英文單字')
    const deck = readDeck()
    deck.push({word,translation:inputTrans.value.trim(),pos:inputPos.value.trim(),etymology:inputEty.value.trim(),notes:inputNotes.value.trim()})
    writeDeck(deck)
    form.reset()
    renderList()
    alert('已加入單字')
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
      inputNotes.value = it.notes || ''
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
          // 若沒翻譯就試著抓英文定義
          if(!inputNotes.value && entry.meanings && entry.meanings[0] && entry.meanings[0].definitions && entry.meanings[0].definitions[0]){
            inputNotes.value = entry.meanings[0].definitions[0].definition
          }
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
  renderList()
})();
