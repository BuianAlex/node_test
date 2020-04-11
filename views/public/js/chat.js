const socket = io()
const body = document.querySelector('body')
const hintBtn = document.querySelector('.hint')
const modalWraper = document.createElement('div')
modalWraper.classList.add('modal-bg')
const modalContent = document.createElement('div')
modalContent.classList.add('modal-content')
modalContent.innerHTML = `
  <form class="mui-form" id="user-form">
    <ul class="mui-tabs__bar mui-tabs__bar--justified">
      <li class="mui--is-active"><a data-mui-toggle="tab" data-mui-controls="pane-justified-1">Login</a></li>
      <li><a data-mui-toggle="tab" data-mui-controls="pane-justified-2">Singin</a></li>
    </ul>
    <div class="mui-textfield">
        <input type="text" name="log">
        <label>User name</label>
      </div>
      <div class="mui-textfield">
        <input type="password" name="pass">
        <label>User password</label>
      </div>
    <div class="mui-tabs__pane mui--is-active" id="pane-justified-1">
      <button type="submit" id="login" class="mui-btn mui-btn--primary mui-btn--raised">Login</button>
    </div>
    <div class="mui-tabs__pane" id="pane-justified-2">
      <div class="mui-checkbox">
        <label>
          <input type="checkbox" name="is_admin" checked>
          Is admin
        </label>
      </div>
      <button type="submit" id="singin" class="mui-btn mui-btn--primary mui-btn--raised">Singin</button>
    </div>
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
  const { time, name, text } = msg
  console.log(time, name, text)

  const message = document.createElement('li')

  if (time) {
    const timeSpan = document.createElement('span')
    timeSpan.classList.add('time')
    timeSpan.textContent = time
    message.appendChild(timeSpan)
  }

  if (name) {
    const nameSpan = document.createElement('span')
    nameSpan.classList.add('name')
    nameSpan.textContent = `${name}:`
    message.appendChild(nameSpan)
  }

  if (text) {
    const textSpan = document.createElement('span')
    textSpan.classList.add('text')
    textSpan.textContent = text
    message.appendChild(textSpan)
  }
  document.getElementById('chat').appendChild(message)
}

function usersBoard (list) {
  const board = document.querySelector('.who-online')
  board.innerHTML = ''
  if (list.length > 0) {
    const board = document.querySelector('.who-online')
    list.forEach(item => {
      const user = document.createElement('li')
      user.classList.add('user-name')
      user.classList.add(item.onLine ? 'onLine' : 'ofLine')
      user.innerHTML = `<span>${item.loginName}</span>`
      board.appendChild(user)
    })
  }
}

socket.on('people online', data => {
  console.log('ping')
  usersBoard(data)
})

socket.on('disconnect', () => {
  appendMessage({ time: moment().format('HH:mm:ss'), text: 'Connection lost' })
})

socket.on('logout', data => {
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

socket.on('not_authorized', () => {
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
