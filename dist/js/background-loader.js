// A language is requested only when selected; image instances are reused on revisit.
export function createBackgroundLoader(createImage, urlFor) {
  const images = new Map();
  return (name, language) => {
    const key = `${name}:${language}`;
    if (!images.has(key)) {
      const image = createImage();
      image.src = urlFor(name, language);
      images.set(key, image);
    }
    return images.get(key);
  };
}
