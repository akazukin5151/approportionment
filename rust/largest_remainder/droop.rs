use crate::{
    allocate::Allocate,
    generators::generate_ballots,
    largest_remainder::lib::allocate_largest_remainder,
    types::{AllocationResult, Party, XY},
};

#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;

pub struct Droop(Vec<usize>);

impl Droop {
    pub fn new(n_voters: usize) -> Self {
        Self(vec![0; n_voters])
    }
}

impl Allocate for Droop {
    fn generate_ballots(
        &mut self,
        voters: &[XY],
        parties: &[Party],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
        #[cfg(feature = "stv_party_discipline")] _: &[usize],
        #[cfg(feature = "stv_party_discipline")] _: usize,
    ) {
        generate_ballots(
            voters,
            parties,
            #[cfg(feature = "progress_bar")]
            bar,
            &mut self.0,
        );
    }

    fn allocate_seats(
        &self,
        total_seats: usize,
        n_parties: usize,
        _: usize,
        #[cfg(test)] _: &mut Vec<Vec<usize>>,
    ) -> AllocationResult {
        allocate_largest_remainder(
            |v, s| {
                let x = v / (1. + s);
                let xf = x.floor();
                1. + xf
            },
            total_seats,
            &self.0,
            n_parties,
        )
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn droop_quota_rounding_1() {
        let mut ballots = vec![0; 43704];
        ballots.extend(vec![1; 492884]);

        let mut a = Droop::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(883, 2, 0, &mut vec![]);

        assert_eq!(r, vec![72, 811]);
    }

    #[test]
    fn droop_quota_rounding_2() {
        let mut ballots = vec![0; 160218];
        ballots.extend(vec![1; 164154]);

        let mut a = Droop::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(990, 2, 0, &mut vec![]);

        assert_eq!(r, vec![489, 501]);
    }

    #[test]
    fn droop_remaining_greater_than_n_parties() {
        let mut ballots = vec![0; 23];
        ballots.extend(vec![1; 26]);
        ballots.extend(vec![2; 51]);
        let n_parties = 3;

        let mut a = Droop::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(30, n_parties, 0, &mut vec![]);
        // there is a tie in over-quotas, either the first or third party
        // can win the final seat, so either results are valid
        assert!(r == vec![8, 8, 14] || r == vec![7, 8, 15], "got r={r:?}")
    }

    #[test]
    fn droop_wikipedia() {
        let mut ballots = vec![0; 47_000];
        ballots.extend(vec![1; 16_000]);
        ballots.extend(vec![2; 15_800]);
        ballots.extend(vec![3; 12_000]);
        ballots.extend(vec![4; 6100]);
        ballots.extend(vec![5; 3100]);

        let mut a = Droop::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(10, 6, 0, &mut vec![]);

        assert_eq!(r, vec![5, 2, 2, 1, 0, 0]);
    }
}
