const socket = io()
let userData = JSON.parse(localStorage.getItem('userData')) || ''

const body = document.querySelector('body')
const modalWraper = document.createElement('div')
modalWraper.classList.add('modal-bg')
const modalContent = document.createElement('div')
modalContent.classList.add('modal-content')
modalContent.innerHTML = `
  <form class="mui-form" id="user-form">
  <legend>Welcome</legend>
  <div class="mui-textfield">
    <input type="text" name="log">
    <label>User name</label>
  </div>
  <div class="mui-textfield">
    <input type="password" name="pass">
    <label>User password</label>
  </div>
  <div class="mui-checkbox">
    <label>
      <input type="checkbox" name="is_admin" value="false">
      Is admin
    </label>
  </div>
  <button type="submit" id="login" class="mui-btn mui-btn--raised">Login</button>
  <button type="submit" id="singin" class="mui-btn mui-btn--raised">Singin</button>
  </form>
`

document.addEventListener('click', async e => {
  if (e.target.id === 'login' || e.target.id === 'singin') {
    e.preventDefault()
    const url = e.target.id === 'login' ? '/users/login' : '/users/create'
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          loginName: e.target.form.log.value,
          password: e.target.form.pass.value
        })
      })
      if (response.status === 200) {
        const resApi = await response.json()
        body.removeChild(modalWraper)
        localStorage.setItem('userData', JSON.stringify(resApi.result))
        userData = resApi.result
        socket.connect()
        socket.emit('new-user')
      } else {
        const resApi = await response.json()
        alert(resApi.message)
      }
    } catch (error) {
      console.log(error)
    }
  }
})

modalWraper.appendChild(modalContent)

// window.onload = function() {
//   if (!userData) {
//     body.appendChild(modalWraper)
//   } else {
//     startSocket()
//   }
// }

function appendMessage(msg) {
  const message = document.createElement('li')
  message.textContent = msg
  document.getElementById('chat').appendChild(message)
}

function usersBoard(list) {
  console.log(JSON.stringify(list))
  const board = document.querySelector('.who-online')
  board.innerHTML = ''
  if (list) {
    const board = document.querySelector('.who-online')
    Object.keys(list).forEach(item => {
      const user = document.createElement('li')
      user.classList.add('user-name')
      user.innerHTML = `<span>${list[item]}</span>`
      board.appendChild(user)
    })
  }
}

socket.on('people online', data => {
  usersBoard(data)
})

// socket.on('connect', function() {
//   socket.emit('new-user', userData.loginName)
// })

socket.on('chat_message', data => {
  appendMessage(data)
})
// socket.on('user-connected', function(msg) {
//   appendMessage(`Welcome ${msg}`)
// })
socket.on('not_aut', function() {
  body.appendChild(modalWraper)
})
document.querySelector('#send-message').addEventListener('submit', e => {
  e.preventDefault()
  console.log('Sgs')
  const inpMsg = document.getElementById('m')
  socket.emit('chat_message', inpMsg.value)
  inpMsg.value = ''
})

// function startSocket() {
//   console.log(userData.loginName)
// }
