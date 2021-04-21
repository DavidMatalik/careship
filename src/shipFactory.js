export default function shipFactory(len) {
  const suppliedSections = new Array(len).fill(false)

  // Update supply status of a ship
  const sendGift = () => {
    suppliedSections.push(true)
    suppliedSections.shift()
  }

  // If whole ship is supllied with gifts return true
  const isSupplied = () => {
    return suppliedSections.every((el) => el === true)
  }

  return { sendGift, isSupplied }
}
