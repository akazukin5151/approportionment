use indicatif::ProgressBar;
use serde::Deserialize;
use serde_dhall::StaticType;
use std::vec;

use crate::{
    allocate::Allocate,
    highest_averages::{DHondt, WebsterSainteLague},
    largest_remainder::{Droop, Hare},
    stv::StvAustralia,
    types::{Party, SimulationResult},
};

#[derive(Deserialize, StaticType)]
pub enum AllocationMethod {
    DHondt,
    WebsterSainteLague,
    Droop,
    Hare,
    StvAustralia,
}

// https://teddit.net/r/rust/comments/9m259y/how_create_a_macro_that_build_match_arms/
macro_rules! generate_simulate_elections {
    ($( ($variant:path, $struct:ident) ),*) => (
        pub fn simulate_elections(
            &self,
            n_seats: usize,
            n_voters: usize,
            stdev: f32,
            parties: &[Party],
            bar: &Option<ProgressBar>,
            use_voters_sample: bool,
        ) -> Vec<SimulationResult> {
            match self {
                $($variant => $struct.simulate_elections(
                    n_seats,
                    n_voters,
                    stdev,
                    parties,
                    bar,
                    use_voters_sample,
                ),)+
            }
        }
    )
}

macro_rules! generate_simulate_single_election {
    ($( ($variant:path, $struct:ident) ),*) => (
        pub fn simulate_single_election(
            &self,
            n_seats: usize,
            n_voters: usize,
            parties: &[Party],
            bar: &Option<ProgressBar>,
            voter_mean: (f32, f32),
            stdev: f32,
            use_voters_sample: bool,
        ) -> SimulationResult {
            match self {
                $($variant => $struct.simulate_single_election(
                    n_seats,
                    n_voters,
                    parties,
                    bar,
                    voter_mean,
                    stdev,
                    use_voters_sample,
                ),)+
            }
        }
    )
}

impl AllocationMethod {
    pub fn filename(&self) -> &'static str {
        match self {
            AllocationMethod::DHondt => "DHondt.feather",
            AllocationMethod::WebsterSainteLague => "SainteLague.feather",
            AllocationMethod::Droop => "Droop.feather",
            AllocationMethod::Hare => "Hare.feather",
            AllocationMethod::StvAustralia => "StvAustralia.feather",
        }
    }

    generate_simulate_elections!(
        (AllocationMethod::DHondt, DHondt),
        (AllocationMethod::WebsterSainteLague, WebsterSainteLague),
        (AllocationMethod::Droop, Droop),
        (AllocationMethod::Hare, Hare),
        (AllocationMethod::StvAustralia, StvAustralia)
    );

    generate_simulate_single_election!(
        (AllocationMethod::DHondt, DHondt),
        (AllocationMethod::WebsterSainteLague, WebsterSainteLague),
        (AllocationMethod::Droop, Droop),
        (AllocationMethod::Hare, Hare),
        (AllocationMethod::StvAustralia, StvAustralia)
    );
}

impl TryFrom<String> for AllocationMethod {
    type Error = &'static str;

    fn try_from(s: String) -> Result<Self, Self::Error> {
        match s.as_str() {
            "DHondt" => Ok(AllocationMethod::DHondt),
            "SainteLague" => Ok(AllocationMethod::WebsterSainteLague),
            "Droop" => Ok(AllocationMethod::Droop),
            "Hare" => Ok(AllocationMethod::Hare),
            "StvAustralia" => Ok(AllocationMethod::StvAustralia),
            _ => Err("Unknown method"),
        }
    }
}
