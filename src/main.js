const nlp = require('compromise');
const FREQUENCY_MAP = require('./frequency-map.json');

/*
  https://github.com/spencermountain/compromise#api
*/

const inputText = document.getElementById("input-text");
const tableContainer = document.getElementById("table");
const maxWordLengthInput = document.getElementById("max-word-length");
const filters = {
  maxWordLength: 10
};
let terms = [];

tableContainer.addEventListener('click', (e) => {
  if (e.target.getAttribute("id") === "translate-word") {
    const selectedTerm = terms.find((term) => {
      return term.id === e.target.dataset.id;
    });

    window.open(`https://translate.google.com/?text=${selectedTerm.text}`);
  }

  if (e.target.getAttribute("id") === "translate-phrase") {
    const selectedTerm = terms.find((term) => {
      return term.id === e.target.dataset.id;
    });

    window.open(`https://translate.google.com/?text=${selectedTerm.phrase}`);
  }

  if (e.target.getAttribute("id") === "youglish") {
    const selectedTerm = terms.find((term) => {
      return term.id === e.target.dataset.id;
    });

    window.open(`https://youglish.com/pronounce/${selectedTerm.text}/english/us`);
  }
});

inputText.addEventListener('input', reRender);
maxWordLengthInput.addEventListener('input', function () {
  filters.maxWordLength = maxWordLengthInput.value || 100;
  reRender();
});

function reRender() {
  const doc = nlp(inputText.value);
  const allTerms = doc.json().reduce((result, phrase) => {
    const terms = phrase.terms.reduce((termsResult, term) => {
      termsResult.push({
        text: term.text,
        tags: term.tags,
        phrase: phrase.text
      });

      return termsResult;
    }, []);

    result = result.concat(terms);

    return result;
  }, []);

  terms = sortTerms(
    enrichTerms(
      filterTerms(
        prettifyTerms(
          allTerms
        )
      )
    )
  );

  print(terms, tableContainer);
}

function prettifyTerms(terms) {
  return terms.map((term) => {
    // remove all "." symbols after text
    term.text = term.text.replace(/\.*$/, '');
    // remove all "?" symbols after text
    term.text = term.text.replace(/\?*$/, '');

    return term;
  });
}

function filterTerms(terms) {
  return terms
    .filter((term) => {
      // 3 symbol minimum in text
      return term.text.length > 2 && term.text.length <= filters.maxWordLength;
    })
    .filter((term) => {
      // only letter allowed
      return /^[a-zA-Z]+$/.test(term.text);
    }).filter((term) => {
      // remove words that is NOT in frequency map
      return Boolean(FREQUENCY_MAP[term.text.toLowerCase()]);
    });
}

function enrichTerms(terms) {
  return terms
    .map((term) => {
      return {
        id: String(Math.random()).slice(2),
        ...term,
        ...FREQUENCY_MAP[term.text.toLowerCase()]
      }
    });
}

function sortTerms(terms) {
  return terms.sort((a, b) => {
    return a.position < b.position ? 1 : -1;
  });
}

function print(terms, container) {
  const fr = document.createDocumentFragment();
  const ul = document.createElement("UL");
  fr.append(ul);

  terms.forEach(term => {
    const li = document.createElement("LI");

    let frequency;
    if (term.position > 50000) {
      frequency = 'complex';
    } else if (term.position > 20000) {
      frequency = 'medium';
    } else if (term.position > 10000) {
      frequency = 'light';
    } else {
      frequency = 'easy';
    }

    const phrase = term.phrase.replace(term.text, `<span style="font-weight: bold" class="${frequency}">${term.text}</span>`);

    li.innerHTML = `
      <div class="item word ${frequency}">${term.original}</div>
      <div class="item button">
          <button id="translate-word" data-id="${term.id}">word</button>
          <button id="translate-phrase" data-id="${term.id}">phrase</button>
      </div>
      <div class="item button">
          <button id="youglish" data-id="${term.id}">youglish</button>
      </div>
      <div class="item phrase">${phrase}</div>
    `;

    ul.append(li);
  });

  container.innerHTML = '';
  container.append(fr);
}
