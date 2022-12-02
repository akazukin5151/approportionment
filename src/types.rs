use std::collections::HashMap;
use std::hash::Hash;

use clap::{Parser, ValueEnum};
use plotters::style::RGBColor;

#[derive(Parser)]
pub struct Cli {
    /// How to color the plot
    #[arg(short, long)]
    pub color: Color,

    /// If color is continuous or discrete, number of seats for which party?
    /// If color is average, this is ignored as all party colors will be blended
    #[arg(short, long)]
    pub party_to_colorize: String,

    /// The directory to save output plots
    #[arg(short, long)]
    pub out_dir: String,

    /// Total number of seats in this district (district magnitude)
    #[arg(short('s'), long)]
    pub n_seats: u32,

    /// Total number of voters to generate with the normal distribution
    #[arg(short('v'), long)]
    pub n_voters: usize,
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum)]
pub enum Color {
    /// Number of seats for a party, continuous color palette
    Continuous,
    /// Number of seats for a party, discrete color palette
    Discrete,
    /// Average colors of all parties, weighted by their number of seats
    Average,
}

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
