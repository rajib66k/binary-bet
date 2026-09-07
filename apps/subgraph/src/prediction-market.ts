import {
  Bought as BoughtEvent,
  FeeUpdated as FeeUpdatedEvent,
  Initialized as InitializedEvent,
  LiquidityAdded as LiquidityAddedEvent,
  LiquidityRefunded as LiquidityRefundedEvent,
  LiquidityRemoved as LiquidityRemovedEvent,
  MarketStateChanged as MarketStateChangedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PositionRedeemed as PositionRedeemedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Sold as SoldEvent,
} from "../generated/templates/PredictionMarket/PredictionMarket"
import {
  Bought,
  FeeUpdated,
  Initialized,
  LiquidityAdded,
  LiquidityRefunded,
  LiquidityRemoved,
  MarketStateChanged,
  OwnershipTransferred,
  PositionRedeemed,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Sold,
} from "../generated/schema"

export function handleBought(event: BoughtEvent): void {
  let entity = new Bought(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.buyer = event.params.buyer
  entity.tokenId = event.params.tokenId
  entity.collateralAmount = event.params.collateralAmount
  entity.fee = event.params.fee
  entity.amountBrought = event.params.amountBrought

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeUpdated(event: FeeUpdatedEvent): void {
  let entity = new FeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.oldRate = event.params.oldRate
  entity.newRate = event.params.newRate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLiquidityAdded(event: LiquidityAddedEvent): void {
  let entity = new LiquidityAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.provider = event.params.provider
  entity.collateralAmount = event.params.collateralAmount
  entity.lpTokensMinted = event.params.lpTokensMinted

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLiquidityRefunded(event: LiquidityRefundedEvent): void {
  let entity = new LiquidityRefunded(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.provider = event.params.provider
  entity.lpTokensBurned = event.params.lpTokensBurned
  entity.collateralAmount = event.params.collateralAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLiquidityRemoved(event: LiquidityRemovedEvent): void {
  let entity = new LiquidityRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.provider = event.params.provider
  entity.lpTokensBurned = event.params.lpTokensBurned
  entity.yesAmount = event.params.yesAmount
  entity.noAmount = event.params.noAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMarketStateChanged(event: MarketStateChangedEvent): void {
  let entity = new MarketStateChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.marketState = event.params.marketState

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

export function handlePositionRedeemed(event: PositionRedeemedEvent): void {
  let entity = new PositionRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSold(event: SoldEvent): void {
  let entity = new Sold(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.buyer = event.params.buyer
  entity.tokenId = event.params.tokenId
  entity.collateralAmount = event.params.collateralAmount
  entity.fee = event.params.fee
  entity.amountSold = event.params.amountSold

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
