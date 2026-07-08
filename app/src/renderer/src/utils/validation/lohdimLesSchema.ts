import { z } from 'zod';
import { FormData } from '../../hooks/atoms/atoms入力_lohdim';

// ヘルパー：必須エラーメッセージの設定（SIBYLと同方式）
// undefined の場合も翻訳キーを返すようにする
const requiredErrorParams = {
  required_error: 'validation.required',
  invalid_type_error: 'validation.required',
};

const baseString = z.string(requiredErrorParams).trim();

// 必須、かつ文字列が空でなく、実数値に変換可能であることを検証
const requiredFloatString = baseString
  .min(1, { message: 'validation.required' })
  .pipe(
    z.coerce
      .number({ invalid_type_error: 'validation.invalid_float' })
      // NaN（数値変換不能な文字）を明示的に弾く
      .refine((n) => !Number.isNaN(n), { message: 'validation.invalid_float' }),
  );

// 必須、かつ文字列が '1' または '0' であることを検証 (フラグ)
const requiredFlag = baseString.refine((val) => val === '1' || val === '0', {
  message: 'validation.invalid_flag',
});

// 必須かつ整数形式の文字列を検証する
const requiredIntString = baseString
  .min(1, { message: 'validation.required' })
  .pipe(
    z.coerce
      .number({ invalid_type_error: 'validation.must_be_integer' })
      .refine((n) => !Number.isNaN(n), { message: 'validation.must_be_integer' })
      .refine((num) => Number.isInteger(num), { message: 'validation.must_be_integer' }),
  );

// 必須、かつ空でない文字列を検証する (パスフィールドなど)
const requiredString = baseString.min(1, { message: 'validation.required' });

// 必須、かつ空でない、かつクオーテーション必須
const requiredquotedString = baseString
  // 例: '' は許容しない想定（入力途中を考慮する場合はここを調整）
  .min(3, { message: 'validation.must_be_quoted' })
  .regex(/^([']).*\1$/, { message: 'validation.must_be_single_quoted' });

const makeOptional = <T extends z.ZodTypeAny>(baseSchema: T) =>
  z
    .string() // オプショナルは空文字許容なので baseString ではなく z.string() でOK
    .trim()
    .transform((val) => (val === '' ? undefined : val))
    .optional()
    .pipe(baseSchema.optional());

// 実数値に変換可能であることを検証するスキーマ
const coreFloatSchema = z
  .coerce
  .number({ invalid_type_error: 'validation.invalid_float' })
  .refine((n) => !Number.isNaN(n), { message: 'validation.invalid_float' });

// 整数形式の文字列を検証するスキーマ
const coreIntSchema = z
  .coerce
  .number({ invalid_type_error: 'validation.must_be_integer' })
  .refine((n) => !Number.isNaN(n), { message: 'validation.must_be_integer' })
  .refine((num) => Number.isInteger(num), { message: 'validation.must_be_integer' });

const coreQuotedStringSchema = z
  .string()
  // 正規表現で「先頭と末尾が ' で、かつ一致していること」をチェック
  .regex(/^([']).*\1$/, { message: 'validation.must_be_single_quoted' });

/** 任意の整数形式の文字列 */
export const optionalIntString = makeOptional(coreIntSchema);

/** 任意の実数形式の文字列 */
export const optionalFloatString = makeOptional(coreFloatSchema);

/** 任意の空ではない文字列 (パスフィールドなど) */
export const optionalString = z.string().trim()
    .transform(val => val === "" ? undefined : val)
    .optional();
export const optionalQuotedString = makeOptional(coreQuotedStringSchema)

/** 任意、かつ文字列が '1' または '0' であることを検証 (フラグ) */
export const optionalFlag = z.string()
    .transform(val => val === "" ? undefined : val) // 空文字を undefined に
    .optional()
    .refine(val => val === undefined || val === '1' || val === '0', {
        message: 'validation.invalid_flag'
    });

// LOHDIM-LESフォームのバリデーションスキーマ
export const lohdimLesSchema = z.object({
  emissionPointCoord: z.object({
    coordX: requiredIntString,
    coordY: requiredIntString,
    coordZ: requiredIntString,
  }),
  averageWindDirection: requiredFloatString,
  emissionRateData: requiredquotedString,
  horizontalResolution: requiredFloatString,
  cellCount: z.object({
    cellsEastWest: requiredIntString,
    cellsNorthSouth: requiredIntString,
    cellsVertical: requiredIntString,
  }),
  verticalMeshData: requiredquotedString,
  calcStart: requiredIntString,
  outputStart: requiredIntString,
  dispersionStart: requiredIntString,
  calcEnd: requiredIntString,
  outputInterval: requiredFloatString,
  stepInterval: requiredFloatString,
  bldgTerrainCalc: requiredFlag,
  buildingData: requiredquotedString,
  terrainData: requiredquotedString,

  // オプション項目 
  dispersionCalc: optionalFlag,
  dryDepositionCalc: optionalFlag,
  dryDepoVelocity: optionalFloatString,
  frictionVelocity: optionalFloatString,
  roughnessLength: optionalFloatString,
  turbulenceGeneration: optionalFlag,
  continueCalc: optionalFlag,
  sibylModel: optionalFlag,

}).passthrough()
  .superRefine((data, ctx) => {
    // 数値に変換
    const ex = parseInt(data.emissionPointCoord.coordX, 10);
    const ey = parseInt(data.emissionPointCoord.coordY, 10);
    const ez = parseInt(data.emissionPointCoord.coordZ, 10);
    const maxE = parseInt(data.cellCount.cellsEastWest, 10);
    const maxN = parseInt(data.cellCount.cellsNorthSouth, 10);
    const maxV = parseInt(data.cellCount.cellsVertical, 10);

    // X方向チェック
    if (!isNaN(ex) && !isNaN(maxE)) {
      if (ex < 1 || ex > maxE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validation.emission_x_range',
          path: ['emissionPointCoord', 'coordX'],
        });
      }
    }

    // Y方向チェック
    if (!isNaN(ey) && !isNaN(maxN)) {
      if (ey < 1 || ey > maxN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validation.emission_y_range',
          path: ['emissionPointCoord', 'coordY'],
        });
      }
    }

    // Z方向チェック
    if (!isNaN(ez) && !isNaN(maxV)) {
      if (ez < 1 || ez > maxV) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validation.emission_z_range',
          path: ['emissionPointCoord', 'coordZ'],
        });
      }
    }
  }) as z.ZodSchema<FormData>;
