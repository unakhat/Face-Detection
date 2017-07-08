module.exports = [
  {
    method: 'POST',
    path: '/imageprocessing/facedetection',
    config: require('./routeConfig/facebiometric/imageHandler')
  },
  {
    method: 'POST',
    path: '/learning/faceModelCreation',
    config: require('./routeConfig/facebiometric/faceModelHandler')
  },
  {
    method: 'POST',
    path: '/learning/v2/faceModelCreation',
    config: require('./routeConfig/facebiometric/faceModelCreation')
  },
  {
    method: 'POST',
    path: '/learning/v3/faceModelCreation',
    config: require('./routeConfig/facebiometric/faceModelCreation_v3')
  },
  {
    method: 'POST',
    path: '/recognition/faceRecognition',
    config: require('./routeConfig/facebiometric/faceRecognition')
  },
  {
    method: 'POST',
    path: '/recognition/v2/faceRecognition',
    config: require('./routeConfig/facebiometric/faceRecognition_v2')
  }
]
