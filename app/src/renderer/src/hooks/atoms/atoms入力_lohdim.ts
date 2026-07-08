import { atom } from 'jotai';

export interface FormData {
    emissionPointCoord: {
        coordX: string;
        coordY: string;
        coordZ: string;
    };
    averageWindDirection: string;
    emissionRateData: string;
    horizontalResolution: string;
    cellCount: {
        cellsEastWest: string;
        cellsNorthSouth: string;
        cellsVertical: string;
    };
    verticalMeshData: string;
    calcStart: string;
    outputStart: string;
    dispersionStart: string;
    calcEnd: string;
    outputInterval: string;
    stepInterval: string;
    bldgTerrainCalc: string;
    buildingData: string;
    terrainData: string;
    dispersionCalc: string;
    dryDepositionCalc: string;
    dryDepoVelocity: string;
    frictionVelocity: string;
    roughnessLength: string;
    turbulenceGeneration: string;
    continueCalc: string;
    sibylModel: string;
}

const initialFormData: FormData = {
    emissionPointCoord: { coordX: '50', coordY: '20', coordZ: '1' },
    averageWindDirection: '180.0',
    emissionRateData: 'release.txt',
    horizontalResolution: '4.',
    cellCount: { cellsEastWest: '100', cellsNorthSouth: '100', cellsVertical: '68' },
    verticalMeshData: 'zgrid.txt',
    calcStart: '1',
    outputStart: '6001',
    dispersionStart: '1',
    calcEnd: '12000',
    outputInterval: '60.0',
    stepInterval: '0.02',
    bldgTerrainCalc: '1',
    buildingData: 'building.txt',
    terrainData: 'terrain.txt',
    dispersionCalc: '1',
    dryDepositionCalc: '1',
    dryDepoVelocity: '0.001',
    frictionVelocity: '0.3',
    roughnessLength: '0.1',
    turbulenceGeneration: '0',
    continueCalc: '0',
    sibylModel: '1',
};

export interface ValidationErrors {
    [key: string]: string; // キー: エラーが発生したフィールドのパス (例: 'coordX'), 値: エラーメッセージ
}

export const formDataAtom = atom<FormData>(initialFormData);

export const validationErrorsAtom = atom<ValidationErrors>({});
