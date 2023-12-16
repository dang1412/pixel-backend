export function getPixelIndex(x, y, w) {
    return y * w + x;
}
export function getPixelXYFromIndex(index, w) {
    var x = index % w;
    var y = (index - x) / w;
    return [x, y];
}
