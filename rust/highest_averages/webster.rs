use crate::{
    allocate::Allocate,
    generators::generate_ballots,
    highest_averages::lib::allocate_highest_average,
    types::{AllocationResult, Party, XY},
};

#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;

pub struct WebsterSainteLague(Vec<usize>);

impl Allocate for WebsterSainteLague {
    fn new(n_voters: usize, _n_parties: usize) -> Self {
        Self(vec![0; n_voters])
    }

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
            original_votes / (2. * n_seats_won + 1.)
        }
        allocate_highest_average(quotient, total_seats, &self.0, n_parties)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_webster_sainte_lague_wikipedia() {
        let mut ballots = vec![0; 10_000];
        ballots.extend(vec![1; 8_000]);
        ballots.extend(vec![2; 3_000]);
        ballots.extend(vec![3; 2_000]);

        let mut a = WebsterSainteLague::new(ballots.iter().sum(), 4);
        a.0 = ballots;
        let r = a.allocate_seats(8, 4, 0, &mut vec![]);

        assert_eq!(r, vec![3, 3, 1, 1]);
    }
}
