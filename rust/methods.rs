use serde::Deserialize;
use serde_dhall::StaticType;
use std::vec;

use crate::{
    allocate::Allocate,
    highest_averages::{DHondt, WebsterSainteLague},
    largest_remainder::{Droop, Hare},
    stv::StvAustralia,
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

    pub fn init(&self, n_voters: usize) -> Box<dyn Allocate> {
        match self {
            AllocationMethod::DHondt => Box::new(DHondt::new(n_voters)),
            AllocationMethod::WebsterSainteLague => {
                Box::new(WebsterSainteLague::new(n_voters))
            }
            AllocationMethod::Droop => Box::new(Droop::new(n_voters)),
            AllocationMethod::Hare => Box::new(Hare::new(n_voters)),
            AllocationMethod::StvAustralia => {
                Box::new(StvAustralia::new(n_voters))
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
            "StvAustralia" => Ok(AllocationMethod::StvAustralia),
            _ => Err("Unknown method"),
        }
    }
}
