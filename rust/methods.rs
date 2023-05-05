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
    stv::{australia::StvAustralia, party_discipline::PartyDiscipline},
    types::{SimulateElectionsArgs, SimulationResult},
};

#[cfg_attr(test, derive(Serialize))]
#[derive(Deserialize)]
pub enum AllocationMethod {
    // TODO: these party list methods can be further simplified
    // but is it a good idea to? the filenames will become unclear
    // we could also split up Cardinal again based on CardinalStrategy
    // or expose the filename to dhall config
    DHondt,
    WebsterSainteLague,
    Droop,
    Hare,

    StvAustralia(PartyDiscipline),

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

    pub fn is_candidate_based(&self) -> bool {
        match self {
            AllocationMethod::StvAustralia(_) => true,
            AllocationMethod::Cardinal(_, _) => true,
            // TODO: RandomBallot can be candidate based too...
            _ => false,
        }
    }
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
        let a = AllocationMethod::StvAustralia(PartyDiscipline::None);
        let s: String = serde_json::to_string(&a).unwrap();
        assert_eq!(
            s,
            "{\"StvAustralia\":\"None\"}");
    }

    #[test]
    fn test_deserialize_method_stv_party_discipline() {
        let a = AllocationMethod::StvAustralia(PartyDiscipline::Min);
        let s: String = serde_json::to_string(&a).unwrap();
        assert_eq!(
            s,
            "{\"StvAustralia\":\"Min\"}");
    }

    #[test]
    fn test_deserialize_method_cardinal_thiele() {
        let a = AllocationMethod::Cardinal(
            CardinalStrategy::Mean,
            CardinalAllocator::ScoreFromOriginal,
        );
        let s: String = serde_json::to_string(&a).unwrap();
        assert_eq!(s, "{\"Cardinal\":[\"Mean\",\"ScoreFromOriginal\"]}");
    }

    #[test]
    fn test_deserialize_method_cardinal_reweight() {
        let a = AllocationMethod::Cardinal(
            CardinalStrategy::Mean,
            CardinalAllocator::WeightsFromPrevious(ReweightMethod::Sss),
        );
        let s: String = serde_json::to_string(&a).unwrap();
        assert_eq!(
            s,
            "{\"Cardinal\":[\"Mean\",{\"WeightsFromPrevious\":\"Sss\"}]}"
        );
    }

    #[test]
    fn test_deserialize_method_cardinal_phragmen() {
        let a = AllocationMethod::Cardinal(
            CardinalStrategy::Mean,
            CardinalAllocator::VoterLoads,
        );
        let s: String = serde_json::to_string(&a).unwrap();
        assert_eq!(s, "{\"Cardinal\":[\"Mean\",\"VoterLoads\"]}");
    }
}
