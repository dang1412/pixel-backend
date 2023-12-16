import { getPixelIndex } from './getPixelIndex';
export function getPixelIndexesFromArea(area, mapWidth) {
    var indexes = [];
    for (var j = 0; j < area.h; j++) {
        var index = getPixelIndex(area.x, area.y + j, mapWidth);
        for (var i = 0; i < area.w; i++) {
            indexes.push(index + i);
        }
    }
    return indexes;
}
