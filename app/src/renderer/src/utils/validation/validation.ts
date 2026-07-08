import { ZodError } from 'zod';
import { lohdimLesSchema } from '../validation/lohdimLesSchema';
import { sibylSchema } from '../validation/sibylSchema';
import { FormData as LohdimFormData} from '../../hooks/atoms/atoms入力_lohdim';
import { FormData as SibylFormData} from '../../hooks/atoms/atoms入力_sibyl';

export interface ValidationErrors {
    [key: string]: string; 
}

/**
 * Zodのエラーオブジェクトを、フラットなパス/メッセージ形式に変換する
 */
export const flattenZodErrors = (error: ZodError): ValidationErrors => {
    
    const flattened = error.flatten();
    
    const errors: ValidationErrors = {};
    
    for (const key in flattened.fieldErrors) {
        const messageArray = flattened.fieldErrors[key];
        if (messageArray && messageArray.length > 0) {
            errors[key] = messageArray[0];
        }
    }
    
    if (flattened.formErrors && flattened.formErrors.length > 0) {
        errors['general'] = flattened.formErrors[0];
    }
    
    return errors;
};



/**
 * Zodを使用してフォームデータを検証する関数
 */
export const validateLohdimLes = (data: LohdimFormData): ValidationErrors => {
    const result = lohdimLesSchema.safeParse(data);

    if (result.success) {
            return {};
    } else {
        if (result.error) {
             return flattenZodErrors(result.error);
        } else {
             return { general: "validation.general_error" };
        }
    }
};

/**
 * Zodを使用してフォームデータを検証する関数
 */
export const validateSibyl = (data: SibylFormData): ValidationErrors => {
    const result = sibylSchema.safeParse(data);

    if (result.success) {
        return {};
    }

    console.log("Zod detected issues:", result.error.issues.length);

    const errors: ValidationErrors = {};

    result.error.issues.forEach((issue) => {
        const key = issue.path.join('.');
       
        if (errors[key]) {
            errors[key] += `\n${issue.message}`;
        } else {
            errors[key] = issue.message;
        }
    });

    console.log("Formatted errors object keys:", Object.keys(errors));

    return errors;
};
