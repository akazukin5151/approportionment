use crate::*;

pub struct WebsterSainteLague;

impl Allocate for WebsterSainteLague {
    fn allocate_seats(
        &self,
        ballots: Vec<usize>,
        total_seats: u32,
        n_parties: usize,
    ) -> AllocationResult {
        fn quotient(original_votes: u32, n_seats_won: u32) -> u32 {
            original_votes / (2 * n_seats_won + 1)
        }
        allocate_highest_average(quotient, total_seats, &ballots, n_parties)
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

        let r = WebsterSainteLague.allocate_seats(ballots, 8, 4);

        assert_eq!(r, vec![3, 3, 1, 1]);
    }
}
