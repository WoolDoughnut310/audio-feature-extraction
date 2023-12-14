import express, { NextFunction } from 'express';
import formidable from 'formidable';
import fs from 'fs';
import { IncomingMessage } from 'http';
import { Essentia, EssentiaWASM } from 'essentia.js';
import decode from 'audio-decode';
import IncomingForm from 'formidable/Formidable';

const app = express();
const port = 3005;

const essentia = new Essentia(EssentiaWASM);

const KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const parseForm = async (
  form: IncomingForm,
  req: IncomingMessage,
  next: NextFunction
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return await new Promise(resolve => {
    form.parse(
      req,
      function (
        err: Error,
        fields: formidable.Fields,
        files: formidable.Files
      ) {
        if (err) return next(err);
        resolve({ fields, files });
      }
    );
  });
};

const decodeAudio = async (filepath: string) => {
  const buffer = fs.readFileSync(filepath);
  const audio = await decode(buffer);
  const audioVector = essentia.arrayToVector(audio._channelData[0]);
  return audioVector;
};

app.post('/upload', async (req, res, next) => {
  const form = formidable();

  const { files } = await parseForm(form, req, next);

  // The file uploaded must have the field name "file"
  const file = files.file as any;

  const data = await decodeAudio(file.filepath);

  const danceability = essentia.Danceability(data).danceability;
  const duration = essentia.Duration(data).duration;
  const energy = essentia.Energy(data).energy;

  const computedKey = essentia.KeyExtractor(data);
  const key = KEYS.indexOf(computedKey.key);
  const mode = computedKey.scale === 'major' ? 1 : 0;

  const loudness = essentia.DynamicComplexity(data).loudness;
  const tempo = essentia.PercivalBpmEstimator(data).bpm;

  res.status(200).json({
    danceability,
    duration,
    energy,
    key,
    mode,
    loudness,
    tempo,
  });
});

app.listen(port, () => {
  return console.log(`Express server listening at http://localhost:${port}`);
});
