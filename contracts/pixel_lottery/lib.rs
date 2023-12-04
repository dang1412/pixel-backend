#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[openbrush::implementation(Ownable)]
#[openbrush::contract]
mod pixel_lottery {
    use openbrush::{
        contracts::ownable,
        traits::Storage,
    };

    use common_traits::lottery::{
        types::LotteryData,
        impls::{
            LotteryTrait,
            Internal as LotteryInternal,
            lotterytrait_external,
        },
    };

    // upgradable
    use common_traits::upgradable::UpgradableTrait;

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct PixelLottery {
        #[storage_field]
        ownable: ownable::Data,
        #[storage_field]
        lottery: LotteryData,
    }

    // lottery logic
    impl LotteryTrait for PixelLottery {}
    impl LotteryInternal for PixelLottery {}

    impl PixelLottery {
        /// Constructor that initializes the pixel contract address.
        #[ink(constructor)]
        pub fn new(pixel_ref: AccountId) -> Self {
            let mut instance = PixelLottery::default();
            instance.lottery.pixel_ref = Some(pixel_ref);

            instance
        }

        /// This function allow contract owner modifies the code which is used to execute calls to this contract address (`AccountId`).
        #[ink(message)]
        pub fn set_code(&mut self, code_hash: [u8; 32]) -> Result<(), OwnableError> {
            self._set_code(code_hash)?;

            Ok(())
        }
    }
}
