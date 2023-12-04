use ink::prelude::vec::Vec;

pub const WORLD_WIDTH: u8 = 100;
pub const WORLD_HEIGHT: u8 = 100;
pub const MAX_PIXEL_ID: u16 = (WORLD_WIDTH as u16) * (WORLD_HEIGHT as u16);

pub const PIXEL_EXPAND_X: u8 = 10;
pub const PIXEL_EXPAND_Y: u8 = 10;
pub const MAX_SUB_PIXEL_ID: u8 = PIXEL_EXPAND_X * PIXEL_EXPAND_Y;

///
pub fn pixel_id_to_position(pixel_id: u16) -> (u8, u8) {
    let y = pixel_id / (WORLD_WIDTH as u16);
    let x = pixel_id % (WORLD_WIDTH as u16);

    (x as u8, y as u8)
}

///
pub fn position_to_pixel_id(x: u8, y: u8, w: u8) -> u16 {
    y as u16 * w as u16 + x as u16
}

///
pub fn area_to_pixels(pixel_id: u16, w: u8, h: u8) -> Vec<u16> {
    let mut pixel_ids = Vec::<u16>::new();
    let (x, y) = pixel_id_to_position(pixel_id);
    for i in 0..w {
        for j in 0..h {
            let pixel_id = position_to_pixel_id(x + i, y + j, WORLD_WIDTH);
            pixel_ids.push(pixel_id);
        }
    }

    pixel_ids
}

///
pub fn get_subpixels_vec(value: u128) -> Vec<u8> {
    let mut vec = Vec::new();
    let mut tmp = 1;
    let mut i = 0;
    while tmp <= value {
        if value & tmp > 0 {
            vec.push(i)
        }

        i = i + 1;
        tmp = tmp << 1;
    }

    vec
}

///
pub fn get_subpixels_value(subpixels: Vec<u8>) -> u128 {
    let mut val = 0u128;

    for i in subpixels {
        val |= 1u128 << i;
    }

    val
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pixel_id_to_position() {
        assert_eq!(pixel_id_to_position(10), (10, 0));
    }
}
