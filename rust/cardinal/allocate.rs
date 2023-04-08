use crate::types::AllocationResult;

// TODO: some code copied from largest remainders method
pub fn allocate_cardinal(
    mut ballots: Vec<f32>,
    total_seats: usize,
    n_candidates: usize,
    n_voters: usize,
) -> AllocationResult {
    let originals = ballots.clone();
    // no candidates elected at the beginning
    let mut result: Vec<usize> = vec![0; n_candidates];
    let mut sums_of_elected = vec![0.; n_voters];

    let mut current_seats = 0;
    while current_seats < total_seats {
        let mut counts = vec![0.; n_candidates];
        for ballot in ballots.chunks_exact(n_candidates) {
            for (idx, value) in ballot.iter().enumerate() {
                // only count votes for un-elected candidates
                if result[idx] == 0 {
                    counts[idx] += value;
                }
            }
        }

        // find the candidate with most votes
        // O(p)
        let (pos, _) = counts
            .iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| {
                a.partial_cmp(b).expect("partial_cmp found NaN")
            })
            .expect("counts is empty");

        // give the largest candidate 1 seat.
        result[pos] += 1;

        // re-weight all ballots that approved of the candidate just elected
        ballots.clone_from_slice(&originals);
        reweight_ballots(
            &mut ballots,
            &mut sums_of_elected,
            pos,
            &result,
            n_candidates,
        );

        current_seats += 1;
    }

    result
}

fn reweight_ballots(
    ballots: &mut [f32],
    sums_of_elected: &mut [f32],
    pos: usize,
    result: &[usize],
    n_candidates: usize,
) {
    // using manual iteration is slower than chunking
    for (voter_idx, ballot) in
        ballots.chunks_exact_mut(n_candidates).enumerate()
    {
        if ballot[pos] != 0. {
            // we want to sum up the scores of every elected candidate
            // instead of filtering and summing again every time,
            // we cache the latest sum for every voter.
            // every time this function runs, a new candidate (`pos`)
            // has been elected so we check if this voter has contributed
            // to this candidate's win. if so, we add their sum to the cache.
            let sum_of_elected = &mut sums_of_elected[voter_idx];
            *sum_of_elected += ballot[pos];
            // this is the d'hondt divisor, the sainte lague divisor could be used
            // instead
            let weight = 1. / (1. + *sum_of_elected);
            for (idx, value) in ballot.iter_mut().enumerate() {
                if result[idx] == 1 {
                    *value = 0.;
                } else {
                    *value *= weight;
                }
            }
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    // https://electowiki.org/wiki/File:RRV_Procedure.svg
    #[test]
    fn test_reweighting() {
        let mut ballots = vec![10., 5., 2., 0., 7.];
        ballots.iter_mut().for_each(|x| *x /= 10.);
        let originals = ballots.clone();

        // we have only one voter
        let mut sums_of_elected = vec![0.];

        // first candidate (A) is being elected
        let a = 0;
        let mut result = vec![1, 0, 0, 0, 0];
        let n_candidates = result.len();

        reweight_ballots(
            &mut ballots,
            &mut sums_of_elected,
            a,
            &result,
            n_candidates,
        );

        assert_eq!(sums_of_elected, vec![1.]);
        let mut r = vec![0., 2.5, 1., 0., 3.5];
        r.iter_mut().for_each(|x| *x /= 10.);
        assert_eq!(ballots, r);

        // elect C
        let c = 2;
        result[c] = 1;
        ballots.copy_from_slice(&originals);
        reweight_ballots(
            &mut ballots,
            &mut sums_of_elected,
            c,
            &result,
            n_candidates,
        );

        // scores from original ballots:
        // 10 from A plus 2 from C = 12 (out of max score of 10)
        assert_eq!(sums_of_elected, vec![1.2]);

        // we reweight on the original ballots
        let mut r = originals;
        // but elect A and C first
        r[a] = 0.;
        r[c] = 0.;

        // 1 / (1 + 1.2) == 0.454545 ... and so on
        // since we're using floats, the result doesn't exactly match the example
        // also the example truncated the weight into 0.45, but we didn't do it
        // here, so we have to compare to a floating point calculation
        let weight = 1. / (1. + 1.2);
        r.iter_mut().for_each(|x| *x *= weight);
        assert_eq!(ballots, r);
    }
}
