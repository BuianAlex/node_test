const form = document.querySelector('#text')
const panel = document.querySelector('.mui-panel')
const upload = document.getElementById('uploadFile')
const upLabel = document.getElementById('uploadLable')
const progressElement = document.getElementById('progress')
upload.addEventListener('change', e => {
  upLabel.innerHTML = e.target.files[0].name
})

form.addEventListener('submit', e => {
  e.preventDefault()
  const formFile = e.target.fileUpload.files[0]

  upload.innerHTML = formFile.name
  console.log(formFile)

  const request = new XMLHttpRequest()
  request.open('POST', '/text/upload')
  request.setRequestHeader('Content-Type', formFile.type)
  request.setRequestHeader(
    'Content-Disposition',
    'attachment; filename="' + formFile.name + '"'
  )
  request.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE) {
      const resDataObject = JSON.parse(this.response)
      let listRes = ''
      Object.keys(resDataObject).forEach(item => {
        listRes += `<li>${item}: ${resDataObject[item]}</li>`
      })
      if (this.status === 200) {
        const resBlock = document.createElement('div')
        resBlock.innerHTML = `
         <h3> Result:</h3>
        <ul>
          ${listRes}
          </ul>
        `

        panel.appendChild(resBlock)

        // location.reload()
      } else {
        alert(this.statusText)
      }
    }
  }
  request.upload.onprogress = function(event) {
    if (event.lengthComputable) {
      const progress = Math.floor((10000 * event.loaded) / event.total) / 10000
      progressElement.textContent = Math.floor(progress * 100) + '%' // 0.2536 (25.36%)
    }
  }
  request.send(formFile)
})
