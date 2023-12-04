/// TODO
/// Should find a way to implement the Storage<data> things,
/// not just bring all the contract macros

#[openbrush::implementation(Ownable)]
#[openbrush::contract]
mod lottery_test {
    use openbrush::{
        contracts::ownable,
        traits::Storage,
    };

    use crate::lottery::{
        types::LotteryData,
        impls::{
            LotteryTrait,
            Internal as LotteryInternal,
            lotterytrait_external,
        },
    };

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct Lottery {
        #[storage_field]
        ownable: ownable::Data,
        #[storage_field]
        lotterydata: LotteryData,
    }

    // lottery logic
    impl LotteryTrait for Lottery {}
    impl LotteryInternal for Lottery {}

    impl Lottery {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(pixel_ref: AccountId) -> Self {
            let mut instance = Self::default();
            instance.lotterydata.pixel_ref = Some(pixel_ref);

            instance
        }
    }

    #[test]
    fn default_works() {
        let mut lottery = Lottery::new([0u8; 32]);
        assert_eq!(lottery.lotterydata.pixel_ref, [0u8; 32]);
    }
}
