use openbrush::{traits::{
    Balance,
    String,
}, storage::MultiMapping};

use ink::{
    storage::{ Mapping, traits::StorageLayout },
    prelude::{
        vec::Vec,
        collections::BTreeSet,
    },
};

#[derive(Default, Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
pub struct PixelImage {
    pub pixel_id: u16,
    pub size: (u8, u8),
    pub image_cid: Vec<u8>,
    pub meta_cid: Option<Vec<u8>>,
    pub sub_pixel_id: Option<u8>,   // in case sub-image
}

#[derive(Default, Debug)]
#[openbrush::storage_item]
pub struct PixelData {
    pub max_mint_amount: u8,
    pub max_owned_amount: u16,
    pub price_per_mint: Balance,

    /// images
    pub images: Mapping<u16, PixelImage>,
    /// map a pixel to the top-left pixel (if image on it)
    pub pixel_image_topleft: Mapping<u16, u16>,
    pub meaningful_pixel_ids: BTreeSet<u16>,

    /// sub-images
    pub sub_images: Mapping<(u16, u8), PixelImage>,
    /// map from a pixel_id to a list of sub_pixel_ids (represented by u128) which has sub_image on it.
    pub pixel_sub_image_ids: Mapping<u16, u128>,

    /// market
    pub prices: Mapping<u16, Balance>,
    // pub onsale_pixel_ids: BTreeSet<u16>,
    pub onsale_pixel_ids: MultiMapping<(), u16>,
}

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum PixelError {
    BadMintValue,
    CannotMintZeroTokens,
    TooManyTokensToMint,
    WithdrawalFailed,
    NotPixelOwner,
}

impl PixelError {
    pub fn as_str(&self) -> String {
        match self {
            PixelError::BadMintValue => String::from("BadMintValue"),
            PixelError::CannotMintZeroTokens => String::from("CannotMintZeroTokens"),
            PixelError::TooManyTokensToMint => String::from("TooManyTokensToMint"),
            PixelError::WithdrawalFailed => String::from("WithdrawalFailed"),
            PixelError::NotPixelOwner => String::from("NotPixelOwner"),
        }
    }
}
