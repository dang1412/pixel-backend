use ink::prelude::{
    string::String,
    vec::Vec,
};

use openbrush::{
    traits::{
        AccountId,
        Balance,
    },
    contracts::psp34::PSP34Error,
};

use crate::pixel::types::PixelImage;

#[openbrush::wrapper]
pub type PixelRef = dyn PixelTraitRef;

/// Pixel method definitions.
/// Actually only methods used by other contract (cross-contract call) are needed.
#[openbrush::trait_definition]
pub trait PixelTraitRef {
    /// Mint one or more pixels
    #[ink(message, payable)]
    fn mint(&mut self, pixel_ids: Vec<u16>) -> Result<(), PSP34Error>;

    /// Set image
    #[ink(message)]
    fn set_image(
        &mut self,
        pixel_id: u16,
        size: (u8, u8),
        image_cid: Vec<u8>,
        meta_cid: Option<Vec<u8>>,
        sub_pixel_id: Option<u8>,
    ) -> Result<(), PSP34Error>;

    /// Get meaningful pixel ids
    /// (pixels not covered by image or image top-left corner pixels)
    #[ink(message)]
    fn get_meaningful_pixels(&self) -> Vec<(u16, AccountId)>;

    /// Get all images
    #[ink(message)]
    fn get_images(&self) -> Vec<PixelImage>;

    /// Get all sub-images inside a pixel.
    #[ink(message)]
    fn get_sub_images(&self, pixel_id: u16) -> Vec<PixelImage>;

    /// Get all sub-images inside list of pixels
    #[ink(message)]
    fn get_multiple_sub_images(&self, pixel_ids: Vec<u16>) -> Vec<PixelImage>;

    /// Set new value for the baseUri
    #[ink(message)]
    fn set_base_uri(&mut self, uri: String) -> Result<(), PSP34Error>;

    /// Withdraws funds to contract owner
    #[ink(message)]
    fn withdraw(&mut self) -> Result<(), PSP34Error>;

    /// Set max number of tokens which could be minted per call
    #[ink(message)]
    fn set_max_mint_amount(&mut self, max_mint_amount: u8) -> Result<(), PSP34Error>;

    /// Get URI from token ID
    #[ink(message)]
    fn token_uri(&self, token_id: u64) -> Result<String, PSP34Error>;

    /// Get token price
    #[ink(message)]
    fn get_mint_price(&self) -> Balance;

    /// Get max number of tokens which could be minted per call
    #[ink(message)]
    fn get_max_mint_amount(&mut self) -> u8;
}