import {
  MarketResolved as MarketResolvedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
} from "../generated/BinaryOracle/BinaryOracle"
import { MarketResolved, OwnershipTransferred } from "../generated/schema"

export function handleMarketResolved(event: MarketResolvedEvent): void {
  let entity = new MarketResolved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.questionId = event.params.questionId
  entity.roundId = event.params.roundId
  entity.price = event.params.price
  entity.updatedAt = event.params.updatedAt
  entity.yesWins = event.params.yesWins

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent,
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
