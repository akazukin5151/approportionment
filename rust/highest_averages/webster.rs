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
        // allocation algorithm is too slow for massive house sizes
        // no parliament has more than a thousand members anyway
        #[test]
        fn webster_sainte_lague_is_house_monotonic(
            house_size_1 in 0..=1000_u32,
            house_size_2 in 0..=1000_u32,
        ) {
            prop_assume!(house_size_1 != house_size_2);

            let mut ballots = vec![0; 10_000];
            ballots.extend(vec![1; 8_000]);
            ballots.extend(vec![2; 3_000]);
            ballots.extend(vec![3; 2_000]);

            let r1 = WebsterSainteLague.allocate_seats(
                ballots.clone(),
                house_size_1,
                4
            );
            let r2 =
                WebsterSainteLague.allocate_seats(ballots, house_size_2, 4);

            if house_size_2 > house_size_1 {
                let b = r1.iter().zip(r2).into_iter().all(|(s1, s2)| s2 >= *s1);
                assert!(b)
            } else {
                let b = r1.iter().zip(r2).into_iter().all(|(s1, s2)| s2 <= *s1);
                assert!(b)
            }
        }
    }
}
