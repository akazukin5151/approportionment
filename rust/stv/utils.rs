use crate::stv::types::StvBallot;
use crate::*;

/// O(v*p + v)
pub fn calc_votes_to_transfer<'a>(
    ballots: impl Iterator<Item = &'a StvBallot>,
    result: &[usize],
    eliminated: usize,
    n_candidates: usize,
    pending: usize,
) -> Vec<usize> {
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

/// O(p) -- iterates over a vec whose len is the number of candidates
pub fn find_next_valid_candidate(
    ballot: &StvBallot,
    elected: &[usize],
    eliminated: usize,
    pending: usize,
) -> Option<usize> {
    ballot
        .0
        .iter()
        .find(|cand_idx| {
            elected[**cand_idx] == 0
                && !is_nth_flag_set(eliminated, **cand_idx)
                && !is_nth_flag_set(pending, **cand_idx)
        })
        .copied()
}
