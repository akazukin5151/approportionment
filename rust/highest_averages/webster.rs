use crate::{generators::generate_ballots, *};

pub struct WebsterSainteLague(Vec<usize>);

impl Allocate for WebsterSainteLague {
    fn new(n_voters: usize) -> Self {
        Self(vec![Default::default(); n_voters])
    }

    fn generate_ballots(
        &mut self,
        voters: &[Voter],
        parties: &[Party],
        bar: &Option<ProgressBar>,
    ) {
        generate_ballots(voters, parties, bar, &mut self.0);
    }

    fn allocate_seats(
        &self,
        total_seats: usize,
        n_parties: usize,
    ) -> AllocationResult {
        fn quotient(original_votes: usize, n_seats_won: usize) -> usize {
            original_votes / (2 * n_seats_won + 1)
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

        let r = WebsterSainteLague.allocate_seats(&ballots, 8, 4);

        assert_eq!(r, vec![3, 3, 1, 1]);
    }
}
