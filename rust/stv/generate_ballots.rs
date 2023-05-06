use crate::types::{SimulateElectionsArgs, XY};

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
        args.bar.inc(1);

        rank_method
            .party_discipline(voter, args)
            .iter()
            .enumerate()
            .for_each(|(dist_idx, cand_idx)| {
                ballots[voter_idx * args.parties.len() + dist_idx] = *cand_idx;
            });
    });
}
