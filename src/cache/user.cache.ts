
import NodeCache from "node-cache";

// cache.js
const cache = new NodeCache({ stdTTL: 3600 }); // default TTL = 1 hour
const userCache = new NodeCache({ stdTTL: 60 * 30 }); // default TTL = 30 minutes
const tokenCache = new NodeCache({ stdTTL: 600 * 6 }); // default TTL = 1 hour




export { cache, userCache, tokenCache};
