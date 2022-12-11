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
        #![proptest_config(ProptestConfig::with_cases(1000))]
        #[test]
        fn sainte_lague_is_house_monotonic(
            house_size_1 in house_size(),
            house_size_2 in house_size(),
            all_votes in all_votes::<usize>(None)
        ) {
            prop_assume!(house_size_1 != house_size_2);
            is_house_monotonic(
                &WebsterSainteLague,
                house_size_1,
                house_size_2,
                all_votes,
            )
        }

        #[test]
        fn sainte_lague_is_house_monotonic_4_parties(
            house_size_1 in house_size(),
            house_size_2 in house_size(),
            all_votes in all_votes(Some(4)),
        ) {
            prop_assume!(house_size_1 != house_size_2);
            is_house_monotonic(
                &WebsterSainteLague,
                house_size_1,
                house_size_2,
                all_votes,
            )
        }

        #[test]
        fn sainte_lague_is_stable(
            house_size in house_size(),
            (all_votes, party_1, party_2) in votes_and_parties_to_merge(),
        ) {
            prop_assume!(party_1 != party_2);
            is_stable(
                &WebsterSainteLague,
                house_size,
                all_votes,
                party_1,
                party_2
            )
        }

        #[test]
        fn sainte_lague_is_concordant(
            house_size in house_size(),
            all_votes in all_votes::<usize>(None),
        ) {
            is_concordant(
                WebsterSainteLague,
                house_size,
                all_votes,
            )
        }
    }
}
