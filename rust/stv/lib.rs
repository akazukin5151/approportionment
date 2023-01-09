use rayon::slice::ParallelSliceMut;

use crate::*;
use crate::stv::types::StvBallot;

pub fn generate_stv_ballots(
    voters: &[Voter],
    parties: &[Party],
    bar: &Option<ProgressBar>,
) -> Vec<StvBallot> {
    voters
        .iter()
        .map(|voter| {
            if let Some(b) = bar {
                b.inc(1);
            }
            let mut distances: Vec<_> = parties
                .iter()
                .enumerate()
                .map(|(idx, party)| {
                    let a = (party.x - voter.x).powi(2);
                    let b = (party.y - voter.y).powi(2);
                    (idx, (a + b).powf(0.5))
                })
                .collect();
            distances.par_sort_unstable_by(|(_, a), (_, b)| {
                a.partial_cmp(b).expect("partial_cmp found NaN")
            });
            let ballot: Vec<_> =
                distances.iter().map(|(i, _)| *i).collect();
            StvBallot(ballot)
        })
        .collect()
}

// O(v*p + v)
pub fn calc_votes_to_transfer<'a>(
    ballots: impl Iterator<Item = &'a StvBallot>,
    result: &[u32],
    eliminated: &[bool],
    n_candidates: usize,
    pending: &[bool],
) -> Vec<u32> {
    // outer is O(v) as there are v ballots
    // so entire loop is O(v*p)
    let next_prefs: Vec<_> = ballots
        .filter_map(|ballot| {
            find_next_valid_candidate(ballot, result, eliminated, pending)
        })
        .collect();

    // O(v)
    count_freqs(&next_prefs, n_candidates)
}

// O(p) -- iterates over a vec whose len is the number of candidates
pub fn find_next_valid_candidate(
    ballot: &StvBallot,
    elected: &[u32],
    eliminated: &[bool],
    pending: &[bool],
) -> Option<usize> {
    ballot
        .0
        .iter()
        .find(|cand_idx| {
            elected[**cand_idx] == 0
                && !eliminated[**cand_idx]
                && !pending[**cand_idx]
        })
        .copied()
}

