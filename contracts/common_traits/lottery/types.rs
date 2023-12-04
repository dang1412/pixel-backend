use openbrush::traits::{
    AccountId,
    Balance,
    BlockNumber,
};

use openbrush::storage::{
    Mapping,
    MultiMapping,
};

#[derive(Default, Debug)]
#[openbrush::storage_item]
pub struct LotteryConfig {
    /// Price per entry.
    price: Balance,
    /// Starting block of the lottery.
    start: BlockNumber,
    /// Length of the lottery (start + length = end).
    length: BlockNumber,
    /// Delay for choosing the winner of the lottery. (start + length + delay = payout).
    /// Randomness in the "payout" block will be used to determine the winner.
    delay: BlockNumber,
}

// #[derive(Default, Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
// #[cfg_attr(
//     feature = "std",
//     derive(scale_info::TypeInfo, StorageLayout)
// )]
// pub struct Pick {
//     pub pick_id: u32,
//     pub pixel_id: u16,
//     pub sub_pixels: u128,
//     pub account: AccountId,
//     pub date_picked: u32,
// }

#[derive(Default, Debug)]
#[openbrush::storage_item]
pub struct LotteryData {
    pub pixel_ref: Option<AccountId>,
    pub config: LotteryConfig,
    pub winning_pixel: (u16, u8),
    pub lottery_index: u64,

    pub pixel_count: Mapping<u16, u32>,
    pub sub_pixel_count: Mapping<(u16, u8), u32>,

    /// List of pixels an account picked
    /// AccountId None is for all
    pub account_picks: MultiMapping<Option<AccountId>, u16>,

    /// List of sub_pixels and account picked
    /// AccountId None is for all
    pub account_subpixel_picks: Mapping<(Option<AccountId>, u16), u128>,
}

/// The PSP34 error type. Contract will throw one of this errors.
#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum LotteryError {
    /// Lottery round already ended
    AlreadyEnded,
    /// Some sub_pixel already picked
    AlreadyPicked,
}
