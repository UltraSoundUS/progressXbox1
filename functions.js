/** @type {Object} */
let songsGlobal;

/** @type {Object} */
let resultsGlobal;

/** @type {Object} */
let genresGlobal;

/** @type {int[]} */
let songValues;

/** @type {int[]} */
let conditionValues;

/** @type {string[]} */
let genreValues;


/**
 * 
 * @param {string} s 
 * @returns 
 */
const parseTxt = s => {
  const pair = s.trim().split(';');
  return [pair[0], +pair[1]];
};

/**
 * 
 * @param {string} url  
 * @returns {Object}
 */
const getResults = async url => {
  const txt = await fetch(url).then(data => data.text());
  const lines = txt.split('\n').filter(s => s.indexOf(';') != -1).map(parseTxt);
  return Object.fromEntries(lines);
};

/**
 * 
 * @param {string} title 
 * @returns {number} 
 */
const getGenreIndex = title => genreValues.findIndex(x => x == genresGlobal[title]);

/**
 * 
 * @param {bool[]} levels 
 * @param {bool[]} genres 
 */
const setTable = (
  levels = Array(10).fill(true),
  genres = Array(7).fill(true),
  conditions = Array(4).fill(true),
) => {
  const main = document.getElementById('results');
  Array.from(main.children).forEach(e => e.remove());

  // const titles = Array.from(Object.keys(resultsGlobal))
  //   .sort((x, y) => getGenreIndex(x) - getGenreIndex(y))
  //   .sort((x, y) => songsGlobal[y] - songsGlobal[x]);
  const titles = Array.from(Object.keys(resultsGlobal))
    .sort((x, y) => getGenreIndex(x) - getGenreIndex(y));

  const classNames = ['none', 'clear', 'fullcombo', 'donderfulcombo']
  for (let title of titles) {
    if (!levels[songsGlobal[title] - 1]
      || !genres[getGenreIndex(title)]
      || !conditions[resultsGlobal[title]]
    ) {
      continue;
    }
    const p = document.createElement('p');
    main.appendChild(p);
    const span = document.createElement('span');
    p.appendChild(span);
    span.innerText = title;
    span.classList.add('condition-' + classNames[resultsGlobal[title]])
  }
};


const setTableWithOptions = () => {
  const levels = Array.from(document.getElementById('checkboxes-level')
    .querySelectorAll('input')).map(e => e.checked);
  const genres = Array.from(document.getElementById('checkboxes-genre')
    .querySelectorAll('input')).map(e => e.checked);
  const conditions = Array.from(document.getElementById('checkboxes-condition')
    .querySelectorAll('input')).map(e => e.checked);
  setTable(levels, genres, conditions);
};

const createCheckboxes = () => {
  const main = document.getElementById('checkboxes');
  const levels = document.createElement('div');
  main.appendChild(levels);
  levels.setAttribute('id', 'checkboxes-level')
  songValues.forEach(x => {
    const box = document.createElement('input');
    levels.appendChild(box);
    box.setAttribute('type', 'checkbox');
    box.setAttribute('id', 'checkbox-level-' + x);
    box.setAttribute('checked', '')
    box.addEventListener('change', setTableWithOptions);
    const label = document.createElement('label');
    levels.appendChild(label);
    label.innerText = '☆' + x;
    label.setAttribute('for', 'checkbox-level-' + x);
  })

  const genres = document.createElement('div');
  main.appendChild(genres);
  genres.setAttribute('id', 'checkboxes-genre')
  genreValues.forEach((x, idx) => {
    const box = document.createElement('input');
    genres.appendChild(box);
    box.setAttribute('type', 'checkbox');
    box.setAttribute('id', 'checkbox-genre-' + (idx + 1));
    box.setAttribute('checked', '')
    box.addEventListener('change', setTableWithOptions);
    const label = document.createElement('label');
    genres.appendChild(label);
    label.innerText = x;
    label.setAttribute('for', 'checkbox-genre-' + (idx + 1));
  })

  const conditions = document.createElement('div');
  main.appendChild(conditions);
  conditions.setAttribute('id', 'checkboxes-condition');
  conditionValues.forEach((x, idx) => {
    const box = document.createElement('input');
    conditions.appendChild(box);
    box.setAttribute('type', 'checkbox');
    box.setAttribute('id', 'checkbox-condition-' + (idx + 1));
    box.setAttribute('checked', '')
    box.addEventListener('change', setTableWithOptions);
    const label = document.createElement('label');
    conditions.appendChild(label);
    label.innerText = ['未クリア', 'クリア', 'フルコンボ', '全良'][x];
    label.setAttribute('for', 'checkbox-condition-' + (idx + 1));
  })
};


const initialize = async () => {
  const songs1 = await fetch('songs.json').then(data => data.json());
  const results1 = await getResults('songs.txt');

  const fn = songs => {
    const songsArr = [];
    for (let val of songs) {
      const title = val['title'];
      songsArr.push([title, val['oni']]);
      if (val['ura'] !== null) {
        songsArr.push([title + '(裏)', val['ura']]);
      }
    }
    return Object.fromEntries(songsArr);
  };

  const gn = songs => {
    const songsArr = [];
    for (let val of songs) {
      const title = val['title'];
      songsArr.push([title, val['genre']]);
      if (val['ura'] !== null) {
        songsArr.push([title + '(裏)', val['genre']]);
      }
    }
    return Object.fromEntries(songsArr);
  };

  resultsGlobal = { ...results1 };
  songsGlobal = { ...fn(songs1) };
  genresGlobal = { ...gn(songs1) };

  conditionValues = Array.from(new Set(Object.values(resultsGlobal))).sort((x, y) => x - y);
  songValues = Array.from(new Set(Object.values(songsGlobal))).sort((x, y) => x - y);
  genreValues = Array.from(new Set(Object.values(genresGlobal)));

  setTable();
  createCheckboxes();
};


// 読み込み完了時の処理
window.addEventListener('load', () => {
  initialize();
});
