use ink::prelude::vec::Vec;
use openbrush::traits::{Storage, AccountId};
use openbrush::contracts::ownable;

use crate::lottery::types::{ LotteryData, LotteryError };
use crate::utils;

#[openbrush::trait_definition]
pub trait LotteryTrait:
    Storage<LotteryData>
    + Storage<ownable::Data>
    + Internal
{
    /// pick one or more sub_pixels
    #[ink(message, payable)]
    fn pick(&mut self, pixels: Vec<(u16, u128)>) -> Result<(), LotteryError> {
        // check if enough value

        let caller = Self::env().caller();

        // check if not picked

        for (pixel_id, sub_pixels) in pixels.iter() {
            self.pick_pixel(caller, *pixel_id, *sub_pixels)?;
        }

        Ok(())
    }

    /// get the pixels and number of pick
    #[ink(message)]
    fn get_pixel_picked_count(&self) -> Vec<(u16, u32)> {
        // number of pixels which are picked by at least 1
        let pixel_count = self.data::<LotteryData>().account_picks.count(&None);
        // loop through all picked pixels and get the count
        let pixel_picked_count: Vec<(u16, u32)> = (0..pixel_count)
            .filter_map(|index| {
                let pixel_id = self.data::<LotteryData>().account_picks.get_value(&None, &index)?;
                let count = self.data::<LotteryData>().pixel_count.get(&pixel_id)?;

                Some((pixel_id, count))
            })
            .collect();

        pixel_picked_count
    }

    /// get the sub_pixels and number of pick (from 1 pixel)
    #[ink(message)]
    fn get_subpixel_picked_count(&self, pixel_id: u16) -> Vec<(u8, u32)> {
        let sub_pixels_value = self.data::<LotteryData>().account_subpixel_picks.get(&(None, pixel_id)).unwrap_or_default();
        let sub_pixels_vec = utils::get_subpixels_vec(sub_pixels_value);

        sub_pixels_vec.into_iter().filter_map(|sub_pixel_id| {
            let count = self.data::<LotteryData>().sub_pixel_count.get(&(pixel_id, sub_pixel_id))?;

            Some((sub_pixel_id, count))
        }).collect()
    }
}

pub trait Internal: Storage<LotteryData> {
    fn pick_pixel(&mut self, account: AccountId, pixel_id: u16, subpixels: u128) -> Result<(), LotteryError> {

        let current = self.data::<LotteryData>().account_subpixel_picks.get(&(Some(account), pixel_id)).unwrap_or_default();

        // check if some picked (some overlap)
        if current & subpixels > 0 {
            return Err(LotteryError::AlreadyPicked);
        }

        // update account picks
        self.data::<LotteryData>().account_picks.insert(&Some(account), &pixel_id);
        // all picks
        self.data::<LotteryData>().account_picks.insert(&None, &pixel_id);

        // update account subpixel picks
        self.data::<LotteryData>().account_subpixel_picks.insert(&(Some(account), pixel_id), &(current | subpixels));
        // all subpixel picks
        let current_all = self.data::<LotteryData>().account_subpixel_picks.get(&(None, pixel_id)).unwrap_or_default();
        self.data::<LotteryData>().account_subpixel_picks.insert(&(None, pixel_id), &(current_all | subpixels));


        // sub pixel vec
        let sub_pixel_vec = utils::get_subpixels_vec(subpixels);

        // update pixel count
        let count = self.data::<LotteryData>().pixel_count.get(&pixel_id).unwrap_or_default();
        self.data::<LotteryData>().pixel_count.insert(&pixel_id, &count.saturating_add(sub_pixel_vec.len() as u32));

        // update sub pixels count
        for sub_pixel_id in sub_pixel_vec.iter() {
            let count = self.data::<LotteryData>().sub_pixel_count.get(&(pixel_id, *sub_pixel_id)).unwrap_or_default();
            self.data::<LotteryData>().sub_pixel_count.insert(&(pixel_id, *sub_pixel_id), &count.saturating_add(1));
        }

        // TODO
        // - Pay pixel owner

        Ok(())
    }
}
