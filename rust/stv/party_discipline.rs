/// these functions will sort candidates by distance, but enforce
/// party discipline by ranking all candidates from a more preferred
/// party over a less preferred party
///
/// there are different ways to determine the preference order of parties,
/// such as minimum distance and mean distance
use serde::Deserialize;
#[cfg(test)]
use serde::Serialize;

use crate::types::{Party, XY};

use super::sort_cands::{
    mean_party_discipline_sort, min_party_discipline_sort, normal_sort,
};

#[cfg_attr(test, derive(Serialize))]
#[derive(Deserialize)]
pub enum PartyDiscipline {
    None,
    Min,
    Avg,
}

impl PartyDiscipline {
    pub fn party_discipline(
        &self,
        voter: &XY,
        candidates: &[Party],
        party_of_cands: &[usize],
        n_parties: usize,
    ) -> Vec<usize> {
        match self {
            PartyDiscipline::None => normal_sort(voter, candidates),
            PartyDiscipline::Min => min_party_discipline_sort(
                voter,
                candidates,
                party_of_cands,
                n_parties,
            ),
            PartyDiscipline::Avg => mean_party_discipline_sort(
                voter,
                candidates,
                party_of_cands,
                n_parties,
            ),
        }
    }
}
