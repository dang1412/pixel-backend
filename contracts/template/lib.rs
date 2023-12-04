#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[openbrush::implementation(Ownable)]
#[openbrush::contract]
mod pixel_sample {
    use ink::codegen::{
        EmitEvent,
        Env,
    };

    use openbrush::{
        contracts::ownable,
        traits::Storage,
    };

    use common_traits::sample::{
        types::SampleData,
        impls::{
            SampleTrait,
            Internal as SampleInternal,
            sampletrait_external,
        },
    };

    // upgradable
    use common_traits::upgradable::UpgradableTrait;

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct PixelSample {
        #[storage_field]
        ownable: ownable::Data,
    }

    impl PixelSample {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            PixelSample::default()
        }
    }
}
