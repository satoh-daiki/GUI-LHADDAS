// 入力テキストを解析してオブジェクトに変換し、新しいフォーマットの文字列を生成する関数
export const convertToLohdimFormat = (inputText: string): string => {
  const lines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // 入力ファイルの各行を順番に定義（インデックスに基づいたマッピング）
  // 注: 入力テキストの順番が固定であることを前提としています
  const data: Record<string, string> = {};

  // 文字列のクォーテーションを除去するヘルパー
  //const clean = (val: string) => val.replace(/['"]/g, '').trim();
  const clean = (val: string) => val;


  const DEFAULTS: Record<string, string> = {
    "EMISSION_RATE_DATA" : `'release.txt'`,
    "EMISSION_COORD_X" : "50",
    "EMISSION_COORD_Y" : "20",
    "EMISSION_COORD_Z" : "1",
    "HORIZONTAL_RESOLUTION" :"4." ,
    "CELLS_EAST_WEST" :"100" ,
    "CELLS_NORTH_SOUTH" :"100" ,
    "CELLS_VERTICAL" :"68" ,
    "VERTICAL_MESH_DATA" :`'zgrid.txt'` ,
    "CALC_START" : "1",
    "OUTPUT_START" :"6001" ,
    "DISPERSION_START" :"1" ,
    "CALC_END" : "12000",
    "OUTPUT_INTERVAL" :"60.0" ,
    "STEP_INTERVAL" : "0.02",
    "BLDG_TERRAIN_CALC" : "1",
    "BUILDING_DATA" :`'building.txt'` ,
    "TERRAIN_DATA" : `'terrain.txt'`,
    "AVG_WIND_DIRECTION" : "180.0",
    "DISPERSION_CALC" : "1",
    "DRY_DEPOSITION_CALC" :"1" ,
    "DRY_DEPO_VELOCITY" :"0.01" ,
    "FRICTION_VELOCITY" : "0.3",
    "ROUGHNESS_LENGTH" :"0.1" ,
    "TURBULENCE_GENERATION" :"0" ,
    "CONTINUE_CALC" : "0",
    "SIBYL_MODEL" : "1"
}

  try {
    data['BUILDING_DATA'] = clean(lines[0].split('!')[0]) || DEFAULTS['BUILDING_DATA'];
    data['VERTICAL_MESH_DATA'] = clean(lines[2].split('!')[0])|| DEFAULTS['VERTICAL_MESH_DATA'] ;
    data['TERRAIN_DATA'] = clean(lines[1].split('!')[0]) || DEFAULTS['TERRAIN_DATA'];
    data['EMISSION_RATE_DATA'] = clean(lines[3].split('!')[0]) || DEFAULTS['EMISSION_RATE_DATA'];
    
    data['CELLS_EAST_WEST'] = lines[4].split('!')[0].trim() ||DEFAULTS['CELLS_EAST_WEST'] ;
    data['CELLS_NORTH_SOUTH'] = lines[5].split('!')[0].trim() || DEFAULTS['CELLS_NORTH_SOUTH'];
    data['CELLS_VERTICAL'] = lines[6].split('!')[0].trim() || DEFAULTS['CELLS_VERTICAL'];
    
    data['SIBYL_MODEL'] = lines[7].split('!')[0].trim() || DEFAULTS['SIBYL_MODEL'];
    data['BLDG_TERRAIN_CALC'] = lines[8].split('!')[0].trim()|| DEFAULTS['BLDG_TERRAIN_CALC'];
    data['DISPERSION_CALC'] = lines[9].split('!')[0].trim() || DEFAULTS['DISPERSION_CALC'];
    data['DRY_DEPOSITION_CALC'] = lines[10].split('!')[0].trim() || DEFAULTS['DRY_DEPOSITION_CALC'];
    data['TURBULENCE_GENERATION'] = lines[11].split('!')[0].trim() || DEFAULTS['TURBULENCE_GENERATION'];

    // 座標の分割 (50,20,1)
    const coords = lines[12].split('!')[0].split(',');
    data['EMISSION_COORD_X'] = coords[0]?.trim() || DEFAULTS['EMISSION_COORD_X'];
    data['EMISSION_COORD_Y'] = coords[1]?.trim() || DEFAULTS['EMISSION_COORD_Y'];
    data['EMISSION_COORD_Z'] = coords[2]?.trim() || DEFAULTS['EMISSION_COORD_Z'];

    data['CONTINUE_CALC'] = lines[13].split('!')[0].trim() || DEFAULTS['CONTINUE_CALC'];
    data['CALC_START'] = lines[14].split('!')[0].trim()|| DEFAULTS['CALC_START'];
    data['OUTPUT_START'] = lines[15].split('!')[0].trim() || DEFAULTS['OUTPUT_START'];
    data['DISPERSION_START'] = lines[16].split('!')[0].trim() || DEFAULTS['DISPERSION_START'];
    data['CALC_END'] = lines[17].split('!')[0].trim() || DEFAULTS['CALC_END'];
    
    data['OUTPUT_INTERVAL'] = lines[18].split('!')[0].trim() || DEFAULTS['OUTPUT_INTERVAL'];
    data['STEP_INTERVAL'] = lines[19].split('!')[0].trim() || DEFAULTS['STEP_INTERVAL'];
    data['HORIZONTAL_RESOLUTION'] = lines[20].split('!')[0].trim() || DEFAULTS['HORIZONTAL_RESOLUTION'];
    data['FRICTION_VELOCITY'] = lines[21].split('!')[0].trim() || DEFAULTS['FRICTION_VELOCITY'];
    data['ROUGHNESS_LENGTH'] = lines[22].split('!')[0].trim() || DEFAULTS['ROUGHNESS_LENGTH'];
    data['AVG_WIND_DIRECTION'] = lines[23].split('!')[0].trim() || DEFAULTS['AVG_WIND_DIRECTION'];
    data['DRY_DEPO_VELOCITY'] = lines[24].split('!')[0].trim() || DEFAULTS['DRY_DEPO_VELOCITY'];

  } catch (e) {
    console.error("フォーマット解析エラー:", e);
    return "";
  }

  // 画像の形式に合わせて文字列を組み立てる
  const outputLines = [
    `EMISSION_RATE_DATA = ${data.EMISSION_RATE_DATA}`,
    `EMISSION_COORD_X = ${data.EMISSION_COORD_X}`,
    `EMISSION_COORD_Y = ${data.EMISSION_COORD_Y}`,
    `EMISSION_COORD_Z = ${data.EMISSION_COORD_Z}`,
    `HORIZONTAL_RESOLUTION = ${data.HORIZONTAL_RESOLUTION}`,
    `CELLS_EAST_WEST = ${data.CELLS_EAST_WEST}`,
    `CELLS_NORTH_SOUTH = ${data.CELLS_NORTH_SOUTH}`,
    `CELLS_VERTICAL = ${data.CELLS_VERTICAL}`,
    `VERTICAL_MESH_DATA = ${data.VERTICAL_MESH_DATA}`,
    `CALC_START = ${data.CALC_START}`,
    `OUTPUT_START = ${data.OUTPUT_START}`,
    `DISPERSION_START = ${data.DISPERSION_START}`,
    `CALC_END = ${data.CALC_END}`,
    `OUTPUT_INTERVAL = ${data.OUTPUT_INTERVAL}`,
    `STEP_INTERVAL = ${data.STEP_INTERVAL}`,
    `BLDG_TERRAIN_CALC = ${data.BLDG_TERRAIN_CALC}`,
    `BUILDING_DATA = ${data.BUILDING_DATA}`,
    `TERRAIN_DATA = ${data.TERRAIN_DATA}`,
    `AVG_WIND_DIRECTION = ${data.AVG_WIND_DIRECTION}`,
    `DISPERSION_CALC = ${data.DISPERSION_CALC}`,
    `DRY_DEPOSITION_CALC = ${data.DRY_DEPOSITION_CALC}`,
    `DRY_DEPO_VELOCITY = ${data.DRY_DEPO_VELOCITY}`,
    `FRICTION_VELOCITY = ${data.FRICTION_VELOCITY}`,
    `ROUGHNESS_LENGTH = ${data.ROUGHNESS_LENGTH}`,
    `TURBULENCE_GENERATION = ${data.TURBULENCE_GENERATION}`,
    `CONTINUE_CALC = ${data.CONTINUE_CALC}`,
    `SIBYL_MODEL = ${data.SIBYL_MODEL}`
  ];

  return outputLines.join('\n');
};
