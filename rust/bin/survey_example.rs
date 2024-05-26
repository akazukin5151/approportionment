//! Run with `cargo r --features "csv,serde_json,counts_by_round" --bin survey_example --release`.
//!
//! Copy the results from out/langs/*.json to webui/static/langs
//!
#[cfg(all(feature = "serde_json", feature = "csv"))]
mod survey {
    use std::{
        collections::HashMap,
        fs::{create_dir_all, remove_file, File},
        path::Path,
    };

    use libapproportionment::{
        allocate::Allocate,
        cardinal::{
            allocate::CardinalAllocator, strategy::CardinalStrategy, Cardinal,
        },
    };
    use serde::Serialize;

    #[derive(Serialize)]
    struct Output {
        choices: HashMap<String, usize>,
        rounds: Vec<Vec<f32>>,
    }

    pub fn main() {
        let mut rdr = csv::Reader::from_path(
            "data/stack-overflow-developer-survey-2022/survey_results_public.csv",
        )
        .unwrap();

        println!("reading data...");
        let mut ballots = vec![];
        let mut numbered = HashMap::new();
        let mut first_prefs = HashMap::new();

        for result in rdr.deserialize() {
            let record: HashMap<String, String> = result.unwrap();
            if let Some(x) = record.get("LanguageWantToWorkWith") {
                let mut choice = vec![];
                let it = x.split(';').filter(|s| *s != "NA");
                for s in it.clone() {
                    let l = numbered.len();
                    let x = numbered.entry(s.to_owned()).or_insert(l);
                    choice.push(*x);
                    first_prefs
                        .entry(s.to_owned())
                        .and_modify(|c| *c += 1)
                        .or_insert(1);
                }
                ballots.push(choice)
            }
        }

        dbg!(&numbered);

        println!("transforming ballots...");
        let n_voters = ballots.len();
        let n_candidates = numbered.len();
        let n_seats = n_candidates;

        // A row-major matrix with `n_candidates` columns and `n_voters` rows.
        // Row major means [V1, V2, V3] where V1 is [C1, C2, C3] and so on
        let mut ballots_matrix: Vec<f32> = vec![0.; n_candidates * n_voters];
        // let mut total_approvals = 0;
        for (voter_idx, ballot) in ballots.iter().enumerate() {
            for choice in ballot {
                let i = n_candidates * voter_idx + choice;
                ballots_matrix[i] = 1.;
                // total_approvals += 1;
            }
        }

        println!("running elections...");
        // note that star pr is not house monotone (monotonic wrt seats)
        // so changing the number of total seats can cause a candidate to lose
        // even if they won with fewer total seats
        let allocators = [
            ("SPAV", CardinalAllocator::ScoreFromOriginal),
            ("Phragmen", CardinalAllocator::VoterLoads),
        ];

        let mut ordered_cands = vec![];

        for (label, allocator) in allocators {
            let mut c = Cardinal::new(
                n_voters,
                n_candidates,
                CardinalStrategy::Mean, // this is unused
                allocator,
            );

            c.ballots = ballots_matrix.clone();
            let mut rounds = Vec::with_capacity(n_seats);
            let _res =
                c.allocate_seats(n_seats, n_candidates, n_voters, &mut rounds);

            let winners_by_round: Vec<Vec<usize>> = if label == "SPAV" {
                rounds
                    .iter()
                    .skip(1) // the "first round" have no 0s
                    .map(|tally| {
                        tally
                            .iter()
                            .enumerate()
                            .filter(|(_i, t)| **t == 0.)
                            .map(|x| x.0)
                            .collect()
                    })
                    .collect()
            } else {
                // phragmen uses a different way to indicate winners - their loads are equal
                // to the number of seats
                rounds
                    .iter()
                    .skip(2)
                    .map(|tally| {
                        tally
                            .iter()
                            .enumerate()
                            .filter(|(_i, t)| **t > (n_seats as f32))
                            .map(|x| x.0)
                            .collect()
                    })
                    .collect()
            };

            if label == "SPAV" {
                // we save the order of the candidates in the first round, for Phragmen later
                ordered_cands =
                    rounds[0].clone().into_iter().enumerate().collect();
                ordered_cands.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
            } else if label == "Phragmen" {
                // in phragmen, when a candidate is elected, we indicate that in the loads vector
                // in-band by using n_seats + 2.
                // (if a candidate has zero votes, that is indicated by n_seats + 1)
                // but for the purposes of this visualization, we want to show the latest load
                // of the candidate in the round they won.
                // so we postprocess the rounds vector here to set such values to the value they had
                // in the previous round.
                // TODO: in the algorithm, we could achieve this by simply filtering out elected
                // candidates during the min load search, instead of using an in-band value that
                // will never be the min load
                for round_idx in 1..rounds.len() {
                    let prev_round = rounds[round_idx - 1].clone();
                    let round = &mut rounds[round_idx];
                    for cand_idx in 0..n_candidates {
                        let value = &mut round[cand_idx];
                        if *value > n_seats as f32 {
                            *value = prev_round[cand_idx];
                        }
                    }
                }

                // and then we can sort rounds by the "first preferences" that was counted
                // in SPAV, to help later visualization.
                // the first round has all 0 loads, so we can skip that one
                for (_lang, lang_idx) in numbered.iter_mut() {
                    *lang_idx = ordered_cands
                        .iter()
                        .position(|x| x.0 == *lang_idx)
                        .unwrap();
                }
                for round in rounds.iter_mut().skip(1) {
                    *round = ordered_cands
                        .iter()
                        .map(|(cand_idx, _)| round[*cand_idx])
                        .collect();
                }
            }

            let output = Output {
                choices: numbered.clone(),
                rounds: rounds.clone(),
            };

            let filename = format!("out/langs/{label}.json");
            let filename = Path::new(&filename);
            write_to_file(filename, output);

            let filename = format!("out/langs/{label}_metrics.json");
            let filename = Path::new(&filename);
            let metrics = evaluate(&winners_by_round, &ballots, n_candidates);
            write_to_file(filename, metrics);
        }
    }

    fn write_to_file<T: Serialize>(filename: &Path, data: T) {
        create_dir_all(filename.parent().unwrap()).unwrap();
        let _ = remove_file(filename);

        let writer = File::options()
            .write(true)
            .create_new(true)
            .open(filename)
            .unwrap();
        serde_json::to_writer(writer, &data).unwrap();
    }

    #[derive(Serialize)]
    struct EvaluationMetrics {
        average_utility: f64,
        average_log_utility: f64,
        average_at_least_1_winner: f64,
        average_unsatisfied_utility: f64,
        fully_satisfied_perc: f64,
        totally_unsatisfied_perc: f64,
        unsatisfied_perc: f64,
        total_harmonic_quality: f64,
        ebert_cost: f64,
        utility_deviation: f64,
    }

    fn evaluate(
        winners_by_round: &[Vec<usize>],
        voter_ballots: &[Vec<usize>],
        n_candidates: usize,
    ) -> Vec<EvaluationMetrics> {
        let n_voters = voter_ballots.len() as f64;

        winners_by_round
            .iter()
            .map(|round_winners| {
                let n_winners = round_winners.len();

                // average utility
                // average of (total score that a voter gave to winning candidates on their ballot)
                // over all voters.
                // this is disproportional and highly majoritarian.
                let mut total_winners_approved =
                    Vec::with_capacity(n_voters as usize);

                // average log utility
                // average of ln(total score that a voter gave to winning candidates on their ballot)
                // over all voters.
                // this is disproportional and majoritarian.
                let mut ln_total_winners_approved = 0.;

                // the number of voters that approved at least 1 winner.
                let mut n_at_least_1 = 0;

                // Average Unsatisfied Utility
                // average of (total number of approvals that went to an unelected candidate)
                let mut unsatisfied_utility = 0;

                // Fraction of fully satisfied voters
                // fraction of voters where everyone they approved of was elected
                let mut n_fully_satisfied = 0;

                // Fraction of totally unsatisfied voters
                // fraction of voters who did not get everyone they approved of
                let mut n_unsatisfied = 0;

                // Fraction of voters who did not approve of any winners
                let mut n_totally_unsatified = 0;

                // harmonic quality function
                // if a voter's favourite candidate is elected, the utility they gain is 1/1.
                // the second favourite gets an utility of 1/2, etc.
                // the numerator is the score they gave to the candidate (which is always 1 for approval).
                // in approval, there's no way to distinguish the preferences between approved
                // candidates. so we just order them arbitrarily. for example, a voter who
                // approved of 3 winning candidates have an utility of 1/1 + 1/2 + 1/3.
                let mut total_harmonic_quality = 0.;

                // counts the number of voters that approved of an elected candidate
                let mut elected_cand_sums: Vec<i32> = vec![0; n_candidates];

                for voter_ballot in voter_ballots {
                    let n_approvals = voter_ballot.len();

                    let mut total_winners_approved_for_this_voter = 0;
                    for cand_idx in voter_ballot {
                        if round_winners.contains(cand_idx) {
                            total_winners_approved_for_this_voter += 1;
                            elected_cand_sums[*cand_idx] += 1;
                        }
                    }

                    total_winners_approved
                        .push(total_winners_approved_for_this_voter as f64);

                    ln_total_winners_approved +=
                        (total_winners_approved_for_this_voter as f64 + 1.0)
                            .ln();

                    // if every candidate approved approved by this voter is a winner,
                    // the voter is fully satisfied. Otherwise, they have some unsatisfied utility.
                    if total_winners_approved_for_this_voter == 0 {
                        // this voter is completely unsatisfied by the winners
                        n_totally_unsatified += 1;
                    } else {
                        // this voter approved at least 1 winner,
                        n_at_least_1 += 1;
                    }

                    if total_winners_approved_for_this_voter < n_approvals {
                        let n_unelected = voter_ballot.len()
                            - total_winners_approved_for_this_voter;
                        unsatisfied_utility += n_unelected;
                        n_unsatisfied += 1;
                    } else {
                        n_fully_satisfied += 1;
                    }

                    let mut harmonic_quality = 0.;
                    for idx in 0..total_winners_approved_for_this_voter {
                        harmonic_quality += 1. / (1. + (idx as f64));
                    }
                    total_harmonic_quality += harmonic_quality;
                }

                let total_utility: f64 = total_winners_approved.iter().sum();

                let average_utility = total_utility / n_voters;

                let average_log_utility = ln_total_winners_approved / n_voters;
                let average_at_least_1_winner =
                    (n_at_least_1 as f64) / n_voters;
                let average_unsatisfied_utility =
                    (unsatisfied_utility as f64) / n_voters;
                let fully_satisfied_perc =
                    (n_fully_satisfied as f64) / n_voters;
                let unsatisfied_perc = (n_unsatisfied as f64) / n_voters;
                let totally_unsatisfied_perc =
                    (n_totally_unsatified as f64) / n_voters;

                // `elected_cand_sums` adjusted by the number of winners and voters
                let adj_sum: Vec<_> = elected_cand_sums
                    .into_iter()
                    .map(|x| (x as f64) * (n_winners as f64) / n_voters)
                    .collect();

                let mut ebert_cost = 0.;
                for voter_ballot in voter_ballots {
                    // there's one divided sum for every voter
                    let mut divided_sum = 0.;
                    for cand_idx in voter_ballot {
                        let denom = adj_sum[*cand_idx];
                        if denom != 0. {
                            let divided = 1. / denom;
                            divided_sum += divided;
                        }
                    }

                    let squared_sum = divided_sum.powi(2);
                    ebert_cost += squared_sum;
                }

                let ebert_cost = ebert_cost / n_voters;

                assert_eq!(total_winners_approved.len(), n_voters as usize);
                let mean_total_utility =
                    total_utility / (total_winners_approved.len() as f64);
                let squared_deviation: Vec<_> = total_winners_approved
                    .iter()
                    .map(|x| (x - mean_total_utility).powi(2))
                    .collect();
                let variance = squared_deviation.iter().sum::<f64>()
                    / (squared_deviation.len() as f64);

                let utility_deviation = variance.sqrt();

                EvaluationMetrics {
                    average_utility,
                    average_log_utility,
                    average_at_least_1_winner,
                    average_unsatisfied_utility,
                    fully_satisfied_perc,
                    unsatisfied_perc,
                    totally_unsatisfied_perc,
                    total_harmonic_quality,
                    ebert_cost,
                    utility_deviation,
                }
            })
            .collect()
    }
}

#[cfg(not(all(feature = "serde_json", feature = "csv")))]
fn main() {}

#[cfg(all(feature = "serde_json", feature = "csv"))]
fn main() {
    survey::main()
}
