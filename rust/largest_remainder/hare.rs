use crate::*;

pub struct Hare;

impl Allocate for Hare {
    fn allocate_seats(
        &self,
        ballots: Vec<usize>,
        total_seats: u32,
        n_parties: usize,
    ) -> AllocationResult {
        allocate_largest_remainder(
            |v, s| v / s,
            total_seats,
            &ballots,
            n_parties,
        )
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::test_utils::*;
    use proptest::prelude::*;

    #[test]
    fn hare_wikipedia() {
        let mut ballots = vec![0; 47_000];
        ballots.extend(vec![1; 16_000]);
        ballots.extend(vec![2; 15_800]);
        ballots.extend(vec![3; 12_000]);
        ballots.extend(vec![4; 6100]);
        ballots.extend(vec![5; 3100]);

        let r = Hare.allocate_seats(ballots, 10, 6);

        assert_eq!(r, vec![5, 2, 1, 1, 1, 0]);
    }

    proptest! {
        #![proptest_config(ProptestConfig::with_cases(1000))]
        #[test]
        fn hare_satisfies_quota_rule(
            house_size in 10..=1000_u32,
            // between 1 thousand and a million voters
            // for 2 to 10 parties
            all_votes in proptest::collection::vec(1000..=1_000_000_usize, 2..=10)
        ) {
            satisfies_quota_rule(Hare, house_size, all_votes)
        }

        #[test]
        fn hare_satisfies_quota_rule_4_parties(
            house_size in 10..=1000_u32,
            // between 1 thousand and a million voters
            // for 2 to 10 parties
            all_votes in proptest::collection::vec(1000..=1_000_000_usize, 4)
        ) {
            satisfies_quota_rule(Hare, house_size, all_votes)
        }

        #[test]
        fn hare_is_stable(
            house_size in 10..=1000_u32,
            (all_votes, party_1, party_2) in votes_and_parties_to_merge(),
        ) {
            prop_assume!(party_1 != party_2);
            is_stable(
                &Hare,
                house_size,
                all_votes,
                party_1,
                party_2
            )
        }
    }
}
