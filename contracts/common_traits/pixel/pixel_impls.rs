use ink::prelude::{
    string::{
        String,
        ToString,
    },
    vec::Vec,
};

use crate::utils;

use openbrush::{
    modifiers,
    traits::{
        AccountId,
        Balance,
        Storage,
    },
};

use openbrush::contracts::{
    ownable,
    ownable::only_owner,
    psp34,
    psp34::{
        extensions::{
            metadata,
            metadata::{
                Id,
                PSP34MetadataImpl,
            },
        },
        PSP34Error,
        PSP34Impl,
    },
};

use crate::pixel::{ 
    // pixel_traits::PixelTrait as _,
    types::{ PixelData, PixelImage, PixelError }
};

#[openbrush::trait_definition]
pub trait PixelTrait:
    Storage<PixelData>
    + Storage<psp34::Data>
    + Storage<ownable::Data>
    // + Storage<metadata::Data>
    + PSP34Impl
    + PSP34MetadataImpl
    + psp34::extensions::metadata::Internal
    + Internal
{
    /// Mint one or more pixels
    #[ink(message, payable)]
    fn mint(&mut self, pixel_ids: Vec<u16>) -> Result<(), PSP34Error> {
        self.check_amount(pixel_ids.len())?;
        self.check_value(Self::env().transferred_value(), pixel_ids.len() as u8)?;

        let caller = Self::env().caller();

        for pixel_id in pixel_ids {
            self._mint_to(caller, Id::U16(pixel_id))?;
            self.data::<PixelData>().meaningful_pixel_ids.insert(pixel_id);
        }

        Ok(())
    }

    /// Set image
    #[ink(message)]
    fn set_image(
        &mut self,
        pixel_id: u16,
        size: (u8, u8),
        image_cid: Vec<u8>,
        meta_cid: Option<Vec<u8>>,
        sub_pixel_id: Option<u8>,
    ) -> Result<(), PSP34Error> {
        let caller = Self::env().caller();

        // update images in storage
        let image = PixelImage {
            pixel_id,
            size,
            image_cid,
            meta_cid,
            sub_pixel_id
        };

        if sub_pixel_id.is_none() {
            let pixel_ids = self.check_owner_get_pixels(caller, pixel_id, size)?;
            self.set_main_image(image, pixel_ids)?;
        } else {
            // TODO check sub-pixels owner
            self.set_sub_image(image)?;
        }

        Ok(())
    }

    /// Get meaningful pixel ids
    /// (pixels not covered by image or image top-left corner pixels)
    #[ink(message)]
    fn get_meaningful_pixels(&self) -> Vec<(u16, AccountId)> {
        self.data::<PixelData>().meaningful_pixel_ids.clone().into_iter().map(|pixel_id| -> (u16, AccountId) {
            let owner = psp34::Internal::_owner_of(self, &Id::U16(pixel_id)).unwrap_or(AccountId::from([0u8; 32]));

            (pixel_id, owner)
        }).collect()
    }

    /// Get all images
    #[ink(message)]
    fn get_images(&self) -> Vec<PixelImage> {
        self.data::<PixelData>().meaningful_pixel_ids.clone().into_iter().filter_map(|pixel_id| {
            self.data::<PixelData>().images.get(pixel_id)
        }).collect()
    }

    /// Get all sub-images inside list of pixels
    #[ink(message)]
    fn get_multiple_sub_images(&self, pixel_ids: Vec<u16>) -> Vec<PixelImage> {
        let vecs = pixel_ids.into_iter().map(|pixel_id| {
            self.get_sub_images(pixel_id).into_iter()
        }).flat_map(|v| v).collect();

        vecs
    }

    /// Get all sub-images inside a pixel.
    #[ink(message)]
    fn get_sub_images(&self, pixel_id: u16) -> Vec<PixelImage> {
        let subpixels_value = self.data::<PixelData>().pixel_sub_image_ids.get(pixel_id).unwrap_or_default();
        // subpixel which has an image on it
        let subpixels = utils::get_subpixels_vec(subpixels_value);

        subpixels.into_iter().filter_map(|subpixel| {
            self.data::<PixelData>().sub_images.get((pixel_id, subpixel))
        }).collect()
    }

    /// Set new value for the baseUri
    #[ink(message)]
    #[modifiers(only_owner)]
    fn set_base_uri(&mut self, uri: String) -> Result<(), PSP34Error> {
        let id = PSP34Impl::collection_id(self);
        metadata::Internal::_set_attribute(self, id, String::from("baseUri"), uri);

        Ok(())
    }

    /// Withdraws funds to contract owner
    #[ink(message)]
    #[modifiers(only_owner)]
    fn withdraw(&mut self) -> Result<(), PSP34Error> {
        let balance = Self::env().balance();
        let current_balance = balance
            .checked_sub(Self::env().minimum_balance())
            .unwrap_or_default();
        let owner = self.data::<ownable::Data>().owner.get().unwrap().unwrap();
        Self::env()
            .transfer(owner, current_balance)
            .map_err(|_| PSP34Error::Custom(PixelError::WithdrawalFailed.as_str()))?;
        
        Ok(())
    }

    /// Set max number of tokens which could be minted per call
    #[ink(message)]
    #[modifiers(only_owner)]
    fn set_max_mint_amount(&mut self, max_mint_amount: u8) -> Result<(), PSP34Error> {
        self.data::<PixelData>().max_mint_amount = max_mint_amount;

        Ok(())
    }

    /// Get URI from token ID
    #[ink(message)]
    fn token_uri(&self, token_id: u64) -> Result<String, PSP34Error> {
        self.token_exists(Id::U64(token_id))?;
        let base_uri = PSP34MetadataImpl::get_attribute(
            self,
            PSP34Impl::collection_id(self),
            String::from("baseUri"),
        );
        let token_uri = base_uri.unwrap() + &token_id.to_string() + &String::from(".json");
        Ok(token_uri)
    }

    /// Get token price
    #[ink(message)]
    fn get_mint_price(&self) -> Balance {
        self.data::<PixelData>().price_per_mint
    }

    /// Get max number of tokens which could be minted per call
    #[ink(message)]
    fn get_max_mint_amount(&mut self) -> u8 {
        self.data::<PixelData>().max_mint_amount
    }
}

/// Helper trait for PayableMint
pub trait Internal: Storage<PixelData> + psp34::Internal {
    /// Check if the transferred mint values is as expected
    fn check_value(&self, transferred_value: u128, mint_amount: u8) -> Result<(), PSP34Error> {
        if let Some(value) = (mint_amount as u128).checked_mul(self.data::<PixelData>().price_per_mint) {
            if transferred_value == value {
                return Ok(())
            }
        }
        Err(PSP34Error::Custom(PixelError::BadMintValue.as_str()))
    }

    /// Check amount of tokens to be minted
    fn check_amount(&self, mint_amount: usize) -> Result<(), PSP34Error> {
        if mint_amount == 0 {
            return Err(PSP34Error::Custom(
                PixelError::CannotMintZeroTokens.as_str(),
            ))
        }
        if (mint_amount > 255) || (mint_amount as u8) > self.data::<PixelData>().max_mint_amount {
            return Err(PSP34Error::Custom(
                PixelError::TooManyTokensToMint.as_str(),
            ))
        }

        Ok(())
    }

    fn check_owner_get_pixels(&self, account: AccountId, pixel_id: u16, size: (u8, u8)) -> Result<Vec<u16>, PSP34Error> {
        let pixel_ids = utils::area_to_pixels(pixel_id, size.0, size.1);

        for pixel_id in pixel_ids.clone() {
            let owner = self._owner_of(&Id::U16(pixel_id)).ok_or(PSP34Error::TokenNotExists)?;
            if owner != account {
                return Err(PSP34Error::Custom(
                    PixelError::NotPixelOwner.as_str(),
                ))
            }
        }

        Ok(pixel_ids)
    }

    /// Check if token is minted
    fn token_exists(&self, id: Id) -> Result<(), PSP34Error> {
        self._owner_of(&id).ok_or(PSP34Error::TokenNotExists)?;
        Ok(())
    }

    fn set_main_image(&mut self, image: PixelImage, pixel_ids: Vec<u16>) -> Result<(), PSP34Error> {
        self.data::<PixelData>().images.insert(image.pixel_id, &image);

        // TODO reset price if any

        // TODO burn pixels covered by this image except top-left corner pixel

        // remove from meaningful pixels
        for pixel_id in pixel_ids.iter().skip(1) {
            self.data::<PixelData>().meaningful_pixel_ids.remove(pixel_id);
        }

        Ok(())
    }

    fn set_sub_image(&mut self, image: PixelImage) -> Result<(), PSP34Error> {
        if let Some(sub_pixel_id) = image.sub_pixel_id {
            let pixel_id = image.pixel_id;
            self.data::<PixelData>().sub_images.insert((pixel_id, sub_pixel_id), &image);

            // update sub-pixels list of this pixel
            // current value
            let value = self.data::<PixelData>().pixel_sub_image_ids.get(pixel_id).unwrap_or_default();
            // mark this sub_pixel_id 1
            let tmp = 1u128 << sub_pixel_id;
            // no subimage before, now mark that it has a subimage on the sub_pixel_id
            if value & tmp == 0 {
                self.data::<PixelData>().pixel_sub_image_ids.insert(pixel_id, &(value + tmp));
            }
        }
        
        Ok(())
    }

}