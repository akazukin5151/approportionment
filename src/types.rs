use std::collections::HashMap;
use std::hash::Hash;

use plotters::style::RGBColor;

/// A decimal resource to allocate between integer seats.
#[derive(Clone, Debug)]
pub struct Party {
    pub x: f64,
    pub y: f64,
    pub name: String,
    pub color: RGBColor,
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
