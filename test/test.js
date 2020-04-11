const data = [
  {
    photo: [],
    _id: '5e8c8fa6e215fb3e81140b56',
    loginName: 'Alex',
    password: '$2b$10$ViN/yL31YSZmPfWkXwdwVeh1anfYsH3hTAuWAQ/.2vxN7qWJBG8wm',
    isAdmin: false,
    userNumb: 0,
    __v: 1,
    personalInfo: '5e8cb98962bf234a23d73276',
    evolution: '5e8ef56158dbf552a51a677e'
  },
  {
    photo: [],
    _id: '5e8f1e664dcaf16b62ecc91c',
    loginName: 'Alex2',
    password: '$2b$10$keVn0WKCLRQ9B1aouu5qNeiRnfnzWfqdRiG7jgQt.DFraw5x9t7xW',
    isAdmin: true,
    userNumb: 1,
    __v: 0
  },
  {
    photo: [],
    _id: '5e8f632cbc743d3054686c95',
    loginName: 'qwas',
    password: '$2b$10$aTWB0KEDD3.wnQbGPfIb8u1gccd6O/Nzuga4yOg4VT6kwA5YTJag2',
    isAdmin: true,
    userNumb: 2,
    __v: 0
  },
  {
    photo: [],
    _id: '5e8f6396fe860f308a65f96a',
    loginName: 'asqw',
    password: '$2b$10$hAKuOt7irgI.SLql0oRE8e6kHViFZTTQFGLsU/yw/4kvlTqAsyz1u',
    isAdmin: true,
    userNumb: 3,
    __v: 0
  },
  {
    photo: [],
    _id: '5e8f65fda3b26f3208922e13',
    loginName: 'asdf',
    password: '$2b$10$Ph7osQJGvkIJ34.1aAPQ4u.98tx6kAdv37iqW7JMTBOu7mutiGZ2.',
    isAdmin: false,
    userNumb: 4,
    __v: 0
  },
  {
    photo: [],
    _id: '5e8f6674d1d24532898343b9',
    loginName: 'rggrfd',
    password: '$2b$10$ZWs2TRJYFJIIlkcyLr17o.ZLhT0MqPGysSzyLj.rzKrG8fy2m1WRy',
    isAdmin: false,
    userNumb: 5,
    __v: 0
  },
  {
    photo: [],
    _id: '5e8f66b8cc4e4832b5d274e8',
    loginName: 'thdfbv',
    password: '$2b$10$fizrcZGUtD116Ldoa/kH/O.ZmYmkyTAUcBJpeg4x03mn79kn1zufe',
    isAdmin: false,
    userNumb: 6,
    __v: 0
  },
  {
    photo: [],
    _id: '5e90519b2012b546ac39bf1a',
    loginName: 'hp',
    password: '$2b$10$nfDhxBmJ9b9Kg8887WRDAucdNr/FctGUWkXB37tHiW0X559dzLSaK',
    isAdmin: true,
    userNumb: 7,
    __v: 0
  }
]

const userList = {
  am1lief8oow4xwaEAAAA: {
    photo: [],
    _id: '5e8c8fa6e215fb3e81140b56',
    loginName: 'Alex',
    password: '$2b$10$ViN/yL31YSZmPfWkXwdwVeh1anfYsH3hTAuWAQ/.2vxN7qWJBG8wm',
    isAdmin: false,
    userNumb: 0,
    __v: 1,
    personalInfo: '5e8cb98962bf234a23d73276',
    evolution: '5e8ef56158dbf552a51a677e'
  }
}

const line = data.map(item => {
  const res = Object.values(userList).filter(onUser => item.userNumb === onUser.userNumb)
  if (res.length === 1) {
    item.onLine = true
  } else {
    item.onLine = false
  }
  return item
})
console.log(line)
