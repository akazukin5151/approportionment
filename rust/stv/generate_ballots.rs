use crate::distance::distance_stv;
use crate::*;

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
    #[cfg(feature = "stv_party_discipline")] party_of_cands: &[usize],
    #[cfg(feature = "stv_party_discipline")] n_parties: usize,
) {
    voters.iter().enumerate().for_each(|(voter_idx, voter)| {
        #[cfg(feature = "progress_bar")]
        bar.inc(1);

        generate_inner(
            voter,
            candidates,
            #[cfg(feature = "stv_party_discipline")]
            party_of_cands,
            #[cfg(feature = "stv_party_discipline")]
            n_parties,
        )
        .iter()
        .enumerate()
        .for_each(|(dist_idx, cand_idx)| {
            ballots[voter_idx * candidates.len() + dist_idx] = *cand_idx;
        });
    });
}

#[cfg(not(feature = "stv_party_discipline"))]
#[inline(always)]
fn generate_inner(
    voter: &XY,
    candidates: &[Party],
    #[cfg(feature = "stv_party_discipline")] _: &[usize],
    #[cfg(feature = "stv_party_discipline")] _: usize,
) -> Vec<usize> {
    normal_sort(voter, candidates)
}

#[cfg(feature = "stv_party_discipline")]
#[inline(always)]
fn generate_inner(
    voter: &XY,
    candidates: &[Party],
    party_of_cands: &[usize],
    n_parties: usize,
) -> Vec<usize> {
    min_party_discipline_sort(voter, candidates, party_of_cands, n_parties)
}

// TODO: reuse returned vecs
#[inline(always)]
fn normal_sort(voter: &XY, candidates: &[Party]) -> Vec<usize> {
    let mut distances: Vec<_> = candidates
        .iter()
        .enumerate()
        .map(|(idx, candidate)| (idx, distance_stv(candidate, voter)))
        .collect();
    distances.sort_unstable_by(|(_, a), (_, b)| {
        a.partial_cmp(b).expect("partial_cmp found NaN")
    });
    distances.iter().map(|(cand_idx, _)| *cand_idx).collect()
}
