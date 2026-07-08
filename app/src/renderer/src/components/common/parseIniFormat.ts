export const parseIniFormat = (text: string): Record<string, string> => {
    const rawData: Record<string, string> = {};
    const lines = text.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0 || trimmedLine.startsWith(';')) continue; // 空行やコメントをスキップ

        const parts = trimmedLine.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            // 値は最初の'='以降のすべてとして扱う
            const value = parts.slice(1).join('=').trim(); 
            rawData[key] = value;
        }
    }
    return rawData;
};
