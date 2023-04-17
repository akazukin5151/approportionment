use serde::Deserialize;

use crate::{
    allocate::Allocate,
    cardinal::{strategy::CardinalStrategy, Cardinal},
    highest_averages::{dhondt::DHondt, webster::WebsterSainteLague},
    largest_remainder::{droop::Droop, hare::Hare},
    random_ballot::RandomBallot,
    stv::australia::StvAustralia,
};

#[derive(Deserialize)]
pub struct RankMethod {
    pub normal: f32,
    pub min_party: f32,
    pub avg_party: f32,
}

impl Default for RankMethod {
    fn default() -> Self {
        Self {
            normal: 1.0,
            min_party: 0.0,
            avg_party: 0.0,
        }
    }
}

#[derive(Deserialize)]
pub enum AllocationMethod {
    DHondt,
    WebsterSainteLague,
    Droop,
    Hare,

    // not supported on webui
    // must have RankMethod here, even if stv_party_discipline feature is
    // disabled, because dhall file will always have it, and rust will panic
    // if RankMethod is not here. This means, unfortunately, this is passed
    // all the way to the StvAustralia struct, even if stv_party_discipline
    // is disabled, but it would do nothing, so hopefully the costs are negligible
    StvAustralia(RankMethod),

    // We combine the method and strategy to simplify the webui.
    // Theoretically we can add extra forms
    // to the webui to ask for CardinalStrategy (and RankMethod too), but that's
    // extra complexity that we don't quite need yet
    SpavMean,
    SpavMedian,
    RrvNormed,
    RrvBullet,

    RandomBallot,
}

impl AllocationMethod {
    pub fn filename(&self) -> &'static str {
        match self {
            AllocationMethod::DHondt => "DHondt.feather",
            AllocationMethod::WebsterSainteLague => "SainteLague.feather",
            AllocationMethod::Droop => "Droop.feather",
            AllocationMethod::Hare => "Hare.feather",
            AllocationMethod::StvAustralia(_) => "StvAustralia.feather",
            AllocationMethod::SpavMean => "SpavMean.feather",
            AllocationMethod::SpavMedian => "SpavMedian.feather",
            AllocationMethod::RrvNormed => "RrvNormed.feather",
            AllocationMethod::RrvBullet => "RrvBullet.feather",
            AllocationMethod::RandomBallot => "RandomBallot.feather",
        }
    }

    pub fn init(self, n_voters: usize, n_parties: usize) -> Box<dyn Allocate> {
        match self {
            AllocationMethod::DHondt => Box::new(DHondt::new(n_voters)),
            AllocationMethod::WebsterSainteLague => {
                Box::new(WebsterSainteLague::new(n_voters))
            }
            AllocationMethod::Droop => Box::new(Droop::new(n_voters)),
            AllocationMethod::Hare => Box::new(Hare::new(n_voters)),
            AllocationMethod::StvAustralia(method) => {
                Box::new(StvAustralia::new(n_voters, n_parties, method))
            }
            AllocationMethod::SpavMean => Box::new(Cardinal::new(
                n_voters,
                n_parties,
                CardinalStrategy::Mean,
            )),
            AllocationMethod::SpavMedian => Box::new(Cardinal::new(
                n_voters,
                n_parties,
                CardinalStrategy::Median,
            )),
            AllocationMethod::RrvNormed => Box::new(Cardinal::new(
                n_voters,
                n_parties,
                CardinalStrategy::NormedLinear,
            )),
            AllocationMethod::RrvBullet => Box::new(Cardinal::new(
                n_voters,
                n_parties,
                CardinalStrategy::Bullet,
            )),
            AllocationMethod::RandomBallot => {
                Box::new(RandomBallot::new(n_voters))
            }
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
            "StvAustralia" => {
                Ok(AllocationMethod::StvAustralia(RankMethod::default()))
            }
            "SpavMean" => Ok(AllocationMethod::SpavMean),
            "SpavMedian" => Ok(AllocationMethod::SpavMedian),
            "RrvNormed" => Ok(AllocationMethod::RrvNormed),
            "RrvBullet" => Ok(AllocationMethod::RrvBullet),
            "RandomBallot" => Ok(AllocationMethod::RandomBallot),
            _ => Err("Unknown method"),
        }
    }
}
