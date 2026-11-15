// A license plan with a yearly price per preparer in whole dollars
class Plan {
  constructor({ planId, name, seatLimit, pricePerSeat, returnTypes, efileIncluded }) {
    this.planId = planId;
    this.name = name;
    this.seatLimit = seatLimit;
    this.pricePerSeat = pricePerSeat;
    this.returnTypes = returnTypes;
    this.efileIncluded = efileIncluded;
  }

  // Check the preparer count against the seat limit
  hasRoomFor(preparerCount) {
    return preparerCount <= this.seatLimit;
  }

  // Calculate the yearly price for the preparer count
  priceFor(preparerCount) {
    return this.pricePerSeat * preparerCount;
  }
}

module.exports = Plan;
