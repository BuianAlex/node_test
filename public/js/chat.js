const socket = io()
const body = document.querySelector('body')
const hintBtn = document.querySelector('.hint')
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
      <input type="checkbox" name="is_admin" checked>
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
    const reqData = {
      loginName: e.target.form.log.value,
      password: e.target.form.pass.value
    }
    if (e.target.id === 'singin') {
      reqData.isAdmin = e.target.form.is_admin.checked
    }
    const url = e.target.id === 'login' ? '/users/login' : '/users/create'
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqData)
      })
      if (response.status === 200) {
        body.removeChild(modalWraper)
        location.reload()
      } else {
        alert(response.status)
      }
    } catch (error) {
      console.log(error)
    }
  }
  if (e.target.classList.contains('hint')) {
    socket.emit('hint')
  }
})

modalWraper.appendChild(modalContent)

function appendMessage (msg) {
  const message = document.createElement('li')
  message.textContent = msg
  document.getElementById('chat').appendChild(message)
}

function usersBoard (list) {
  const board = document.querySelector('.who-online')
  board.innerHTML = ''
  if (list) {
    const board = document.querySelector('.who-online')
    Object.keys(list).forEach(item => {
      const user = document.createElement('li')
      user.classList.add('user-name')
      user.innerHTML = `<span>${list[item].loginName}</span>`
      board.appendChild(user)
    })
  }
}

socket.on('people online', data => {
  console.log('ping')
  usersBoard(data)
})

socket.on('disconnect', () => {
  body.appendChild(modalWraper)
  fetch('/users/logout')
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log(data)
    })
})

socket.on('chat_message', data => {
  appendMessage(data)
})

socket.on('hint', data => {
  appendMessage(data)
})

socket.on('not_aut', () => {
  body.appendChild(modalWraper)
})

document.querySelector('#send-message').addEventListener('submit', e => {
  e.preventDefault()
  const inpMsg = document.getElementById('m')
  if (inpMsg.value.length > 0) {
    socket.emit('chat_message', inpMsg.value)
  }
  inpMsg.value = ''
})
