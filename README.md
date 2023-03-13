# Unleash With Remote Segment

This repo is to demonstrate how Unleash can be used with a Segment or set of constraints that are too large to fit into memory/pipe over network. There's no hard rule for what too large means but a constraint with over a hundred values is where you'd want to start looking into this approach.

## What is this?

This is a simple example to demonstrate how you can use an external datastore along side Unleash to build a toggle strategy that resolves to `true` when a user is present in a potentially extremely large set of users. This does the check to see if a user is part of a list in a Redis instance, instead of using a constraint directly. This means the that your list of users can be as large as you want without impacting the performance of your Unleash SDK.

## Why shouldn't you do this with Unleash directly?

There's no limit on the number of constraints that you can add to a toggle, so you might think that using Unleash directly in this way would be a good idea. **It's not.** Unleash is designed to be a feature flagging service and not a data store.

There's two major problems with having a very complex set of constraints on a toggle:

1) By design, the Unleash SDKs run a polling loop in the background to retrieve the the toggle configuration from the Unleash server, this means that as you add more and more constraints to the toggle, the amount of data that's transferred between your SDK and your server grows. This is fine for a small number of constraints but as you add more and more complex constraints, this can overload your network and significantly slow down your SDK. The more SDKs that have connected to your Unleash server, the worse this problem becomes.

2) It's very likely that a complex constraint reflects some logic within your domain and that this logic is used in multiple places external to Unleash. This can become fragile and a maintenance burden if you constantly have to update this logic in Unleash as well as the other places it's being used. It's better to have a single source of truth for this.

## Why doesn't Unleash support this out the box?

The Unleash SDKs are designed to fast and unobtrusive. This means that resolving a large set of constraints at runtime results in one of two problems: either the SDK needs to resolve very large amounts of data, which can put pressure on your network or it needs to make a potentially slow network call to resolve the segment. Both of these are undesirable for the health of your application.

# Running the example

## Prerequisites

Running the docker-compose will spin up Unleash, Postgres, Redis and a test application instances. This compose is built against the OSS version of Unleash so we'll be using a Constraint rather than a Segment but practically, the flow is the same. To see this in action you'll need to do the following:

- Create a custom context field called `isInSegment`, with the available options of true or false.
- Create a toggle called `test-toggle` and enable this in the development environment
- Add a standard strategy to `test-toggle`
- Add a constraint to the previous standard strategy, we'll be using `isInSegment` IN `true` for this.

[A screenshot of what the toggle configuration in Unleash should look like](example.png).

Running the docker-compose will add two users to Redis (userId 7 and 8) and then query Unleash for userId 7,8 and 9. You should see the toggle enabled for only ID 7 and 8 in the output.