use crate::*;

pub struct Droop;

impl Allocate for Droop {
    fn allocate_seats(
        &self,
        ballots: Vec<usize>,
        total_seats: u32,
        n_parties: usize,
    ) -> AllocationResult {
        allocate_largest_remainder(
            |v, s| 1 + v / (1 + s),
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
    fn droop_wikipedia() {
        let mut ballots = vec![0; 47_000];
        ballots.extend(vec![1; 16_000]);
        ballots.extend(vec![2; 15_800]);
        ballots.extend(vec![3; 12_000]);
        ballots.extend(vec![4; 6100]);
        ballots.extend(vec![5; 3100]);

        let r = Droop.allocate_seats(ballots, 10, 6);

        assert_eq!(r, vec![5, 2, 2, 1, 0, 0]);
    }

    #[test]
    fn droop_quota_rule() {
        let house_sizes = [360, 72, 144, 216, 288];
        let votes = [
            [885292, 50089, 1536, 87859],
            [80183, 34027, 403586, 30472],
            [80183, 34027, 803270, 7888],
            [35570, 24675, 798357, 30291],
            [80183, 34027, 705602, 23398],
        ];
        for (house_size, all_votes) in house_sizes.iter().zip(votes) {
            satisfies_quota_rule(Droop, *house_size, all_votes.to_vec())
        }
    }

    proptest! {
        #![proptest_config(ProptestConfig::with_cases(1000))]
        #[test]
        fn droop_satisfies_quota_rule(
            house_size in 10..=1000_u32,
            // between 1 thousand and a million voters
            // for 2 to 10 parties
            all_votes in proptest::collection::vec(1000..=1_000_000_usize, 2..=10)
        ) {
            satisfies_quota_rule(Droop, house_size, all_votes)
        }

        #[test]
        fn droop_satisfies_quota_rule_4_parties(
            house_size in 10..=1000_u32,
            // between 1 thousand and a million voters
            all_votes in proptest::collection::vec(1000..=1_000_000_usize, 4)
        ) {
            satisfies_quota_rule(Droop, house_size, all_votes)
        }

        #[test]
        fn droop_is_stable(
            house_size in 10..=1000_u32,
            (all_votes, party_1, party_2) in votes_and_parties_to_merge(),
        ) {
            prop_assume!(party_1 != party_2);
            is_stable(
                &Droop,
                house_size,
                all_votes,
                party_1,
                party_2
            )
        }
    }
}
