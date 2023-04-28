use serde::Deserialize;
#[cfg(test)]
use serde::Serialize;

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

#[cfg_attr(test, derive(Serialize))]
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

#[cfg_attr(test, derive(Serialize))]
#[derive(Deserialize)]
pub enum AllocationMethod {
    DHondt,
    WebsterSainteLague,
    Droop,
    Hare,

    StvAustralia(RankMethod),

    Cardinal(CardinalStrategy, CardinalAllocator),

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
                    AllocationMethod::Cardinal(strategy, allocator) => Cardinal::new(
                        args.n_voters,
                        args.parties.len(),
                        strategy,
                        allocator,
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
            AllocationMethod::Cardinal(_, _) => "Cardinal.feather",
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

#[cfg(test)]
mod test {
    use crate::cardinal::reweighter::ReweightMethod;

    use super::*;

    #[test]
    fn test_deserialize_method_unit() {
        let a = AllocationMethod::DHondt;
        let s: String = serde_json::to_string(&a).unwrap();
        assert_eq!(s, "\"DHondt\"");
    }

    #[test]
    fn test_deserialize_method_stv() {
        let a = AllocationMethod::StvAustralia(RankMethod::default());
        let s: String = serde_json::to_string(&a).unwrap();
        assert_eq!(
            s,
            "{\"StvAustralia\":{\"normal\":1.0,\"min_party\":0.0,\"avg_party\":0.0}}");
    }

    #[test]
    fn test_deserialize_method_cardinal_thiele() {
        let a = AllocationMethod::Cardinal(
            CardinalStrategy::Mean,
            CardinalAllocator::Thiele,
        );
        let s: String = serde_json::to_string(&a).unwrap();
        assert_eq!(
            s,
            "{\"Cardinal\":[\"Mean\",\"Thiele\"]}");
    }

    #[test]
    fn test_deserialize_method_cardinal_reweight() {
        let a = AllocationMethod::Cardinal(
            CardinalStrategy::Mean,
            CardinalAllocator::IterativeReweight(ReweightMethod::Sss),
        );
        let s: String = serde_json::to_string(&a).unwrap();
        assert_eq!(
            s,
            "{\"Cardinal\":[\"Mean\",{\"IterativeReweight\":\"Sss\"}]}");
    }
}
