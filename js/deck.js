export function shuffle(items) {
  const result = items.slice();

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    result[index] = result[swapIndex];
    result[swapIndex] = current;
  }

  return result;
}

export function createDeck(symbolIds) {
  const cards = symbolIds.flatMap((symbol) => [
    { symbol, revealed: false, matched: false },
    { symbol, revealed: false, matched: false },
  ]);

  return shuffle(cards);
}
