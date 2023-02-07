# Unleash With Remote Segment

This repo is to demonstrate how Unleash can be used with a Segment that's too large to fit into memory/pipe over network.

## Prerequisites

Running the docker-compose will spin up Unleash, Postgres, Redis and a test application instances. This compose is built against the OSS version of Unleash so we'll be using a Constraint rather than a Segment but practically, the flow is the same. To see this in action you'll need to do the following:

- Create a custom context field called `isInSegment`, with the available options of true or false.
- Create a toggle called `test-toggle` and enable this in the development environment
- Add a standard strategy to `test-toggle`
- Add a constraint to the previous standard strategy, we'll be using `isInSegment` IN `true` for this.

[A screenshot of what the toggle configuration in Unleash should look like](example.png).

Running the docker-compose will add two users to Redis (userId 7 and 8) and then query Unleash for userId 7,8 and 9. You should see the toggle enabled for only ID 7 and 8 in the output.