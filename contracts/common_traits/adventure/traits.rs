use ink::prelude::string::String;

use crate::adventure::types::AdventureError;

#[openbrush::wrapper]
pub type AdventureRef = dyn AdventureTraitRef;

/// Adventure method definitions.
/// Actually only methods used by other contract (cross-contract call) are needed.
#[openbrush::trait_definition]
pub trait AdventureTraitRef {
    #[ink(message, payable)]
    fn mint(&mut self, name: String, beast_type: String) -> Result<u32, AdventureError>;
}