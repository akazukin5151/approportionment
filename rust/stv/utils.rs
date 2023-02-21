use crate::*;

/// O(v*p) - len of ballots is v*p
pub fn calc_votes_to_transfer<T>(
    ballots: &[usize],
    result: &[usize],
    eliminated: usize,
    n_candidates: usize,
    pending: usize,
    idx_to_search: usize,
) -> Vec<T>
where
    T: rand_distr::num_traits::Zero
        + rand_distr::num_traits::One
        + rand_distr::num_traits::NumAssign
        + std::clone::Clone,
{
    // we want loop over the ballots in one pass for efficiency
    // it iterates over every preference of the voters in order. if it found
    // what it needs for this voter, it skips to the next voter, so it usually
    // iterates less than v times, but never greater.
    let mut votes_to_transfer = vec![T::zero(); n_candidates];
    let mut idx = 0;
    let mut next_row_idx = n_candidates;
    while idx < ballots.len() {
        let cand = ballots[idx];
        // check if this is the first valid preference
        if result[cand] == 0 && !is_nth_flag_set(eliminated, cand) {
            // check if this voter's first valid preference is the elected candidate
            if cand == idx_to_search {
                // find their next valid preference
                for next_cand in &ballots[idx + 1..next_row_idx] {
                    if result[*next_cand] == 0
                        && !is_nth_flag_set(eliminated, *next_cand)
                        && !is_nth_flag_set(pending, *next_cand)
                    {
                        // transfer this voter's vote to the next valid preference
                        votes_to_transfer[*next_cand] += T::one();
                        break;
                    }
                }
            }
            // if this voter's first valid preference is someone else, there is
            // nothing we need to do and we can move on to the next voter.
            // if we have transferred here, this voter's ballot is also fixed
            // and we can also move on to the next voter
            idx = next_row_idx;
            next_row_idx += n_candidates;
        } else {
            // if this is not the first valid preference, continue searching
            idx += 1;
        }
    }
    votes_to_transfer
}
