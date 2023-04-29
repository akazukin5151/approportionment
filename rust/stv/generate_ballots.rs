use crate::types::{Party, XY};
use std::collections::HashSet;

#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;

use super::party_discipline::PartyDiscipline;

// this isn't parallelized because it is called too often:
// the overhead is too large
// although benchmarks on Github CI shows that parallelizing
// the first loop (on voters) is slightly faster, I can't reproduce it on my machine
// Github CI machines aren't designed for benchmarking anyway

pub fn generate_stv_ballots(
    voters: &[XY],
    candidates: &[Party],
    #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    ballots: &mut [usize],
    rank_method: &PartyDiscipline,
) {
    // TODO: don't run this for PartyDiscipline::None
    let (party_of_cands, n_parties) = extract_stv_parties(candidates);
    voters.iter().enumerate().for_each(|(voter_idx, voter)| {
        #[cfg(feature = "progress_bar")]
        bar.inc(1);

        rank_method
            .party_discipline(voter, candidates, &party_of_cands, n_parties)
            .iter()
            .enumerate()
            .for_each(|(dist_idx, cand_idx)| {
                ballots[voter_idx * candidates.len() + dist_idx] = *cand_idx;
            });
    });
}

// party_of_cands is a lookup table where the index is the cand_idx,
// and the value is the party_idx
pub fn extract_stv_parties(candidates: &[Party]) -> (Vec<usize>, usize) {
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

    let party_of_cands: Vec<_> = parties.iter().map(|x| x.unwrap()).collect();

    let mut unique_parties = HashSet::new();
    for p in &party_of_cands {
        unique_parties.insert(p);
    }
    let n_parties = unique_parties.len();

    (party_of_cands, n_parties)
}
