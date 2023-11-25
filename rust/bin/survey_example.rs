//! Run with `cargo r --features "csv,serde_json,counts_by_round" --bin survey_example --release`.
//!
//! Copy the results from out/langs/*.json to webui/static/langs
//!
#[cfg(all(feature = "serde_json", feature = "csv"))]
mod survey {
    use std::{
        collections::HashMap,
        fs::{remove_file, File},
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
                rounds,
            };

            let filename = format!("out/langs/{label}.json");
            let _ = remove_file(filename.clone());
            let writer = File::options()
                .write(true)
                .create_new(true)
                .open(filename)
                .unwrap();
            serde_json::to_writer(writer, &output).unwrap();

            // let mut fps: Vec<_> = first_prefs.iter().collect();
            // fps.sort_unstable_by(|a, b| b.1.cmp(a.1));
            //
            // let pct_of_seats = 1. / n_seats as f32;
            // println!("\nwinning 1 seat means winning {pct_of_seats}% of seats\n");
            // for (name, fp) in fps {
            //     let i = numbered.get(name).unwrap();
            //     let r = _res[*i];
            //     let pct_approved = *fp as f32 / n_voters as f32 * 100.;
            //     let pct_approvals = *fp as f32 / total_approvals as f32 * 100.;
            //     println!("{name} ({pct_approved:.02}% approved, {pct_approvals:.02}% of approvals): {r} seats");
            // }
        }
    }
}

#[cfg(not(all(feature = "serde_json", feature = "csv")))]
fn main() {}

#[cfg(all(feature = "serde_json", feature = "csv"))]
fn main() {
    survey::main()
}
