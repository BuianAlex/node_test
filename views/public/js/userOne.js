const fileInput = document.getElementById('uploadPhoto')
const imgPrw = document.getElementById('img-prw')
const formLegend = document.getElementById('form-legend')
const nextBtn = document.getElementById('next-btn')
const imgForm = document.getElementById('img-form')
const imgList = document.querySelector('.img-list')
const addHobby = document.getElementById('hobby-form')

let imgName = ''

function getUserId () {
  const regUserID = /\?id=(\d*)/gm
  if (window.location.search) {
    return regUserID.exec(window.location.search)[1]
  } else {
    return undefined
  }
}

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
        imgPrw.setAttribute('src', `./../..${resData.path}`)
        formLegend.innerText = `File name: ${file.name}`
      } else {
        alert(this.statusText)
      }
    }
  }
  request.upload.onprogress = function (event) {
    if (event.lengthComputable) {
      const progress = Math.floor((10000 * event.loaded) / event.total) / 10000
    }
  }
  request.send(file)
})
// add foto to user
imgForm.addEventListener('submit', e => {
  e.preventDefault()
  const data = new FormData(e.target)
  const object = {}
  data.forEach((value, key) => {
    if (value !== '') {
      const numberFild = ['quality', 'imgWidth', 'imgHeigh']
      if (numberFild.indexOf(key) >= 0) {
        object[key] = parseInt(value, 10)
      } else if (key === 'greyscale') {
        object.greyscale = true
      } else {
        object[key] = value
      }
    }
  })
  object.fileName = imgName
  object.userNumb = getUserId()
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
    const dataToSend = {}
    const imgID = e.target.getAttribute('img-id')
    dataToSend.imgID = imgID
    const userNumb = getUserId()
    if (userNumb) {
      dataToSend.userNumb = userNumb
    }
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
    request.send(JSON.stringify(dataToSend))
  }
})

let evoStep = 'hobbies'
const evoPane = ['hobbies', 'courses', 'skills']
let evoPos = 0
function evolutionSteps () {
  evoPos = (evoPos + 1) % evoPane.length
  evoStep = evoPane[evoPos]
  mui.tabs.activate(evoStep)
}

let stepName = 'step-1'
const paneIds = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5']
let currPos = 0
function persInfoStep () {
  currPos = (currPos + 1) % paneIds.length
  stepName = paneIds[currPos]
  mui.tabs.activate(stepName)
}

document.getElementById('next-btn-evo').addEventListener('click', (e) => {
  e.preventDefault()
  evolutionSteps()
})

nextBtn.addEventListener('click', (e) => {
  e.preventDefault()
  persInfoStep()
})

const toggleEls = document.querySelectorAll('[data-mui-controls]')

function tabsClick (ev) {
  if (paneIds.indexOf(ev.paneId) >= 0) {
    currPos = paneIds.indexOf(ev.paneId)
    stepName = paneIds[currPos]
  }
  if (evoPane.indexOf(ev.paneId) >= 0) {
    evoPos = evoPane.indexOf(ev.paneId)
    evoStep = evoPane[evoPos]
  }
}

for (var i = 0; i < toggleEls.length; i++) {
  toggleEls[i].addEventListener('mui.tabs.showend', tabsClick)
}
// add user info
document.addEventListener('submit', e => {
  e.preventDefault()
  const allowedForms = ['hobby-form', 'info-form', 'course-form', 'skills-form']
  if (allowedForms.indexOf(e.target.id) >= 0) {
    const formData = new FormData(e.target)
    let dataToSend
    let reqURL
    const urlEvo = { hobbies: 'step-1', courses: 'step-2', skills: 'step-3' }
    const evolution = {
      hobbies: [{ name: '', timeStarted: '', isKeepOnDoing: false }],
      courses: [{ name: '', timeStarted: '', timeEnd: '', isKeepOnDoing: false, doYouLikeIt: false }],
      skills: [{ name: '', level: '', improvements: '' }]
    }
    switch (e.target.id) {
      case 'skills-form':
      case 'course-form':
      case 'hobby-form' :
        reqURL = `/users/evolution/${urlEvo[evoStep]}`

        formData.forEach(function (value, key) {
          if (key === 'isKeepOnDoing' || key === 'doYouLikeIt') {
            evolution[evoStep][0][key] = true
          } else {
            evolution[evoStep][0][key] = value
          }
        })
        dataToSend = JSON.stringify({ [evoStep]: evolution[evoStep] })
        break

      case 'info-form':
        reqURL = `/users/personal-info/${stepName}`
        const persInfo = {}
        formData.forEach(function (value, key) {
          persInfo[key] = value
        })
        const {
          firstName, lastName, givenName, surname,
          dob,
          nationality,
          country, homeAddress, phoneNumber, postCode, city,
          passportExpectedDate, passportExpiryDate, passportStatus, passportNumber
        } = persInfo
        const steps = {
          'step-1': { firstName, lastName, givenName, surname },
          'step-2': { dob },
          'step-3': { nationality },
          'step-4': { country, homeAddress, postCode, phoneNumber, city },
          'step-5': { passportExpectedDate, passportExpiryDate, passportStatus, passportNumber }
        }
        dataToSend = JSON.stringify(steps[stepName])
        break

      default:
        break
    }
    const request = new XMLHttpRequest()
    request.open('POST', reqURL)
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          addHobby.reset()
          // location.reload()
        } else {
          alert(this.responseText)
        }
      }
    }
    request.send(dataToSend)
  }
})
