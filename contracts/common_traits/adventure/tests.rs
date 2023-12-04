/// TODO
/// Should find a way to implement the Storage<data> things,
/// not just bring all the contract macros

#[openbrush::implementation(Ownable)]
#[openbrush::contract]
mod adventure_test {
    use openbrush::{
        contracts::ownable,
        traits::Storage,
    };

    use crate::adventure::{
        types::AdventureData,
        impls::{
            AdventureTrait,
            Internal as AdventureInternal,
            adventuretrait_external,
        },
    };

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct Adventure {
        #[storage_field]
        ownable: ownable::Data,
        #[storage_field]
        adventuredata: AdventureData,
    }

    // adventure logic
    impl AdventureTrait for Adventure {}
    impl AdventureInternal for Adventure {}

    impl Adventure {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            let mut instance = Self::default();

            instance
        }
    }

    #[test]
    fn default_works() {
        let mut adventure = Adventure::new([0u8; 32]);
        assert_eq!(adventure.adventuredata.pixel_ref, [0u8; 32]);
    }
}
