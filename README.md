# The Graph <> scaffold-eth

## Introduction
Today we are talking about [The Graph](https://thegraph.com/). The Graph Dot Com is a horrible choice from an SEO perspective, but that is pretty much the only criticism that I have for this wonderful piece of blockchain middleware. Today we are going to be firing up [scaffold-eth](https://github.com/austintgriffith/scaffold-eth) to run through what it takes to build your OWN DARN SUBGRAPH (based on nifty.ink data) and then have that subgraph show up nicely in a fresh new React App

BUT FIRST! What are we even talking about here? If you've ever wandered wide-eyed through Web3, I am sure you will have been peppered with permission requests to view your Metamask, peep your Argent or some-such, often before you even load the page when you're checking out what this hot-new defi thing is (NOT INVESTMENT ADVICE). That is because to even breathe up in here you need to connect to a blockchain. While blockchains are great in lots of ways (not now Dad), one thing they are not so good at is returning nice structured data for your user interface. Extracting data from our dear friend Ethereum can be EXCEPTIONALLY CONVOLUTED, which means that as much time is spent massaging eth_call as is spent actually creating a good user experience (if you see where I am going with this).

The smart-brains at The Graph identified this as a problem, and what they have built is a really quite excellent way to aggregate the events that happen on a blockchain into easily accessible graphQL so your data is a single graphQL API call away, and up to date with the chain. If you're not excited, you've never iterated through a mapping in a smart contract (that was a joke because you can't!) TO THE CODE!

## Set up
NOTE that you need to have Docker set up to run the local Graph node. Go [install Docker](https://www.docker.com/products/docker-desktop) now if you haven't got it already.

You will be needing a local graph node to deploy onto.
Open up a new terminal window and go to your documents or wherever:
```
git clone https://github.com/graphprotocol/graph-node/
```
This is the repository for a Graph Node. We're going to be running the docker image - before we start it, we need to make one change to the config file docker/docker-compose.yml, update the "ethereum" line to point at xDai (where nifty.ink is deployed!)
```
ethereum: 'xdai:https://dai.poa.network'
```
Then you just need to get it starte
```
cd graph-node/docker
docker-compose up
```
You should see a bunch of logs in the terminal as this node gets going!

Leave it alone, and open up a fresh new terminal…
First step you're going to want to clone to the [graph-dev branch of scaffold-eth](https://github.com/austintgriffith/scaffold-eth/tree/graph-dev):
```
git clone -b graph-dev https://github.com/austintgriffith/scaffold-eth.git
```
install all of the relevant Node modules (make sure you are on Node > 0:
```
yarn install
```
Then fire up the frontend:
```
yarn start
```

## Tour guide
Let me show you round:
So you've got the usual react-app, that's what is running on localhost://3000. There are two tabs:
- Nifty: here there will be some data from our subgraph when we make it
- GraphiQL: this is an interface for writing custom queries against your subgraph

The hot new thing is in the packages/subgraph. This is where you define the configuration for your subgraph. You can then take that configuration and deploy it onto a Graph Node, and the Graph Node will give you back a fully functional graphQL endpoint.

So let's get to it! As an example, we'll be creating a subgraph that captures data from nifty.ink
You need four things to create a subgraph:
- the ABIs for any contract(s) that you want to get data from - this is "raw material" for the files which you have to define…
- schema.graphql defines the structure of the dataset you want to create
- functions that map blockchain events (or calls or blocks) to your dataset, defined above - in this case they are stored in one file called src/mapping.ts
- subgraph.yaml - this ties together your schema with chain and contracts that the graph should be listening to, the events you want to track and how they should be handled (by the functions defined above)
schema.graphql

Let's start with the schema. We are interested in knowing about all the inks that artists are creating on nifty.ink, so we have defined an `Ink` entity, and an `Artist` entity. We also want to know how many of each of these were created each day - the `DayTotal` entity. You can refer to [The Graph's docs for more details](https://thegraph.com/docs/define-a-subgraph), but there are several really nice things to call out here:
- Nested types - we are able to nest an Artist within our Ink object, which will then let us easily access artist attributes from the ink. When creating the mapping, we just have to pass the "Id" for the relevant artist
- Derived fields - when we created the Artist object on the Ink, that then lets us easily create an array of associated inks on the Artist object, all in the schema itself. A thing of beauty.

## Creating a subgraph
With our schema defined, in packages/subgraph we can run:
```
yarn codegen
```
This combines the ABIs with our schema to create some of the auto-generated files that we need.
src/mapping.ts
Onto the mapping! This file holds the functions that take events from our contract, and turn them into our structured data. There is much more detail in [the documentation](https://thegraph.com/docs/assemblyscript-api) of course, but roughly speaking you need to:
- Import any assembly script helpers you need from graph-ts
- Import any contract or events from the autogenerated files
- Import any entities from your schema
- Define the functions to handle events or contract calls

These handler functions have a load of data available to them - the event data, the block information etc. Your role is to simply take that, and to add it to your data store appropriately. The key pattern here is load() and save(), where you can load an entity from the datastore by searching for it by its ID, make any changes and then save it back to the datastore, which will over-write the entity with the new information. If there is no existing entity, you can create a new one instead.

In our example we are only handling one event, the "new ink" event, but we are doing quite a few things:
- creating a new ink
- creating a new artist if appropriate
- incrementing the number of new inks or artists that day

All you need to do here is to run:
```
yarn build
```
This will build the files needed to deploy, and it is at this point that The Graph may report some errors relating to your mapping.ts (or equivalent) file.

But if it's all green then it's time to deploy! Run:
```
yarn create-local
yarn deploy-local
```

## Accessing your subgraph
If you re-open the app, you should now see two things:

### Charts on the "Nifty" tab
You can see the number of inks by day, and a table of the top 10 artists by inks created
We are using [Apollo](https://www.apollographql.com/docs/react/) to connect to our graphQL endpoint. We set this up in `index.jsx`, and pass it down to `App.jsx`, where we define our query and use the useQuery hook to get our data. Then it's just a matter of handling and formatting that for some little visualisations (we used [react-vis!](https://uber.github.io/react-vis/))

### Custom queries on the graphiQL tab
- You can write some custom graphQL queries on the graphiQL tab. Try these out for size
Information on the last 100 inks
```
{
  inks(first: 100, orderBy: createdAt, orderDirection: desc) {
    id
    jsonUrl
    limit
    createdAt
    artist {
      id
    }
  }
}
```
Top 10 artists by number of inks:
```
{
artists(first: 10, orderBy:inkCount, orderDirection: desc) {
  id
  inkCount
  inks {id}
}
}
```

## What next?
Once you are happy with your subgraph, you can follow the instructions [here](https://thegraph.com/docs/deploy-a-subgraph) to deploy it to The Graph's hosted service.

Happy graphing!
