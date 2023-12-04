use openbrush::traits::{
    // AccountId,
    // Balance,
    // BlockNumber,
    String,
};

use openbrush::storage::{
    Mapping,
    MultiMapping,
};

use ink::storage::traits::StorageLayout;

#[derive(Default, Debug)]
#[openbrush::storage_item]
pub struct AdventureConfig {
    // /// Price per entry.
    // price: Balance,
    // /// Starting block of the lottery.
    // start: BlockNumber,
    // /// Length of the lottery (start + length = end).
    // length: BlockNumber,
    // /// Delay for choosing the winner of the lottery. (start + length + delay = payout).
    // /// Randomness in the "payout" block will be used to determine the winner.
    // delay: BlockNumber,
}

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub struct BeastAttributes {
    pub name: String,
    pub beast_type: String,
    pub shoot_range: u8,
    pub move_range: u8,
}

#[derive(Default, Debug)]
#[openbrush::storage_item]
pub struct AdventureData {
    pub position_beast: Mapping<u16, u32>,
    pub beast_position: Mapping<u32, u16>,

    // pub beast_index: Mapping<u16, u16>,
    // pub alives: Mapping<u16, u16>,
    // pub length: u16,

    pub max_id: u32,

    pub beast_onboard: MultiMapping<u16, u32>,
}

/// The Adventure error type. Contract will throw one of this errors.
#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum AdventureError {
    AlreadyDeath,
    CannotMove,
    CannotMint,
    NotOwner,
    NotExists,
}
