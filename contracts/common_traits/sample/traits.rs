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

#[openbrush::wrapper]
pub type LotteryRef = dyn LotteryTraitRef;

/// Lottery method definitions.
/// Actually only methods used by other contract (cross-contract call) are needed.
#[openbrush::trait_definition]
pub trait LotteryTraitRef {
    #[ink(message, payable)]
    fn pick(&mut self, pixel_ids: Vec<(u16, u128)>);
}