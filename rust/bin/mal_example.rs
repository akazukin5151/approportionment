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
    let mut rdr =
        csv::Reader::from_path("data/mal/animelists_cleaned.csv").unwrap();

    println!("reading data...");
    let mut scores: Vec<HashMap<usize, i32>> = vec![];
    let mut numbered = HashMap::new();
    let mut first_prefs = HashMap::new();
    let mut total_score = 0;
    let mut current_user = "".to_owned();

    for result in rdr.deserialize() {
        let record: HashMap<String, String> = result.unwrap();
        let username = record.get("username").unwrap();
        if &current_user != username {
            // we're going to a different user now, add a new hashmap for their ballot
            // this assumes users are contiguous
            scores.push(HashMap::new());
        }
        current_user = username.to_owned();

        let anime_id = record.get("anime_id").unwrap();
        let score = record.get("my_score").unwrap();
        let score: Result<i32, _> = score.parse();
        if let Ok(s) = score {
            if s >= 0 {
                let l = numbered.len();
                let idx = numbered.entry(anime_id.to_owned()).or_insert(l);
                let map = scores.last_mut().unwrap();
                map.insert(*idx, s);

                total_score += s;
                first_prefs
                    .entry(anime_id.to_owned())
                    .and_modify(|c| *c += s)
                    .or_insert(s);
            }
        }
    }

    println!("transforming ballots...");
    let n_voters = scores.len();
    let n_candidates = numbered.len();
    let n_seats = 5;
    dbg!(n_voters, n_candidates);

    // A row-major matrix with `n_candidates` columns and `n_voters` rows.
    // Row major means [V1, V2, V3] where V1 is [C1, C2, C3] and so on
    // V1C1 = 0, V1C3 = 2, V2C1 = 3
    let mut ballots_matrix: Vec<f32> = vec![0.; n_candidates * n_voters];
    for (voter_idx, map) in scores.iter().enumerate() {
        for (cand_idx, score) in map {
            let i = n_candidates * voter_idx + cand_idx;
            ballots_matrix[i] = *score as f32;
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
    let mut rounds = vec![];
    let res = c.allocate_seats(n_seats, n_candidates, n_voters, &mut rounds);

    let output = Output {
        choices: numbered.clone(),
        rounds,
    };

    let writer = File::options()
        .write(true)
        .create(true)
        .open("out/mal/mal.json")
        .unwrap();
    serde_json::to_writer(writer, &output).unwrap();

    let mut fps: Vec<_> = first_prefs.iter().collect();
    fps.sort_unstable_by(|a, b| b.1.cmp(a.1));

    let pct_of_seats = 1. / n_seats as f32;
    println!("\nwinning 1 seat means winning {pct_of_seats}% of all seats\n");
    for (name, fp) in fps {
        let i = numbered.get(name).unwrap();
        let r = res[*i];
        // highest score is 10/10, so divide first-round scores by 10 (* 100 / 10)
        // to compare how high the score is compared to a perfect score
        let pct_approved = *fp as f32 / n_voters as f32 * 10.;
        let pct_approvals = *fp as f32 / total_score as f32 * 100.;
        println!("{name} ({pct_approved:.02}% approved, {pct_approvals:.02}% of approvals): {r} seats");
    }
}
