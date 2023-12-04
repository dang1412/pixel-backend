/// TODO
/// Should find a way to implement the Storage<data> things,
/// not just bring all the contract macros

#[openbrush::implementation(PSP34, PSP34Metadata, PSP34Enumerable, Ownable)]
#[openbrush::contract]
mod pixel_test {
    use openbrush::{
        contracts::{
            ownable,
            psp34,
            psp34::{
                extensions::{
                    enumerable,
                    metadata,
                    metadata::Id,
                },
                PSP34Impl,
            },
        },
        traits::Storage,
    };

    use crate::pixel::{
        types::PixelData,
        pixel_impls::{
            PixelTrait,
            Internal as PixelInternal,
            pixeltrait_external,
        },
    };

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
        pixeldata: PixelData,
    }

    // pixel logic
    impl PixelTrait for Pixel {}
    impl PixelInternal for Pixel {}

    impl Pixel {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            let mut instance = Self::default();
            instance.pixeldata.max_mint_amount = 25;
            instance.pixeldata.max_owned_amount = 256;

            instance
        }
    }

    #[test]
    fn default_works() {
        let mut pixel = Pixel::new();
        assert_eq!(1 + 1, 2);
        assert_eq!(pixel.get_max_mint_amount(), 25);
        assert_eq!(pixel.pixeldata.max_owned_amount, 256);
    }

    #[ink::test]
    fn mint_works() {
        let mut pixel = Pixel::new();
        // Get dev accounts
        let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
        // Set the contract as callee and Bob as caller.
        // let contract = ink::env::account_id::<ink::env::DefaultEnvironment>();
        // ink::env::test::set_callee::<ink::env::DefaultEnvironment>(contract);
        ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
        let _ = pixel.mint(vec![100,110]);

        assert_eq!(PSP34::owner_of(&pixel, Id::U16(100)), Some(accounts.bob));
        assert_eq!(PSP34::owner_of(&pixel, Id::U16(110)), Some(accounts.bob));

        ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        let _ = pixel.mint(vec![200]);

        assert_eq!(PSP34::owner_of(&pixel, Id::U16(200)), Some(accounts.alice));
    }

    #[ink::test]
    fn get_meaningful_pixels_works() {
        let mut pixel = Pixel::new();
        // Get dev accounts
        let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

        // Bob mint
        ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
        let _ = pixel.mint(vec![100,110]);

        // Alice mint
        ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        let _ = pixel.mint(vec![200]);

        assert_eq!(pixel.get_meaningful_pixels(), vec![(100, accounts.bob), (110, accounts.bob), (200, accounts.alice)]);
    }

}
