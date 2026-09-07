import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
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
  Sold
} from "../generated/PredictionMarket/PredictionMarket"

export function createBoughtEvent(
  buyer: Address,
  tokenId: BigInt,
  collateralAmount: BigInt,
  fee: BigInt,
  amountBrought: BigInt
): Bought {
  let boughtEvent = changetype<Bought>(newMockEvent())

  boughtEvent.parameters = new Array()

  boughtEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam(
      "collateralAmount",
      ethereum.Value.fromUnsignedBigInt(collateralAmount)
    )
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam(
      "amountBrought",
      ethereum.Value.fromUnsignedBigInt(amountBrought)
    )
  )

  return boughtEvent
}

export function createFeeUpdatedEvent(
  oldRate: BigInt,
  newRate: BigInt
): FeeUpdated {
  let feeUpdatedEvent = changetype<FeeUpdated>(newMockEvent())

  feeUpdatedEvent.parameters = new Array()

  feeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldRate",
      ethereum.Value.fromUnsignedBigInt(oldRate)
    )
  )
  feeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newRate",
      ethereum.Value.fromUnsignedBigInt(newRate)
    )
  )

  return feeUpdatedEvent
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createLiquidityAddedEvent(
  provider: Address,
  collateralAmount: BigInt,
  lpTokensMinted: BigInt
): LiquidityAdded {
  let liquidityAddedEvent = changetype<LiquidityAdded>(newMockEvent())

  liquidityAddedEvent.parameters = new Array()

  liquidityAddedEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  liquidityAddedEvent.parameters.push(
    new ethereum.EventParam(
      "collateralAmount",
      ethereum.Value.fromUnsignedBigInt(collateralAmount)
    )
  )
  liquidityAddedEvent.parameters.push(
    new ethereum.EventParam(
      "lpTokensMinted",
      ethereum.Value.fromUnsignedBigInt(lpTokensMinted)
    )
  )

  return liquidityAddedEvent
}

export function createLiquidityRefundedEvent(
  provider: Address,
  lpTokensBurned: BigInt,
  collateralAmount: BigInt
): LiquidityRefunded {
  let liquidityRefundedEvent = changetype<LiquidityRefunded>(newMockEvent())

  liquidityRefundedEvent.parameters = new Array()

  liquidityRefundedEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  liquidityRefundedEvent.parameters.push(
    new ethereum.EventParam(
      "lpTokensBurned",
      ethereum.Value.fromUnsignedBigInt(lpTokensBurned)
    )
  )
  liquidityRefundedEvent.parameters.push(
    new ethereum.EventParam(
      "collateralAmount",
      ethereum.Value.fromUnsignedBigInt(collateralAmount)
    )
  )

  return liquidityRefundedEvent
}

export function createLiquidityRemovedEvent(
  provider: Address,
  lpTokensBurned: BigInt,
  yesAmount: BigInt,
  noAmount: BigInt
): LiquidityRemoved {
  let liquidityRemovedEvent = changetype<LiquidityRemoved>(newMockEvent())

  liquidityRemovedEvent.parameters = new Array()

  liquidityRemovedEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  liquidityRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "lpTokensBurned",
      ethereum.Value.fromUnsignedBigInt(lpTokensBurned)
    )
  )
  liquidityRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "yesAmount",
      ethereum.Value.fromUnsignedBigInt(yesAmount)
    )
  )
  liquidityRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "noAmount",
      ethereum.Value.fromUnsignedBigInt(noAmount)
    )
  )

  return liquidityRemovedEvent
}

export function createMarketStateChangedEvent(
  marketState: i32
): MarketStateChanged {
  let marketStateChangedEvent = changetype<MarketStateChanged>(newMockEvent())

  marketStateChangedEvent.parameters = new Array()

  marketStateChangedEvent.parameters.push(
    new ethereum.EventParam(
      "marketState",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(marketState))
    )
  )

  return marketStateChangedEvent
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

export function createPositionRedeemedEvent(
  user: Address,
  amount: BigInt
): PositionRedeemed {
  let positionRedeemedEvent = changetype<PositionRedeemed>(newMockEvent())

  positionRedeemedEvent.parameters = new Array()

  positionRedeemedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  positionRedeemedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return positionRedeemedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createSoldEvent(
  buyer: Address,
  tokenId: BigInt,
  collateralAmount: BigInt,
  fee: BigInt,
  amountSold: BigInt
): Sold {
  let soldEvent = changetype<Sold>(newMockEvent())

  soldEvent.parameters = new Array()

  soldEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  soldEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  soldEvent.parameters.push(
    new ethereum.EventParam(
      "collateralAmount",
      ethereum.Value.fromUnsignedBigInt(collateralAmount)
    )
  )
  soldEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )
  soldEvent.parameters.push(
    new ethereum.EventParam(
      "amountSold",
      ethereum.Value.fromUnsignedBigInt(amountSold)
    )
  )

  return soldEvent
}
