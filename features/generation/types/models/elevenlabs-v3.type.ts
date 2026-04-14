import { BaseAiInput } from "../generation";
import { z } from "zod";


export enum ElevenLabsV3Voice {
  ARIA = 'Aria',
  ROGER = 'Roger',
  SARAH = 'Sarah',
  LAURA = 'Laura',
  CHARLIE = 'Charlie',
  GEORGE = 'George',
  CALLUM = 'Callum',
  RIVER = 'River',
  LIAM = 'Liam',
  CHARLOTTE = 'Charlotte',
  ALICE = 'Alice',
  MATILDA = 'Matilda',
  WILL = 'Will',
  JESSICA = 'Jessica',
  ERIC = 'Eric',
  CHRIS = 'Chris',
  BRIAN = 'Brian',
  DANIEL = 'Daniel',
  LILY = 'Lily',
  BILL = 'Bill'
}

export enum ElevenLabsV3ApplyTextNormalization {
  AUTO = 'auto',
  ON = 'on',
  OFF = 'off'
}

export interface IElevenLabsV3Input extends BaseAiInput {
  voice?: ElevenLabsV3Voice;
  stability?: number;
  languageCode?: string;
  applyTextNormalization?: ElevenLabsV3ApplyTextNormalization;
}

export const ElevenLabsV3InputConst = {
  voice: Object.values(ElevenLabsV3Voice),
    applyTextNormalization: Object.values(ElevenLabsV3ApplyTextNormalization)
  
};

export const elevenLabsV3ValidationSchema = z.object({
  prompt: z.string().nonempty(),
  voice: z.nativeEnum(ElevenLabsV3Voice).optional(),
  stability: z.number().optional(),
  languageCode: z.string().optional(),
  applyTextNormalization: z.nativeEnum(ElevenLabsV3ApplyTextNormalization).optional(),
}) as z.ZodType<IElevenLabsV3Input>;
