import { BaseAiInput } from "../generation";
import {z} from "zod"
export const KlingO3ImageOptionsConst = {
  aspectRatio: [
    '16:9',
    '9:16',
    '1:1',
    '4:3',
    '3:4',
    '3:2',
    '2:3',
    '21:9'
  ] as const,
    resolution: ['1K', '2K', '4K'] as const,
};
export interface KlingO3ImageOptions {
  aspectRatio: (typeof KlingO3ImageOptionsConst.aspectRatio)[number];
  resolution: (typeof KlingO3ImageOptionsConst.resolution)[number];
}
export interface KlingO3ImageInput
  extends BaseAiInput, KlingO3ImageOptions {
  numImages?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  images: string[];
}

export const klingO3ImageValidationSchema = z.object({
  prompt: z.string().nonempty(),
  aspectRatio: z.string().nonempty(),
  resolution: z.string().nonempty(),
  numImages: z.number().optional(),
  images: z.array(z.string()).optional(),
}) as z.ZodType<KlingO3ImageInput>;
