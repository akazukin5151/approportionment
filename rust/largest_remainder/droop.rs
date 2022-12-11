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
            |v, s| {
                let v = v as f32;
                let s = s as f32;
                let x = v / (1. + s);
                let xf = x.floor();
                1. + xf
            },
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
    fn droop_quota_rounding_1() {
        let mut ballots = vec![0; 43704];
        ballots.extend(vec![1; 492884]);

        let r = Droop.allocate_seats(ballots, 883, 2);

        assert_eq!(r, vec![72, 811]);
    }

    #[test]
    fn droop_quota_rounding_2() {
        let mut ballots = vec![0; 160218];
        ballots.extend(vec![1; 164154]);

        let r = Droop.allocate_seats(ballots, 990, 2);

        assert_eq!(r, vec![489, 501]);
    }

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
        #[ignore]
        fn droop_satisfies_quota_rule(
            house_size in house_size(),
            all_votes in all_votes::<usize>(None)
        ) {
            satisfies_quota_rule(Droop, house_size, all_votes)
        }

        #[test]
        #[ignore]
        fn droop_satisfies_quota_rule_4_parties(
            house_size in house_size(),
            // between 1 thousand and a million voters
            all_votes in all_votes(Some(4))
        ) {
            satisfies_quota_rule(Droop, house_size, all_votes)
        }

        #[test]
        #[ignore]
        fn droop_is_stable(
            house_size in house_size(),
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

        #[test]
        #[ignore]
        fn droop_is_concordant(
            house_size in house_size(),
            all_votes in all_votes::<usize>(None),
        ) {
            is_concordant(
                Droop,
                house_size,
                all_votes,
            )
        }
    }
}
