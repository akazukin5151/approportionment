use crate::{
    cardinal::{
        allocate::CardinalAllocator, reweighter::ReweightMethod,
        strategy::CardinalStrategy,
    },
    methods::AllocationMethod,
    stv::party_discipline::PartyDiscipline,
};

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
    assert_eq!(s, "{\"StvAustralia\":\"None\"}");
}

#[test]
fn test_deserialize_method_stv_party_discipline() {
    let a = AllocationMethod::StvAustralia(PartyDiscipline::Min);
    let s: String = serde_json::to_string(&a).unwrap();
    assert_eq!(s, "{\"StvAustralia\":\"Min\"}");
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
