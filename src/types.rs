use std::hash::Hash;
use std::collections::HashMap;

/// A decimal resource to allocate between integer seats.
/// x and y coordinates should not be calculated, and should be hardcoded
/// directly as magic numbers (or `const` values), because float equality
/// is inexact, so counting ballots may fail
#[derive(Clone, Debug)]
pub struct Party {
    pub x: f64,
    pub y: f64,
    pub name: String,
    pub color: String,
}

impl PartialEq for Party {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name
    }
}

impl Eq for Party {}

impl Hash for Party {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.name.hash(state);
    }
}

/// A process that can allocate decimal resources into integer seats
pub trait Allocate {
    fn allocate_seats(&self, total_seats: u32) -> AllocationResult;
}

/// The result of an allocation
pub type AllocationResult = HashMap<Party, u32>;

#[derive(Debug)]
pub struct Voter {
    pub x: f64,
    pub y: f64,
}
