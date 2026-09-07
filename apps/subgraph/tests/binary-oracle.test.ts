import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { MarketResolved } from "../generated/schema"
import { MarketResolved as MarketResolvedEvent } from "../generated/BinaryOracle/BinaryOracle"
import { handleMarketResolved } from "../src/binary-oracle"
import { createMarketResolvedEvent } from "./binary-oracle-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let questionId = Bytes.fromI32(1234567890)
    let roundId = BigInt.fromI32(234)
    let price = BigInt.fromI32(234)
    let updatedAt = BigInt.fromI32(234)
    let yesWins = 123
    let newMarketResolvedEvent = createMarketResolvedEvent(
      questionId,
      roundId,
      price,
      updatedAt,
      yesWins
    )
    handleMarketResolved(newMarketResolvedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("MarketResolved created and stored", () => {
    assert.entityCount("MarketResolved", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MarketResolved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "questionId",
      "1234567890"
    )
    assert.fieldEquals(
      "MarketResolved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "roundId",
      "234"
    )
    assert.fieldEquals(
      "MarketResolved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "price",
      "234"
    )
    assert.fieldEquals(
      "MarketResolved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "updatedAt",
      "234"
    )
    assert.fieldEquals(
      "MarketResolved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "yesWins",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
