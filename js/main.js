import { createDeck } from './deck.js';
import { el } from './dom.js';
import { createIcon, SYMBOLS } from './icons.js';
import { createModal } from './modal.js';
import { formatScoreDate, loadScores, saveScore } from './scores.js';

const PAIR_GOAL = 8;
const MISMATCH_HIDE_DELAY_MS = 1000;

const symbolById = new Map(SYMBOLS.map((symbol) => [symbol.id, symbol]));

function pluralMoves(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'ход';
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'хода';
  }

  return 'ходов';
}

function createApp() {
  const newGameButton = el('button', {
    className: 'button button-primary',
    text: 'Новая игра',
    attrs: { type: 'button' },
  });
  const leadersButton = el('button', {
    className: 'button button-secondary',
    text: 'Таблица лидеров',
    attrs: { type: 'button' },
  });
  const movesNode = el('strong', {
    className: 'stat-value stat-moves',
    text: '0',
  });
  const pairsNode = el('strong', {
    className: 'stat-value stat-pairs',
    text: '0 из 8',
  });
  const board = el('div', {
    className: 'board',
    attrs: { role: 'group', 'aria-label': 'Игровое поле' },
  });

  const app = el(
    'div',
    { className: 'app' },
    el(
      'header',
      { className: 'topbar' },
      el(
        'div',
        { className: 'brand' },
        el('p', { className: 'eyebrow', text: 'Игра на память' }),
        el('h1', { text: 'Поиск пар' }),
      ),
      el('div', { className: 'topbar-actions' }, newGameButton, leadersButton),
    ),
    el(
      'section',
      { className: 'stats', attrs: { 'aria-live': 'polite' } },
      el(
        'div',
        { className: 'stat' },
        el('span', { className: 'stat-label', text: 'Ходы' }),
        movesNode,
      ),
      el(
        'div',
        { className: 'stat' },
        el('span', { className: 'stat-label', text: 'Пары' }),
        pairsNode,
      ),
    ),
    el('main', {}, board),
  );

  return { app, newGameButton, leadersButton, movesNode, pairsNode, board };
}

function paintCard(card) {
  card.button.classList.toggle('is-open', card.revealed);
  card.button.classList.toggle('is-matched', card.matched);

  const label = symbolById.get(card.symbol).label;
  if (card.matched) {
    card.button.setAttribute('aria-label', `Найденная пара: ${label}`);
  } else if (card.revealed) {
    card.button.setAttribute('aria-label', `Открытая карточка: ${label}`);
  } else {
    card.button.setAttribute('aria-label', 'Закрытая карточка');
  }
}

function renderCard(card, onSelect) {
  const front = el('span', {
    className: `card-face card-front symbol-${card.symbol}`,
  });
  front.append(createIcon(card.symbol));

  const button = el(
    'button',
    {
      className: 'card',
      attrs: {
        type: 'button',
        'aria-label': 'Закрытая карточка',
      },
      on: { click: () => onSelect(card) },
    },
    el(
      'span',
      { className: 'card-inner' },
      el('span', { className: 'card-face card-back', attrs: { 'aria-hidden': 'true' } }),
      front,
    ),
  );

  card.button = button;
  return button;
}

function victoryContent(moves, onRestart, onClose) {
  return el(
    'div',
    { className: 'modal-copy' },
    el('h2', {
      className: 'modal-title',
      text: 'Победа',
      attrs: { id: 'victory-title' },
    }),
    el('p', {
      className: 'modal-text',
      text: 'Все 8 пар найдены.',
    }),
    el('p', {
      className: 'modal-score',
      text: `Ходов: ${moves}`,
    }),
    el('p', {
      className: 'modal-note',
      text: `Игра заняла ${moves} ${pluralMoves(moves)}.`,
    }),
    el(
      'div',
      { className: 'modal-actions' },
      el('button', {
        className: 'button button-primary',
        text: 'Новая игра',
        attrs: { type: 'button' },
        on: { click: onRestart },
      }),
      el('button', {
        className: 'button button-secondary',
        text: 'Закрыть',
        attrs: { type: 'button' },
        on: { click: onClose },
      }),
    ),
  );
}

function leaderboardContent(scores, onClose) {
  const copy = el(
    'div',
    { className: 'modal-copy' },
    el('h2', {
      className: 'modal-title',
      text: 'Таблица лидеров',
      attrs: { id: 'leaderboard-title' },
    }),
  );

  if (scores.length === 0) {
    copy.append(el('p', {
      className: 'modal-text',
      text: 'Пока нет результатов',
    }));
  } else {
    const head = el('tr', {},
      el('th', { text: 'Место', attrs: { scope: 'col' } }),
      el('th', { text: 'Ходы', attrs: { scope: 'col' } }),
      el('th', { text: 'Дата', attrs: { scope: 'col' } }),
    );
    const body = el('tbody');

    scores.forEach((score, index) => {
      body.append(el('tr', {},
        el('td', { text: String(index + 1) }),
        el('td', { text: String(score.moves) }),
        el('td', { text: formatScoreDate(score.playedAt) }),
      ));
    });

    copy.append(el('table', { className: 'scores' }, el('thead', {}, head), body));
  }

  copy.append(el(
    'div',
    { className: 'modal-actions' },
    el('button', {
      className: 'button button-primary',
      text: 'Закрыть',
      attrs: { type: 'button' },
      on: { click: onClose },
    }),
  ));

  return copy;
}

function bindGame(ui, modal) {
  let moves = 0;
  let pairs = 0;
  let won = false;
  let locked = false;
  let firstCard = null;
  let roundId = 0;
  let mismatchTimer = 0;

  function updateStats() {
    ui.movesNode.textContent = String(moves);
    ui.pairsNode.textContent = `${pairs} из ${PAIR_GOAL}`;
  }

  function deal() {
    moves = 0;
    pairs = 0;
    won = false;
    locked = false;
    firstCard = null;
    ui.board.classList.remove('is-locked', 'is-finished');

    const deck = createDeck(SYMBOLS.map((symbol) => symbol.id));
    ui.board.replaceChildren(
      ...deck.map((card) => renderCard(card, handleCardClick)),
    );
    updateStats();
  }

  function finish() {
    if (won) {
      return;
    }

    won = true;
    ui.board.classList.add('is-finished');

    try {
      saveScore(moves);
    } catch {
      // Победа остаётся на поле, даже если хранилище недоступно.
    }

    modal.open(victoryContent(moves, startNewGame, () => modal.close()), 'victory-title');
  }

  function handleCardClick(card) {
    if (won || locked || modal.isOpen() || card.revealed || card.matched) {
      return;
    }

    card.revealed = true;
    paintCard(card);

    if (firstCard === null) {
      firstCard = card;
      return;
    }

    const previous = firstCard;
    firstCard = null;
    moves += 1;
    updateStats();

    if (previous.symbol === card.symbol) {
      previous.matched = true;
      card.matched = true;
      pairs += 1;
      paintCard(previous);
      paintCard(card);
      updateStats();

      if (pairs === PAIR_GOAL) {
        finish();
      }
      return;
    }

    locked = true;
    ui.board.classList.add('is-locked');
    const round = roundId;

    mismatchTimer = window.setTimeout(() => {
      if (round !== roundId) {
        return;
      }

      previous.revealed = false;
      card.revealed = false;
      paintCard(previous);
      paintCard(card);
      locked = false;
      ui.board.classList.remove('is-locked');
    }, MISMATCH_HIDE_DELAY_MS);
  }

  function startNewGame() {
    window.clearTimeout(mismatchTimer);
    roundId += 1;
    locked = false;
    modal.close();
    deal();
  }

  function openLeaderboard() {
    modal.open(
      leaderboardContent(loadScores(), () => modal.close()),
      'leaderboard-title',
    );
  }

  ui.newGameButton.addEventListener('click', startNewGame);
  ui.leadersButton.addEventListener('click', openLeaderboard);
  startNewGame();
}

const ui = createApp();
document.body.append(ui.app);
bindGame(ui, createModal());
