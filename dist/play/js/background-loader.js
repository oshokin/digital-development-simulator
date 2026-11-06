// Generated from src/ by npm run build. Do not edit.
function createBackgroundLoader(createImage, urlFor) {
  const images = /* @__PURE__ */ new Map();
  return (name, language, retry = false) => {
    const key = `${name}:${language}`;
    let entry = images.get(key);
    if (!entry || retry && entry.failed) {
      const attempts = entry ? entry.attempts + 1 : 0;
      const image = createImage();
      entry = {
        image,
        attempts,
        failed: false,
        ready: Promise.resolve(image),
        check: () => {
        }
      };
      const activeEntry = entry;
      images.set(key, entry);
      entry.ready = new Promise((resolve, reject) => {
        let decoding = false, settled = false;
        const fail = () => {
          if (settled) return;
          settled = true;
          activeEntry.failed = true;
          reject(new Error(`Scene unavailable: ${key}`));
        };
        const loaded = async () => {
          if (decoding || settled) return;
          if (!image.naturalWidth || !image.naturalHeight) {
            fail();
            return;
          }
          decoding = true;
          try {
            if (image.decode) await image.decode();
            if (settled) return;
            settled = true;
            resolve(image);
          } catch {
            fail();
          }
        };
        image.onerror = fail;
        image.onload = loaded;
        activeEntry.check = () => {
          if (image.complete) loaded();
        };
      });
      entry.ready.catch(() => {
      });
      const url = urlFor(name, language);
      image.src = attempts && !url.startsWith("data:") ? `${url}${url.includes("?") ? "&" : "?"}background-retry=${attempts}` : url;
      entry.check();
    }
    return entry;
  };
}
function createSceneGate(load, changed) {
  let revision = 0;
  const gate = {
    pending: false,
    failed: false,
    current: null,
    target: null,
    request,
    retry: () => gate.target ? gate.request(gate.target.name, gate.target.language, true) : Promise.resolve()
  };
  function request(name, language, retry = false) {
    const id = ++revision;
    gate.target = { name, language };
    gate.pending = true;
    gate.failed = false;
    changed(gate);
    return load(name, language, retry).ready.then(
      (image) => {
        if (id !== revision) return;
        gate.current = { name, language, image };
        gate.pending = false;
        changed(gate);
      },
      () => {
        if (id !== revision) return;
        gate.failed = true;
        changed(gate);
      }
    );
  }
  return gate;
}
export {
  createBackgroundLoader,
  createSceneGate
};
