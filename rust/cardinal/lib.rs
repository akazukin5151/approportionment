use crate::{
    allocate::Allocate,
    cardinal::{
        allocate::allocate_cardinal, generate::generate_cardinal_ballots,
    },
    types::{AllocationResult, Party, XY},
};

use super::strategy::CardinalStrategy;

pub struct Cardinal {
    /// A row-major matrix with `n_candidates` columns and `n_voters` rows.
    /// Row major means [V1, V2, V3] where V1 is [C1, C2, C3] and so on
    pub(crate) ballots: Vec<f32>,
    pub strategy: CardinalStrategy,
}

impl Allocate for Cardinal {
    fn new(n_voters: usize, n_candidates: usize) -> Self {
        Self {
            ballots: vec![0.; n_candidates * n_voters],
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
    use crate::generators::generate_voters;

    use super::*;

    // https://en.wikipedia.org/wiki/Sequential_proportional_approval_voting
    #[test]
    fn spav_wikipedia() {
        let mut ballots: Vec<f32> = vec![];
        ballots.extend_from_slice(&[1., 1., 1., 0., 0., 0.].repeat(112));
        ballots.extend_from_slice(&[0., 1., 1., 0., 0., 0.].repeat(6));
        ballots.extend_from_slice(&[1., 1., 1., 1., 0., 0.].repeat(4));
        ballots.extend_from_slice(&[0., 0., 0., 1., 1., 1.].repeat(73));
        ballots.extend_from_slice(&[0., 0., 1., 1., 1., 1.].repeat(4));
        ballots.extend_from_slice(&[0., 0., 0., 1., 1., 0.]);

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
        #[rustfmt::skip]
        let ballots: Vec<f32> = vec![
            1., 0., 0., 1.,
            0., 1., 0., 1.,
            1., 0., 1., 0.,
            1., 0., 1., 1.,
            0., 1., 0., 1.,
            1., 0., 1., 1.,
            1., 1., 0., 1.,
            0., 1., 0., 1.,
            1., 0., 0., 1.,
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
        #[rustfmt::skip]
        let ballots: Vec<f32> = vec![
            5., 0., 3., 5.,
            5., 0., 0., 4.,
            0., 5., 0., 1.,
            1., 2., 4., 3.,
            1., 0., 2., 0.,
            1., 3., 0., 1.,
            0., 0., 5., 0.,
            5., 0., 0., 4.,
        ];
        let ballots: Vec<_> = ballots.iter().map(|x| x / 5.).collect();

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

    // https://www.rangevoting.org/RRVr.html
    #[test]
    fn rrv_rangevoting_org() {
        let mut ballots: Vec<f32> = vec![];
        ballots.extend_from_slice(&[1., 0.9, 0.8, 0.1, 0.].repeat(60));
        ballots.extend_from_slice(&[0., 0., 0., 1., 1.].repeat(40));

        let total_seats = 3;
        let n_voters = ballots.len();
        let n_candidates = 5;
        let mut a = Cardinal::new(n_voters, n_candidates);
        a.ballots = ballots;

        let mut rounds = vec![];
        let r =
            a.allocate_seats(total_seats, n_candidates, n_voters, &mut rounds);

        assert_eq!(r, vec![1, 1, 0, 1, 0]);
    }

    #[test]
    // only used for later debugging
    fn spav_web() {
        let n_voters = 100;
        let n_candidates = 4;
        let total_seats = 3;
        let voters = generate_voters((-1., 1.), n_voters, 1., (None, None));
        let mut ballots = vec![0.; n_candidates * n_voters];
        generate_cardinal_ballots(
            &voters,
            &[
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
            ],
            &CardinalStrategy::Mean,
            &mut ballots,
        );

        let mut a = Cardinal::new(n_voters, n_candidates);
        a.ballots = dbg!(ballots);
        let _r =
            a.allocate_seats(total_seats, n_candidates, n_voters, &mut vec![]);
    }
}
