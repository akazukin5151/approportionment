use crate::{
    distance::distance_non_stv,
    types::{Party, XY},
};

use super::strategy::Strategy;

#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;

pub fn generate_cardinal_ballots(
    voters: &[XY],
    candidates: &[Party],
    #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    strategy: &impl Strategy,
    ballots: &mut [f32],
) {
    // we only need 1 aux vector, which is reused for every voter
    let mut dists_for_this_voter = vec![0.; candidates.len()];
    for (voter_idx, voter) in voters.iter().enumerate() {
        #[cfg(feature = "progress_bar")]
        bar.inc(1);
        for (cand_idx, candidate) in candidates.iter().enumerate() {
            let dist = distance_non_stv(candidate, voter);
            // overwrite previous voter
            dists_for_this_voter[cand_idx] = dist;
        }
        strategy.dists_to_ballot(
            &dists_for_this_voter,
            &mut ballots[voter_idx * candidates.len()..],
        );
    }
}

#[cfg(test)]
mod test {
    use crate::cardinal::strategy::CardinalStrategy;

    use super::*;

    #[test]
    fn test_generate_cardinal_ballots() {
        let candidates = &[
            Party {
                x: -0.7,
                y: 0.7,
                #[cfg(feature = "stv_party_discipline")]
                coalition: None,
            },
            Party {
                x: 0.7,
                y: 0.7,
                #[cfg(feature = "stv_party_discipline")]
                coalition: None,
            },
            Party {
                x: 0.7,
                y: -0.7,
                #[cfg(feature = "stv_party_discipline")]
                coalition: None,
            },
            Party {
                x: -0.7,
                y: -0.7,
                #[cfg(feature = "stv_party_discipline")]
                coalition: None,
            },
        ];
        let voters = &[
            XY { x: -0.75, y: 0.75 },
            XY { x: 0.0, y: 0.0 },
            XY { x: 0.9, y: -0.9 },
            XY { x: -0.6, y: -0.6 },
        ];
        let mut ballots = vec![0.; voters.len() * candidates.len()];
        generate_cardinal_ballots(
            voters,
            candidates,
            &CardinalStrategy::Mean,
            &mut ballots,
        );
        #[rustfmt::skip]
        assert_eq!(
            ballots,
            vec![
                1.0, 1.0, 0.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                0.0, 1.0, 1.0, 1.0,
                1.0, 0.0, 1.0, 1.0
            ]
        );
    }
}
