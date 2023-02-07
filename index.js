import { createClient } from "redis";
import { initialize } from "unleash-client";

const SEGMENT_NAME = "someSegmentOfUsers"; // We'll be using "someSegmentOfUsers" but the name is arbitrary
const TOKEN = "*:development:some-secret"; // Prepopulated in the docker compose
const USERS_TO_QUERY = [7, 8, 9];

class RedisLayer {
  constructor() {
    this.client = createClient({
      url: "redis://redis",
    });
  }

  async connect() {
    await this.client.connect();
    this.client.on("error", (err) => console.log("Redis Client Error", err));
  }

  async addToSegment(userId) {
    await this.client.sAdd(SEGMENT_NAME, userId.toString());
  }

  async isInSegment(userId) {
    return this.client.sIsMember(SEGMENT_NAME, userId.toString());
  }

  async setup() {
    await this.addToSegment(7);
    await this.addToSegment(8);
  }
}

let redisLayer = new RedisLayer();
await redisLayer.connect();
await redisLayer.setup(); // Don't do this in prod, this is to populate our users in Redis, practically, this would be handled by another system

const unleash = initialize({
  url: "http://unleash:4242/api",
  appName: "some-app-name",
  customHeaders: { Authorization: TOKEN },
});

// End setup code, below is how this would be used

async function pollUnleash() {
  for (const userId of USERS_TO_QUERY) {
    // Ask our Redis client if this userId is in the segment
    const isInSegment = await redisLayer.isInSegment(userId);
    const isEnabled = unleash.isEnabled("test-toggle", {
      // Pass the "true"/"false" context to Unleash
      isInSegment: isInSegment.toString(),
    });

    console.log(
      `Toggle test-toggle is enabled? ${isEnabled} for userId ${userId} ${isInSegment}`
    );
  }
  await new Promise((_resolve) => setTimeout(pollUnleash, 1000));
}

await pollUnleash();
