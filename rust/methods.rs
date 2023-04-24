use serde::Deserialize;

use crate::{
    allocate::Allocate,
    cardinal::{
        allocate::CardinalAllocator, strategy::CardinalStrategy, Cardinal,
    },
    highest_averages::{divisor::Divisor, lib::HighestAverages},
    largest_remainder::{lib::LargestRemainders, quota::Quota},
    random_ballot::RandomBallot,
    stv::australia::StvAustralia,
    types::{SimulateElectionsArgs, SimulationResult},
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
    StarPr,

    RandomBallot,
}

macro_rules! make {
    (
        $fn_name:ident,
        $ret_ty:ty,
        $( ($extra:ident: $typ:ty) ,)*
    ) => {
            pub fn $fn_name(
                self,
                args: SimulateElectionsArgs,
                $( $extra: $typ, )*
            ) -> $ret_ty {
                match self {
                    AllocationMethod::DHondt => {
                        HighestAverages::new(args.n_voters, Divisor::DHondt)
                            .$fn_name(&args, $( $extra, )* )
                    }
                    AllocationMethod::WebsterSainteLague => {
                        HighestAverages::new(args.n_voters, Divisor::SainteLague)
                            .$fn_name(&args, $( $extra, )* )
                    }
                    AllocationMethod::Droop => {
                        LargestRemainders::new(args.n_voters, Quota::Droop)
                            .$fn_name(&args, $( $extra, )* )
                    }
                    AllocationMethod::Hare => {
                        LargestRemainders::new(args.n_voters, Quota::Hare)
                            .$fn_name(&args, $( $extra, )* )
                    }
                    AllocationMethod::StvAustralia(method) => {
                        StvAustralia::new(args.n_voters, args.parties.len(), method)
                            .$fn_name(&args, $( $extra, )* )
                    }
                    AllocationMethod::SpavMean => Cardinal::new(
                        args.n_voters,
                        args.parties.len(),
                        CardinalStrategy::Mean,
                        CardinalAllocator::Thiele,
                    )
                    .$fn_name(&args, $( $extra, )* ),
                    AllocationMethod::SpavMedian => Cardinal::new(
                        args.n_voters,
                        args.parties.len(),
                        CardinalStrategy::Median,
                        CardinalAllocator::Thiele,
                    )
                    .$fn_name(&args, $( $extra, )* ),
                    AllocationMethod::RrvNormed => Cardinal::new(
                        args.n_voters,
                        args.parties.len(),
                        CardinalStrategy::NormedLinear,
                        CardinalAllocator::Thiele,
                    )
                    .$fn_name(&args, $( $extra, )* ),
                    AllocationMethod::RrvBullet => Cardinal::new(
                        args.n_voters,
                        args.parties.len(),
                        CardinalStrategy::Bullet,
                        CardinalAllocator::Thiele,
                    )
                    .$fn_name(&args, $( $extra, )* ),
                    AllocationMethod::StarPr => Cardinal::new(
                        args.n_voters,
                        args.parties.len(),
                        CardinalStrategy::NormedLinear,
                        CardinalAllocator::StarPr,
                    )
                    .$fn_name(&args, $( $extra, )* ),
                    AllocationMethod::RandomBallot => {
                        RandomBallot::new(args.n_voters)
                            .$fn_name(&args, $( $extra, )* )
                    }
                }
            }
        };
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
            AllocationMethod::StarPr => "StarPr.feather",
            AllocationMethod::RandomBallot => "RandomBallot.feather",
        }
    }

    make!(simulate_elections, Vec<SimulationResult>,);

    make!(
        simulate_single_election,
        SimulationResult,
        (voter_mean: (f32, f32)),
        (election_seed: Option<u64>),
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
            "StvAustralia" => {
                Ok(AllocationMethod::StvAustralia(RankMethod::default()))
            }
            "SpavMean" => Ok(AllocationMethod::SpavMean),
            "SpavMedian" => Ok(AllocationMethod::SpavMedian),
            "RrvNormed" => Ok(AllocationMethod::RrvNormed),
            "RrvBullet" => Ok(AllocationMethod::RrvBullet),
            "StarPr" => Ok(AllocationMethod::StarPr),
            "RandomBallot" => Ok(AllocationMethod::RandomBallot),
            _ => Err("Unknown method"),
        }
    }
}
