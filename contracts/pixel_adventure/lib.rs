#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[openbrush::implementation(PSP34, PSP34Metadata, PSP34Enumerable, Ownable)]
#[openbrush::contract]
mod pixel_adventure {
    use ink::codegen::{
        EmitEvent,
        Env,
    };

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
        },
        traits::Storage,
    };

    use common_traits::adventure::{
        types::AdventureData,
        impls::{
            AdventureTrait,
            Internal as AdventureInternal,
            adventuretrait_external,
        },
    };

    // upgradable
    use common_traits::upgradable::UpgradableTrait;

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct PixelAdventure {
        #[storage_field]
        psp34: psp34::Data,
        #[storage_field]
        ownable: ownable::Data,
        #[storage_field]
        metadata: metadata::Data,
        #[storage_field]
        enumerable: enumerable::Data,
        #[storage_field]
        adventure_data: AdventureData
    }

    #[ink(event)]
    pub struct BeastMove {
        beast_id: u32,
        pixel_id: u16,
    }

    #[ink(event)]
    pub struct BeastJoinMatch {
        match_id: u16,
        beast_id: u32,
    }

    #[ink(event)]
    pub struct CharacterKill {
        beast_id: u32,
    }

    // adventure logic
    impl AdventureTrait for PixelAdventure {}
    impl AdventureInternal for PixelAdventure {
        fn _emit_beast_move(&self, beast_id: u32, pixel_id: u16) {
            self.env().emit_event( BeastMove { beast_id, pixel_id });
        }

        fn _emit_beast_join_match(&self, match_id: u16, beast_id: u32) {
            self.env().emit_event( BeastJoinMatch { match_id, beast_id });
        }
    }

    impl PixelAdventure {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            let mut instance = PixelAdventure::default();
            let caller = Self::env().caller();
            ownable::InternalImpl::_init_with_owner(&mut instance, caller);

            instance
        }

        /// This function allow contract owner modifies the code which is used to execute calls to this contract address (`AccountId`).
        #[ink(message)]
        pub fn set_code(&mut self, code_hash: [u8; 32]) -> Result<(), OwnableError> {
            self._set_code(code_hash)?;

            Ok(())
        }
    }

    #[ink::test]
    fn test_mint() {
        // set caller Alice
        let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
        ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

        let mut adventure = PixelAdventure::new();

        assert_eq!(adventure.mint_beast("Dang".into(), "0".into()), Ok(0));
        assert_eq!(adventure.mint_beast("Razor".into(), "2".into()), Ok(1));
        assert_eq!(adventure.join_match(0, 0), Ok(()));
        assert_eq!(adventure.join_match(0, 1), Ok(()));

        assert_eq!(adventure.adventure_data.current_id, 2);

        let rs = adventure.get_beast_onmatch(0);

        assert_eq!(rs, vec![0, 1]);
    }
}
