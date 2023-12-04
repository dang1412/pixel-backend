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
pub type AdventureRef = dyn AdventureTraitRef;

/// Adventure method definitions.
/// Actually only methods used by other contract (cross-contract call) are needed.
#[openbrush::trait_definition]
pub trait AdventureTraitRef {
    #[ink(message, payable)]
    fn pick(&mut self, pixel_ids: Vec<(u16, u128)>);
}