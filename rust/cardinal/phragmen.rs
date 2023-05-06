use crate::utils::f32_cmp;

use super::allocate::AllocateCardinal;

pub struct Phragmen {
    n_voters: usize,
    new_maxload: Vec<f32>,
}

impl Phragmen {
    pub fn new(n_voters: usize, n_candidates: usize) -> Self {
        Self {
            n_voters,
            new_maxload: vec![0.; n_candidates],
        }
    }
}

// copied from abcvoting
impl AllocateCardinal for Phragmen {
    fn aux_init(&self) -> f32 {
        0.
    }

    fn count(
        &self,
        ballots: &[f32],
        n_candidates: usize,
        _result: &[usize],
        counts: &mut [f32],
        _aux: &[f32],
    ) {
        for ballot in ballots.chunks_exact(n_candidates) {
            for (idx, cand) in ballot.iter().enumerate() {
                counts[idx] += cand;
            }
        }
    }

    fn find_max<'a>(
        &'a mut self,
        counts: &'a [f32],
        n_candidates: usize,
        n_seats: usize,
        result: &[usize],
        costs: &[f32],
        ballots: &[f32],
    ) -> (usize, &f32) {
        let approvers_load: Vec<f32> = (0..n_candidates)
            .map(|cand| {
                (0..self.n_voters)
                    .map(|voter| {
                        if ballots[voter * n_candidates + cand] != 0. {
                            costs[voter]
                        } else {
                            0.
                        }
                    })
                    .sum()
            })
            .collect();

        // instead of electing the max score, we elect the lowest load
        self.new_maxload = (0..n_candidates)
            .map(|cand| {
                // avoid divide by zero by using a value that won't be min load
                if counts[cand] > 0. {
                    (approvers_load[cand] + 1.) / counts[cand]
                } else {
                    n_seats as f32 + 1.
                }
            })
            .collect();

        for (cand, elected) in result.iter().enumerate() {
            if *elected != 0 {
                // this is just to exclude cand from the min search forever
                self.new_maxload[cand] = n_seats as f32 + 2.;
            }
        }

        self.new_maxload
            .iter()
            .enumerate()
            .min_by(|(_, a), (_, b)| f32_cmp(a, b))
            .unwrap()
    }

    fn reweight(
        &self,
        ballots: &mut [f32],
        costs: &mut [f32],
        pos: usize,
        _result: &[usize],
        n_candidates: usize,
    ) {
        for voter in 0..self.n_voters {
            if ballots[voter * n_candidates + pos] != 0. {
                costs[voter] = self.new_maxload[pos]
            }
        }
    }
}
