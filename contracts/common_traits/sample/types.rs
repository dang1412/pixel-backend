use openbrush::traits::{
    AccountId,
    Balance,
    BlockNumber,
};

use openbrush::storage::{
    Mapping,
    MultiMapping,
};

use ink::storage::traits::StorageLayout;

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
    config: LotteryConfig,
    winning_pixel: (u16, u8),
    lottery_index: u64,

    pixel_count: Mapping<u16, u32>,
    sub_pixel_count: Mapping<(u16, u8), u32>,

    account_picks: MultiMapping<AccountId, u16>,
    account_subpixel_picks: Mapping<(AccountId, u16), u128>,
}

/// The PSP34 error type. Contract will throw one of this errors.
#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum LotteryError {
    /// Returned if owner approves self
    AlreadyEnded
}