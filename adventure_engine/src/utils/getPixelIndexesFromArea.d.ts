export interface PixelArea {
    x: number;
    y: number;
    w: number;
    h: number;
}
export declare function getPixelIndexesFromArea(area: PixelArea, mapWidth: number): number[];
