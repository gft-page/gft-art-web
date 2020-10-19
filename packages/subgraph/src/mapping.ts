import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ProjectUpdate
} from "../generated/Projects/Projects"
import {
  QuestUpdate
} from "../generated/Quests/Quests"
import { Project, Owner, Quest, Author } from "../generated/schema"

export function handleProjectUpdate(event: ProjectUpdate): void {

  let projectId = event.params.id.toHexString()
  let ownerId = event.params.owner.toHexString()

  let project = new Project(projectId)

  project.idBytes = event.params.id
  project.title = event.params.title
  project.desc = event.params.desc
  project.repo = event.params.repo
  project.owner = ownerId
  project.updatedAt = event.block.timestamp

  project.save()

  let owner = new Owner(ownerId)
  owner.save()

}

export function handleQuestUpdate(event: QuestUpdate): void {

  let questId = event.params.id.toHexString()
  let projectId = event.params.project.toHexString()
  let authorId = event.params.author.toHexString()

  let quest = new Quest(questId)

  quest.project = projectId
  quest.idBytes = event.params.id
  quest.title = event.params.title
  quest.desc = event.params.desc
  quest.link = event.params.link
  quest.author = authorId
  quest.updatedAt = event.block.timestamp

  quest.save()

  let author = new Author(authorId)
  author.save()

}
