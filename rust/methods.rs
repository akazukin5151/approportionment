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
            AllocationMethod::DHondt => DHondt.simulate_elections(
                n_seats,
                n_voters,
                stdev,
                parties,
                bar,
                use_voters_sample,
            ),
            AllocationMethod::WebsterSainteLague => WebsterSainteLague
                .simulate_elections(
                    n_seats,
                    n_voters,
                    stdev,
                    parties,
                    bar,
                    use_voters_sample,
                ),
            AllocationMethod::Droop => Droop.simulate_elections(
                n_seats,
                n_voters,
                stdev,
                parties,
                bar,
                use_voters_sample,
            ),
            AllocationMethod::Hare => Hare.simulate_elections(
                n_seats,
                n_voters,
                stdev,
                parties,
                bar,
                use_voters_sample,
            ),
            AllocationMethod::StvAustralia => StvAustralia.simulate_elections(
                n_seats,
                n_voters,
                stdev,
                parties,
                bar,
                use_voters_sample,
            ),
        }
    }

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
            AllocationMethod::DHondt => DHondt.simulate_single_election(
                n_seats,
                n_voters,
                parties,
                bar,
                voter_mean,
                stdev,
                use_voters_sample,
            ),
            AllocationMethod::WebsterSainteLague => WebsterSainteLague
                .simulate_single_election(
                    n_seats,
                    n_voters,
                    parties,
                    bar,
                    voter_mean,
                    stdev,
                    use_voters_sample,
                ),
            AllocationMethod::Droop => Droop.simulate_single_election(
                n_seats,
                n_voters,
                parties,
                bar,
                voter_mean,
                stdev,
                use_voters_sample,
            ),
            AllocationMethod::Hare => Hare.simulate_single_election(
                n_seats,
                n_voters,
                parties,
                bar,
                voter_mean,
                stdev,
                use_voters_sample,
            ),
            AllocationMethod::StvAustralia => StvAustralia
                .simulate_single_election(
                    n_seats,
                    n_voters,
                    parties,
                    bar,
                    voter_mean,
                    stdev,
                    use_voters_sample,
                ),
        }
    }
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
