use crate::*;

use stv::types::StvBallot;

pub struct StvAustralia;

impl Allocate for StvAustralia {
    type Ballot = StvBallot;

    fn allocate_seats(
        &self,
        ballots: Vec<Self::Ballot>,
        total_seats: u32,
        n_candidates: usize,
    ) -> AllocationResult {
        if (n_candidates as u32) <= total_seats {
            return vec![1; n_candidates];
        }
        // dividing usizes will automatically floor
        let quota = (ballots.len() / (total_seats as usize + 1)) + 1;
        let mut result = vec![0; n_candidates];
        let mut eliminated = vec![false; n_candidates];

        // every voter's first preferences
        let first_prefs: Vec<_> =
            ballots.iter().map(|ballot| ballot.0[0]).collect();
        // the first preference tally
        let mut counts = count_freqs(&first_prefs, n_candidates);

        while result.iter().sum::<u32>() < total_seats {
            if let Some(e) = find_elected(&counts, quota, &result) {
                // immediately elected due to reaching the quota
                elect_and_transfer(
                    e.0,
                    e.1,
                    e.2,
                    &mut result,
                    &ballots,
                    n_candidates,
                    &eliminated,
                    &mut counts,
                )
            } else {
                eliminate_and_transfer(
                    &mut counts,
                    &mut result,
                    &mut eliminated,
                    &ballots,
                    n_candidates,
                )
            }
        }
        result
    }

    fn generate_ballots(
        &self,
        voters: &[Voter],
        parties: &[Party],
        bar: &Option<ProgressBar>,
    ) -> Vec<Self::Ballot> {
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
}

fn find_next_valid_candidate(
    ballots: &StvBallot,
    elected: &[u32],
    eliminated: &[bool],
) -> Option<usize> {
    ballots
        .0
        .iter()
        .find(|cand_idx| elected[**cand_idx] == 0 && !eliminated[**cand_idx])
        .copied()
}

fn find_elected(
    counts: &[u32],
    quota: usize,
    r: &[u32],
) -> Option<(u32, usize, f32)> {
    counts
        .iter()
        .enumerate()
        .find(|(i, &count)| r[*i] == 0 && count as usize >= quota)
        .map(|(i, &count)| {
            let surplus = count as usize - quota;
            let transfer_value = surplus as f32 / count as f32;
            (i as u32, surplus, transfer_value)
        })
}

/// elect candidate and transfer their surplus
fn elect_and_transfer(
    cand_idx: u32,
    surplus: usize,
    transfer_value: f32,
    result: &mut [u32],
    ballots: &[StvBallot],
    n_candidates: usize,
    eliminated: &[bool],
    counts: &mut Vec<u32>,
) {
    let idx = cand_idx as usize;
    // record that this candidate has won
    result[idx] = 1;

    // ballots where first valid preferences is the elected candidate
    let b = ballots.iter().filter(|&ballot| {
        // find the first candidate that is not elected or eliminated
        // as the candidate to elect is already recorded in result
        // allow it to pass as true here
        let first_valid_pref = ballot
            .0
            .iter()
            .find(|i| !eliminated[**i] && (**i == idx || result[**i] == 0));

        first_valid_pref.map(|x| *x == idx).unwrap_or(false)
    });
    let mut votes_to_transfer: Vec<_> =
        calc_votes_to_transfer(b, result, eliminated, n_candidates)
            .iter()
            .map(|&c| c as f32 * transfer_value)
            .collect();
    votes_to_transfer[idx] = -(surplus as f32);

    *counts = counts
        .iter()
        .zip(votes_to_transfer)
        .map(|(x, y)| (*x as f32 + y) as u32)
        .collect();
}

/// no candidate elected
/// eliminate the last candidate and transfer
fn eliminate_and_transfer(
    counts: &mut Vec<u32>,
    result: &mut [u32],
    eliminated: &mut [bool],
    ballots: &[StvBallot],
    n_candidates: usize,
) {
    let last_idx = counts
        .iter()
        .enumerate()
        .filter(|(i, _)| result[*i] == 0 && !eliminated[*i])
        .min_by_key(|(_, c)| *c)
        .expect("No candidates remaining to eliminate")
        .0 as usize;
    eliminated[last_idx] = true;

    // ballots where first valid preference is the eliminated candidate
    // that means, a vote that was previously transferred to this candidate
    // has to be transferred again, to their (possibly different)
    // next alternative
    let b = ballots.iter().filter(|&ballot| {
        // find the first candidate that is not elected or eliminated
        // as the candidate to eliminate is already recorded in eliminated
        // allow it to pass as true here
        let first_valid_pref = ballot.0.iter().find(|i| {
            result[**i] == 0 && (**i == last_idx || !eliminated[**i])
        });

        first_valid_pref.map(|x| *x == last_idx).unwrap_or(false)
    });
    // find the next valid candidate to transfer
    // this is not necessarily the second preference, as it could be elected
    // or eliminated
    let votes_to_transfer =
        calc_votes_to_transfer(b, result, eliminated, n_candidates);
    *counts = counts
        .iter()
        .zip(votes_to_transfer)
        .enumerate()
        .map(
            |(idx, (x, y))| {
                if idx == last_idx {
                    0
                } else {
                    x + y as u32
                }
            },
        )
        .collect();
}

fn calc_votes_to_transfer<'a>(
    b: impl Iterator<Item = &'a StvBallot>,
    result: &[u32],
    eliminated: &[bool],
    n_candidates: usize,
) -> Vec<u32> {
    let next_prefs: Vec<_> = b
        .filter_map(|ballot| {
            find_next_valid_candidate(ballot, result, eliminated)
        })
        .collect();
    count_freqs(&next_prefs, n_candidates)
}
