export function formatSibylData(data) {
    let content = '';

    // 基本情報
    content += `ctitle = ${data.title}\n`;
    content += `file = RESP_${data.doseRateType === 'ambient' ? 'H' : 'K'}_${data.nuclide}.bin\n`;
    content += `irs = ${data.cellSize}\n`;

    // 線源領域
    content += `ns_x_sta = ${data.source.xStart}\n`;
    content += `ns_x_end = ${data.source.xEnd}\n`;
    content += `ns_y_sta = ${data.source.yStart}\n`;
    content += `ns_y_end = ${data.source.yEnd}\n`;
    content += `ns_z_sta = ${data.source.zStart}\n`;
    content += `ns_z_end = ${data.source.zEnd}\n`;

    // 標的領域
    content += `nt_x_sta = ${data.target.xStart}\n`;
    content += `nt_x_end = ${data.target.xEnd}\n`;
    content += `nt_y_sta = ${data.target.yStart}\n`;
    content += `nt_y_end = ${data.target.yEnd}\n`;

    // 障害物パラメータ
    content += `att = ${data.obstacle.gamma}\n`;
    content += `den = ${data.obstacle.effectiveDensity}\n`;
    content += `nsh_max = ${data.obstacle.zMaxCell}\n`;

    // 計算領域
    content += `nc_x_sta = ${data.calcArea.xStart}\n`;
    content += `nc_x_end = ${data.calcArea.xEnd}\n`;
    content += `nc_y_sta = ${data.calcArea.yStart}\n`;
    content += `nc_y_end = ${data.calcArea.yEnd}\n`;

    return content;
}

