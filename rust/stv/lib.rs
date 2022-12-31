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
            distances.sort_unstable_by(|(_, a), (_, b)| {
                a.partial_cmp(b).expect("partial_cmp found NaN")
            });
            let ballot: Vec<_> =
                distances.iter().map(|(i, _)| *i).collect();
            StvBallot(ballot)
        })
        .collect()
}
