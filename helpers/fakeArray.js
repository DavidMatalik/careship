const create2DArray = () => {
  const arrSize = 10
  let fakeArr = []

  beforeEach(() => {
    for (let i = 0; i < arrSize; i++) {
      fakeArr[i] = new Array(arrSize).fill(undefined)
    }
  })
}

export { create2DArray }
