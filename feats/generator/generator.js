const tokenizer = require('./tokenizer.js');

const range = (count) => Array.from(Array(count).keys());
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = (list) => list[random(0, list.length - 1)];

/**
 * When parsing the source text, is it possible
 * to find reserved words e.g. “constructor”, “function” etc.
 * To prevent them from accessing the real properties on an object
 * we naively escape `tokens`.
 */
const escapeString = (token) => `_+${token}`;
const fromTokens = (tokens) => escapeString(tokens.join(""));

/**
 * We need to slice the given source text into a set of `samples`.
 * Each sample contains 2 or more `tokens` — words, spaces, or punctuation marks.
 * The bigger `sampleSize` is, the more tokens are used to generate the next.
 *
 * More about transition matrix:
 * @see https://dev.to/bespoyasov/text-generation-with-markov-chains-in-javascript-i38 in English
 * @see https://bespoyasov.ru/blog/text-generation-with-markov-chains/ in Russian
 *
 * @param {Array<Token>} corpus, the source text represented as an array of tokens.
 * @param {number} sampleSize, the size of a token group, first tokens of which
 *                             will constitute the TransitionMatrix key.
 * @return {Array<Sample>}
 */
function sliceCorpus(corpus, sampleSize) {
  return corpus
    .map((_, index) => corpus.slice(index, index + sampleSize))
    .filter((group) => group.length === sampleSize);
}

/**
 * Transition matrix is an object with samples' first tokens as keys
 * and lists of their following tokens as values.
 * This object will allow to randomly select one
 * of the following tokens to “generate” the next word.
 *
 * We don't use Map() here, since we would need to stringify keys anyway.
 * Map uses referential equality for keys comparison
 * and different array instances would be considered as different keys.
 *
 * @param {Array<Sample>} samples, an array of token groups.
 * @return {TransitionMatrix}
 */
function collectTransitions(samples) {
  return samples.reduce((transitions, sample) => {
    const lastIndex = sample.length - 1;
    const lastToken = sample[lastIndex];
    const restTokens = sample.slice(0, lastIndex);

    const state = fromTokens(restTokens);
    const next = lastToken;

    transitions[state] = transitions[state] || [];
    transitions[state].push(next);
    return transitions;
  }, {});
}

/**
 * Initially, the chain is the tokenized `startText` if given,
 * or a random sample—the key from the transition matrix.
 *
 * @param {string} startText, a string to be used as the initial tokens for the chain.
 * @param {TransitionMatrix} transitions, the transition matrix object.
 * @returns {Chain}
 */
function createChain(startText, transitions) {
  const head = startText || pickRandom(Object.keys(transitions));
  return tokenizer.tokenize(head);
}

/**
 * When generating a next word,
 * we take the (`sampleSize` - 1) number of last `tokens` from the chain.
 * These tokens consist a key for the transition matrix,
 * by which we get a list of possible next words,
 * and randomly select one from them.
 *
 * @param {Chain} chain, a current list of tokens representing the chain.
 * @param {TransitionMatrix} transitions, the transition matrix object.
 * @param {number} sampleSize, the number of tokens in a group.
 * @returns {Token}
 */
function predictNext(chain, transitions, sampleSize) {
  const lastState = fromTokens(chain.slice(-(sampleSize - 1)));
  const nextWords = transitions[lastState] || [];
  return pickRandom(nextWords);
}

/**
 * Each time the generator is asked for a new word,
 * it “predicts” the next `token` for the `chain` and yields it.
 * If there are no following tokens, it removes the last token from the chain
 * so the chain contains only sequences that can produce new words.
 *
 * @param {string} startText, initial text for the chain.
 * @param {TransitionMatrix} transitions, the transition matrix object.
 * @param {number} sampleSize, the number of tokens in a group.
 * @returns {Generator<Token>}
 */
function* generateChain(startText, transitions, sampleSize) {
  const chain = createChain(startText, transitions);

  while (true) {
    const state = predictNext(chain, transitions, sampleSize);
    yield state;

    if (state) chain.push(state);
    else chain.pop();
  }
}

module.exports = {
    generate: function({ source, start=null, wordsCount=200, sampleSize=3} = {}) {
      if (!source) throw new Error("The source text cannot be empty.");
      if (sampleSize < 2) throw new Error("Sample size must not be less than 2.");

      const corpus = tokenizer.tokenize(String(source));
      const samples = sliceCorpus(corpus, sampleSize);
      const transitions = collectTransitions(samples);

      const generator = generateChain(start, transitions, sampleSize);
    const chain = range(wordsCount).map((_) => generator.next().value);
    
      return tokenizer.textify(chain);
    }
}
