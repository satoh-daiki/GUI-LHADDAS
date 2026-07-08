import { atom } from 'jotai';

export interface FormData {
    title: string;
    nuclide: string;
    doseRateType: string;
    cellSize: string;
    source: {
        xStart: string;
        xEnd: string;
        yStart: string;
        yEnd: string;
        zStart: string;
        zEnd: string;
    };
    target: {
        xStart: string;
        xEnd: string;
        yStart: string;
        yEnd: string;
    };
    obstacle: {
        gamma: string;
        effectiveDensity: string;
        zMaxCell: string;
    };
    calcArea: {
        xStart: string;
        xEnd: string;
        yStart: string;
        yEnd: string;
    };
}

const initialFormData: FormData = {
    title: 'SIBYL',
    nuclide: '',
    doseRateType: '',
    cellSize: '',
    source: { xStart: '', xEnd: '', yStart: '', yEnd: '', zStart: '', zEnd: '' },
    target: { xStart: '', xEnd: '', yStart: '', yEnd: ''},
    obstacle: { gamma: '8.118E-2', effectiveDensity: '2.400E-1', zMaxCell: '50' },
    calcArea: { xStart: '-100', xEnd: '199', yStart: '-100', yEnd: '99' },
};

export const formDataAtom = atom<FormData>(initialFormData);

export const validationErrorsAtom = atom<ValidationErrors>({});
