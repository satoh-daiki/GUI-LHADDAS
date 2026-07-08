import { FormData as SibylFormData } from './atoms入力_sibyl';

/**
 * 文字列から「!」以降のコメント部分を除去し、両端の空白を削除するヘルパー関数。
 * @param {string | number | undefined} rawValue - rawDataから取得した値
 * @returns {string} コメントを除去したクリーンな値
 */
const cleanValue = (rawValue: string | number | undefined): string => {
    // 1. undefined や number の場合は文字列に変換
    const value = String(rawValue || '');
    
    // 2. 文字列を '!' で分割し、最初の要素（値の部分）だけを取得
    const valueWithoutComment = value.split('!')[0];
    
    // 3. 両端の空白を削除 (trim()) して返す
    return valueWithoutComment.trim();
};

const SIBYL_DEFAULTS:Record<string,string> = {
    ctitle:"SIBYL",
    irs:"4",
    nuclide:'Cs-137',
    ns_x_sta:'1',
    ns_x_end:'100',
    ns_y_sta:'1',
    ns_y_end:'100',
    ns_z_sta:'0',
    ns_z_end:'68',
    nt_x_sta:'1',
    nt_x_end:'100',
    nt_y_sta:'1',
    nt_y_end:'100',
    att:'8.118E-2',
    den:'2.400E-1',
    nsh_max:'68',
    nc_x_sta:'1',
    nc_x_end:'100',
    nc_y_sta:'1',
    nc_y_end:'100',
    doseRateType:'ambient'
}

/**
 * Sibylの入力ファイルデータをFormDataオブジェクトに変換する
 * @param {Record<string, string | number>} rawData 
 * @returns {SibylFormData} 整形後のFormDataオブジェクト
 */
export const mapSibylDataToFormData = (rawData: Record<string, string>): SibylFormData => {
    
    const getValue = (key: string, defaultValue: string): string => {
        const rawValue = rawData[key]
        const cleaned = cleanValue(rawValue)
        
        if(cleaned == ''){
             return defaultValue
        }
        return cleaned; 
    };

    const ns_z_end = getValue('ns_z_end', SIBYL_DEFAULTS.ns_z_end);
    const nt_x_sta = getValue('nt_x_sta', SIBYL_DEFAULTS.nt_x_sta);
    const nt_x_end = getValue('nt_x_end', SIBYL_DEFAULTS.nt_x_end);
    const nt_y_sta = getValue('nt_y_sta', SIBYL_DEFAULTS.nt_y_sta);
    const nt_y_end = getValue('nt_y_end', SIBYL_DEFAULTS.nt_y_end);

    const isWithin = (val: string, min: number, max: number) => {
        const n = Number(val);
        return !isNaN(n) && n >= min && n <= max;
    };

    // 障害物z方向最大セル(nsh_max)の判定
    // 条件: 1 <= nsh_max <= ns_z_end
    const rawNshMax = getValue('nsh_max', '');
    const validNshMax = isWithin(rawNshMax, 1, Number(ns_z_end))
        ? rawNshMax
        : ns_z_end; // 条件外ならns_z_endを採用

    // 計算領域(nc)の判定
    const rawNcXSta = getValue('nc_x_sta', SIBYL_DEFAULTS.nc_x_sta);
    const rawNcXEnd = getValue('nc_x_end', SIBYL_DEFAULTS.nc_x_end);
    const rawNcYSta = getValue('nc_y_sta', SIBYL_DEFAULTS.nc_y_sta);
    const rawNcYEnd = getValue('nc_y_end', SIBYL_DEFAULTS.nc_y_end);

    // 条件チェック
    const getValidNc = (ncVal: string, ntVal: string, compareVal: string, isStart: boolean) => {
        const n = Number(ncVal);
        const comp = Number(compareVal);
        const nt = Number(ntVal);
        if (isNaN(n) || isNaN(comp) || isNaN(nt)) return ntVal;

        if (isStart) {
            // sta条件: < nc_end & <= nt_sta
            return (n < comp && n <= nt) ? ncVal : ntVal;
        } else {
            // end条件: > nc_sta & <= nt_end
            return (n > comp && n <= nt) ? ncVal : ntVal;
        }
    };


    const rawFileName = getValue('file');
    let doseRateType = 'ambient';
    if (rawFileName.includes('_H_')) {
        doseRateType = 'ambient'; 
    } else if (rawFileName.includes('_K_')) {
        doseRateType = 'airkerma';
    }

    let nuclideValue = '';
    
    if (rawFileName) {
        const match = rawFileName.match(/RESP_[^_]+_(.*)\.bin/i); 
        if (match && match[1]) {
            nuclideValue = match[1];
        } else {
            console.warn("error extracting nuclide value: ", rawFileName);
        }
    }
    return {
        title: getValue('ctitle',SIBYL_DEFAULTS.ctitle),
        nuclide: nuclideValue,
        doseRateType: doseRateType, 
        cellSize: getValue('irs',SIBYL_DEFAULTS.irs),
        
        source: {
            xStart: getValue('ns_x_sta',SIBYL_DEFAULTS.ns_x_sta),
            xEnd: getValue('ns_x_end',SIBYL_DEFAULTS.ns_x_end),
            yStart: getValue('ns_y_sta',SIBYL_DEFAULTS.ns_y_sta),
            yEnd: getValue('ns_y_end',SIBYL_DEFAULTS.ns_y_end),
            zStart: getValue('ns_z_sta',SIBYL_DEFAULTS.ns_z_sta),
            zEnd: getValue('ns_z_end',SIBYL_DEFAULTS.ns_z_end),
        },
        target: {
            xStart: getValue('nt_x_sta',SIBYL_DEFAULTS.nt_x_sta),
            xEnd: getValue('nt_x_end',SIBYL_DEFAULTS.nt_x_end),
            yStart: getValue('nt_y_sta',SIBYL_DEFAULTS.nt_y_sta),
            yEnd: getValue('nt_y_end',SIBYL_DEFAULTS.nt_y_end),
        },
        obstacle: {
            gamma: getValue('att',SIBYL_DEFAULTS.att),
            effectiveDensity: getValue('den',SIBYL_DEFAULTS.den),
            // 条件を満たしていればnsh_maxを採用し、そうでなければns_z_endを採用
            zMaxCell: validNshMax,
        },
        calcArea: {
            // 条件を満たしていればncを採用し、そうでなければntを採用
            xStart: rawNcXSta,
            xEnd:   getValidNc(rawNcXEnd, nt_x_end, rawNcXSta || nt_x_sta, false),
            yStart: rawNcYSta,
            yEnd:   getValidNc(rawNcYEnd, nt_y_end, rawNcYSta || nt_y_sta, false),
        },
    };
};
