use crate::{
    distance::distance_non_stv,
    methods::ApprovalStrategy,
    types::{Party, XY},
};

pub fn generate_approval_ballots(
    voters: &[XY],
    candidates: &[Party],
    #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    strategy: &ApprovalStrategy,
    ballots: &mut [Vec<f32>],
) {
    for (voter_idx, voter) in voters.iter().enumerate() {
        let mut dists_for_this_voter = vec![0.; candidates.len()];
        for (cand_idx, candidate) in candidates.iter().enumerate() {
            let dist = distance_non_stv(candidate, voter);
            dists_for_this_voter[cand_idx] = dist;
        }
        strategy
            .dists_to_ballot(&dists_for_this_voter, &mut ballots[voter_idx]);
    }
}

