mod config;
mod highest_averages;
mod largest_remainder;
mod simulator;
mod types;
mod utils;

use std::{
    collections::HashMap,
    env::args,
    fs::{create_dir_all, File},
    path::Path,
    sync::Arc,
};

use arrow::{
    array::{ArrayRef, Float32Array, UInt32Array},
    datatypes::{DataType, Field, Schema},
    ipc::writer::FileWriter,
    record_batch::RecordBatch,
};
use config::*;
use highest_averages::*;
use indicatif::ProgressBar;
use largest_remainder::*;
use rayon::prelude::*;
use types::*;
use utils::*;

#[cfg(test)]
mod test_utils;
#[cfg(test)]
use test_utils::*;

#[cfg(test)]
mod test_config;

fn main() {
    let file = args().nth(1).unwrap();
    let r_configs: Result<Configs, _> = serde_dhall::from_file(file)
        .static_type_annotation()
        .parse();
    let c = r_configs.unwrap_or_else(|r| {
        println!("{}", r);
        panic!()
    });
    let configs = c.configs;

    let total_ballots: u64 = configs
        .iter()
        .map(|c| {
            let mut ballots_in_config = 0;
            let out_dir = &c.data_out_dir;
            let path = Path::new(&out_dir);
            for method in &c.allocation_methods {
                let filename = path.join(method.filename());
                if !filename.exists() {
                    let n_voters = c.n_voters as u64;
                    // if domain is customizable this will change
                    // there are 200 values between -100 to 100
                    let n_coords = 200 * 200;
                    ballots_in_config += n_voters * n_coords;
                }
            }
            ballots_in_config
        })
        .sum();

    let bar = if c.show_progress_bar {
        Some(ProgressBar::new(total_ballots))
    } else {
        None
    };
    configs.into_par_iter().for_each(|config| {
        run_config(config, &bar);
    });
    if let Some(b) = bar {
        b.finish();
    }
}

fn run_config(config: Config, bar: &Option<ProgressBar>) {
    let parties: Vec<Party> = config.parties.into_iter().collect();

    let out_dir = config.data_out_dir;
    let path = Path::new(&out_dir);
    if !path.exists() {
        create_dir_all(path).unwrap();
    }

    config
        .allocation_methods
        .into_par_iter()
        .for_each(|method| {
            let filename = path.join(method.filename());
            if filename.exists() {
                return;
            }
            let rs = method.simulate_elections(
                config.n_seats,
                config.n_voters,
                &parties,
                bar,
            );

            let schema = Schema {
                fields: vec![
                    Field::new("x", DataType::Float32, false),
                    Field::new("y", DataType::Float32, false),
                    Field::new("party_x", DataType::Float32, false),
                    Field::new("party_y", DataType::Float32, false),
                    Field::new("seats_for_party", DataType::UInt32, false),
                ],
                metadata: HashMap::new(),
            };
            let total_rows = 200 * 200 * parties.len();

            let mut xs = Float32Array::builder(total_rows);
            let mut ys = Float32Array::builder(total_rows);
            let mut party_xs = Float32Array::builder(total_rows);
            let mut party_ys = Float32Array::builder(total_rows);
            let mut seats = UInt32Array::builder(total_rows);
            for ((x, y), hmap) in rs {
                for (i, s) in hmap.iter().enumerate() {
                    xs.append_value(x);
                    ys.append_value(y);
                    let p = &parties[i];
                    party_xs.append_value(p.x);
                    party_ys.append_value(p.y);
                    seats.append_value(*s);
                }
            }

            let columns: Vec<ArrayRef> = vec![
                Arc::new(xs.finish()),
                Arc::new(ys.finish()),
                Arc::new(party_xs.finish()),
                Arc::new(party_ys.finish()),
                Arc::new(seats.finish()),
            ];
            let batch = RecordBatch::try_new(Arc::new(schema.clone()), columns)
                .unwrap();

            let f = File::create(filename).unwrap();
            let mut w = FileWriter::try_new(f, &schema).unwrap();
            w.write(&batch).unwrap();
            w.finish().unwrap();
        });
}
