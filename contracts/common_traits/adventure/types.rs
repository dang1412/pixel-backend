use openbrush::contracts::psp34::Id;
use openbrush::traits::{
    AccountId,
    Balance,
    String,
};

use openbrush::storage::{
    Mapping,
    MultiMapping,
};

#[derive(Default, Debug)]
#[openbrush::storage_item]
pub struct AdventureConfig {
    /// Price to mint a new beast
    mint_beast_price: Balance,
    /// Beast has this number of free lives a day, pay to play more
    beast_day_lives: u8,
    /// Pixel contract addr, for cross-contract call
    pixel_addr: Option<AccountId>,
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
    /// Config
    pub config: AdventureConfig,
    /// 1 pixel contains multiple beasts
    pub position_beast: MultiMapping<u16, u32>,
    /// 1 beast is located at 1 pixel
    /// beast will join match to move to other location
    pub beast_position: Mapping<u32, u16>,

    /// each new beast mint will use this current id, then increase it
    pub current_id: u32,

    /// match_id => all beasts on the match
    pub beast_onmatch: MultiMapping<u16, u32>,

    /// equipments
    pub beast_equipments: MultiMapping<u32, Id>,
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
