use super::allocate::AllocateCardinal;

pub struct Thiele {
    originals: Vec<f32>,
}

impl Thiele {
    pub fn new(ballots: &[f32]) -> Self {
        Self {
            originals: ballots.to_vec(),
        }
    }
}

impl AllocateCardinal for Thiele {
    fn aux_init(&self) -> f32 {
        0.
    }

    fn count(
        &self,
        ballots: &[f32],
        n_candidates: usize,
        result: &[usize],
        counts: &mut [f32],
        _: &[f32],
    ) {
        let mut c_idx = 0;
        for value in ballots {
            if c_idx == n_candidates {
                c_idx = 0;
            }
            if result[c_idx] == 0 {
                counts[c_idx] += value;
            }
            c_idx += 1;
        }
    }

    fn reweight(
        &self,
        ballots: &mut [f32],
        aux: &mut [f32],
        pos: usize,
        result: &[usize],
        n_candidates: usize,
    ) {
        ballots.copy_from_slice(&self.originals);
        reweight_ballots(ballots, aux, pos, result, n_candidates);
    }
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
        // we want to sum up the scores of every elected candidate
        // that this voter has given a non zero score to
        // we are summing the original scores, so ballots must be the originals
        //
        // instead of filtering and summing again every time,
        // we cache the latest sum for every voter.
        // every time this function runs, a new candidate (`pos`)
        // has been elected so we check if this voter has contributed
        // to this candidate's win. if so, we add their sum to the cache.
        if ballot[pos] != 0. {
            // only reweight voters that contributed to this candidate's win
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
