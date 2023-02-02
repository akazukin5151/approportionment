use crate::distance::distance_stv;
use crate::stv::types::StvBallot;
use crate::*;

// this isn't parallelized because it is called too often:
// the overhead is too large
// although benchmarks on Github CI shows that parallelizing
// the first loop (on voters) is slightly faster, I can't reproduce it on my machine
// Github CI machines aren't designed for benchmarking anyway
pub fn generate_stv_ballots(
    voters: &[XY],
    parties: &[XY],
    #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    ballots: &mut [StvBallot],
) {
    voters.iter().enumerate().for_each(|(voter_idx, voter)| {
        #[cfg(feature = "progress_bar")]
        bar.inc(1);
        let mut distances: Vec<_> = parties
            .iter()
            .enumerate()
            .map(|(idx, party)| (idx, distance_stv(party, voter)))
            .collect();
        distances.sort_unstable_by(|(_, a), (_, b)| {
            a.partial_cmp(b).expect("partial_cmp found NaN")
        });
        distances
            .iter()
            .enumerate()
            .for_each(|(dist_idx, (cand_idx, _))| {
                let voter_ballot = &mut ballots[voter_idx].0;
                voter_ballot[dist_idx] = *cand_idx;
            });
    });
}


