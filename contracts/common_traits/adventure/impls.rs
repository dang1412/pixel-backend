use ink::prelude::vec::Vec;

use openbrush::{
    modifiers,
    traits::{
        AccountId,
        Balance,
        Storage,
        String,
    },
};

use openbrush::contracts::{
    ownable,
    ownable::only_owner,
    psp34,
    psp34::{
        extensions::{
            metadata,
            metadata::{
                Id,
                PSP34MetadataImpl,
            },
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
    /// Mint one or more pixels
    #[ink(message, payable)]
    fn mint(&mut self, name: String, beast_type: String) -> Result<u32, AdventureError> {
        // self.check_amount(pixel_ids.len())?;
        // self.check_value(Self::env().transferred_value(), pixel_ids.len() as u8)?;

        let caller = Self::env().caller();

        let id = self.data::<AdventureData>().max_id;
        
        self._mint_to(caller, Id::U32(id)).map_err(|_| AdventureError::CannotMint)?;

        self._set_attribute(Id::U32(id), "name".into(), name);
        self._set_attribute(Id::U32(id), "type".into(), beast_type);

        self.data::<AdventureData>().max_id = id + 1;

        Ok(id)
    }

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

    #[ink(message)]
    fn get_beast_onboard(&self) -> Vec<(u32, u16)> {
        let count = self.data::<AdventureData>().beast_onboard.count(&0);

        let beast_positions: Vec<(u32, u16)> = (0..count)
            .filter_map(|ind| { self.data::<AdventureData>().beast_onboard.get_value(&0, &ind) })
            .filter_map(|beast_id| {
                let position = self.data::<AdventureData>().beast_position.get(&beast_id)?;
                Some((beast_id, position))
            }).collect();

        beast_positions
    }

    // #[ink(message)]
    // fn get_alives(&self) -> Vec<(u16, u16)> {
    //     let length = self.data::<AdventureData>().length;

    //     let positions: Vec<(u16, u16)> = (0..length).map(|ind| { self.data::<AdventureData>().alives.get(&ind).unwrap() })
    //         .map(|beast_id| {
    //             let position = self.data::<AdventureData>().beast_position.get(&beast_id).unwrap();
    //             (beast_id, position)
    //         }).collect();

    //     positions
    // }

    /// Bring a beast onboard
    #[ink(message)]
    fn onboard(&mut self, beast_id: u32, target: u16) -> Result<(), AdventureError> {
        // check owner
        let caller = Self::env().caller();
        self.check_owner(caller, beast_id)?;

        // put on the board
        self.set_pos(beast_id, target)?;

        self.data::<AdventureData>().beast_onboard.insert(&0, &beast_id);

        // insert into alives array
        // let index = self.data::<AdventureData>().length;
        // self.data::<AdventureData>().length = index + 1;
        // self.data::<AdventureData>().alives.insert(&index, &id);
        // self.data::<AdventureData>().beast_index.insert(&id, &index);

        Ok(())
    }

    /// 
    #[ink(message)]
    fn action_move(&mut self, beast_id: u32, target: u16) -> Result<(), AdventureError> {

        // check owner
        let caller = Self::env().caller();
        self.check_owner(caller, beast_id)?;

        // check alive
        self.check_alive(beast_id)?;
        // set position
        self.set_pos(beast_id, target)?;
        
        Ok(())
    }

    ///
    #[ink(message)]
    fn action_shoot(&mut self, beast_id: u32, target: u16) -> Result<(), AdventureError> {
        
        let caller = Self::env().caller();
        self.check_owner(caller, beast_id)?;

        self.shoot(beast_id, target)?;

        Ok(())
    }

    #[ink(message)]
    #[modifiers(only_owner)]
    fn bulk_actions(&mut self, moves: Vec<(u32, u16)>, shoots: Vec<(u32, u16)>) -> Result<(), PSP34Error> {
        // move actions
        for (beast_id, to) in moves {
            // check alive
            let rs = self.check_alive(beast_id);
            if rs.is_ok() {
                let _ = self.set_pos(beast_id, to);
            }
        }

        // shoot actions
        for (beast_id, to) in shoots {
            let _ = self.shoot(beast_id, to);
        }

        Ok(())
    }
}

pub trait Internal: Storage<AdventureData> + psp34::Internal {
    fn kill(&mut self, beast_id: u32) {
        // let index = self.data::<AdventureData>().beast_index.get(&beast_id).unwrap();
        // self.data::<AdventureData>().beast_index.remove(&beast_id);

        // let length = self.data::<AdventureData>().length;
        // let last_char = self.data::<AdventureData>().alives.get(&(length - 1)).unwrap();

        // self.data::<AdventureData>().alives.insert(&index, &last_char);
        // self.data::<AdventureData>().length = length - 1;

        self.data::<AdventureData>().beast_onboard.remove_value(&0, &beast_id);

        let pos = self.data::<AdventureData>().beast_position.get(&beast_id).unwrap();
        self.data::<AdventureData>().position_beast.remove(&pos);

        self._emit_beast_kill(beast_id);
    }

    fn set_pos(&mut self, beast_id: u32, to: u16) -> Result<(), AdventureError> {
        // check if position to empty
        if self.data::<AdventureData>().position_beast.get(&to).is_some() {
            return Err(AdventureError::CannotMove);
        }

        // set beast position
        self.data::<AdventureData>().position_beast.insert(&to, &beast_id);
        self.data::<AdventureData>().beast_position.insert(&beast_id, &to);

        self._emit_beast_move(beast_id, to);

        Ok(())
    }

    fn shoot(&mut self, beast_id: u32, to: u16) -> Result<(), AdventureError> {
        self.check_alive(beast_id)?;

        if let Some(id) = self.data::<AdventureData>().position_beast.get(&to) {
            self.kill(id);
        }

        self._emit_beast_shoot(beast_id, to);

        Ok(())
    }

    fn check_alive(&self, beast_id: u32) -> Result<(), AdventureError> {
        if !self.data::<AdventureData>().beast_onboard.contains_value(&0, &beast_id) {
            return Err(AdventureError::AlreadyDeath);
        }

        Ok(())
    }

    fn check_owner(&self, account: AccountId, beast_id: u32) -> Result<(), AdventureError> {
        let owner = self._owner_of(&Id::U32(beast_id)).ok_or(AdventureError::NotExists)?;
        if owner != account {
            return Err(AdventureError::NotOwner)
        }

        Ok(())
    }

    fn _emit_beast_move(&self, beast_id: u32, to: u16);
    fn _emit_beast_shoot(&self, beast_id: u32, to: u16);
    fn _emit_beast_kill(&self, beast_id: u32);
}