// A language is requested only when selected; image instances are reused on revisit.
export function createBackgroundLoader(createImage, urlFor, { now = Date.now, retryDelay = 1000, maxRetryDelay = 30000 } = {}) {
  const images = new Map();
  return (name, language) => {
    const key = `${name}:${language}`;
    let entry = images.get(key);
    if (!entry || (entry.failed && now() >= entry.retryAt)) {
      const attempts = entry ? entry.attempts + 1 : 0;
      const image = createImage();
      entry = { image, attempts, failed: false, retryAt: Infinity };
      images.set(key, entry);
      // Register before assigning src: cached failures may be delivered immediately.
      image.onerror = () => {
        entry.failed = true;
        entry.retryAt = now() + Math.min(maxRetryDelay, retryDelay * 2 ** Math.min(attempts, 20));
      };
      image.onload = () => { entry.failed = false; entry.attempts = 0; };
      const url = urlFor(name, language);
      // Offline builds use data URLs; only network retries need to bypass a cached error.
      image.src = attempts && !url.startsWith('data:')
        ? `${url}${url.includes('?') ? '&' : '?'}background-retry=${attempts}`
        : url;
    }
    return entry.image;
  };
}
