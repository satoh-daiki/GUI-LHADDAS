import { FormData as LohdimFormData } from './atoms入力_lohdim';

/**
 * Lohdimの入力ファイルデータをFormDataオブジェクトに変換する
 * @param {Record<string, string | number>} rawData
 * @returns {LohdimFormData}
 */
export const mapLohdimDataToFormData = (rawData: Record<string, string>): LohdimFormData => {
    // 欠落しているキーがある場合を考慮し、デフォルト値を空文字として設定
    const getValue = (key: string, defaultValue: string = '') => rawData[key] || defaultValue;
    
    return {
        // ネストされたオブジェクトへのマッピング
        emissionPointCoord: {
            coordX: getValue('EMISSION_COORD_X'),
            coordY: getValue('EMISSION_COORD_Y'),
            coordZ: getValue('EMISSION_COORD_Z'),
        },
        cellCount: {
            cellsEastWest: getValue('CELLS_EAST_WEST'),
            cellsNorthSouth: getValue('CELLS_NORTH_SOUTH'),
            cellsVertical: getValue('CELLS_VERTICAL'),
        },
        
        // フラットなプロパティへのマッピング
        averageWindDirection: getValue('AVG_WIND_DIRECTION'),
        emissionRateData: getValue('EMISSION_RATE_DATA'),
        horizontalResolution: getValue('HORIZONTAL_RESOLUTION'),
        verticalMeshData: getValue('VERTICAL_MESH_DATA'),
        calcStart: getValue('CALC_START'),
        outputStart: getValue('OUTPUT_START'),
        dispersionStart: getValue('DISPERSION_START'),
        calcEnd: getValue('CALC_END'),
        outputInterval: getValue('OUTPUT_INTERVAL'),
        stepInterval: getValue('STEP_INTERVAL'),
        
        // 整数や数値が期待されるが、FormDataがstringなのでそのままマッピング
        bldgTerrainCalc: getValue('BLDG_TERRAIN_CALC'),
        buildingData: getValue('BUILDING_DATA'),
        terrainData: getValue('TERRAIN_DATA'),
        dispersionCalc: getValue('DISPERSION_CALC'),
        dryDepositionCalc: getValue('DRY_DEPOSITION_CALC'),
        dryDepoVelocity: getValue('DRY_DEPO_VELOCITY'),
        frictionVelocity: getValue('FRICTION_VELOCITY'),
        roughnessLength: getValue('ROUGHNESS_LENGTH'),
        turbulenceGeneration: getValue('TURBULENCE_GENERATION'),
        continueCalc: getValue('CONTINUE_CALC'),
        sibylModel: getValue('SIBYL_MODEL'),
    };
};
