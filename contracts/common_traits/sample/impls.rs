use openbrush::traits::Storage;
use crate::lottery::types::{ LotteryData, LotteryError };

#[openbrush::trait_definition]
pub trait PixelTrait:
    Storage<LotteryData>
    // + Storage<ownable::Data>
    // + Storage<metadata::Data>
    // + PSP34Impl
    // + PSP34MetadataImpl
    // + psp34::extensions::metadata::Internal
    + Internal
{
    /// Mint one or more pixels
    #[ink(message, payable)]
    fn pick(&mut self, pixels: Vec<(u16, u128)>) -> Result<(), LotteryError> {
        
        for (pixel_id, sub_pixels) in pixels.iter() {

        }
        Ok(())
    }
}

pub trait Internal: Storage<LotteryData> {

}