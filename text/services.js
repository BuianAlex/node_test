function handler (req) {
  return new Promise((resolve, reject) => {
    let dods = 0
    let whitespace = 0
    let coma = 0
    let totalLength = 0
    const lines = []
    let oneLine = []

    req
      .on('data', chunk => {
        const inString = chunk.toString()
        totalLength += chunk.length
        if (inString.match(/[.]/g)) {
          dods += inString.match(/[.]/g).length
        }
        if (inString.match(/[\s]/g)) {
          whitespace += inString.match(/[\s]/g).length
        }
        if (inString.match(/[,]/g)) {
          coma += inString.match(/[,]/g).length
        }

        for (let index = 0; index < inString.length; index++) {
          oneLine.push(inString[index])
          if (
            /[.]/.test(inString[index]) &&
          (/[\D]/.test(inString[index + 1]) ||
            inString[index + 1] === undefined)
          ) {
            lines.push(oneLine.join(''))
            oneLine = []
          }
        }
      })
      .on('end', () => {
        resolve({ dods, whitespace, coma, totalLength, linesCalc: lines.length })
      })
  })
}

module.exports = { handler }
