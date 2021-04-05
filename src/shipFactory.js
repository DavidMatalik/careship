export default function shipFactory(len) {
  const suppliedSections = new Array(len).fill(false)

  // Put gift at appropriate section of ship
  const sendGift = (num) => {
    return (suppliedSections[num] = true)
  }

  // If whole ship is supllied with gifts return true
  const isSupplied = () => {
    return suppliedSections.every((el) => el === true)
  }

  return { sendGift, isSupplied }
}
