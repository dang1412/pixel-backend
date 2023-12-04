#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[openbrush::implementation(PSP34, PSP34Metadata, PSP34Enumerable, Ownable)]
#[openbrush::contract]
mod pixel {
    use openbrush::{
        contracts::{
            ownable,
            psp34,
            psp34::{
                extensions::{
                    enumerable,
                    metadata,
                },
                PSP34Impl,
            },
            // reentrancy_guard,
        },
        traits::Storage,
    };

    use common_traits::pixel::{
        types::PixelData,
        pixel_impls::{
            PixelTrait,
            Internal as PixelInternal,
            pixeltrait_external,
        },
    };

    // upgradable
    use common_traits::upgradable::UpgradableTrait;

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct Pixel {
        #[storage_field]
        psp34: psp34::Data,
        #[storage_field]
        ownable: ownable::Data,
        #[storage_field]
        metadata: metadata::Data,
        #[storage_field]
        enumerable: enumerable::Data,
        #[storage_field]
        pixel: PixelData,
    }

    // pixel logic
    impl PixelTrait for Pixel {}
    impl PixelInternal for Pixel {}

    impl Pixel {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            let mut instance = Self::default();
            let caller = Self::env().caller();
            ownable::InternalImpl::_init_with_owner(&mut instance, caller);

            instance.pixel.max_mint_amount = 64;
            instance.pixel.max_owned_amount = 256;

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
