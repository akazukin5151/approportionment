use crate::{
    allocate::Allocate,
    cardinal::{
        allocate::allocate_cardinal, generate::generate_cardinal_ballots,
    },
    types::{AllocationResult, Party, XY},
};

use super::strategy::CardinalStrategy;

pub struct Cardinal {
    /// TODO:
    /// A row-major matrix with `n_candidates` columns and `n_voters` rows.
    /// Row major means [V1, V2, V3] where V1 is [C1, C2, C3] and so on
    pub(crate) ballots: Vec<Vec<f32>>,
    pub(crate) strategy: CardinalStrategy,
}

impl Allocate for Cardinal {
    fn new(n_voters: usize, n_candidates: usize) -> Self {
        Self {
            ballots: vec![vec![0.; n_candidates]; n_voters],
            strategy: CardinalStrategy::default(),
        }
    }

    fn allocate_seats(
        &self,
        total_seats: usize,
        n_candidates: usize,
        _n_voters: usize,
        #[cfg(test)] _rounds: &mut Vec<Vec<usize>>,
    ) -> AllocationResult {
        let ballots = self.ballots.clone();
        allocate_cardinal(ballots, total_seats, n_candidates, 1.)
    }

    fn generate_ballots(
        &mut self,
        voters: &[XY],
        candidates: &[Party],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
        #[cfg(feature = "stv_party_discipline")] _: &[usize],
        #[cfg(feature = "stv_party_discipline")] _: usize,
    ) {
        generate_cardinal_ballots(
            voters,
            candidates,
            #[cfg(feature = "progress_bar")]
            bar,
            &self.strategy,
            &mut self.ballots,
        );
    }
}

#[cfg(test)]
mod test {
    use super::*;

    // https://en.wikipedia.org/wiki/Sequential_proportional_approval_voting
    #[test]
    fn spav_wikipedia() {
        let mut ballots: Vec<Vec<f32>> = vec![];
        for _ in 0..112 {
            ballots.push(vec![1., 1., 1., 0., 0., 0.]);
        }
        for _ in 0..6 {
            ballots.push(vec![0., 1., 1., 0., 0., 0.]);
        }
        for _ in 0..4 {
            ballots.push(vec![1., 1., 1., 1., 0., 0.]);
        }
        for _ in 0..73 {
            ballots.push(vec![0., 0., 0., 1., 1., 1.]);
        }
        for _ in 0..4 {
            ballots.push(vec![0., 0., 1., 1., 1., 1.]);
        }
        ballots.push([0., 0., 0., 1., 1., 0.].to_vec());

        let total_seats = 3;
        let n_voters = 200;
        let n_candidates = 6;
        let mut a = Cardinal::new(n_voters, n_candidates);
        a.ballots = ballots;

        let mut rounds = vec![];
        let r =
            a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

        assert_eq!(r, vec![0, 1, 1, 1, 0, 0]);
    }

    // https://electowiki.org/wiki/Sequential_proportional_approval_voting
    #[test]
    fn spav_electowiki() {
        let ballots: Vec<Vec<f32>> = vec![
            vec![1., 0., 0., 1.],
            vec![0., 1., 0., 1.],
            vec![1., 0., 1., 0.],
            vec![1., 0., 1., 1.],
            vec![0., 1., 0., 1.],
            vec![1., 0., 1., 1.],
            vec![1., 1., 0., 1.],
            vec![0., 1., 0., 1.],
            vec![1., 0., 0., 1.],
        ];

        let total_seats = 3;
        let n_voters = ballots.len();
        let n_candidates = 4;
        let mut a = Cardinal::new(n_voters, n_candidates);
        a.ballots = ballots;

        let mut rounds = vec![];
        let r =
            a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

        assert_eq!(r, vec![1, 1, 0, 1]);
    }

    // https://electowiki.org/wiki/Reweighted_range_voting
    #[test]
    fn rrv_electowiki() {
        let ballots: Vec<Vec<f32>> = vec![
            vec![5., 0., 3., 5.],
            vec![5., 0., 0., 4.],
            vec![0., 5., 0., 1.],
            vec![1., 2., 4., 3.],
            vec![1., 0., 2., 0.],
            vec![1., 3., 0., 1.],
            vec![0., 0., 5., 0.],
            vec![5., 0., 0., 4.],
        ];
        let ballots: Vec<Vec<_>> = ballots
            .iter()
            .map(|v| v.iter().map(|x| x / 5.).collect())
            .collect();

        let total_seats = 3;
        let n_voters = ballots.len();
        let n_candidates = 4;
        let mut a = Cardinal::new(n_voters, n_candidates);
        a.ballots = ballots;

        let mut rounds = vec![];
        let r =
            a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

        assert_eq!(r, vec![1, 0, 1, 1]);
    }
}
