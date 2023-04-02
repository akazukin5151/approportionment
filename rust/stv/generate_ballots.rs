use crate::distance::distance_stv;
use crate::types::{Party, XY};

#[cfg(feature = "stv_party_discipline")]
use {
    crate::methods::RankMethod,
    crate::rng::Fastrand,
    crate::stv::{mean_party_discipline_sort, min_party_discipline_sort},
    rand_distr::{Distribution, WeightedIndex},
};

#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;

// this isn't parallelized because it is called too often:
// the overhead is too large
// although benchmarks on Github CI shows that parallelizing
// the first loop (on voters) is slightly faster, I can't reproduce it on my machine
// Github CI machines aren't designed for benchmarking anyway

#[cfg(not(feature = "stv_party_discipline"))]
pub fn generate_stv_ballots(
    voters: &[XY],
    candidates: &[Party],
    #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    ballots: &mut [usize],
) {
    voters.iter().enumerate().for_each(|(voter_idx, voter)| {
        #[cfg(feature = "progress_bar")]
        bar.inc(1);

        normal_sort(voter, candidates).iter().enumerate().for_each(
            |(dist_idx, cand_idx)| {
                ballots[voter_idx * candidates.len() + dist_idx] = *cand_idx;
            },
        );
    });
}

#[cfg(feature = "stv_party_discipline")]
pub fn generate_stv_ballots(
    voters: &[XY],
    candidates: &[Party],
    #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    ballots: &mut [usize],
    rank_method: &RankMethod,
    party_of_cands: &[usize],
    n_parties: usize,
) {
    // SliceRandom::choose_multiple will result in 3 set of voters that are out of
    // order, but we rely on order to fill the ballot buffer, so we have to
    // randomly choose indices and use that info during in-order iteration
    let weights = [
        rank_method.normal,
        rank_method.min_party,
        rank_method.avg_party,
    ];
    // O(log(n)) time where n is the number of weights, which is always 3 here
    let distr = WeightedIndex::new(&weights).unwrap();
    let mut rng = Fastrand::new();

    voters.iter().enumerate().for_each(|(voter_idx, voter)| {
        #[cfg(feature = "progress_bar")]
        bar.inc(1);

        let method_idx = distr.sample(&mut rng);
        let sorted = if method_idx == 0 {
            normal_sort(voter, candidates)
        } else if method_idx == 1 {
            min_party_discipline_sort(
                voter,
                candidates,
                party_of_cands,
                n_parties,
            )
        } else {
            mean_party_discipline_sort(
                voter,
                candidates,
                party_of_cands,
                n_parties,
            )
        };

        sorted.iter().enumerate().for_each(|(dist_idx, cand_idx)| {
            ballots[voter_idx * candidates.len() + dist_idx] = *cand_idx;
        });
    });
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
