use crate::*;

pub trait HighestAverages {
    fn quotient(original_votes: u64, n_seats_won: u32) -> u64;

    fn generate_ballots(
        parties: &[Party],
        voters: &[Voter],
    ) -> Vec<Party>{
        todo!()
    }

    fn allocate(
        total_seats: u32,
        ballots_by_party: HashMap<&Party, u64>,
    ) -> ElectionResult {
        let mut counts: Vec<(Party, u64)> = ballots_by_party
            .iter()
            .map(|(&x, y)| (x.clone(), *y))
            .collect();

        // by default, all parties start with 0 seats
        let mut result: HashMap<Party, u32> = HashMap::new();
        for party in ballots_by_party.keys() {
            result.insert((*party).clone(), 0);
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

            // Apply the highest averages quotient to the original votes
            // to get the new number of votes
            // ballots_by_party is unchanged from the original
            let original_votes = ballots_by_party.get(&largest_party).unwrap();
            let new_votes = Self::quotient(*original_votes, *n_seats_won);
            counts.push((largest_party, new_votes));
        }

        result
    }
}

impl<T: HighestAverages> ElectoralSystem for T {
    type Ballot = Party;

    fn generate_ballots(
        parties: &[Party],
        voters: &[Voter],
    ) -> Vec<Self::Ballot> {
        todo!()
    }

    fn allocate_seats(
        // district magnitude
        total_seats: u32,
        ballots: &[Self::Ballot],
    ) -> ElectionResult {
        let ballots_by_party = count_freqs(ballots);
        Self::allocate(total_seats, ballots_by_party)
    }
}
