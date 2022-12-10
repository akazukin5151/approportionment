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
    use crate::test_utils::*;
    use proptest::prelude::*;

    #[test]
    fn test_webster_sainte_lague_wikipedia() {
        let mut ballots = vec![0; 10_000];
        ballots.extend(vec![1; 8_000]);
        ballots.extend(vec![2; 3_000]);
        ballots.extend(vec![3; 2_000]);

        let r = WebsterSainteLague.allocate_seats(ballots, 8, 4);

        assert_eq!(r, vec![3, 3, 1, 1]);
    }

    proptest! {
        #[test]
        fn sainte_lague_is_house_monotonic(
            house_size_1 in 0..=1000_u32,
            house_size_2 in 0..=1000_u32,
            // between 1 thousand and a million voters
            // for 2 to 10 parties
            all_votes in proptest::collection::vec(1000..=1_000_000_usize, 2..10)
        ) {
            prop_assume!(house_size_1 != house_size_2);
            is_house_monotonic(
                WebsterSainteLague,
                house_size_1,
                house_size_2,
                all_votes,
            )
        }
    }
}
