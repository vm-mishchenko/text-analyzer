const nlp = require('compromise');
const FREQUENCY_MAP = require('./frequency-map.json');

/*
  https://github.com/spencermountain/compromise#api
*/

const inputText = document.getElementById("input-text");
const allWordsContainer = document.getElementById("result");
const nounsContainer = document.getElementById("nouns");
const verbsContainer = document.getElementById("verbs");

inputText.addEventListener('input', function () {
  const doc = nlp(inputText.value);

  const nouns = enrichWords(filterWords(filterTerms(doc.nouns().unique().trim().normalize().json())));
  const verbs = enrichWords(filterWords(filterTerms(doc.verbs().unique().trim().normalize().json())));
  const allWords = enrichWords(filterWords(filterTerms(doc.terms().unique().trim().normalize().json())));

  print(sortEnrichedWords(allWords), allWordsContainer);
  print(sortEnrichedWords(nouns), nounsContainer);
  print(sortEnrichedWords(verbs), verbsContainer);
});

function filterTerms(terms) {
  return terms.map((term) => {
    // remove all "." symbols after text
    term.text = term.text.replace(/\.*$/, '');
    // remove all "?" symbols after text
    term.text = term.text.replace(/\?*$/, '');
    return term;
  })
    .filter((term) => {
      // 3 symbol minimum in text
      return term.text.length > 2 && term.text.length < 6;
    })
    .filter((term) => {
      // only letter allowed
      return /^[a-zA-Z]+$/.test(term.text);
    })
    .map((term) => {
      return term.text.toLowerCase();
    });
}

function filterWords(words) {
  return words
    .filter((word) => {
      // remove words that is NOT in frequency map
      return Boolean(FREQUENCY_MAP[word]);
    });
}

function enrichWords(words) {
  return words
    .map((word) => {
      return {
        word,
        ...FREQUENCY_MAP[word]
      }
    });
}

function sortEnrichedWords(enrichedWords) {
  return enrichedWords.sort((a, b) => {
    return a.position < b.position ? 1 : -1;
  });
}

function print(sortedWordsWithMetadata, container) {
  const fr = document.createDocumentFragment();
  const ul = document.createElement("UL");
  fr.append(ul);

  sortedWordsWithMetadata.forEach(wordWithMetadata => {
    const li = document.createElement("LI");

    if (wordWithMetadata.word === wordWithMetadata.original) {
      li.textContent = `${wordWithMetadata.position}: ${wordWithMetadata.original}`;
    } else {
      li.textContent = `${wordWithMetadata.position}: ${wordWithMetadata.original} (${wordWithMetadata.word})`;
    }

    if (wordWithMetadata.position > 50000) {
      li.classList.add('complex');
    } else if (wordWithMetadata.position > 20000) {
      li.classList.add('medium');
    } else if (wordWithMetadata.position > 10000) {
      li.classList.add('light');
    }

    ul.append(li);
  });

  container.innerHTML = '';
  container.append(fr);
}
