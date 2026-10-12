const UNSORTED = ["Unsorted"];

export function cardDomains(card) {
  return card.domains ?? [UNSORTED];
}

export function domainPaths(cards) {
  const paths = new Map();
  for (const card of cards) {
    for (const domain of cardDomains(card)) {
      for (let length = 1; length <= domain.length; length++) {
        const path = domain.slice(0, length);
        paths.set(JSON.stringify(path), path);
      }
    }
  }
  return [...paths.values()].sort((a, b) => {
    for (let index = 0; index < Math.min(a.length, b.length); index++) {
      const comparison = a[index].localeCompare(b[index]);
      if (comparison) return comparison;
    }
    return a.length - b.length;
  });
}

export function selectCards(cards, selectedPaths) {
  if (!selectedPaths.length) return cards;
  return cards.filter((card) => cardDomains(card).some((domain) =>
    selectedPaths.some((selected) => selected.length <= domain.length && selected.every((segment, index) => segment === domain[index]))
  ));
}
