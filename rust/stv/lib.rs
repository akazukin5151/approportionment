use crate::generators::distance;
use crate::stv::types::StvBallot;
use crate::*;

// this isn't parallelized because it is called too often:
// the overhead is too large
// although benchmarks on Github CI shows that parallelizing
// the first loop (on voters) is slightly faster, I can't reproduce it on my machine
// Github CI machines aren't designed for benchmarking anyway
pub fn generate_stv_ballots(
    voters: &[Voter],
    parties: &[Party],
    #[cfg(feature = "progress_bar")]
    bar: &ProgressBar,
    ballots: &mut [StvBallot],
) {
    voters.iter().enumerate().for_each(|(j, voter)| {
        #[cfg(feature = "progress_bar")]
        bar.inc(1);
        let mut distances: Vec<_> = parties
            .iter()
            .enumerate()
            .map(|(idx, party)| (idx, distance(party, voter)))
            .collect();
        distances.sort_unstable_by(|(_, a), (_, b)| {
            a.partial_cmp(b).expect("partial_cmp found NaN")
        });
        let ballot: Vec<_> = distances.iter().map(|(i, _)| *i).collect();
        ballots[j] = StvBallot(ballot);
    });
}

// O(v*p + v)
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

// O(p) -- iterates over a vec whose len is the number of candidates
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
