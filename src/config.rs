use plotters::style::RGBColor;
use serde::Deserialize;
use serde_dhall::StaticType;

use crate::types::Party;

pub type Configs = Vec<Config>;

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

    /// Parties participating in the elections
    pub parties: Vec<ConfigParty>,
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

#[derive(Deserialize, StaticType)]
pub struct ConfigParty {
    pub x: f64,
    pub y: f64,
    pub name: String,
    pub color: Rgb,
}

#[derive(Deserialize, StaticType, Clone)]
pub struct Rgb {
    pub r: u16,
    pub g: u16,
    pub b: u16,
}

impl From<Rgb> for RGBColor {
    fn from(rgb: Rgb) -> Self {
        Self(rgb.r as u8, rgb.g as u8, rgb.b as u8)
    }
}

impl From<&ConfigParty> for Party {
    fn from(c: &ConfigParty) -> Self {
        Self {
            x: c.x,
            y: c.y,
            name: c.name.clone(),
            color: c.color.clone().into(),
        }
    }
}
