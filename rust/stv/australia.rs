use crate::*;

use stv::lib::generate_stv_ballots;
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
        // TODO: this can be multi-threaded
        // O(v)
        let first_prefs: Vec<_> =
            ballots.iter().map(|ballot| ballot.0[0]).collect();

        // the first preference tally
        // O(v)
        let mut counts = count_freqs(&first_prefs, n_candidates);

        // the sum in the condition is technically O(c),
        // but should be optimized out into a simple counter
        // one loop is O(p + v*p) ~= O(v*p), it loops p times
        // so the entire loop is O(v*p^2)
        while result.iter().sum::<u32>() < total_seats {
            let mut pending = vec![false; n_candidates];
            // O(p)
            let elected = find_elected(&counts, quota, &result);
            if !elected.is_empty() {
                // immediately elected due to reaching the quota
                for (c, _, _) in &elected {
                    pending[*c] = true;
                }
                let to_add = elected
                    .iter()
                    .map(|(cand_idx, surplus, transfer_value)| {
                        // O(v*p)
                        transfer_elected_surplus(
                            *cand_idx,
                            *surplus,
                            *transfer_value,
                            &result,
                            &ballots,
                            n_candidates,
                            &eliminated,
                            &counts,
                            &pending,
                        )
                    })
                    .fold(vec![0; counts.len()], |acc, x| {
                        acc.iter()
                            .zip(x)
                            .map(|(a, b)| (*a as f32 + b) as u32)
                            .collect()
                    });
                let nc: Vec<_> =
                    counts.iter().zip(to_add).map(|(x, y)| *x + y).collect();
                counts = nc;
                for (c, _, _) in &elected {
                    result[*c] = 1;
                }
            } else {
                // O(v*p)
                eliminate_and_transfer(
                    &mut counts,
                    &mut result,
                    &mut eliminated,
                    &ballots,
                    n_candidates,
                    &pending,
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
        generate_stv_ballots(voters, parties, bar)
    }
}

// O(p) -- iterates over a vec whose len is the number of candidates
fn find_next_valid_candidate(
    ballot: &StvBallot,
    elected: &[u32],
    eliminated: &[bool],
    pending: &[bool],
) -> Option<usize> {
    ballot
        .0
        .iter()
        .find(|cand_idx| {
            elected[**cand_idx] == 0
                && !eliminated[**cand_idx]
                && !pending[**cand_idx]
        })
        .copied()
}

// O(p) -- len of counts is p
fn find_elected(
    counts: &[u32],
    quota: usize,
    r: &[u32],
) -> Vec<(usize, usize, f32)> {
    // TODO: this can be multi-threaded if p is very large
    counts
        .iter()
        .enumerate()
        .filter(|(i, &count)| r[*i] == 0 && count as usize >= quota)
        .map(|(i, &count)| {
            let surplus = count as usize - quota;
            let transfer_value = surplus as f32 / count as f32;
            (i, surplus, transfer_value)
        })
        .collect()
}

/// elect candidate and transfer their surplus
/// O(v*p + v*p + v + p) = O(v*p + v + p) ~= O(v*p)
/// - v is the number of voters
/// - p is the number of candidates
/// Note that there are likely to be many candidates in STV, as parties
/// must run multiple candidates if they want to win multiple seats
fn transfer_elected_surplus(
    idx: usize,
    surplus: usize,
    transfer_value: f32,
    result: &[u32],
    ballots: &[StvBallot],
    n_candidates: usize,
    eliminated: &[bool],
    counts: &[u32],
    pending: &[bool],
) -> Vec<f32> {
    if surplus == 0 {
        return vec![0.; counts.len()];
    }
    // ballots where first valid preferences is the elected candidate
    // TODO: can be multi-threaded
    // outer is O(v) so entire is O(v*p)
    let r = result.to_vec();
    let b = ballots.iter().filter(|&ballot| {
        // find the first candidate that is not elected or eliminated
        // O(p)
        let first_valid_pref =
            ballot.0.iter().find(|i| !eliminated[**i] && r[**i] == 0);

        first_valid_pref.map(|x| *x == idx).unwrap_or(false)
    });

    // Part XVIII section 273 number 9b specifies it to be truncated
    // O(v*p + v), plus the map which is O(v), but this map should be inlined
    let mut votes_to_transfer: Vec<_> =
        calc_votes_to_transfer(b, result, eliminated, n_candidates, pending)
            .iter()
            .map(|&c| (c as f32 * transfer_value).floor())
            .collect();
    votes_to_transfer[idx] = -(surplus as f32);

    votes_to_transfer
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
    pending: &[bool],
) {
    // TODO: can be multi-threaded if p is very large
    // then again, this is a reduce operation, so still needs a sequential
    // search for the global min value among the thread-local min values
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
    // TODO: can be multi-threaded
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
        calc_votes_to_transfer(b, result, eliminated, n_candidates, pending);

    // TODO: can be multi-threaded if p is very large
    // O(p)
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
    pending: &[bool],
) -> Vec<u32> {
    // TODO: can be multi-threaded if p is very large
    // outer is O(v) as there are v ballots
    // so entire loop is O(v*p)
    let next_prefs: Vec<_> = ballots
        .filter_map(|ballot| {
            find_next_valid_candidate(ballot, result, eliminated, pending)
        })
        .collect();

    // O(v)
    count_freqs(&next_prefs, n_candidates)
}
