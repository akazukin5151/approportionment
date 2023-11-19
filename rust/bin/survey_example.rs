use std::{collections::HashMap, fs::File};

use libapproportionment::{
    allocate::Allocate,
    cardinal::{
        allocate::CardinalAllocator, reweighter::ReweightMethod,
        strategy::CardinalStrategy, Cardinal,
    },
};
use serde::Serialize;

#[derive(Serialize)]
struct Output {
    choices: HashMap<String, usize>,
    rounds: Vec<Vec<f32>>,
}

fn main() {
    let mut rdr = csv::Reader::from_path(
        "data/stack-overflow-developer-survey-2022/survey_results_public.csv",
    )
    .unwrap();

    println!("reading data...");
    let mut ballots = vec![];
    let mut numbered = HashMap::new();
    let mut first_prefs = HashMap::new();

    // for those who approved of javascript, what else did they also approve of?
    // let mut specific = HashMap::new();

    for result in rdr.deserialize() {
        let record: HashMap<String, String> = result.unwrap();
        if let Some(x) = record.get("LanguageWantToWorkWith") {
            let mut choice = vec![];
            // let mut b = false;
            let it = x.split(';').filter(|s| *s != "NA");
            for s in it.clone() {
                let l = numbered.len();
                let x = numbered.entry(s.to_owned()).or_insert(l);
                choice.push(*x);
                first_prefs
                    .entry(s.to_owned())
                    .and_modify(|c| *c += 1)
                    .or_insert(1);
                // if s == "JavaScript" {
                //     b = true
                // }
            }
            // if b {
            //     for s in it {
            //         if s != "JavaScript" {
            //             specific
            //                 .entry(s.to_owned())
            //                 .and_modify(|c| *c += 1)
            //                 .or_insert(1);
            //         }
            //     }
            // }
            ballots.push(choice)
        }
    }

    // dbg!(&ballots);
    dbg!(&numbered);

    println!("transforming ballots...");
    let n_voters = ballots.len();
    let n_candidates = numbered.len();
    let n_seats = 5;

    // A row-major matrix with `n_candidates` columns and `n_voters` rows.
    // Row major means [V1, V2, V3] where V1 is [C1, C2, C3] and so on
    let mut ballots_matrix: Vec<f32> = vec![0.; n_candidates * n_voters];
    let mut total_approvals = 0;
    for (voter_idx, ballot) in ballots.iter().enumerate() {
        for choice in ballot {
            let i = n_candidates * voter_idx + choice;
            ballots_matrix[i] = 1.;
            total_approvals += 1;
        }
    }

    println!("running election...");
    let mut c = Cardinal::new(
        n_voters,
        n_candidates,
        CardinalStrategy::Mean, // this is unused
        CardinalAllocator::WeightsFromPrevious(ReweightMethod::StarPr),
    );

    c.ballots = ballots_matrix;
    let mut rounds = Vec::with_capacity(n_seats);
    let res = c.allocate_seats(n_seats, n_candidates, n_voters, &mut rounds);

    let output = Output {
        choices: numbered.clone(),
        rounds,
    };

    let writer = File::options()
        .write(true)
        .create(true)
        .open("out/langs/langs.json")
        .unwrap();
    serde_json::to_writer(writer, &output).unwrap();

    let mut fps: Vec<_> = first_prefs.iter().collect();
    fps.sort_unstable_by(|a, b| b.1.cmp(a.1));

    let pct_of_seats = 1. / n_seats as f32;
    println!("\nwinning 1 seat means winning {pct_of_seats}% of seats\n");
    for (name, fp) in fps {
        let i = numbered.get(name).unwrap();
        let r = res[*i];
        let pct_approved = *fp as f32 / n_voters as f32 * 100.;
        let pct_approvals = *fp as f32 / total_approvals as f32 * 100.;
        println!("{name} ({pct_approved:.02}% approved, {pct_approvals:.02}% of approvals): {r} seats");
    }

    // println!("\n\nanalysis:");
    // dbg!(&specific);
}
