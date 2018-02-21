import * as Const from '../defines/const'

/***********************************
 * ****   Main functions:    *******
 ***********************************
 *
 * 1.classifyCards
 * 2.cardRanking
 *
 * *********************************
 ***********************************/


export function classifyCards (data) {

  let messageResult = ''
  let contentData = ''

  let validate = validateData(data)
  if (validate.status === Const.DATA_STATUS_FAILURE) {
    return {
      type: Const.CLASSIFY_CARDS,
      status: Const.DATA_STATUS_FAILURE,
      message: validate.message,
      content: contentData
    }
  }

  // let cards = data.split(' ');

  //result
  contentData = solveData(data)
  return {
    type: Const.CLASSIFY_CARDS,
    status: Const.DATA_STATUS_SUCCESS,
    message: messageResult,
    content: contentData
  }
}

export function cardRanking (data) {

  let result = []
  let cardList = data.split(',')

  for (let i = 0; i < cardList.length; i++) {
    cardList[i] = cardList[i].trim()
    let validate = validateData(cardList[i])
    if (validate.status === Const.DATA_STATUS_FAILURE) {
      return {
        type: Const.RANKING_CARDS,
        status: Const.DATA_STATUS_FAILURE,
        message: validate.message,
        content: result
      }
    }
  }

  let validate = checkCards(cardList)
  if (validate.status === Const.DATA_STATUS_FAILURE) {

    return {
      type: Const.RANKING_CARDS,
      status: Const.DATA_STATUS_FAILURE,
      message: validate.message,
      content: result,
    }
  }

  let bestHand = solveData(cardList[0])
  let bestIndex = 0

  for (let i = 0; i < cardList.length; i++) {
    let pokerHand = solveData(cardList[i])
    if (compareHand(pokerHand, bestHand) > 0) {
      bestHand = pokerHand
      bestIndex = i
    }
    result.push(pokerHand)
  }
  result[bestIndex].isBest = true

  let json = generateJsonResult(result)
  //console.log(json);
  return {
    type: Const.RANKING_CARDS,
    status: Const.DATA_STATUS_SUCCESS,
    message: '',
    content: result,
    jsonResult: json
  }
}

/************************************
 * ****   Support functions     *****
 * **********************************
 *
 * a) validateData
 * b) checkCards
 * c) isInvalidCard
 * d) solveData
 * e) getResult
 * f) getCardType
 * g) getNumber
 * h) resolveCards
 * i) fixedCard
 * j) getRepresentative
 * k) compareHand
 * l) generateJsonResult
 * m) sortCardWithPriority
 *
 * **********************************
 * **********************************
 ************************************/

/**
 * @desc validate input data
 *   each string has 5 element , each element is a card string
 * @param data : string
 * {
  *   status : success or fail
  *   message : empty string if success , validate message if fail 
  * }
 */
function validateData (data) {

  let cardSet = new Set()
  let isValid = true
  let messageContent = Const.MESSAGE_INVALID_INPUT

  let cards = data.split(' ')
  if (cards.length === 5) {
    for (let i = 0; i < cards.length; i++) {
      cardSet.add(cards[i])
    }

    for (let i = 0; i < cards.length; i++) {
      if (isInvalidCard(cards[i])) {
        isValid = false
        break
      }
    }

    if (isValid) {
      if (cardSet.size !== 5) {
        isValid = false
        messageContent = Const.MESSAGE_DUPLICATE_CARDS
      }
    }

  } else {
    isValid = false
  }
  if (isValid) {
    return {
      status: Const.DATA_STATUS_SUCCESS,
      message: ''
    }
  } else {
    return {
      status: Const.DATA_STATUS_FAILURE,
      message: messageContent
    }
  }

}

/**
 * @desc check duplicate card for all card received
 * @param cardList : array of list cards
 * @return : an Object
 * {
  *   status : success or fail
  *   message : empty string if success , validate message if fail 
  * }
 */
function checkCards (cardList) {
  let cardQuantity = cardList.length * 5
  let cardSet = new Set()
  for (let i in cardList) {
    let cards = cardList[i].split(' ')
    for (let j in cards) {
      cardSet.add(cards[j])
    }
  }

  if (cardSet.size !== cardQuantity) {
    return {
      status: Const.DATA_STATUS_FAILURE,
      message: Const.MESSAGE_DUPLICATE_CARDS
    }
  } else {
    return {
      status: Const.DATA_STATUS_SUCCESS,
      message: ''
    }
  }
}

/**
 * @desc check card format is valid or not
 *  A card is a POKER card
 *  Card format : Xy
 *  X :A letter represent for Card type (define on const) , y :card number (from 1 to 13) A is 1
 * @param card : a card string
 * @return : boolean - true if INVALID , false otherwise
 */
function isInvalidCard (card) {
  if (card.length == 1) return true

  let cardType = getCardType(card)
  if (![Const.SPADE,Const.HEART,Const.DIAMOND,Const.CLUB].includes(cardType)) {
    return true
  }

  let cardNumber = getNumber(card)
  if (cardNumber === 'undefined') return true
  if (cardNumber > 13 || cardNumber < 1) return true

  return false
}

/**
 * @desc caculate a poker hand
 *
 * @param data : cards string (5 element , each element is a card)
 * @return : an Object
 {
     type: String - type of a poker hand
     cardList: Array - array of card
     representative: String - a representative cards of a poker hand
     point: int - point of each poker hand's type (define in const)
     isBest: boolean - true if it's the best poker hand
     originalList: String - original poker hand
 }
 */
function solveData (data) {

  let result = {
    type: '',
    cardList: data,
    representative: '',
    point: 0,
    isBest: false,
    originalList: data,
  }

  let cards = data.split(' ')
  let typeSet = new Set()
  let numberSet = new Set()
  let existSet = new Set()
  let totalIndex = 0
  let isSpecialCase = false

  //special case x1 x2 x3 x4 x5 , x={S,H,D,C}

  let testCards = cards
  testCards.sort(function (cardA, cardB) {
    return getNumber(cardA) - getNumber(cardB)
  })
  if (getNumber(testCards[0]) === 1
      && getNumber(testCards[1]) === 2
      && getNumber(testCards[2]) === 3
      && getNumber(testCards[3]) === 4
      && getNumber(testCards[4]) === 5) {
        isSpecialCase = true
  }

  for (let i in cards) {

    let cardNumber = getNumber(cards[i])
    let cardType = getCardType(cards[i])

    if (cardNumber === 1 && !isSpecialCase) {
      cards[i] = cardType + '14' //(1+13)

      cardNumber = 14
    }

    totalIndex += cardNumber
    if (numberSet.has(cardNumber)) {
      existSet.add(cardNumber)
    }
    numberSet.add(cardNumber)
    typeSet.add(cardType)
  }

  cards.sort(function (cardA, cardB) {
    return getNumber(cardA) - getNumber(cardB)
  })

  if (numberSet.size === 5) {
    // check straight : i , i+1 , i+2 , i+3 , i+4 ; total = i*5 +10
    let text = ''
    let point = ''
    // let representative;
    //
    if (totalIndex === getNumber(cards[0]) * 5 + 10) {
      if (typeSet.size === 1) {
        text = Const.TEXT_STRAIGHT_FLUSH
        point = Const.POINT_STRAIGHT_FLUSH
      } else {
        text = Const.TEXT_STRAIGHT
        point = Const.POINT_STRAIGHT
      }
    } else {
      if (typeSet.size === 1) {
        text = Const.TEXT_FLUSH
        point = Const.POINT_FLUSH
      } else {
        text = Const.TEXT_HIGH_CARD
        point = Const.POINT_HIGH_CARD
      }
    }
    result = getResult(text, cards, fixedCard(cards[4], Const.NORMAL), point)
  } else {

    let array = Array.from(existSet)
    let text = ''
    let type = ''
    let point = ''
    let fixedCards = resolveCards(cards, true)

    if (numberSet.size === 4) {
      text = Const.TEXT_ONE_PAIR
      type = Const.TYPE_ONE_PAIR
      point = Const.POINT_ONE_PAIR
    }

    if (numberSet.size === 3) {
      if (existSet.size === 1) {
        text = Const.TEXT_THREE_OF_A_KIND
        type = Const.TYPE_THREE_OF_A_KIND
        point = Const.POINT_THREE_OF_A_KIND
      } else {
        text = Const.TEXT_TWO_PAIR
        type = Const.TYPE_TWO_PAIR
        point = Const.POINT_TWO_PAIR
      }
    }

    if (numberSet.size === 2) {
      if (existSet.size === 1) {
        text = Const.TEXT_FOUR_OF_A_KIND
        type = Const.TYPE_FOUR_OF_A_KIND
        point = Const.POINT_FOUR_OF_A_KIND
      } else {
        text = Const.TEXT_FULL_HOUSE
        type = Const.TYPE_FULL_HOUSE
        point = Const.POINT_FULL_HOUSE
      }
    }

    let represent = getRepresentative(fixedCards, array, type)
    let sortCards = sortCardWithPriority(fixedCards, array, represent)

    result = getResult(text, sortCards, represent, point)
  }
  result.originalList = data

  return result
}

/**
 * @desc get result of a poker hand
 *
 * @param type, cardList, representative, point
 * @return : an Object
 {
     type: String - type of a poker hand
     cardList: Array - array of card
     representative: String - a representative cards of a poker hand
     point: int - point of each poker hand's type (define in const)
     isBest: boolean - true if it's the best poker hand , false otherwise
 }
 */
function getResult (type, cardList, representative, point) {
  let result = {}
  result.type = type
  result.cardList = resolveCards(cardList, false)
  result.representative = representative
  result.point = point
  result.isBest = false
  return result
}

/**
 * @desc get number of a card
 *
 * @param card : a cardString (e.g H3)
 * @return : value - int
 */
function getNumber (card) {

  let index = card.substring(1, card.length)
  if (isNaN(index) || index.includes('.')) return 'undefined'
  //not support zero format value '0x' as 'x'
  let value = parseInt(index)
  if (index.length !== value.toString().length) return 'undefined'
  return value
}

/**
 * @desc get card type
 *
 * @param card : a cardString (e.g H3)
 * @return : card type String
 */
function getCardType (card) {
  return card.substring(0, 1)
}

/**
 * @desc solve A-card (change 1->14 or 14->1) of card list (e.g S1 <-> S14) to calculate
 *
 * @param cards :  array - array of card String
 * @param isInitial :  boolean - true : convert 1 > 14 , false : convert 14 -> 1
 * @return : data - array of card String
 */
function resolveCards (cards, isInitial) {
  let data = cards
  for (let i = 0; i < data.length; i++) {
    if (isInitial) {
      data[i] = fixedCard(data[i], Const.FIXED)
    } else {
      data[i] = fixedCard(data[i], Const.NORMAL)
    }
  }
  return data
}

/**
 * @desc solve A-card (change 1->14 or 14->1) of a card
 *
 * @param cards :  card - a card string
 * @param fixMode :  Const.FIXED : convert 1 > 14 , Const.NORMAL : convert 14 -> 1
 * @return : a card type String
 */
function fixedCard (card, fixMode) {
  let cardNumber = getNumber(card)
  if (fixMode === Const.FIXED) {
    if (cardNumber === 1) cardNumber = 14
  } else {
    if (cardNumber === 14) cardNumber = 1
  }
  return getCardType(card) + cardNumber
}

/**
 * @desc get representative of a poker hand
 *
 * @param cardArray, array, type
 * @return : a representative card string
 */
function getRepresentative (cardArray, array, type) {

  let existArray = array
  let result = 'H0' //set default

  switch (type) {
    case Const.TYPE_FOUR_OF_A_KIND: {
      result = Const.SPADE + existArray[0]
    }
      break
    case Const.TYPE_ONE_PAIR: {
      let maxValue = ''
      for (let i in cardArray) {

        if (getNumber(cardArray[i]) === existArray[0]) {
          if (maxValue === '') {
            maxValue = cardArray[i]
          }
          else {
            if (cardArray[i] > maxValue) {
              maxValue = cardArray[i]
            }
          }
        }
      }
      result = maxValue
    }
      break
    case Const.TYPE_THREE_OF_A_KIND:
    case Const.TYPE_FULL_HOUSE: {
      for (let i = 0; i < cardArray.length; i++) {
        let count = 1
        let maxValue = cardArray[i]
        for (let j = i + 1; j < cardArray.length; j++) {
          if (getNumber(cardArray[j]) === getNumber(cardArray[i])) {
            count++
            if (cardArray[j] > cardArray[i]) {
              maxValue = cardArray[j]
            }
          }
        }
        if (count === 3) {
          result = maxValue
          break
        }
      }
    }
      break
    case Const.TYPE_TWO_PAIR: {
      let targetNumber = existArray[0] > existArray[1] ? targetNumber = existArray[0] : targetNumber = existArray[1]
      let maxValue = ''
      for (let i = 0; i < cardArray.length; i++) {

        if (getNumber(cardArray[i]) === targetNumber) {
          if (maxValue === '') {
            maxValue = cardArray[i]
          }
          else {
            if (cardArray[i] > maxValue) {
              maxValue = cardArray[i]
            }
          }
        }
      }
      result = maxValue
    }
      break
    default:
      result = Const.SPADE + existArray[0]
  }

  return fixedCard(result, Const.NORMAL)
}

/**
 * @desc compare 2 hands
 *
 * @param 2 poker hands
 * @return : a integer with >0 , <0 or =0
 */
function compareHand (handA, handB) {
  /* hand properties :
      type: String
      cardList: Array,
      representative: String(card name),
      point: integer,
      isBest : boolean
  */
  if (handA.point !== handB.point) {
    return (handA.point - handB.point)
  } else {
    //same point
    if (getNumber(handA.representative) !== getNumber(handB.representative)) {
      let repHandA = fixedCard(handA.representative, Const.FIXED)
      let repHandB = fixedCard(handB.representative, Const.FIXED)

      return (getNumber(repHandA) - getNumber(repHandB))
    } else {
      //same number
      let repHandA = fixedCard(handA.representative, Const.FIXED)
      let repHandB = fixedCard(handB.representative, Const.FIXED)

      if (repHandA < repHandB) return -1
      if (repHandA > repHandB) return 1
      if (repHandA === repHandB) return 0
    }
  }
}

/**
 * @desc generate json string
 *
 * @param result- string
 * @return : a json string
 */
function generateJsonResult (result) {
  let cards = []
  for (let i = 0; i < result.length; i++) {
    let card = {}
    let cardString = ''
    for (let j = 0; j < result[i].cardList.length; j++) {
      cardString += result[i].cardList[j]
      if (j < result[i].cardList.length - 1) {
        cardString += ' '
      }
    }
    card.Card = cardString
    card.hand = result[i].type
    if (result[i].isBest === true) {
      card.best = true
    }
    cards.push(card)
  }
  let model = {
    result: cards
  }
  return JSON.stringify(model, null, '  ')
}

/**
 * @desc sort cards in a poker hand with priority
 * cars with high priority first -> lower one -> lower one
 *
 * @param cardList,targetArray,represent,type
 * @return : a sort card list
 */
function sortCardWithPriority (cardList, targetArray, represent) {

  let result = []
  let tmpCards = cardList
  let tmpRepresent = fixedCard(represent, Const.FIXED)
  let repNumber = getNumber(tmpRepresent)
  let alternateNumber = 0
  //kuna
  //listCard.splice(index, 1);
  result.push(represent)

  for (let i = 0; i < tmpCards.length; i++) {
    if (getNumber(tmpCards[i]) === repNumber && tmpCards[i] !== tmpRepresent) {
      result.push(tmpCards[i])
    }
  }
  for (let i = 0; i < targetArray.length; i++) {
    if (targetArray[i] === repNumber) {
      targetArray.splice(i, 1)
    }
  }
  if (targetArray.length === 1) {
    alternateNumber = targetArray[0]
    for (var i = 0; i < tmpCards.length; i++) {
      if (getNumber(tmpCards[i]) === alternateNumber) {
        result.push(tmpCards[i])
      }
    }
  }
  for (let i = 0; i < tmpCards.length; i++) {
    if (getNumber(tmpCards[i]) !== repNumber && getNumber(tmpCards[i]) !== alternateNumber) {
      result.push(tmpCards[i])
    }
  }
  return result
}