use crate::{
    distance::distance_non_stv,
    types::{SimulateElectionsArgs, XY},
};

use super::strategy::Strategy;

pub fn generate_cardinal_ballots(
    voters: &[XY],
    args: &SimulateElectionsArgs,
    strategy: &impl Strategy,
    ballots: &mut [f32],
) {
    let candidates = args.parties;
    // we only need 1 aux vector, which is reused for every voter
    let mut dists_for_this_voter = vec![0.; candidates.len()];
    for (voter_idx, voter) in voters.iter().enumerate() {
        #[cfg(feature = "progress_bar")]
        args.bar.inc(1);
        for (cand_idx, candidate) in candidates.iter().enumerate() {
            let dist = distance_non_stv(candidate, voter);
            // overwrite previous voter
            dists_for_this_voter[cand_idx] = dist;
        }
        strategy.dists_to_ballot(
            &dists_for_this_voter,
            &mut ballots[voter_idx * candidates.len()..],
            args,
        );
    }
}
