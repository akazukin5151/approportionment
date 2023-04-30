use crate::{
    methods::AllocationMethod,
    types::{Party, SimulateElectionsArgs, XY},
};
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
    args: &SimulateElectionsArgs,
    ballots: &mut [usize],
    rank_method: &PartyDiscipline,
) {
    voters.iter().enumerate().for_each(|(voter_idx, voter)| {
        #[cfg(feature = "progress_bar")]
        bar.inc(1);

        rank_method
            .party_discipline(voter, args)
            .iter()
            .enumerate()
            .for_each(|(dist_idx, cand_idx)| {
                ballots[voter_idx * args.parties.len() + dist_idx] = *cand_idx;
            });
    });
}

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
