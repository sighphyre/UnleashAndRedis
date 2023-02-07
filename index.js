import { createClient } from "redis";
import { initialize } from "unleash-client";

const SEGMENT_NAME = "someSegmentOfUsers";
const TOKEN = "*:development:some-secret";

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
await redisLayer.setup();

const unleash = initialize({
  url: "http://unleash:4242/api",
  appName: "some-app-name",
  customHeaders: { Authorization: TOKEN },
});

const usersToQuery = [7, 8, 9];

async function pollUnleash() {
  for (const userId of usersToQuery) {
    const isInSegment = await redisLayer.isInSegment(userId);
    const isEnabled = unleash.isEnabled("test-toggle", {
      isInSegment: isInSegment.toString(),
    });

    console.log(
      `Toggle test-toggle is enabled? ${isEnabled} for userId ${userId} ${isInSegment}`
    );
  }
  await new Promise((_resolve) => setTimeout(pollUnleash, 1000));
}

await pollUnleash();
