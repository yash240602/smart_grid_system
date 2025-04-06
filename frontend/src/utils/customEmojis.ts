/**
 * Custom emoji and text combinations to add personality
 * These make the app feel more handcrafted and less AI-generated
 */

type MessageCategories = 'energy' | 'insights' | 'error' | 'success';
type PhraseCategories = 'loading' | 'error' | 'success' | 'empty';

interface TextCollection {
  energy: string[];
  insights: string[];
  error: string[];
  success: string[];
  getRandom: (category: MessageCategories) => string;
}

interface PhraseCollection {
  loading: string[];
  error: string[];
  success: string[];
  empty: string[];
  getRandom: (category: PhraseCategories) => string;
}

export const symbols: TextCollection = {
  energy: ['>>>', '**', '~*~', '><>', '//', '||', '###', '...', ':::', '+++'],
  insights: ['<<>', '>/<', '/\\', '***', '!!', '-->', '<-->', '##', ':::', '~~~'],
  error: ['x_x', '-_-', '...', '?!?', '////', 'xxx', '!!!', '___', ':(', ':|'],
  success: ['+++', '<!>', '~*~', ':)', '^^', '**', '!!', '---', ':D', '><'],

  getRandom(category: MessageCategories): string {
    return this[category][Math.floor(Math.random() * this[category].length)];
  }
};

export const phrases: PhraseCollection = {
  loading: [
    "loading data... might take a sec",
    "fetching the goods rn",
    "gimme a moment",
    "processing in the void",
    "waiting for signals in the dark",
    "decoding the matrix",
    "calculating reality",
    "almost there, being dramatic",
    "calibrating the algorithm",
    "assembling digital fragments"
  ],
  
  error: [
    "that didn't work, try again",
    "system broke itself",
    "failed to process your request",
    "something went wrong in the shadows",
    "code error. not your fault",
    "connection lost in translation",
    "digital breakdown detected",
    "system rejected the input",
    "request vanished into the void",
    "technical glitch in the network"
  ],
  
  success: [
    "mission accomplished",
    "all systems functional",
    "request processed successfully",
    "operation complete",
    "everything went according to plan",
    "task executed without error",
    "digital transaction confirmed",
    "system accepted your input",
    "analysis complete, results ready",
    "successful connection established"
  ],
  
  empty: [
    "nothing here but empty space",
    "no data found in this dimension",
    "void of information",
    "blankness, only blankness",
    "search returned zero results",
    "empty dataset, try again",
    "no matches in the database",
    "information desert, nothing here",
    "query returned a black hole",
    "digital emptiness detected"
  ],

  getRandom(category: PhraseCategories): string {
    return this[category][Math.floor(Math.random() * this[category].length)];
  }
};

export const tooltips = {
  voltage: "Voltage is like water pressure in a pipe, but for electricity. Higher = more zap power!",
  current: "Current is the flow of electrons - like how much water is flowing through that pipe.",
  grid: "Your power network - connecting everything from solar panels to your coffee maker.",
  optimization: "Making everything run super efficiently - like Marie Kondo, but for electricity."
};

export default { symbols, phrases, tooltips }; 