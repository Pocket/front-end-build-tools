const axios = require('axios');
const [ prArg ] = process.argv.slice(2)
const publishPullRequest = (prArg === '-pr' )
//  \
//   -H 'Accept: */*' \
//   -H 'Authorization: Bearer vlpABldTQhAAAAAAAAAAi4gaXBb286XMt5fmT8-1C_e9FRFpsKXcalKvMFgNr3jh' \
//   -H 'Cache-Control: no-cache' \
//   -H 'Connection: keep-alive' \
//   -H 'Content-Type: application/octet-stream' \
//   -H 'Dropbox-API-Arg: {"path":"/HomeworkMatrices.txt","mode":"add","autorename":true,"mute":false,"strict_conflict":false}' \
//   -data-binary=@/Users/nelsonomuto/test.json
// {"name": "HomeworkMatrices.txt", "path_lower": "/homeworkmatrices.txt", "path_display": "/HomeworkMatrices.txt", "id": "id:OGKr4JlloPAAAAAAAAAOMw", "client_modified": "2019-06-22T14:54:57Z", "server_modified": "2019-06-22T14:54:57Z", "rev": "38fc7d66240", "size": 40, "is_downloadable": true, "content_hash": "d8e076b35c8f456c2512f2c7d0f28a8a0587ccdd705987b1615bea2fd1b2ffc2"}%

const dropBoxUploadUrl = 'https://content.dropboxapi.com/2/files/upload'
axios.request({
    url: dropBoxUploadUrl,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.POCKET_DROP_BOX_TOKEN}`
    }
  }).catch(error => {
    throw error
  }).then(response => {
    console.log(response)
  })