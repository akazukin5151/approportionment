use std::collections::HashSet;

use crate::{methods::AllocationMethod, types::Party};

pub fn extract_stv_parties(
    method: &AllocationMethod,
    parties: &[Party],
) -> (Option<Vec<usize>>, Option<usize>) {
    if method.is_candidate_based() {
        let (a, b) = extract_stv_parties_inner(parties);
        (Some(a), Some(b))
    } else {
        (None, None)
    }
}

fn extract_stv_parties_inner(candidates: &[Party]) -> (Vec<usize>, usize) {
    let mut parties: Vec<_> = candidates.iter().map(|x| x.coalition).collect();

    // fill in none values with max_value + 1
    // if the config has gaps, the gaps won't be filled. no need to bother
    // for simplicity
    let mut max_value = parties.iter().copied().flatten().max().unwrap_or(0);

    for party in parties.iter_mut() {
        if party.is_none() {
            *party = Some(max_value);
            max_value += 1;
        }
    }

    // we subtract by min to make the lowest value 0
    let min = parties.iter().flatten().min().unwrap_or(&0);

    let party_of_cands: Vec<_> =
        parties.iter().map(|x| x.unwrap() - min).collect();

    let mut unique_parties = HashSet::new();
    for p in &party_of_cands {
        unique_parties.insert(p);
    }
    let n_parties = unique_parties.len();

    (party_of_cands, n_parties)
}
