const fileInput = document.getElementById('uploadPhoto')
const imgPrw = document.getElementById('img-prw')
const formLegend = document.getElementById('form-legend')
const imgForm = document.getElementById('img-form')
const imgList = document.querySelector('.img-list')
const addHobby = document.getElementById('hobby-form')
const reg = /\?id=(\d*)/gm
const userID = reg.exec(window.location.search)[1]
let imgName = ''
let imgExt = ''
let mime = ''

function reRenderImgList (resData) {
  const listElement = document.createElement('li')
  listElement.classList.add('with-photo')
  listElement.setAttribute('img-id', resData._id)
  const img = document.createElement('img')
  img.setAttribute('src', `./../../${resData.path}/${resData.fileName}`)
  img.setAttribute('alt', resData.altText)
  const btnDelete = document.createElement('button')
  btnDelete.classList.add('img-delete')
  btnDelete.setAttribute('img-id', resData._id)
  btnDelete.textContent = '+'
  listElement.appendChild(img)
  listElement.appendChild(btnDelete)
  imgList.appendChild(listElement)
}
// upload photo
fileInput.addEventListener('change', e => {
  const file = e.target.files[0]
  imgName = file.name
  const request = new XMLHttpRequest()
  request.open('POST', '/files/upload')
  request.setRequestHeader('Content-Type', file.type)
  request.setRequestHeader(
    'Content-Disposition',
    'attachment; filename="' + file.name + '"'
  )
  request.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        const resData = JSON.parse(this.response)
        console.log(resData.path)
        imgPrw.setAttribute('src', `./../..${resData.path}`)
        imgExt = resData.ext
        mime = resData.mime
        formLegend.innerText = `File name: ${file.name}`
      } else {
        alert(this.statusText)
      }
    }
  }
  request.upload.onprogress = function (event) {
    if (event.lengthComputable) {
      const progress = Math.floor((10000 * event.loaded) / event.total) / 10000
      console.log(Math.floor(progress * 100) + '%')
    }
  }
  request.send(file)
})
// add foto to user
imgForm.addEventListener('submit', e => {
  e.preventDefault()
  const data = new FormData(e.target)
  const object = {}
  data.forEach(function (value, key) {
    object[key] = value
  })
  object.fileName = imgName
  object.userNumb = userID
  object.mime = mime
  object.type = imgExt
  const json = JSON.stringify(object)
  const request = new XMLHttpRequest()
  request.open('POST', '/users/add-photo')
  request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  request.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        const resData = JSON.parse(this.response)
        imgPrw.setAttribute('src', './../../img/nophoto.png')
        formLegend.innerText = ''
        imgForm.reset()
        imgName = ''
        imgExt = ''
        mime = ''
        reRenderImgList(resData)
        console.log(resData)
      } else {
        alert(this.responseText)
      }
    }
  }
  request.send(json)
})
// delete
document.addEventListener('click', e => {
  if (e.target.classList.contains('img-delete')) {
    const imgID = e.target.getAttribute('img-id')
    const json = JSON.stringify({ userID, imgID })
    const img = document.querySelector('.img-list').childNodes
    const request = new XMLHttpRequest()
    request.open('POST', '/users/delete-photo')
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          Array.from(img).forEach((item, i) => {
            if (imgID === item.getAttribute('img-id')) {
              imgList.removeChild(item)
            }
          })
        } else {
          alert(this.responseText)
        }
      }
    }
    request.send(json)
  }
})

document.addEventListener('submit', e => {
  e.preventDefault()
  const allowedForms = ['hobby-form']
  if (allowedForms.indexOf(e.target.id) >= 0) {
    const formData = new FormData(e.target)
    let dataToSend
    let ReqURL
    let evolution = {}
    switch (e.target.id) {
      case 'hobby-form':
        ReqURL = '/users/evolution/step-1'
        evolution = { hobbies: [{ name: '', timeStarted: '', isKeepOnDoing: false }] }
        formData.forEach(function (value, key) {
          if (key === 'isKeepOnDoing') {
            evolution.hobbies[0][key] = true
          } else {
            evolution.hobbies[0][key] = value
          }
        })
        console.log('sds')
        dataToSend = JSON.stringify(evolution)
        break

      default:
        break
    }
    const request = new XMLHttpRequest()
    request.open('POST', ReqURL)
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          addHobby.reset()
          location.reload()
          console.log(this.response)
        } else {
          alert(this.responseText)
        }
      }
    }
    request.send(dataToSend)
  }
})
