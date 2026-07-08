import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { formDataAtom, FormData, validationErrorsAtom, ValidationErrors } from '../../atoms/atoms入力_sibyl';

export const useSibylFormState = () => {
    const [formData, setFormData] = useAtom(formDataAtom);
    const [validationErrors, setValidationErrors] = useAtom(validationErrorsAtom);

    // トップレベルのフィールドを更新するヘルパー
    const updateField = useCallback((field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, [setFormData]);

    // ネストされたフィールドを更新するヘルパー
    const updateNestedField = useCallback(<T extends keyof FormData>(
        section: T,
        field: keyof FormData[T],
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value
            } as any
        }));
    }, [setFormData]);

    return {
        formData,
        setFormData,
        validationErrors,
        setValidationErrors,
        updateField,
        updateNestedField,
    };
};

