use serde::Deserialize;
use serde_dhall::StaticType;
use std::{iter, vec};

use crate::{types::XY, AllocationMethod};

#[derive(Deserialize)]
pub struct Configs {
    pub configs: Vec<Config>,
}

#[derive(Deserialize)]
pub struct Config {
    /// Which allocation methods to use for this election
    pub allocation_methods: Vec<AllocationMethod>,

    /// The directory to save output plots
    pub data_out_dir: String,

    /// Total number of seats in this district (district magnitude)
    pub n_seats: usize,

    /// Total number of voters to generate with the normal distribution
    pub n_voters: usize,

    /// Standard deviation of the normal distribution
    pub stdev: f32,

    /// Parties participating in the elections
    pub parties: NonEmpty<XY>,
}

// Implentation for the NonEmpty dhall type
#[derive(Deserialize, StaticType, Clone)]
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
