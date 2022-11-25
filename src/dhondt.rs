use crate::*;

struct DHondt;

impl ElectoralSystem for DHondt {
    // In party list PR, voters select a single party on their ballot
    type Ballot = Party;

    fn generate_ballots(
        parties: &[Party],
        voters: &[Voter],
    ) -> Vec<Self::Ballot> {
        todo!()
    }

    fn allocate_seats(
        total_seats: u32,
        ballots_by_party: HashMap<Self::Ballot, u64>,
    ) -> ElectionResult {
        let mut counts: Vec<(Party, u64)> = ballots_by_party
            .iter()
            .map(|(x, y)| (x.clone(), *y))
            .collect();

        // by default, all parties start with 0 seats
        let mut result: HashMap<Party, u32> = HashMap::new();
        for party in ballots_by_party.keys() {
            result.insert(party.clone(), 0);
        }

        // as long as there are seats remaining to be allocated, find the
        // best party to allocate a seat to
        while result.values().copied().sum::<u32>() < total_seats {
            // sort it so that party with most votes is at the end
            counts.sort_unstable_by_key(|(_, c)| *c);

            let (largest_party, _) = counts.pop().unwrap();

            // give the largest party 1 seat.
            let n_seats_won = result
                .entry(largest_party.clone())
                .and_modify(|seats| *seats += 1)
                .or_insert(1);

            // Apply the D'Hondt quotient to the original votes
            // get the new number of votes
            // ballots_by_party is unchanged from the original
            let original_votes = ballots_by_party.get(&largest_party).unwrap();
            let new_votes = original_votes / (*n_seats_won as u64 + 1);
            counts.push((largest_party, new_votes));
        }

        result
    }
}

#[cfg(test)]
mod test {
    use super::*;

    fn generic_party(name: &str) -> Party {
        Party {
            x: unsafe { NotNan::new_unchecked(0.0) },
            y: unsafe { NotNan::new_unchecked(0.0) },
            name: name.to_string(),
            color: "".to_string(),
        }
    }

    fn assert(r: &HashMap<Party, u32>, name: &str, value: u32) {
        assert_eq!(r.get(&generic_party(name)).unwrap(), &value);
    }

    #[test]
    fn test_dhondt_wikipedia() {
        let mut ballots_by_party = HashMap::new();
        ballots_by_party.insert(generic_party("A"), 100_000);
        ballots_by_party.insert(generic_party("B"), 80_000);
        ballots_by_party.insert(generic_party("C"), 30_000);
        ballots_by_party.insert(generic_party("D"), 20_000);

        let r = DHondt::allocate_seats(8, ballots_by_party);

        assert(&r, "A", 4);
        assert(&r, "B", 3);
        assert(&r, "C", 1);
        assert(&r, "D", 0);
    }

    #[test]
    fn test_dhondt_uk_eu_10_seats() {
        let mut ballots_by_party = HashMap::new();
        ballots_by_party.insert(generic_party("Brexit"), 240);
        ballots_by_party.insert(generic_party("Labour"), 220);
        ballots_by_party.insert(generic_party("Liberal Democrats"), 130);
        ballots_by_party.insert(generic_party("Conservatives"), 100);
        ballots_by_party.insert(generic_party("Greens"), 70);
        ballots_by_party.insert(generic_party("CHUK"), 60);

        let r = DHondt::allocate_seats(10, ballots_by_party);

        assert(&r, "CHUK", 0);
        assert(&r, "Conservatives", 1);
        assert(&r, "Greens", 1);
        assert(&r, "Liberal Democrats", 2);
        assert(&r, "Labour", 3);
        assert(&r, "Brexit", 3);
    }

    #[test]
    fn test_dhondt_uk_eu_5_seats() {
        let mut ballots_by_party = HashMap::new();
        ballots_by_party.insert(generic_party("Brexit"), 240);
        ballots_by_party.insert(generic_party("Labour"), 220);
        ballots_by_party.insert(generic_party("Liberal Democrats"), 130);
        ballots_by_party.insert(generic_party("Conservatives"), 100);
        ballots_by_party.insert(generic_party("Greens"), 70);
        ballots_by_party.insert(generic_party("CHUK"), 60);

        let r = DHondt::allocate_seats(5, ballots_by_party);

        assert(&r, "CHUK", 0);
        assert(&r, "Conservatives", 0);
        assert(&r, "Greens", 0);
        assert(&r, "Liberal Democrats", 1);
        assert(&r, "Labour", 2);
        assert(&r, "Brexit", 2);
    }
}
