use crate::{
    allocate::Allocate,
    generators::generate_ballots,
    highest_averages::lib::allocate_highest_average,
    types::{AllocationResult, Party, XY},
};

#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;

pub struct DHondt(Vec<usize>);

impl DHondt {
    pub fn new(n_voters: usize) -> Self {
        Self(vec![0; n_voters])
    }
}

impl Allocate for DHondt {
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
        fn quotient(original_votes: f32, n_seats_won: f32) -> f32 {
            original_votes / (n_seats_won + 1.)
        }
        allocate_highest_average(quotient, total_seats, &self.0, n_parties)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_dhondt_wikipedia() {
        let mut ballots = vec![0; 10_000];
        ballots.extend(vec![1; 8_000]);
        ballots.extend(vec![2; 3_000]);
        ballots.extend(vec![3; 2_000]);

        let mut a = DHondt::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(8, 4, 0, &mut vec![]);

        assert_eq!(r, vec![4, 3, 1, 0]);
    }

    #[test]
    fn test_dhondt_uk_eu_10_seats() {
        let mut ballots = vec![0; 240];
        ballots.extend(vec![1; 220]);
        ballots.extend(vec![2; 130]);
        ballots.extend(vec![3; 100]);
        ballots.extend(vec![4; 70]);
        ballots.extend(vec![5; 60]);

        let mut a = DHondt::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(10, 6, 0, &mut vec![]);

        assert_eq!(r, vec![3, 3, 2, 1, 1, 0]);
    }

    #[test]
    fn test_dhondt_uk_eu_5_seats() {
        let mut ballots = vec![0; 240];
        ballots.extend(vec![1; 220]);
        ballots.extend(vec![2; 130]);
        ballots.extend(vec![3; 100]);
        ballots.extend(vec![4; 70]);
        ballots.extend(vec![5; 60]);

        let mut a = DHondt::new(ballots.iter().sum());
        a.0 = ballots;
        let r = a.allocate_seats(5, 6, 0, &mut vec![]);

        assert_eq!(r, vec![2, 2, 1, 0, 0, 0]);
    }
}
