import {
  MarketCreated as MarketCreatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/MarketManager/MarketManager"
import { MarketCreated, OwnershipTransferred } from "../generated/schema"
import { PredictionMarket } from "../generated/templates"

export function handleMarketCreated(event: MarketCreatedEvent): void {
  let entity = new MarketCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.market = event.params.market
  entity.lpToken = event.params.lpToken
  entity.question = event.params.question
  entity.questionId = event.params.questionId
  entity.resolveTime = event.params.resolveTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  PredictionMarket.create(event.params.market)
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
