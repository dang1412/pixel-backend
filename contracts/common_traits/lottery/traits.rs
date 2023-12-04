use ink::prelude::vec::Vec;

#[openbrush::wrapper]
pub type LotteryRef = dyn LotteryTraitRef;

/// Lottery method definitions.
/// Actually only methods used by other contract (cross-contract call) are needed.
#[openbrush::trait_definition]
pub trait LotteryTraitRef {
    #[ink(message, payable)]
    fn pick(&mut self, pixel_ids: Vec<(u16, u128)>);
}