use ink::prelude::vec::Vec;

use openbrush::{
    modifiers,
    traits::{
        AccountId,
        Storage,
        String,
    },
};

use openbrush::contracts::{
    ownable,
    ownable::only_owner,
    psp34,
    psp34::{
        extensions::metadata::{
            Id,
            PSP34MetadataImpl,
        },
        PSP34Error,
        PSP34Impl,
    },
};

use crate::adventure::types::{ AdventureData, AdventureError, BeastAttributes };

#[openbrush::trait_definition]
pub trait AdventureTrait:
    Storage<AdventureData>
    + Storage<ownable::Data>
    + PSP34Impl
    + PSP34MetadataImpl
    + psp34::extensions::metadata::Internal
    + Internal
{
    /// Mint a new beast
    #[ink(message, payable)]
    fn mint_beast(&mut self, name: String, beast_type: String) -> Result<u32, AdventureError> {
        let caller = Self::env().caller();

        let id = self.data::<AdventureData>().current_id;
        
        self._mint_to(caller, Id::U32(id)).map_err(|_| AdventureError::CannotMint)?;

        self._set_attribute(Id::U32(id), "name".into(), name);
        self._set_attribute(Id::U32(id), "type".into(), beast_type);

        self.data::<AdventureData>().current_id = id + 1;

        Ok(id)
    }

    /// Get beast attributes - default attributes of beast type combine with equiping items
    #[ink(message)]
    fn get_beast_attrs(&self, beast_id: u32) -> BeastAttributes {
        let name = self.get_attribute(Id::U32(beast_id), "name".into()).unwrap_or_default();
        let beast_type = self.get_attribute(Id::U32(beast_id), "type".into()).unwrap_or_default();

        BeastAttributes {
            name,
            beast_type,
            shoot_range: 4,
            move_range: 4,
        }
    }

    /// Get list of beast_id that being on a match
    #[ink(message)]
    fn get_beast_onmatch(&self, match_id: u16) -> Vec<u32> {
        let count = self.data::<AdventureData>().beast_onmatch.count(&match_id);

        let beast_ids: Vec<u32> = (0..count)
            .filter_map(|ind| { self.data::<AdventureData>().beast_onmatch.get_value(&match_id, &ind) })
            .collect();

        beast_ids
    }

    /// Bring a beast into a match, at the current position
    #[ink(message)]
    fn join_match(&mut self, match_id: u16, beast_id: u32) -> Result<(), AdventureError> {
        // check owner
        let caller = Self::env().caller();
        self.check_owner(caller, beast_id)?;

        self.data::<AdventureData>().beast_onmatch.insert(&match_id, &beast_id);

        Ok(())
    }

    /// Moved by beast owner
    /// - when move to other land, cost will be count based on distance between 2 lands
    /// - move within current land will be no cost
    #[ink(message, payable)]
    fn move_beast(&mut self, beast_id: u32, pixel_id: u16) -> Result<(), AdventureError> {
        // check owner
        let caller = Self::env().caller();
        self.check_owner(caller, beast_id)?;

        // get current pixel_id or default starting from central (50, 50)
        let _ = self.data::<AdventureData>().beast_position.get(&beast_id).unwrap_or(5050);
        // calculate fee and check if pay enough

        // move
        self.set_pos(beast_id, pixel_id);
        
        Ok(())
    }

    /// Moved by admin
    #[ink(message, payable)]
    #[modifiers(only_owner)]
    fn move_beast_by_admin(&mut self, beast_id: u32, pixel_id: u16) -> Result<(), PSP34Error> {
        self.set_pos(beast_id, pixel_id);

        Ok(())
    }
}

pub trait Internal: Storage<AdventureData> + psp34::Internal {
    fn set_pos(&mut self, beast_id: u32, pixel_id: u16) {
        // remove beast_id from old position
        if let Some(old_pixel_id) = self.data::<AdventureData>().beast_position.get(&beast_id) {
            self.data::<AdventureData>().position_beast.remove_value(&old_pixel_id, &beast_id);
        }

        // set beast new position
        self.data::<AdventureData>().position_beast.insert(&pixel_id, &beast_id);
        self.data::<AdventureData>().beast_position.insert(&beast_id, &pixel_id);

        self._emit_beast_move(beast_id, pixel_id);
    }

    fn check_owner(&self, account: AccountId, beast_id: u32) -> Result<(), AdventureError> {
        let owner = self._owner_of(&Id::U32(beast_id)).ok_or(AdventureError::NotExists)?;
        if owner != account {
            return Err(AdventureError::NotOwner)
        }

        Ok(())
    }

    fn _emit_beast_move(&self, beast_id: u32, pixel_id: u16);
    fn _emit_beast_join_match(&self, match_id: u16, beast_id: u32);
}