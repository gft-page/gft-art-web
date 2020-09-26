import { BigInt, Address, ipfs, json, JSONValueKind, log } from "@graphprotocol/graph-ts"
import {
  NiftyInk,
  newInk
} from "../generated/NiftyInk/NiftyInk"
import { Ink, Artist } from "../generated/schema"

export function handlenewInk(event: newInk): void {

  let artist = Artist.load(event.params.artist.toHexString())

  if (artist == null) {
    artist = new Artist(event.params.artist.toHexString())
    artist.address = event.params.artist
    artist.inkCount = BigInt.fromI32(1)
  }
  else {
    artist.inkCount = artist.inkCount.plus(BigInt.fromI32(1))
  }

  let ink = Ink.load(event.params.inkUrl)

  if (ink == null) {
    ink = new Ink(event.params.inkUrl)
  }

  ink.inkNumber = event.params.id
  ink.artist = artist.id
  ink.limit = event.params.limit
  ink.jsonUrl = event.params.jsonUrl
  ink.createdAt = event.block.timestamp

  ink.save()
  artist.save()

}
