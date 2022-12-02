use serde::Deserialize;
use serde_dhall::StaticType;

#[derive(Deserialize, StaticType)]
pub struct Config {
    /// How to color the plot
    pub color: Color,

    /// If color is continuous or discrete, number of seats for which party?
    /// If color is average, this is ignored as all party colors will be blended
    pub party_to_colorize: String,

    /// The directory to save output plots
    pub out_dir: String,

    /// Total number of seats in this district (district magnitude)
    pub n_seats: u32,

    /// Total number of voters to generate with the normal distribution
    pub n_voters: usize,
}

#[derive(Deserialize, StaticType)]
pub enum Color {
    /// Number of seats for a party, continuous color palette
    Continuous,
    /// Number of seats for a party, discrete color palette
    Discrete,
    /// Average colors of all parties, weighted by their number of seats
    Average,
}

