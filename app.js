// 簡易 flashcard 應用（純前端，使用 localStorage）
(function(){
  const STORAGE_KEY = 'vocab_deck'
  let deck = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
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
