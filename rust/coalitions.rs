use crate::Party;
use std::collections::HashSet;

// party_of_cands is a lookup table where the index is the cand_idx,
// and the value is the party_idx
pub fn extract_stv_parties(candidates: &[Party]) -> (Vec<usize>, usize) {
    let mut parties: Vec<_> =
        candidates.iter().map(|x| x.coalition).collect();

    // fill in none values with max_value + 1
    // if the config has gaps, the gaps won't be filled. no need to bother
    // for simplicity
    let mut max_value = parties
        .iter()
        .copied()
        .flatten()
        .max()
        .unwrap_or(0);

    for party in parties.iter_mut() {
        if party.is_none() {
            *party = Some(max_value);
            max_value += 1;
        }
    }

    let party_of_cands: Vec<_> =
        parties.iter().map(|x| x.unwrap()).collect();

    let mut unique_parties = HashSet::new();
    for p in &party_of_cands {
        unique_parties.insert(p);
    }
    let n_parties = unique_parties.len();

    (party_of_cands, n_parties)
}
