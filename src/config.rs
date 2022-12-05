use serde::Deserialize;
use serde_dhall::StaticType;
use std::{iter, vec};

use crate::types::Party;

#[derive(Deserialize, StaticType)]
pub enum AllocationMethod {
    DHondt,
    WebsterSainteLague,
    Droop,
    Hare,
}

impl AllocationMethod {
    pub fn filename(&self) -> &'static str {
        match self {
            AllocationMethod::DHondt => "DHondt.feather",
            AllocationMethod::WebsterSainteLague => "SainteLague.feather",
            AllocationMethod::Droop => "Droop.feather",
            AllocationMethod::Hare => "Hare.feather",
        }
    }
}

pub type Configs = Vec<Config>;

#[derive(Deserialize, StaticType)]
pub struct Config {
    /// Which allocation methods to use for this election
    pub allocation_methods: Vec<AllocationMethod>,

    pub colorschemes: Vec<Colorscheme>,

    /// The directory to save output plots
    pub data_out_dir: String,

    /// Total number of seats in this district (district magnitude)
    pub n_seats: u32,

    /// Total number of voters to generate with the normal distribution
    pub n_voters: usize,

    /// Parties participating in the elections
    pub parties: NonEmpty<Party>,
}

// This isn't used because plots are handled by the Python script
// But this is here anyway to ensure the dhall config typechecks
// Without needing to use dhall beforehand
#[derive(Deserialize, StaticType)]
pub struct Colorscheme {
    palette: Palette,
    plot_out_dir: String,
}

#[derive(Deserialize, StaticType)]
pub enum Palette {
    /// Number of seats for a party, continuous color palette
    /// the field is the name of the party to colorize
    Continuous(String),
    /// Number of seats for a party, using a matplotlib color palette
    Discrete {
        party_to_colorize: String,
        palette_name: String,
    },
    /// Average colors of all parties, weighted by their number of seats
    Average,
}

#[derive(Deserialize, StaticType, Clone, Debug)]
pub struct Rgb {
    pub r: u16,
    pub g: u16,
    pub b: u16,
}

// Implentation for the NonEmpty dhall type
#[derive(Deserialize, StaticType)]
pub struct NonEmpty<T> {
    head: T,
    tail: Vec<T>,
}

// Copied from https://docs.rs/nonempty/
impl<T> IntoIterator for NonEmpty<T> {
    type Item = T;
    type IntoIter = iter::Chain<iter::Once<T>, vec::IntoIter<Self::Item>>;

    fn into_iter(self) -> Self::IntoIter {
        iter::once(self.head).chain(self.tail)
    }
}
