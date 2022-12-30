use crate::*;

use stv::types::StvBallot;

pub struct StvAustralia;

impl Allocate for StvAustralia {
    type Ballot = StvBallot;

    /// O(v + v + v*p^2) ~= O(v*p^2)
    /// - v is the number of voters
    /// - p is the number of candidates
    /// Note that there are likely to be many candidates in STV, as parties
    /// must run multiple candidates if they want to win multiple seats
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
        // O(v)
        let first_prefs: Vec<_> =
            ballots.iter().map(|ballot| ballot.0[0]).collect();

        // the first preference tally
        // O(v)
        let mut counts = count_freqs(&first_prefs, n_candidates);

        // technically O(c), but should be optimized out into a simple counter
        // one loop is O(p + v*p) ~= O(v*p), it loops p times
        // so the entire loop is O(v*p^2)
        while result.iter().sum::<u32>() < total_seats {
            // O(p)
            if let Some(e) = find_elected(&counts, quota, &result) {
                // immediately elected due to reaching the quota
                // O(v*p)
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
                // O(v*p)
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

// O(p) -- iterates over a vec whose len is the number of candidates
fn find_next_valid_candidate(
    ballot: &StvBallot,
    elected: &[u32],
    eliminated: &[bool],
) -> Option<usize> {
    ballot
        .0
        .iter()
        .find(|cand_idx| elected[**cand_idx] == 0 && !eliminated[**cand_idx])
        .copied()
}

// O(p) -- len of counts is p
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
/// O(v*p + v*p + v + p) = O(v*p + v + p) ~= O(v*p)
/// - v is the number of voters
/// - p is the number of candidates
/// Note that there are likely to be many candidates in STV, as parties
/// must run multiple candidates if they want to win multiple seats
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
    // outer is O(v) so entire is O(v*p)
    let b = ballots.iter().filter(|&ballot| {
        // find the first candidate that is not elected or eliminated
        // as the candidate to elect is already recorded in result
        // allow it to pass as true here
        // O(p)
        let first_valid_pref = ballot
            .0
            .iter()
            .find(|i| !eliminated[**i] && (**i == idx || result[**i] == 0));

        first_valid_pref.map(|x| *x == idx).unwrap_or(false)
    });

    // Part XVIII section 273 number 9b specifies it to be truncated
    // O(v*p + v), plus the map which is O(v), but this map should be inlined
    let mut votes_to_transfer: Vec<_> =
        calc_votes_to_transfer(b, result, eliminated, n_candidates)
            .iter()
            .map(|&c| (c as f32 * transfer_value).floor())
            .collect();
    votes_to_transfer[idx] = -(surplus as f32);

    // O(p)
    *counts = counts
        .iter()
        .zip(votes_to_transfer)
        .map(|(x, y)| (*x as f32 + y) as u32)
        .collect();
}

/// no candidate elected - eliminate the last candidate and transfer
/// O(p + v*p + v*p + v + p) = O(v*p + v + p) ~= O(v*p)
/// Note that there are likely to be many candidates in STV, as parties
/// must run multiple candidates if they want to win multiple seats
fn eliminate_and_transfer(
    counts: &mut Vec<u32>,
    result: &mut [u32],
    eliminated: &mut [bool],
    ballots: &[StvBallot],
    n_candidates: usize,
) {
    // O(p)
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
    // outer is O(v) so entire loop is O(v*p)
    let b = ballots.iter().filter(|&ballot| {
        // find the first candidate that is not elected or eliminated
        // as the candidate to eliminate is already recorded in eliminated
        // allow it to pass as true here
        // O(p)
        let first_valid_pref = ballot.0.iter().find(|i| {
            result[**i] == 0 && (**i == last_idx || !eliminated[**i])
        });

        first_valid_pref.map(|x| *x == last_idx).unwrap_or(false)
    });

    // find the next valid candidate to transfer
    // this is not necessarily the second preference, as it could be elected
    // or eliminated
    // O(v*p + v)
    let votes_to_transfer =
        calc_votes_to_transfer(b, result, eliminated, n_candidates);

    // O(v)
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

// O(v*p + v)
fn calc_votes_to_transfer<'a>(
    ballots: impl Iterator<Item = &'a StvBallot>,
    result: &[u32],
    eliminated: &[bool],
    n_candidates: usize,
) -> Vec<u32> {
    // outer is O(v) as there are v ballots
    // so entire loop is O(v*p)
    let next_prefs: Vec<_> = ballots
        .filter_map(|ballot| {
            find_next_valid_candidate(ballot, result, eliminated)
        })
        .collect();

    // O(v)
    count_freqs(&next_prefs, n_candidates)
}
