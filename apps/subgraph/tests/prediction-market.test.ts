import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Bought } from "../generated/schema"
import { Bought as BoughtEvent } from "../generated/PredictionMarket/PredictionMarket"
import { handleBought } from "../src/prediction-market"
import { createBoughtEvent } from "./prediction-market-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let buyer = Address.fromString("0x0000000000000000000000000000000000000001")
    let tokenId = BigInt.fromI32(234)
    let collateralAmount = BigInt.fromI32(234)
    let fee = BigInt.fromI32(234)
    let amountBrought = BigInt.fromI32(234)
    let newBoughtEvent = createBoughtEvent(
      buyer,
      tokenId,
      collateralAmount,
      fee,
      amountBrought
    )
    handleBought(newBoughtEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("Bought created and stored", () => {
    assert.entityCount("Bought", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Bought",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "buyer",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Bought",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenId",
      "234"
    )
    assert.fieldEquals(
      "Bought",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "collateralAmount",
      "234"
    )
    assert.fieldEquals(
      "Bought",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "fee",
      "234"
    )
    assert.fieldEquals(
      "Bought",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amountBrought",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
