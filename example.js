const { Essentia, EssentiaWASM } = require("essentia.js");
const fs = require("fs");
const decode = require("audio-decode");

const essentia = new Essentia(EssentiaWASM);

async function main() {
    const buffer = fs.readFileSync("audio/1.mp3");
    const audio = await decode(buffer);
    const data = essentia.arrayToVector(audio._channelData[0]);

    console.log(essentia.PercivalBpmEstimator(data));
}

// Danceability
const computed = essentia.Danceability(data);
// { danceability: N }

const danceability = computed.value;

// Duration
const computed = essentia.Duration(data);
// { duration: N }

const duration = computed.value;

// Energy
const computed = essentia.Energy(data);
// { energy: N }

const energy = computed.value;

// Key
const computed = essentia.KeyExtractor(data);
// { key: "C" | "D" | "E" ..., scale: "major" | "minor", strength: N }

const KEYS = ["C", "D", "E", "F", "G", "A", "B"];

const key = KEYS.indexOf(computed.key);
const mode = computed.scale === "major" ? 1 : 0;

// Loudness
const computed = essentia.DynamicComplexity(data);
// { dynamicComplexity: N, loudness: N }

const loudness = computed.loudness;

// Tempo
const computed = essentia.PercivalBpmEstimator(data);
// { bpm: N }

const tempo = computed.bpm;

main();
