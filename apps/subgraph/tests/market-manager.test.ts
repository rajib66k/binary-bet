import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes } from "@graphprotocol/graph-ts"
import { MarketCreated } from "../generated/schema"
import { MarketCreated as MarketCreatedEvent } from "../generated/MarketManager/MarketManager"
import { handleMarketCreated } from "../src/market-manager"
import { createMarketCreatedEvent } from "./market-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let market = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let lpToken = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let questionId = Bytes.fromI32(1234567890)
    let newMarketCreatedEvent = createMarketCreatedEvent(
      market,
      lpToken,
      questionId
    )
    handleMarketCreated(newMarketCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("MarketCreated created and stored", () => {
    assert.entityCount("MarketCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MarketCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "market",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MarketCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "lpToken",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MarketCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "questionId",
      "1234567890"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
