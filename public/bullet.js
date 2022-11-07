const bullet = document.getElementById('bullet1')

bullet.style.bottom = '10px'
console.log('test')

  setInterval(()=>{
    bullet.style.left += 1
    console.log('test')
  },25)