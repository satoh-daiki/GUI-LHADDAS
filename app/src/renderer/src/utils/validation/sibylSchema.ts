import { z } from 'zod';
import { FormData } from '../../hooks/atoms/atoms入力_sibyl';

// ヘルパー：必須エラーメッセージの設定
const requiredErrorParams = { 
  required_error: "validation.required", 
  invalid_type_error: "validation.required" 
};

// z.string() にパラメータを渡し、undefined時も翻訳キーを返すようにする
const baseString = z.string(requiredErrorParams).trim();

// 必須、かつ文字列が空でなく、実数値に変換可能であることを検証
const requiredFloatString = baseString
    .min(1, { message: 'validation.required' })
    .pipe(
        z.coerce.number({ invalid_type_error: "validation.invalid_float" })
        // NaN（数値変換不能な文字）を明示的に弾く
        .refine((n) => !Number.isNaN(n), { message: "validation.invalid_float" })
    );

// 必須、かつ文字列が '1' または '0' であることを検証 (フラグ)
const requiredFlag = baseString
  .refine(val => val === '1' || val === '0', {
    message: 'validation.invalid_flag'
  });

// 必須かつ整数形式の文字列を検証する
const requiredIntString = baseString
    .min(1, { message: 'validation.required' })
    .pipe(
        z.coerce.number({ invalid_type_error: "validation.must_be_integer" })
        .refine((n) => !Number.isNaN(n), { message: "validation.must_be_integer" }) // NaNチェック
        .refine(num => Number.isInteger(num), { message: 'validation.must_be_integer' })
    );

// 必須、かつ空でない文字列を検証する
const requiredString = baseString.min(1, { message: 'validation.required' });

const makeOptional = <T extends z.ZodTypeAny>(baseSchema: T) => 
    z.string() // オプショナルは空文字許容なので baseString ではなく z.string() でOK
        .trim()
        .transform(val => val === "" ? undefined : val) 
        .optional()   
        .pipe(baseSchema.optional());

// 実数値スキーマ (NaNチェック追加)
const coreFloatSchema = z.coerce.number({ invalid_type_error: "validation.invalid_float" })
    .refine((n) => !Number.isNaN(n), { message: "validation.invalid_float" });

// 整数スキーマ (NaNチェック追加)
const coreIntSchema = z.coerce.number({ invalid_type_error: "validation.must_be_integer" })
    .refine((n) => !Number.isNaN(n), { message: "validation.must_be_integer" })
    .refine(num => Number.isInteger(num), { message: 'validation.must_be_integer' });


/** 任意の整数形式の文字列 */
export const optionalIntString = makeOptional(coreIntSchema);

/** 任意の実数形式の文字列 */
export const optionalFloatString = makeOptional(coreFloatSchema);

/** 任意の空ではない文字列 */
export const optionalString = z.string()
    .trim()
    .transform(val => val === "" ? undefined : val)
    .optional();

/** 任意、かつ文字列が '1' または '0' であることを検証 (フラグ) */
export const optionalFlag = z.string()
    .transform(val => val === "" ? undefined : val)
    .optional()
    .refine(val => val === undefined || val === '1' || val === '0', {
        message: 'validation.invalid_flag'
        //message:JSON.stringify({
	//    key:"validation.invalid_flag"
        //   })
    });

/** 放出点が計算領域内の値になっているか検証 */
export const validateSibyl = (data: FormData) => {
  const result = sibylSchema.safeParse(data);
  if (result.success) return {};

  const errors: any = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });
  return errors;
};

// Sibylフォームのバリデーションスキーマ
export const sibylSchema = z.object({
  nuclide: requiredString,
  doseRateType: requiredString,
  cellSize: requiredFloatString,
  source: z.object({
    xStart: requiredIntString,
    xEnd: requiredIntString,
    yStart: requiredIntString,
    yEnd: requiredIntString,
    zStart: requiredIntString,
    zEnd: requiredIntString,
  }),
  target: z.object({
    xStart: requiredIntString,
    xEnd: requiredIntString,
    yStart: requiredIntString,
    yEnd: requiredIntString,
  }),

  title: optionalString,
  
  obstacle: z.object({
    gamma: optionalFloatString,
    effectiveDensity: optionalFloatString,
    zMaxCell: optionalIntString,
  }),
  calcArea: z.object({
    xStart: optionalIntString,
    xEnd: optionalIntString,
    yStart: optionalIntString,
    yEnd: optionalIntString,
  }),

}).passthrough()
  .superRefine((data, ctx) => {

    const num = (v: string) => Number(v);

    // バリデーション用ヘルパー（X, Y共通ロジック）
    const validateAxis = (
      sta: number, 
      end: number, 
      ntSta: number, 
      ntEnd: number, 
      axisLabel: 'x' | 'y'
    ) => {
      const label = axisLabel.toUpperCase();

      // 大小関係のチェック（開始側に代表してエラーを出す）
      if (sta >= end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `validation.nc_${axisLabel}_range_overlap`, 
          path: ['calcArea', `${axisLabel}Start`],
        });
      }

      // 標的領域（nt）に対する制約チェック（個別に判定）
      if (sta > ntSta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: JSON.stringify({ 
            key: `validation.nc_${axisLabel}_sta_exceeds_nt`, 
            params: { limit: ntSta } 
          }),
          path: ['calcArea', `${axisLabel}Start`],
        });
      }

      if (end > ntEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: JSON.stringify({ 
            key: `validation.nc_${axisLabel}_end_exceeds_nt`, 
            params: { limit: ntEnd } 
          }),
          path: ['calcArea', `${axisLabel}End`],
        });
      }
    };

    
    // X方向
    validateAxis(
      num(data.calcArea.xStart), 
      num(data.calcArea.xEnd), 
      num(data.target.xStart), 
      num(data.target.xEnd), 
      'x'
    );

    // Y方向
    validateAxis(
      num(data.calcArea.yStart), 
      num(data.calcArea.yEnd), 
      num(data.target.yStart), 
      num(data.target.yEnd), 
      'y'
    );

    // nsh_max のチェック
    const nshMax = num(data.obstacle.zMaxCell);
    const zEnd = num(data.source.zEnd);
    if (nshMax < 1 || nshMax > zEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: JSON.stringify({ key: 'validation.nsh_max_range', params: { max: zEnd } }),
        path: ['obstacle', 'zMaxCell'],
      });
    }

   
  })as z.ZodSchema<FormData>;

//}).passthrough() as z.ZodSchema<FormData>;
