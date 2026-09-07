import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  MarketResolved,
  OwnershipTransferred
} from "../generated/BinaryOracle/BinaryOracle"

export function createMarketResolvedEvent(
  questionId: Bytes,
  roundId: BigInt,
  price: BigInt,
  updatedAt: BigInt,
  yesWins: i32
): MarketResolved {
  let marketResolvedEvent = changetype<MarketResolved>(newMockEvent())

  marketResolvedEvent.parameters = new Array()

  marketResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "questionId",
      ethereum.Value.fromFixedBytes(questionId)
    )
  )
  marketResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "roundId",
      ethereum.Value.fromUnsignedBigInt(roundId)
    )
  )
  marketResolvedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromSignedBigInt(price))
  )
  marketResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "updatedAt",
      ethereum.Value.fromUnsignedBigInt(updatedAt)
    )
  )
  marketResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "yesWins",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(yesWins))
    )
  )

  return marketResolvedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
