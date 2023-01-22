use serde::Deserialize;
#[cfg(feature = "wasm")]
use serde::Serialize;

use crate::config::Rgb;

#[cfg_attr(feature = "wasm", derive(Serialize, Deserialize))]
#[derive(Debug)]
pub struct Voter {
    pub x: f32,
    pub y: f32,
}

/// A decimal resource to allocate between integer seats.
#[derive(Deserialize, Debug, Clone)]
pub struct Party {
    pub x: f32,
    pub y: f32,
    pub name: Option<String>,
    pub color: Option<Rgb>,
}

#[cfg(test)]
impl Party {
    pub fn new(x: f32, y: f32) -> Self {
        Self {
            x,
            y,
            name: None,
            color: None,
        }
    }
}

/// The result of an allocation
pub type AllocationResult = Vec<usize>;

/// The result of a single simulation
#[cfg_attr(feature = "wasm", derive(Serialize, Deserialize))]
pub struct SimulationResult {
    /// The x coordinate of the voter mean
    pub x: f32,
    /// The y coordinate of the voter mean
    pub y: f32,
    /// The number of seats won by each party
    pub seats_by_party: AllocationResult,
    pub voters: Vec<Voter>,
}

